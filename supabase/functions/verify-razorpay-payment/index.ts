// @deno-types="https://esm.sh/@supabase/functions-js/src/edge-runtime.d.ts"
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

serve(async (req: Request) => {
  // ✅ CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    // ✅ Env validation
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    const razorpaySecret = Deno.env.get("RAZORPAY_KEY_SECRET");

    if (!supabaseUrl || !serviceRoleKey || !razorpaySecret) {
      throw new Error("Server configuration missing");
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false },
    });

    // ✅ Auth verification
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Authorization header missing" }),
        { status: 401, headers: corsHeaders }
      );
    }

    const jwt = authHeader.replace("Bearer ", "");

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser(jwt);

    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: corsHeaders,
      });
    }

    // ✅ Request body
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      order_id,
    } = await req.json();

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return new Response(
        JSON.stringify({ error: "Missing payment verification fields" }),
        { status: 400, headers: corsHeaders }
      );
    }

    // ✅ Signature verification
    const payload = `${razorpay_order_id}|${razorpay_payment_id}`;

    const key = await crypto.subtle.importKey(
      "raw",
      new TextEncoder().encode(razorpaySecret),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"]
    );

    const signed = await crypto.subtle.sign(
      "HMAC",
      key,
      new TextEncoder().encode(payload)
    );

    const expectedSignature = Array.from(new Uint8Array(signed))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");

    if (expectedSignature !== razorpay_signature) {
      return new Response(
        JSON.stringify({ error: "Invalid payment signature" }),
        { status: 400, headers: corsHeaders }
      );
    }

    // ✅ Update payment
    const { error: paymentError } = await supabase
      .from("payments")
      .update({
        razorpay_payment_id,
        razorpay_signature,
        status: "paid",
      })
      .eq("razorpay_order_id", razorpay_order_id)
      .eq("user_email", user.email);

    if (paymentError) {
      console.error("Payment update failed:", paymentError);
      throw new Error("Payment update failed");
    }

    // ✅ Create the actual order after successful payment
    try {
      // Get the payment record to extract order data
      const { data: payment, error: fetchError } = await supabase
        .from("payments")
        .select("notes")
        .eq("razorpay_order_id", razorpay_order_id)
        .eq("user_email", user.email)
        .single();

      if (fetchError || !payment?.notes) {
        console.error("Could not fetch payment notes for order creation:", fetchError);
      } else {
        console.log("Payment notes found:", payment.notes);
        const orderData = payment.notes;
        
        const totalAmount = orderData.items?.reduce((sum: number, item: any) => 
          sum + (item.product.price * item.quantity), 0
        ) + (orderData.shippingCost || 0);

        const orderRecord = {
          name: `${orderData.firstName} ${orderData.lastName}`,
          email: orderData.email,
          products: JSON.stringify(orderData.items?.map((item: any) => ({
            id: item.product.id,
            name: item.product.name,
            price: item.product.price,
            unit: item.product.unit,
            quantity: item.quantity
          })) || []),
          number: orderData.phone,
          'import export code': orderData.iecTaxId || null,
          'shipping address': `${orderData.shippingAddress}, ${orderData.city}, ${orderData.country}`,
          port: orderData.city,
          country: orderData.country,
          status: 'confirmed',
          incoterms: orderData.incoterms,
          instructions: orderData.specialInstructions || null,
          total_amount: totalAmount,
          payment: 'paid'
        };

        console.log("Creating order with data:", orderRecord);

        const { data: newOrder, error: orderError } = await supabase
          .from("order")
          .insert([orderRecord])
          .select()
          .single();

        if (!orderError && newOrder) {
          // Update payment record with the new order ID
          await supabase
            .from("payments")
            .update({ order_id: newOrder.id })
            .eq("razorpay_order_id", razorpay_order_id)
            .eq("user_email", user.email);
        }
      }
    } catch (orderCreationError) {
      console.error("Order creation after payment failed:", orderCreationError);
      // Don't fail the payment verification if order creation fails
      // The payment is still successful
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: "Payment verified successfully",
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Verification error:", error);

    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
