import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  CreditCard,
  Shield,
  Loader2,
  Smartphone,
  Wallet,
  Building2,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/auth-context";
import {
  createRazorpayOrder,
  verifyRazorpayPayment,
  getRazorpayOptions,
} from "@/services/payment";
import { formatPrice } from "@/lib/currency";

interface RazorpayPaymentProps {
  amount: number;
  orderId?: number;
  orderData?: any;
  cartItems?: any[];
  shippingCost?: number;
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
  orderData,
  cartItems,
  shippingCost,
  onSuccess,
  onError,
  disabled = false,
}: RazorpayPaymentProps) {
  const [loading, setLoading] = useState(false);
  const [createdOrderId, setCreatedOrderId] = useState<string | null>(null);
  const [selectedPaymentMethod, setSelectedPaymentMethod] =
    useState<string>("upi");
  const { toast } = useToast();
  const { user } = useAuth();

  const loadRazorpayScript = (): Promise<boolean> => {
    return new Promise((resolve) => {
      if (window.Razorpay) {
        resolve(true);
        return;
      }

      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const getPaymentMethodConfig = (method: string) => {
    const baseConfig: any = {
      display: {
        blocks: {
          banks: {
            name: `Pay using ${method.toUpperCase()}`,
            instruments: [] as any[],
          },
        },
        sequence: ["block.banks"],
        preferences: {
          show_default_blocks: false,
        },
      },
    };

    switch (method) {
      case "upi":
        baseConfig.display.blocks.banks.instruments = [{ method: "upi" }];
        break;
      case "card":
        baseConfig.display.blocks.banks.instruments = [{ method: "card" }];
        break;
      case "netbanking":
        baseConfig.display.blocks.banks.instruments = [
          { method: "netbanking" },
        ];
        break;
      case "wallet":
        baseConfig.display.blocks.banks.instruments = [{ method: "wallet" }];
        break;
      default:
        baseConfig.display.preferences.show_default_blocks = true;
        baseConfig.display.blocks.banks.instruments = [
          { method: "upi" },
          { method: "card" },
          { method: "netbanking" },
          { method: "wallet" },
        ];
    }

    return baseConfig;
  };

  const handlePayment = async (
    paymentMethod: string = selectedPaymentMethod
  ) => {
    if (!user?.email) {
      toast({
        title: "Authentication Required",
        description: "Please log in to make a payment.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      // Load Razorpay script
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        throw new Error("Failed to load Razorpay SDK");
      }

      // Create Razorpay order with complete order data
      const orderResult = await createRazorpayOrder({
        amount,
        currency: "INR",
        receipt: `receipt_${Date.now()}`,
        notes: {
          // Store complete order data for later order creation
          firstName: orderData?.firstName,
          lastName: orderData?.lastName,
          companyName: orderData?.companyName,
          email: orderData?.email || user.email,
          phone: orderData?.phone,
          iecTaxId: orderData?.iecTaxId,
          shippingAddress: orderData?.shippingAddress,
          city: orderData?.city,
          country: orderData?.country,
          incoterms: orderData?.incoterms,
          specialInstructions: orderData?.specialInstructions,
          items: cartItems || [],
          shippingCost: shippingCost || 0,
          total_amount: amount,
          user_email: user.email,
          preferred_payment_method: paymentMethod,
        },
        orderId,
      });

      if (!orderResult.success || !orderResult.order || !orderResult.key_id) {
        throw new Error(orderResult.error || "Failed to create payment order");
      }

      const createdOrder = orderResult.order;
      setCreatedOrderId(createdOrder.id);

      // Configure Razorpay options with payment method preference
      const baseOptions = getRazorpayOptions(
        createdOrder,
        orderResult.key_id,
        user.email
      );
      const paymentConfig = getPaymentMethodConfig(paymentMethod);

      const options = {
        ...baseOptions,
        config: paymentConfig,
        handler: async (response: any) => {
          try {
            console.log("=== RAZORPAY RESPONSE ===");
            console.log("Razorpay response:", response);
            console.log("Payment method used:", paymentMethod);

            const orderIdToUse = createdOrder.id;

            // Verify payment
            const verificationResult = await verifyRazorpayPayment({
              razorpay_order_id: orderIdToUse,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              order_id: orderId,
            });

            if (verificationResult.success) {
              toast({
                title: "Payment Successful!",
                description: `Your payment via ${paymentMethod.toUpperCase()} has been processed successfully.`,
              });
              onSuccess?.(response.razorpay_payment_id);
            } else {
              throw new Error(
                verificationResult.error || "Payment verification failed"
              );
            }
          } catch (error) {
            console.error("Payment verification error:", error);
            toast({
              title: "Payment Verification Failed",
              description: "Please contact support if amount was deducted.",
              variant: "destructive",
            });
            onError?.(
              error instanceof Error ? error.message : "Verification failed"
            );
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
        },
      };

      // Open Razorpay checkout
      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (error) {
      console.error("Payment error:", error);
      toast({
        title: "Payment Failed",
        description:
          error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive",
      });
      onError?.(error instanceof Error ? error.message : "Payment failed");
    } finally {
      setLoading(false);
    }
  };

  const paymentMethods = [
    {
      id: "upi",
      name: "UPI",
      icon: Smartphone,
      description: "Pay using UPI apps like GPay, PhonePe, Paytm",
      popular: true,
    },
    {
      id: "card",
      name: "Cards",
      icon: CreditCard,
      description: "Credit/Debit Cards, EMI options available",
      popular: false,
    },
    {
      id: "netbanking",
      name: "Net Banking",
      icon: Building2,
      description: "Direct bank transfer from your account",
      popular: false,
    },
    {
      id: "wallet",
      name: "Wallets",
      icon: Wallet,
      description: "Paytm, Mobikwik, Amazon Pay & more",
      popular: false,
    },
  ];

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
      <CardContent className="space-y-6">
        <div className="flex justify-between items-center p-4 bg-secondary/20 rounded-lg">
          <span className="font-medium">Total Amount:</span>
          <span className="text-2xl font-bold text-primary">
            {formatPrice(amount)}
          </span>
        </div>

        {/* Payment Method Selection */}
        <div className="space-y-4">
          <h3 className="font-medium text-sm">Choose Payment Method</h3>
          <Tabs
            value={selectedPaymentMethod}
            onValueChange={setSelectedPaymentMethod}
          >
            <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4">
              {paymentMethods.map((method) => (
                <TabsTrigger
                  key={method.id}
                  value={method.id}
                  className="text-xs"
                >
                  <method.icon className="h-4 w-4 mr-1" />
                  {method.name}
                  {method.popular && (
                    <Badge
                      variant="secondary"
                      className="ml-1 text-[10px] px-1"
                    >
                      Popular
                    </Badge>
                  )}
                </TabsTrigger>
              ))}
            </TabsList>

            {paymentMethods.map((method) => (
              <TabsContent key={method.id} value={method.id} className="mt-4">
                <div className="p-4 border rounded-lg bg-secondary/10">
                  <div className="flex items-center gap-3 mb-2">
                    <method.icon className="h-5 w-5 text-primary" />
                    <div>
                      <h4 className="font-medium">{method.name}</h4>
                      <p className="text-sm text-muted-foreground">
                        {method.description}
                      </p>
                    </div>
                  </div>

                  {method.id === "upi" && (
                    <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                      <div className="flex items-center gap-2 mb-2">
                        <Smartphone className="h-4 w-4 text-blue-600" />
                        <span className="text-sm font-medium text-blue-900">
                          UPI Benefits
                        </span>
                      </div>
                      <ul className="text-xs text-blue-800 space-y-1">
                        <li>• Instant payment confirmation</li>
                        <li>• No additional charges</li>
                        <li>• Works with all UPI apps</li>
                        <li>• Secure & encrypted transactions</li>
                      </ul>
                    </div>
                  )}

                  <Button
                    onClick={() => handlePayment(method.id)}
                    disabled={disabled || loading || amount <= 0}
                    className="w-full mt-3"
                    size="lg"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <method.icon className="h-4 w-4 mr-2" />
                        Pay {formatPrice(amount)} via {method.name}
                      </>
                    )}
                  </Button>
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </div>

        {/* Quick Pay with All Methods */}
        <div className="border-t pt-4">
          <Button
            onClick={() => handlePayment("all")}
            disabled={disabled || loading || amount <= 0}
            variant="outline"
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
                Pay {formatPrice(amount)} - All Methods
              </>
            )}
          </Button>
        </div>

        <div className="space-y-2 text-sm text-muted-foreground">
          <p>• Secure payment processing with Razorpay</p>
          <p>• Supports UPI, Cards, Net Banking & Wallets</p>
          <p>• Test mode - No real money will be charged</p>
          <p>• UPI payments are processed instantly</p>
        </div>

        <p className="text-xs text-center text-muted-foreground">
          By proceeding, you agree to our terms and conditions
        </p>
      </CardContent>
    </Card>
  );
}
