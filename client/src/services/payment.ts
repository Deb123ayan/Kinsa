import { supabase } from "@/lib/supabase";

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
    console.log("=== SIMPLIFIED PAYMENT FLOW FOR TESTING ===");

    // Get user session for email
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session) {
      throw new Error("User not authenticated");
    }

    // Limit test amount to avoid Razorpay limits (max ₹500 for test)
    const testAmount = Math.min(options.amount, 500);
    console.log(
      `Original amount: ₹${options.amount}, Test amount: ₹${testAmount}`
    );

    // Create a simplified order that works with Razorpay checkout
    const testOrder = {
      id: `order_test_${Date.now()}`,
      amount: Math.round(testAmount * 100), // Convert to paise
      currency: options.currency || "INR",
      receipt: options.receipt || `receipt_${Date.now()}`,
      status: "created",
    };

    console.log("Test order created:", testOrder);
    console.log("Order data being stored in notes:", options.notes);

    const paymentRecord = {
      user_email: session.user.email,
      razorpay_order_id: testOrder.id,
      amount: options.amount, // Store original amount in rupees
      currency: testOrder.currency,
      status: "created",
      notes: {
        ...options.notes,
        test_mode: true,
        original_amount: options.amount,
        test_amount: testAmount,
      },
    };

    console.log("Payment record to be inserted:", paymentRecord);

    // Store payment record in Supabase (store original amount)
    const { data: insertedPayment, error: dbError } = await supabase
      .from("payments")
      .insert([paymentRecord])
      .select()
      .single();

    if (dbError) {
      console.error("Database error:", dbError);
      throw new Error("Failed to store payment record: " + dbError.message);
    }

    console.log("Payment record stored successfully:", insertedPayment);

    // Return success with test mode configuration
    return {
      success: true,
      order: testOrder,
      key_id: import.meta.env.VITE_RAZORPAY_KEY_ID || "rzp_test_RwITuiLCTym9FI",
    };
  } catch (error) {
    console.error("Error creating Razorpay order:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}

async function makeRazorpayRequest(
  options: PaymentOptions,
  accessToken: string
) {
  console.log("Making Razorpay request with options:", options);

  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

  const response = await fetch(
    `${supabaseUrl}/functions/v1/create-razorpay-order`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
        apikey: supabaseKey,
      },
      body: JSON.stringify(options),
    }
  );

  console.log("Response status:", response.status);

  const responseText = await response.text();
  console.log("Response body:", responseText);

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

export async function verifyRazorpayPayment(
  verification: PaymentVerification
): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    console.log("=== FRONTEND VERIFICATION WITH ORDER CREATION ===");

    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session) {
      throw new Error("User not authenticated");
    }

    console.log("Verification data:", verification);

    // Update payment record directly
    const { error: updateError } = await supabase
      .from("payments")
      .update({
        razorpay_payment_id: verification.razorpay_payment_id,
        razorpay_signature: verification.razorpay_signature,
        status: "paid",
      })
      .eq("razorpay_order_id", verification.razorpay_order_id)
      .eq("user_email", session.user.email);

    if (updateError) {
      console.error("Database Update Error:", updateError);
      throw new Error(
        "Failed to update payment record: " + updateError.message
      );
    }

    // Create order from payment notes (similar to Edge Function)
    try {
      console.log("Attempting to fetch payment record for order creation...");
      console.log("Looking for razorpay_order_id:", verification.razorpay_order_id);
      console.log("Looking for user_email:", session.user.email);

      // Get the payment record to extract order data
      const { data: payment, error: fetchError } = await supabase
        .from("payments")
        .select("*") // Select all fields to see what's there
        .eq("razorpay_order_id", verification.razorpay_order_id)
        .eq("user_email", session.user.email)
        .single();

      console.log("Payment fetch result:", { payment, fetchError });

      if (fetchError) {
        console.error("Error fetching payment record:", fetchError);
        throw new Error(`Failed to fetch payment record: ${fetchError.message}`);
      }

      if (!payment) {
        console.error("No payment record found");
        throw new Error("Payment record not found");
      }

      if (!payment.notes) {
        console.error("Payment record found but notes field is empty:", payment);
        throw new Error("Payment notes not found - order data missing");
      }

      console.log("Payment notes found:", payment.notes);
      const orderData = payment.notes;

      // Validate that we have the required order data
      if (!orderData.firstName || !orderData.lastName || !orderData.email) {
        throw new Error("Incomplete order data in payment notes");
      }

      const totalAmount =
        orderData.items?.reduce(
          (sum: number, item: any) => sum + item.product.price * item.quantity,
          0
        ) + (orderData.shippingCost || 0);

      const orderRecord = {
        name: `${orderData.firstName} ${orderData.lastName}`,
        email: session.user.email, // Use authenticated user's email instead of form email
        products: JSON.stringify(
          orderData.items?.map((item: any) => ({
            id: item.product.id,
            name: item.product.name,
            price: item.product.price,
            unit: item.product.unit,
            quantity: item.quantity,
          })) || []
        ),
        number: orderData.phone,
        "import export code": orderData.iecTaxId || null,
        "shipping address": `${orderData.shippingAddress}, ${orderData.city}, ${orderData.country}`,
        port: orderData.city,
        country: orderData.country,
        status: "confirmed",
        incoterms: orderData.incoterms,
        instructions: orderData.specialInstructions || null,
        total_amount: totalAmount,
        payment: "paid",
      };

      console.log("Creating order with data:", orderRecord);
      console.log("Current user email:", session.user.email);
      console.log("Order email:", orderRecord.email);

      const { data: newOrder, error: orderError } = await supabase
        .from("order")
        .insert([orderRecord])
        .select()
        .single();

      if (orderError) {
        console.error("Order creation error:", orderError);
        console.error(
          "Order creation error details:",
          JSON.stringify(orderError, null, 2)
        );
        throw new Error("Failed to create order: " + orderError.message);
      }

      console.log("Order created successfully:", newOrder);

      // Update payment record with the new order ID
      const { error: linkError } = await supabase
        .from("payments")
        .update({ order_id: newOrder.id })
        .eq("razorpay_order_id", verification.razorpay_order_id)
        .eq("user_email", session.user.email);

      if (linkError) {
        console.error("Failed to link payment to order:", linkError);
        // Don't fail the whole process for this
      }

      console.log(
        "Payment verification and order creation completed successfully"
      );
    } catch (orderCreationError) {
      console.error("Order creation failed:", orderCreationError);
      // Don't fail the payment verification if order creation fails
      // The payment is still successful, but we should log this
      throw orderCreationError; // Actually, let's fail it so user knows something went wrong
    }

    return {
      success: true,
    };
  } catch (error) {
    console.error("Error verifying Razorpay payment:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}

export async function getUserPayments(): Promise<any[]> {
  try {
    const { data, error } = await supabase
      .from("payments")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error("Error fetching payments:", error);
    throw error;
  }
}

// Debug function to check payment records
export async function debugPaymentRecords(): Promise<void> {
  try {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session) {
      console.log("No user session for debug");
      return;
    }

    console.log("=== DEBUG: Checking payment records ===");
    console.log("Current user email:", session.user.email);

    const { data: payments, error } = await supabase
      .from("payments")
      .select("*")
      .eq("user_email", session.user.email)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching payments for debug:", error);
      return;
    }

    console.log("Found payments:", payments);
    payments?.forEach((payment, index) => {
      console.log(`Payment ${index + 1}:`, {
        id: payment.id,
        razorpay_order_id: payment.razorpay_order_id,
        status: payment.status,
        amount: payment.amount,
        notes: payment.notes,
        created_at: payment.created_at,
      });
    });
  } catch (error) {
    console.error("Debug payment records error:", error);
  }
}

// Razorpay checkout options
export function getRazorpayOptions(
  order: RazorpayOrder,
  keyId: string,
  userEmail: string
) {
  return {
    key: keyId,
    amount: order.amount,
    currency: order.currency,
    name: "KINSA Global",
    description: "Payment for agricultural products",
    image: "/logo_favicon.jpeg",
    // Don't pass order_id for test mode - this allows manual testing
    // order_id: order.id,
    prefill: {
      email: userEmail,
    },
    theme: {
      color: "#3B82F6", // Your primary color
    },
    modal: {
      ondismiss: () => {
        console.log("Payment modal dismissed");
      },
    },
    // Enhanced configuration for better UPI support
    config: {
      display: {
        blocks: {
          banks: {
            name: "Pay using UPI, Cards & More",
            instruments: [
              {
                method: "upi",
              },
              {
                method: "card",
              },
              {
                method: "netbanking",
              },
              {
                method: "wallet",
              },
            ],
          },
        },
        sequence: ["block.banks"],
        preferences: {
          show_default_blocks: true,
        },
      },
    },
    // UPI specific options
    upi: {
      flow: "collect", // or "intent" for UPI apps
    },
    // Retry configuration
    retry: {
      enabled: true,
      max_count: 3,
    },
    // Timeout configuration
    timeout: 300, // 5 minutes
    // Remember customer preference
    remember_customer: false,
  };
}
