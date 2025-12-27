import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CreditCard, Shield, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/auth-context';
import { createRazorpayOrder, verifyRazorpayPayment, getRazorpayOptions } from '@/services/payment';
import { formatPrice } from '@/lib/currency';

interface RazorpayPaymentProps {
  amount: number;
  orderId?: number;
  onSuccess?: (paymentId: string) => void;
  onError?: (error: string) => void;
  disabled?: boolean;
}

declare global {
  interface Window {
    Razorpay: any;
  }
}

export function RazorpayPayment({ 
  amount, 
  orderId, 
  onSuccess, 
  onError, 
  disabled = false 
}: RazorpayPaymentProps) {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const loadRazorpayScript = (): Promise<boolean> => {
    return new Promise((resolve) => {
      if (window.Razorpay) {
        resolve(true);
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handlePayment = async () => {
    if (!user?.email) {
      toast({
        title: "Authentication Required",
        description: "Please log in to make a payment.",
        variant: "destructive",
      });
      return;
    }

    // Debug: Check current auth state
    console.log('Current user:', user);
    console.log('User email:', user.email);

    setLoading(true);

    try {
      // Load Razorpay script
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        throw new Error('Failed to load Razorpay SDK');
      }

      // Create Razorpay order
      const orderResult = await createRazorpayOrder({
        amount,
        currency: 'INR',
        receipt: `receipt_${Date.now()}`,
        notes: {
          order_id: orderId?.toString() || '',
          user_email: user.email,
        },
        orderId,
      });

      if (!orderResult.success || !orderResult.order || !orderResult.key_id) {
        throw new Error(orderResult.error || 'Failed to create payment order');
      }

      // Configure Razorpay options
      const options = {
        ...getRazorpayOptions(orderResult.order, orderResult.key_id, user.email),
        handler: async (response: any) => {
          try {
            // Verify payment
            const verificationResult = await verifyRazorpayPayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              order_id: orderId,
            });

            if (verificationResult.success) {
              toast({
                title: "Payment Successful!",
                description: "Your payment has been processed successfully.",
              });
              onSuccess?.(response.razorpay_payment_id);
            } else {
              throw new Error(verificationResult.error || 'Payment verification failed');
            }
          } catch (error) {
            console.error('Payment verification error:', error);
            toast({
              title: "Payment Verification Failed",
              description: "Please contact support if amount was deducted.",
              variant: "destructive",
            });
            onError?.(error instanceof Error ? error.message : 'Verification failed');
          }
        },
        modal: {
          ondismiss: () => {
            setLoading(false);
            toast({
              title: "Payment Cancelled",
              description: "Payment was cancelled by user.",
              variant: "destructive",
            });
          },
          // Add test mode handler for international card issues
          onhidden: () => {
            console.log('Payment modal hidden - checking for test mode completion');
          },
        },
      };

      // Open Razorpay checkout
      const razorpay = new window.Razorpay(options);
      razorpay.open();

    } catch (error) {
      console.error('Payment error:', error);
      toast({
        title: "Payment Failed",
        description: error instanceof Error ? error.message : 'Unknown error occurred',
        variant: "destructive",
      });
      onError?.(error instanceof Error ? error.message : 'Payment failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="h-5 w-5" />
          Secure Payment
        </CardTitle>
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="text-xs">
            <Shield className="h-3 w-3 mr-1" />
            Test Mode
          </Badge>
          <span className="text-sm text-muted-foreground">
            Powered by Razorpay
          </span>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-between items-center p-4 bg-secondary/20 rounded-lg">
          <span className="font-medium">Total Amount:</span>
          <span className="text-2xl font-bold text-primary">
            {formatPrice(amount)}
          </span>
        </div>

        <div className="space-y-2 text-sm text-muted-foreground">
          <p>• Secure payment processing with Razorpay</p>
          <p>• Supports UPI, Cards, Net Banking & Wallets</p>
          <p>• Test mode - No real money will be charged</p>
        </div>

        <Button 
          onClick={handlePayment}
          disabled={disabled || loading || amount <= 0}
          className="w-full"
          size="lg"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Processing...
            </>
          ) : (
            <>
              <CreditCard className="h-4 w-4 mr-2" />
              Pay {formatPrice(amount)}
            </>
          )}
        </Button>

        <p className="text-xs text-center text-muted-foreground">
          By proceeding, you agree to our terms and conditions
        </p>
      </CardContent>
    </Card>
  );
}