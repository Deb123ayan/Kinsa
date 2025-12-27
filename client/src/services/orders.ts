import { supabase } from '@/lib/supabase';
import type { Product } from './products';

export interface OrderData {
  // Customer details
  firstName: string;
  lastName: string;
  companyName: string;
  email: string;
  phone: string;
  iecTaxId?: string;
  
  // Shipping details
  shippingAddress: string;
  city: string;
  country: string;
  incoterms: string;
  specialInstructions?: string;
  
  // Order details
  items: Array<{
    product: Product;
    quantity: number;
  }>;
  shippingCost: number;
}

export interface SimpleOrder {
  id: number;
  created_at: string;
  name: string | null;
  email: string | null;
  products: any | null; // JSON field
  number: number | null;
  'import export code': string | null;
  'shipping address': string | null;
  port: string | null;
  country: string | null;
  status: string | null;
  incoterms: string | null;
  instructions: string | null;
  total_amount: number | null;
  payment: string | null;
}

export interface Order extends SimpleOrder {
  items: Array<{
    product: Product;
    quantity: number;
    total_price: number;
  }>;
}

export async function createOrder(orderData: OrderData): Promise<{ success: boolean; orderId?: number; error?: string }> {
  try {
    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      throw new Error('User not authenticated');
    }

    // Calculate total amount
    const itemsTotal = orderData.items.reduce((sum, item) => 
      sum + (item.product.price * item.quantity), 0
    );
    const totalAmount = itemsTotal + orderData.shippingCost;

    // Prepare products JSON
    const productsJson = orderData.items.map(item => ({
      id: item.product.id,
      name: item.product.name,
      price: item.product.price,
      quantity: item.quantity,
      unit: item.product.unit,
      total: item.product.price * item.quantity
    }));

    // Create the order
    const { data: order, error: orderError } = await supabase
      .from('order')
      .insert({
        name: `${orderData.firstName} ${orderData.lastName}`,
        email: user.email,
        products: productsJson,
        number: orderData.phone ? parseFloat(orderData.phone.replace(/\D/g, '')) : null,
        'import export code': orderData.iecTaxId || null,
        'shipping address': `${orderData.shippingAddress}, ${orderData.city}`,
        port: orderData.city, // Using city as port for now
        country: orderData.country,
        status: 'in transit', // Default status as requested
        incoterms: orderData.incoterms,
        instructions: orderData.specialInstructions || null,
        total_amount: totalAmount,
        payment: 'paid' // Default payment status as requested
      })
      .select()
      .single();

    if (orderError) {
      console.error('Error creating order:', orderError);
      throw new Error('Failed to create order');
    }

    return { success: true, orderId: order.id };
  } catch (error) {
    console.error('Error in createOrder:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error occurred' 
    };
  }
}

export async function getUserOrders(): Promise<Order[]> {
  try {
    // Add a unique timestamp to prevent caching issues
    const requestId = Date.now();
    console.log(`[${requestId}] Fetching user orders...`);
    
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      console.error(`[${requestId}] User not authenticated:`, userError);
      throw new Error('User not authenticated');
    }

    console.log(`[${requestId}] User authenticated, fetching orders for user: ${user.email}`);

    // Fetch orders for the current user
    const { data: orders, error: ordersError } = await supabase
      .from('order')
      .select('*')
      .eq('email', user.email)
      .order('created_at', { ascending: false });

    if (ordersError) {
      console.error(`[${requestId}] Error fetching orders:`, ordersError);
      throw new Error(`Failed to fetch orders: ${ordersError.message}`);
    }

    console.log(`[${requestId}] Successfully fetched ${orders?.length || 0} orders`);

    // Transform the data to match our interface
    return (orders || []).map(order => ({
      ...order,
      items: Array.isArray(order.products) ? order.products.map((product: any) => ({
        product: {
          id: product.id?.toString() || '',
          name: product.name || 'Unknown Product',
          category: determineCategory(product.name || ''),
          price: Number(product.price) || 0,
          unit: product.unit || 'MT',
          image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=800&h=600&fit=crop',
          description: 'Premium quality product for export.',
          specs: generateSpecs(product.name || ''),
          inStock: true,
        },
        quantity: product.quantity || 0,
        total_price: product.total || 0
      })) : []
    }));
  } catch (error) {
    console.error('Failed to fetch user orders:', error);
    throw error;
  }
}

export async function cancelOrder(orderId: number): Promise<{ success: boolean; error?: string }> {
  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      throw new Error('User not authenticated');
    }

    // Update order status to cancelled
    const { error: updateError } = await supabase
      .from('order')
      .update({ status: 'cancelled' })
      .eq('id', orderId)
      .eq('email', user.email);

    if (updateError) {
      console.error('Error cancelling order:', updateError);
      throw new Error('Failed to cancel order');
    }

    return { success: true };
  } catch (error) {
    console.error('Error in cancelOrder:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error occurred' 
    };
  }
}

// Helper functions
function determineCategory(name: string): "Grains" | "Spices" | "Pulses" {
  const nameUpper = name.toUpperCase();
  
  if (nameUpper.includes('RICE') || nameUpper.includes('WHEAT') || nameUpper.includes('MAIZE') || 
      nameUpper.includes('CORN')) {
    return 'Grains';
  }
  
  if (nameUpper.includes('LENTIL') || nameUpper.includes('CHICKPEA') || nameUpper.includes('BEAN') ||
      nameUpper.includes('PEA') || nameUpper.includes('DAL')) {
    return 'Pulses';
  }
  
  return 'Spices';
}

function generateSpecs(name: string): any {
  const nameUpper = name.toUpperCase();
  const specs: any = {};
  
  if (nameUpper.includes('RICE') || nameUpper.includes('WHEAT') || nameUpper.includes('GRAIN')) {
    specs.moisture = '10-12%';
    specs.purity = '99%';
    specs.origin = 'India';
    specs.grade = 'Premium';
  } else if (nameUpper.includes('SPICE') || nameUpper.includes('TURMERIC') || nameUpper.includes('PEPPER')) {
    specs.moisture = '8-10%';
    specs.purity = '98%';
    specs.origin = 'India';
    specs.grade = 'Premium';
  } else {
    specs.moisture = '10-11%';
    specs.purity = '99.5%';
    specs.origin = 'India';
    specs.grade = 'Sortex Cleaned';
  }
  
  return specs;
}