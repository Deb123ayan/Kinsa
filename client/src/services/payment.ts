import { supabase } from '@/lib/supabase';

export interface RazorpayOrder {
  id: string;
  amount: number;
  currency: string;
  receipt: string;
  status: string;
}

export interface PaymentOptions {
  amount: number;
  currency?: string;
  receipt?: string;
  notes?: Record<string, any>;
  orderId?: number;
}

export interface PaymentVerification {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
  order_id?: number;
}

export async function createRazorpayOrder(options: PaymentOptions): Promise<{
  success: boolean;
  order?: RazorpayOrder;
  key_id?: string;
  error?: string;
}> {
  try {
    console.log('=== SIMPLIFIED PAYMENT FLOW FOR TESTING ===');
    
    // Get user session for email
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      throw new Error('User not authenticated');
    }

    // Limit test amount to avoid Razorpay limits (max ₹500 for test)
    const testAmount = Math.min(options.amount, 500);
    console.log(`Original amount: ₹${options.amount}, Test amount: ₹${testAmount}`);

    // Create a simplified order that works with Razorpay checkout
    const testOrder = {
      id: `order_test_${Date.now()}`,
      amount: Math.round(testAmount * 100), // Convert to paise
      currency: options.currency || 'INR',
      receipt: options.receipt || `receipt_${Date.now()}`,
      status: 'created'
    };

    console.log('Test order created:', testOrder);

    // Store payment record in Supabase (store original amount)
    const { error: dbError } = await supabase
      .from('payments')
      .insert({
        user_email: session.user.email,
        razorpay_order_id: testOrder.id,
        amount: options.amount, // Store original amount in rupees
        currency: testOrder.currency,
        status: 'created',
        notes: { 
          ...options.notes,
          test_mode: true,
          original_amount: options.amount,
          test_amount: testAmount
        },
      });

    if (dbError) {
      console.error('Database error:', dbError);
      throw new Error('Failed to store payment record: ' + dbError.message);
    }

    console.log('Payment record stored successfully');

    // Return success with test mode configuration
    return {
      success: true,
      order: testOrder,
      key_id: import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_RwITuiLCTym9FI',
    };

  } catch (error) {
    console.error('Error creating Razorpay order:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}

async function makeRazorpayRequest(options: PaymentOptions, accessToken: string) {
  console.log('Making Razorpay request with options:', options);
  
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
  
  const response = await fetch(`${supabaseUrl}/functions/v1/create-razorpay-order`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${accessToken}`,
      'apikey': supabaseKey,
    },
    body: JSON.stringify(options),
  });

  console.log('Response status:', response.status);
  
  const responseText = await response.text();
  console.log('Response body:', responseText);

  if (!response.ok) {
    let errorMessage = `HTTP ${response.status}`;
    try {
      const errorData = JSON.parse(responseText);
      errorMessage = errorData.error || errorData.message || errorMessage;
    } catch {
      errorMessage = responseText || errorMessage;
    }
    throw new Error(`Edge Function Error: ${errorMessage}`);
  }

  return JSON.parse(responseText);
}

export async function verifyRazorpayPayment(verification: PaymentVerification): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    console.log('=== TEMPORARY FRONTEND VERIFICATION ===');
    console.log('Note: This bypasses Edge Function for testing');
    
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      throw new Error('User not authenticated');
    }

    // In a real implementation, signature verification MUST be done server-side
    // This is just for testing the UI flow
    console.log('Verification data:', verification);

    // Update payment record directly
    const { error: updateError } = await supabase
      .from('payments')
      .update({
        razorpay_payment_id: verification.razorpay_payment_id,
        razorpay_signature: verification.razorpay_signature,
        status: 'paid',
        order_id: verification.order_id || null,
      })
      .eq('razorpay_order_id', verification.razorpay_order_id)
      .eq('user_email', session.user.email);

    if (updateError) {
      console.error('Database Update Error:', updateError);
      throw new Error('Failed to update payment record: ' + updateError.message);
    }

    // If order_id is provided, update order status
    if (verification.order_id) {
      const { error: orderUpdateError } = await supabase
        .from('order')
        .update({
          payment: 'paid',
          status: 'confirmed'
        })
        .eq('id', verification.order_id)
        .eq('email', session.user.email);

      if (orderUpdateError) {
        console.error('Order Update Error:', orderUpdateError);
        // Don't throw error here as payment is already recorded
      }
    }

    console.log('Payment verification completed successfully');
    
    return {
      success: true,
    };

  } catch (error) {
    console.error('Error verifying Razorpay payment:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}

export async function getUserPayments(): Promise<any[]> {
  try {
    const { data, error } = await supabase
      .from('payments')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error('Error fetching payments:', error);
    throw error;
  }
}

// Razorpay checkout options
export function getRazorpayOptions(order: RazorpayOrder, keyId: string, userEmail: string) {
  return {
    key: keyId,
    amount: order.amount,
    currency: order.currency,
    name: 'KINSA Global',
    description: 'Payment for agricultural products',
    image: '/logo_favicon.jpeg',
    // Don't pass order_id for test mode - this allows manual testing
    // order_id: order.id,
    prefill: {
      email: userEmail,
    },
    theme: {
      color: '#3B82F6', // Your primary color
    },
    modal: {
      ondismiss: () => {
        console.log('Payment modal dismissed');
      },
    },
    // Add test mode configuration
    config: {
      display: {
        blocks: {
          banks: {
            name: 'Pay using ' + order.currency,
            instruments: [
              {
                method: 'card'
              },
              {
                method: 'upi'
              }
            ],
          },
        },
        sequence: ['block.banks'],
        preferences: {
          show_default_blocks: true,
        },
      },
    },
  };
}