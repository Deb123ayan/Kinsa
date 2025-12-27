import { supabase } from '@/lib/supabase';

export interface Order {
  id: number;
  created_at: string;
  name: string | null;
  email: string | null;
  products: any;
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
  // Add items property for dashboard compatibility
  items: Array<{
    product: {
      id: string; // Changed from number to string
      name: string;
      price: number;
      unit: string;
    };
    quantity: number;
  }>;
}

export interface Payment {
  id: number;
  created_at: string;
  updated_at: string;
  order_id: number;
  user_email: string;
  razorpay_order_id: string;
  razorpay_payment_id: string | null;
  razorpay_signature: string | null;
  amount: number;
  currency: string;
  status: string;
  payment_method: string | null;
  failure_reason: string | null;
  notes: any;
}

export interface OrderWithPayment extends Order {
  payments?: Payment[];
}

export interface OrderData {
  firstName: string;
  lastName: string;
  companyName: string;
  email: string;
  phone: string;
  iecTaxId?: string;
  shippingAddress: string;
  city: string;
  country: string;
  incoterms: string;
  specialInstructions?: string;
  items: Array<{
    product: {
      id: string; // Changed from number to string to match Product interface
      name: string;
      price: number;
      unit: string;
    };
    quantity: number;
  }>;
  shippingCost: number;
}

// Interface for pending orders (stored temporarily until payment)
export interface PendingOrderData extends OrderData {
  razorpay_order_id: string;
  total_amount: number;
}

export class OrderService {
  // Create order from payment verification (called after successful payment)
  static async createOrderFromPayment(
    paymentData: {
      razorpay_order_id: string;
      user_email: string;
    }
  ): Promise<{ success: boolean; orderId?: number; error?: string }> {
    try {
      // Get the payment record to find the order data
      const { data: payment, error: paymentError } = await supabase
        .from('payments')
        .select('notes')
        .eq('razorpay_order_id', paymentData.razorpay_order_id)
        .eq('user_email', paymentData.user_email)
        .single();

      if (paymentError || !payment?.notes) {
        throw new Error('Payment record not found or missing order data');
      }

      const orderData = payment.notes as PendingOrderData;
      
      const totalAmount = orderData.items.reduce((sum, item) => 
        sum + (item.product.price * item.quantity), 0
      ) + orderData.shippingCost;

      const orderRecord = {
        name: `${orderData.firstName} ${orderData.lastName}`,
        email: orderData.email,
        products: JSON.stringify(orderData.items.map(item => ({
          id: item.product.id,
          name: item.product.name,
          price: item.product.price,
          unit: item.product.unit,
          quantity: item.quantity
        }))),
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

      const { data, error } = await supabase
        .from('order')
        .insert([orderRecord])
        .select()
        .single();

      if (error) {
        throw error;
      }

      // Update the payment record with the order ID
      await supabase
        .from('payments')
        .update({ order_id: data.id })
        .eq('razorpay_order_id', paymentData.razorpay_order_id)
        .eq('user_email', paymentData.user_email);

      return { success: true, orderId: data.id };
    } catch (error) {
      console.error('Error creating order from payment:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to create order' 
      };
    }
  }

  static async createOrder(orderData: OrderData): Promise<{ success: boolean; orderId?: number; error?: string }> {
    // This function now just validates the order data and returns success
    // The actual order will be created after payment verification
    try {
      const totalAmount = orderData.items.reduce((sum, item) => 
        sum + (item.product.price * item.quantity), 0
      ) + orderData.shippingCost;

      // Validate required fields
      if (!orderData.firstName || !orderData.lastName || !orderData.email || !orderData.phone) {
        throw new Error('Missing required fields');
      }

      if (!orderData.items || orderData.items.length === 0) {
        throw new Error('No items in order');
      }

      // Return success - the order will be created after payment
      // We use a temporary ID for the checkout flow
      return { success: true, orderId: Date.now() }; // Temporary ID
    } catch (error) {
      console.error('Error validating order:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to validate order' 
      };
    }
  }

  static async getUserOrders(userEmail: string): Promise<OrderWithPayment[]> {
    try {
      // First, get all orders for the user
      const { data: orders, error: ordersError } = await supabase
        .from('order')
        .select('*')
        .eq('email', userEmail)
        .order('created_at', { ascending: false });

      if (ordersError) {
        throw ordersError;
      }

      if (!orders || orders.length === 0) {
        return [];
      }

      // Then, get all payments for these orders
      const orderIds = orders.map(order => order.id);
      const { data: payments, error: paymentsError } = await supabase
        .from('payments')
        .select('*')
        .in('order_id', orderIds);

      if (paymentsError) {
        console.warn('Error fetching payments:', paymentsError);
        // Continue without payments if there's an error
      }

      // Combine orders with their payments
      const ordersWithPayments: OrderWithPayment[] = orders.map(order => ({
        ...order,
        payments: payments?.filter(payment => payment.order_id === order.id) || []
      }));

      return ordersWithPayments;
    } catch (error) {
      console.error('Error fetching user orders:', error);
      throw error;
    }
  }

  static async getConfirmedOrders(userEmail: string): Promise<OrderWithPayment[]> {
    try {
      // First, get all paid payments for the user
      const { data: paidPayments, error: paymentsError } = await supabase
        .from('payments')
        .select('*')
        .eq('user_email', userEmail)
        .eq('status', 'paid');

      if (paymentsError) {
        throw paymentsError;
      }

      if (!paidPayments || paidPayments.length === 0) {
        return [];
      }

      // Get the order IDs from paid payments
      const orderIds = paidPayments
        .map(payment => payment.order_id)
        .filter(id => id !== null);

      if (orderIds.length === 0) {
        return [];
      }

      // Then, get the orders for these IDs
      const { data: orders, error: ordersError } = await supabase
        .from('order')
        .select('*')
        .eq('email', userEmail)
        .in('id', orderIds)
        .order('created_at', { ascending: false });

      if (ordersError) {
        throw ordersError;
      }

      // Combine orders with their payments
      const ordersWithPayments: OrderWithPayment[] = (orders || []).map(order => ({
        ...order,
        payments: paidPayments.filter(payment => payment.order_id === order.id)
      }));

      return ordersWithPayments;
    } catch (error) {
      console.error('Error fetching confirmed orders:', error);
      throw error;
    }
  }

  static async getOrderById(orderId: number, userEmail: string): Promise<OrderWithPayment | null> {
    try {
      // Get the specific order
      const { data: order, error: orderError } = await supabase
        .from('order')
        .select('*')
        .eq('id', orderId)
        .eq('email', userEmail)
        .single();

      if (orderError) {
        throw orderError;
      }

      if (!order) {
        return null;
      }

      // Get payments for this order
      const { data: payments, error: paymentsError } = await supabase
        .from('payments')
        .select('*')
        .eq('order_id', orderId);

      if (paymentsError) {
        console.warn('Error fetching payments for order:', paymentsError);
        // Continue without payments if there's an error
      }

      return {
        ...order,
        payments: payments || []
      };
    } catch (error) {
      console.error('Error fetching order by ID:', error);
      throw error;
    }
  }

  static getOrderStatusColor(status: string | null): string {
    switch (status?.toLowerCase()) {
      case 'pending':
        return 'bg-yellow-500';
      case 'confirmed':
      case 'processing':
        return 'bg-blue-500';
      case 'shipped':
      case 'in transit':
        return 'bg-purple-500';
      case 'delivered':
        return 'bg-green-500';
      case 'cancelled':
        return 'bg-red-500';
      case 'paid': // Handle payment status
        return 'bg-green-500';
      default:
        return 'bg-blue-500'; // Default to blue for confirmed orders
    }
  }

  static getOrderStatusText(order: OrderWithPayment): string {
    // For orders with payment = 'paid' in the order table, use the order status
    if (order.payment === 'paid') {
      return order.status || 'Confirmed';
    }
    
    // For other orders, check payment records
    const hasConfirmedPayment = order.payments?.some(p => p.status === 'paid');
    
    if (!hasConfirmedPayment) {
      return 'Payment Pending';
    }
    
    return order.status || 'Processing';
  }

  static formatOrderProducts(products: any): string {
    if (!products) return 'No products';
    
    try {
      if (typeof products === 'string') {
        products = JSON.parse(products);
      }
      
      if (Array.isArray(products)) {
        return products.map(p => `${p.name} (${p.quantity} ${p.unit})`).join(', ');
      }
      
      return 'Product details available';
    } catch {
      return 'Product details available';
    }
  }
}

// Export the createOrder function for backward compatibility
export const createOrder = OrderService.createOrder;

// Export getUserOrders function that automatically gets user email from auth
export const getUserOrders = async (): Promise<Order[]> => {
  console.log("getUserOrders called");
  
  const { data: { user } } = await supabase.auth.getUser();
  console.log("Current user from auth:", user);
  
  if (!user?.email) {
    console.error("User not authenticated in getUserOrders");
    throw new Error('User not authenticated');
  }
  
  console.log("Fetching orders for email:", user.email);
  const orders = await OrderService.getUserOrders(user.email);
  console.log("Raw orders from OrderService:", orders);
  
  // Convert OrderWithPayment[] to Order[] for backward compatibility
  return orders.map(order => {
    let items: Array<{
      product: { id: string; name: string; price: number; unit: string }; // Changed to string
      quantity: number;
    }> = [];
    
    // Parse products JSON to items array
    try {
      if (order.products) {
        const productsData = typeof order.products === 'string' 
          ? JSON.parse(order.products) 
          : order.products;
        
        if (Array.isArray(productsData)) {
          items = productsData.map(item => ({
            product: {
              id: item.id?.toString() || '0', // Ensure string type
              name: item.name || 'Unknown Product',
              price: item.price || 0,
              unit: item.unit || 'unit'
            },
            quantity: item.quantity || 0
          }));
        }
      }
    } catch (error) {
      console.error('Error parsing order products:', error);
      items = [];
    }
    
    return {
      id: order.id,
      created_at: order.created_at,
      name: order.name,
      email: order.email,
      products: order.products,
      number: order.number,
      'import export code': order['import export code'],
      'shipping address': order['shipping address'],
      port: order.port,
      country: order.country,
      status: order.status,
      incoterms: order.incoterms,
      instructions: order.instructions,
      total_amount: order.total_amount,
      payment: order.payment,
      items: items,
    };
  });
};

// Add cancelOrder function that automatically gets user email from auth
export const cancelOrder = async (orderId: number): Promise<{ success: boolean; error?: string }> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user?.email) {
    throw new Error('User not authenticated');
  }
  
  try {
    const { error } = await supabase
      .from('order')
      .update({ status: 'cancelled' })
      .eq('id', orderId)
      .eq('email', user.email);

    if (error) {
      throw error;
    }

    return { success: true };
  } catch (error) {
    console.error('Error cancelling order:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to cancel order' 
    };
  }
};

// Test function to verify order creation works
export const testOrderCreation = async (): Promise<{ success: boolean; error?: string; orderId?: number }> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user?.email) {
      throw new Error('User not authenticated');
    }

    const testOrder = {
      name: 'Test User',
      email: user.email,
      products: JSON.stringify([{
        id: 'test-product',
        name: 'Test Product',
        price: 100,
        unit: 'kg',
        quantity: 1
      }]),
      number: '1234567890',
      'import export code': null,
      'shipping address': 'Test Address, Test City, Test Country',
      port: 'Test City',
      country: 'Test Country',
      status: 'confirmed',
      incoterms: 'FOB',
      instructions: 'Test order',
      total_amount: 100,
      payment: 'paid'
    };

    console.log('Creating test order:', testOrder);

    const { data, error } = await supabase
      .from('order')
      .insert([testOrder])
      .select()
      .single();

    if (error) {
      console.error('Test order creation failed:', error);
      return { success: false, error: error.message };
    }

    console.log('Test order created successfully:', data);
    return { success: true, orderId: data.id };
  } catch (error) {
    console.error('Test order creation error:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
};

// Debug function to check what orders exist in database
export const debugOrderRecords = async (): Promise<void> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user?.email) {
      console.log("No user session for order debug");
      return;
    }

    console.log("=== DEBUG: Checking order records ===");
    console.log("Current user email:", user.email);

    // Check all orders for this user
    const { data: orders, error } = await supabase
      .from('order')
      .select('*')
      .eq('email', user.email)
      .order('created_at', { ascending: false });

    if (error) {
      console.error("Error fetching orders for debug:", error);
      return;
    }

    console.log("Found orders:", orders);
    orders?.forEach((order, index) => {
      console.log(`Order ${index + 1}:`, {
        id: order.id,
        name: order.name,
        email: order.email,
        status: order.status,
        payment: order.payment,
        total_amount: order.total_amount,
        created_at: order.created_at,
        products: order.products,
      });
    });

    // Also check payments for this user
    const { data: payments, error: paymentError } = await supabase
      .from('payments')
      .select('*')
      .eq('user_email', user.email)
      .order('created_at', { ascending: false });

    if (paymentError) {
      console.error("Error fetching payments for debug:", paymentError);
      return;
    }

    console.log("Found payments:", payments);
    payments?.forEach((payment, index) => {
      console.log(`Payment ${index + 1}:`, {
        id: payment.id,
        razorpay_order_id: payment.razorpay_order_id,
        status: payment.status,
        amount: payment.amount,
        order_id: payment.order_id,
        created_at: payment.created_at,
      });
    });

    // Test the new getUserOrders function
    console.log("=== Testing getUserOrders function ===");
    try {
      const ordersWithPayments = await OrderService.getUserOrders(user.email);
      console.log("getUserOrders result:", ordersWithPayments);
    } catch (getUserOrdersError) {
      console.error("getUserOrders failed:", getUserOrdersError);
    }
  } catch (error) {
    console.error("Debug order records error:", error);
  }
};