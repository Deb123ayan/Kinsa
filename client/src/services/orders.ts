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

export interface DatabaseOrder {
  id: number;
  created_at: string;
  user_id: string;
  status: string;
  total_amount: number;
  shipping_cost: number;
  first_name: string;
  last_name: string;
  company_name: string;
  email: string;
  phone: string;
  iec_tax_id: string | null;
  shipping_address: string;
  city: string;
  country: string;
  incoterms: string;
  special_instructions: string | null;
}

export interface DatabaseOrderItem {
  id: number;
  created_at: string;
  order_id: number;
  product_id: number;
  quantity: number;
  unit_price: number;
  total_price: number;
}

export interface Order extends DatabaseOrder {
  items: Array<DatabaseOrderItem & {
    product: Product;
  }>;
}

export async function createOrder(orderData: OrderData): Promise<{ success: boolean; orderId?: number; error?: string }> {
  try {
    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      throw new Error('User not authenticated');
    }

    // Start a transaction by creating the order first
    const { data: order, error: orderError } = await supabase
      .from('Orders')
      .insert({
        user_id: user.id,
        status: 'pending',
        shipping_cost: orderData.shippingCost,
        first_name: orderData.firstName,
        last_name: orderData.lastName,
        company_name: orderData.companyName,
        email: orderData.email,
        phone: orderData.phone,
        iec_tax_id: orderData.iecTaxId || null,
        shipping_address: orderData.shippingAddress,
        city: orderData.city,
        country: orderData.country,
        incoterms: orderData.incoterms,
        special_instructions: orderData.specialInstructions || null,
      })
      .select()
      .single();

    if (orderError) {
      console.error('Error creating order:', orderError);
      throw new Error('Failed to create order');
    }

    // Create order items (this will automatically update stock via trigger)
    const orderItems = orderData.items.map(item => ({
      order_id: order.id,
      product_id: parseInt(item.product.id),
      quantity: item.quantity,
      unit_price: item.product.price,
      total_price: item.product.price * item.quantity,
    }));

    const { error: itemsError } = await supabase
      .from('OrderItems')
      .insert(orderItems);

    if (itemsError) {
      console.error('Error creating order items:', itemsError);
      
      // If there's an error with items, delete the order
      await supabase.from('Orders').delete().eq('id', order.id);
      
      // Check if it's a stock error
      if (itemsError.message.includes('Insufficient stock')) {
        throw new Error('Insufficient stock for one or more products');
      }
      
      throw new Error('Failed to create order items');
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

    console.log(`[${requestId}] User authenticated, fetching orders for user: ${user.id}`);

    // Fetch orders with their items
    const { data: orders, error: ordersError } = await supabase
      .from('Orders')
      .select(`
        *,
        OrderItems (
          *,
          Products (*)
        )
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (ordersError) {
      console.error(`[${requestId}] Error fetching orders:`, ordersError);
      throw new Error(`Failed to fetch orders: ${ordersError.message}`);
    }

    console.log(`[${requestId}] Successfully fetched ${orders?.length || 0} orders`);

    // Transform the data to match our interface
    return (orders || []).map(order => ({
      ...order,
      items: (order.OrderItems || []).map((item: any) => ({
        ...item,
        product: {
          id: item.Products.id.toString(),
          name: item.Products.name || 'Unknown Product',
          category: determineCategory(item.Products.name || '', item.Products.code || ''),
          price: Number(item.Products.price) || 0,
          unit: 'MT',
          image: item.Products.img || 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=800&h=600&fit=crop',
          description: item.Products.description || 'Premium quality product for export.',
          specs: generateSpecs(item.Products.name || '', determineCategory(item.Products.name || '', item.Products.code || '')),
          inStock: (item.Products.stock || 0) > 0,
          code: item.Products.code || undefined,
          stock: item.Products.stock || undefined,
        }
      }))
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
      .from('Orders')
      .update({ status: 'cancelled' })
      .eq('id', orderId)
      .eq('user_id', user.id);

    if (updateError) {
      console.error('Error cancelling order:', updateError);
      throw new Error('Failed to cancel order');
    }

    // Delete order items (this will restore stock via trigger)
    const { error: deleteError } = await supabase
      .from('OrderItems')
      .delete()
      .eq('order_id', orderId);

    if (deleteError) {
      console.error('Error deleting order items:', deleteError);
      throw new Error('Failed to restore stock');
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

// Helper functions (copied from products service to avoid circular imports)
function determineCategory(name: string, code?: string): "Grains" | "Spices" | "Pulses" {
  const nameUpper = name.toUpperCase();
  const codeUpper = code?.toUpperCase() || '';
  
  if (nameUpper.includes('RICE') || nameUpper.includes('WHEAT') || nameUpper.includes('MAIZE') || 
      nameUpper.includes('CORN') || codeUpper.includes('RICE') || codeUpper.includes('GRAIN')) {
    return 'Grains';
  }
  
  if (nameUpper.includes('LENTIL') || nameUpper.includes('CHICKPEA') || nameUpper.includes('BEAN') ||
      nameUpper.includes('PEA') || nameUpper.includes('DAL') || codeUpper.includes('PULSE')) {
    return 'Pulses';
  }
  
  return 'Spices';
}

function generateSpecs(name: string, category: string): any {
  const nameUpper = name.toUpperCase();
  const specs: any = {};
  
  if (category === 'Grains') {
    specs.moisture = '10-12%';
    specs.purity = '99%';
    if (nameUpper.includes('BASMATI')) {
      specs.origin = 'Punjab, India';
      specs.grade = 'Premium Long Grain';
    } else if (nameUpper.includes('WHEAT')) {
      specs.origin = 'Madhya Pradesh, India';
      specs.grade = 'Export Quality';
    } else {
      specs.origin = 'India';
      specs.grade = 'Premium';
    }
  } else if (category === 'Spices') {
    specs.moisture = '8-10%';
    specs.purity = '98%';
    if (nameUpper.includes('TURMERIC')) {
      specs.origin = 'Salem, India';
      specs.grade = 'High Curcumin';
    } else if (nameUpper.includes('CARDAMOM')) {
      specs.origin = 'Kerala, India';
      specs.grade = 'Premium Grade';
    } else if (nameUpper.includes('PEPPER')) {
      specs.origin = 'Kerala, India';
      specs.grade = 'Bold';
    } else {
      specs.origin = 'India';
      specs.grade = 'Premium';
    }
  } else if (category === 'Pulses') {
    specs.moisture = '10-11%';
    specs.purity = '99.5%';
    specs.origin = 'India';
    specs.grade = 'Sortex Cleaned';
  }
  
  return specs;
}