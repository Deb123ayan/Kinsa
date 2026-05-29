// Supabase Edge Function for Razorpay Order Creation
// This runs on Deno runtime, not Node.js
/// <reference path="./types.d.ts" />

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
    // ✅ REQUIRED ENV VARIABLES
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!supabaseUrl || !serviceRoleKey) {
      throw new Error("Supabase environment variables missing");
    }

    // ✅ Server-side Supabase client
    const supabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false },
    });

    // ✅ Verify user from Authorization header
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

    // ✅ Rate Limiting via Supabase Postgres (Max 10 orders per minute per user)
    const { data: isAllowed, error: rateLimitError } = await supabase.rpc('check_rate_limit', {
      p_ip: `razorpay_user_${user.id}`,
      p_max_points: 10,
      p_reset_seconds: 60 
    });

    if (rateLimitError) {
      console.error("Rate limit check error:", rateLimitError);
    } else if (isAllowed === false) {
      return new Response(JSON.stringify({ error: "Too many payment orders created. Please try again later." }), {
        status: 429,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ✅ Parse request body
    const { currency = "INR", receipt, notes } = await req.json();

    if (!notes || !notes.items || !Array.isArray(notes.items) || notes.items.length === 0) {
      return new Response(
        JSON.stringify({ error: "Order items are required in notes" }),
        { status: 400, headers: corsHeaders }
      );
    }

    // ✅ Securely calculate the true amount
    let trueTotalRupees = 0;
    
    // Extract unique product IDs from the order
    const productIds = notes.items.map((item: any) => item.product.id);
    
    // Fetch actual prices from the database
    const { data: dbProducts, error: productsError } = await supabase
      .from("Products")
      .select("id, price")
      .in("id", productIds);

    if (productsError) {
      console.error("Failed to fetch products:", productsError);
      return new Response(JSON.stringify({ error: "Failed to verify product prices" }), {
        status: 500, headers: corsHeaders
      });
    }

    // Map DB prices for quick lookup
    const priceMap = new Map();
    dbProducts?.forEach(p => {
      priceMap.set(p.id.toString(), Number(p.price));
    });

    // Calculate total from DB prices
    for (const item of notes.items) {
      const productId = item.product.id.toString();
      const dbPrice = priceMap.get(productId);
      
      if (dbPrice === undefined) {
        return new Response(JSON.stringify({ error: `Product ID ${productId} not found in database.` }), {
          status: 400, headers: corsHeaders
        });
      }
      
      // Update the notes item with the true DB price to ensure accuracy downstream
      item.product.price = dbPrice;
      
      const quantity = Number(item.quantity) || 0;
      trueTotalRupees += (dbPrice * quantity);
    }

    // Add shipping cost (Assuming a fixed shipping cost or standard rate provided securely)
    // Here we trust the shipping cost from the notes for simplicity, but ideally, 
    // it should be calculated dynamically based on location in a real production app.
    const shippingCost = Number(notes.shippingCost) || 0;
    trueTotalRupees += shippingCost;
    
    // We update the notes total_amount to reflect the secure calculation
    notes.total_amount = trueTotalRupees;
    notes.securely_calculated = true;

    if (trueTotalRupees <= 0) {
      return new Response(
        JSON.stringify({ error: "Calculated order amount must be greater than zero" }),
        { status: 400, headers: corsHeaders }
      );
    }


    // ✅ Razorpay credentials
    const razorpayKeyId = Deno.env.get("RAZORPAY_KEY_ID");
    const razorpayKeySecret = Deno.env.get("RAZORPAY_KEY_SECRET");

    if (!razorpayKeyId || !razorpayKeySecret) {
      throw new Error("Razorpay credentials not configured");
    }

    const auth = btoa(`${razorpayKeyId}:${razorpayKeySecret}`);

    // ✅ Create Razorpay order
    const razorpayResponse = await fetch("https://api.razorpay.com/v1/orders", {
      method: "POST",
      headers: {
        Authorization: `Basic ${auth}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        amount: Math.round(trueTotalRupees * 100), // paise
        currency,
        receipt: receipt || `receipt_${Date.now()}`,
        notes: notes || {},
      }),
    });

    const razorpayOrder = await razorpayResponse.json();

    if (!razorpayResponse.ok) {
      console.error("Razorpay Error:", razorpayOrder);
      return new Response(
        JSON.stringify({ error: "Razorpay order creation failed" }),
        { status: 500, headers: corsHeaders }
      );
    }

    // ✅ Store payment (store RUPEES, not paise)
    const { error: dbError } = await supabase.from("payments").insert({
      user_email: user.email,
      razorpay_order_id: razorpayOrder.id,
      amount: trueTotalRupees, // rupees
      currency,
      status: "created",
      notes: razorpayOrder.notes,
    });

    if (dbError) {
      console.error("DB Error:", dbError);
      throw new Error("Failed to store payment record");
    }

    return new Response(
      JSON.stringify({
        success: true,
        order: razorpayOrder,
        key_id: razorpayKeyId,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Edge Function Error:", error);

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
