import { supabase } from '@/lib/supabase';
import type { Product } from './products';

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface DatabaseCartItem {
  id: number;
  created_at: string;
  products: any; 
  name: string | null;
  email: string | null;
  user_id: string | null;
}

// In-Memory Cache (Cache-Aside Pattern)
const CART_CACHE = {
  data: null as CartItem[] | null,
  lastFetched: 0,
  TTL_MS: 5 * 60 * 1000 // 5 minutes TTL
};

// Helper to invalidate cache
function invalidateCartCache() {
  CART_CACHE.data = null;
  CART_CACHE.lastFetched = 0;
}

export async function saveCartItem(item: CartItem): Promise<{ success: boolean; error?: string }> {
  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return { success: false, error: 'User not authenticated' };
    }

    console.log('Saving cart item:', { productId: item.product.id, userEmail: user.email });

    // Check if item already exists in cart by fetching and filtering in JS for reliability
    const { data: allItems, error: fetchError } = await supabase
      .from('cart')
      .select('*')
      .or(`email.eq.${user.email},user_id.eq.${user.id}`);

    const existingItems = allItems?.filter(dbItem => 
      dbItem.products && (dbItem.products.id?.toString() === item.product.id.toString())
    ) || [];

    if (fetchError) {
      console.error('Error checking existing cart items:', fetchError);
      return { success: false, error: 'Failed to check existing items' };
    }

    const cartData = {
      products: {
        ...item.product,
        quantity: item.quantity
      },
      name: user.user_metadata?.full_name || user.user_metadata?.name || 'User',
      email: user.email,
      user_id: user.id
    };

    if (existingItems && existingItems.length > 0) {
      // Update existing item
      console.log('Updating existing cart item with row ID:', existingItems[0].id);
      const { error: updateError } = await supabase
        .from('cart')
        .update(cartData)
        .eq('id', existingItems[0].id);

      if (updateError) {
        console.error('Error updating cart item:', updateError);
        return { success: false, error: 'Failed to update cart item' };
      }
    } else {
      // Insert new item
      console.log('Inserting new cart item');
      const { error: insertError } = await supabase
        .from('cart')
        .insert(cartData);

      if (insertError) {
        console.error('Error inserting cart item:', insertError);
        return { success: false, error: 'Failed to add item to cart' };
      }
    }

    console.log('Successfully saved cart item to database');
    invalidateCartCache(); // Invalidate cache on write
    return { success: true };
  } catch (error) {
    console.error('Error in saveCartItem:', error);
    return { success: false, error: 'Unexpected error occurred' };
  }
}

export async function fetchCartItems(): Promise<CartItem[]> {
  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      console.log('User not authenticated, returning empty cart');
      return [];
    }

    // Implement Cache-Aside pattern
    const now = Date.now();
    if (CART_CACHE.data && (now - CART_CACHE.lastFetched < CART_CACHE.TTL_MS)) {
      console.log('Returning cart items from in-memory cache (Cache-Aside)');
      return CART_CACHE.data;
    }

    console.log('Fetching cart items for user:', user.email);

    const { data, error } = await supabase
      .from('cart')
      .select('*')
      .or(`email.eq.${user.email},user_id.eq.${user.id}`)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching cart items:', error);
      return [];
    }

    console.log('Fetched cart items from database:', data?.length || 0, 'items');

    const formattedItems = (data || []).map((item: DatabaseCartItem) => ({
      product: {
        id: item.products.id,
        name: item.products.name,
        category: item.products.category,
        price: item.products.price,
        unit: item.products.unit,
        image: item.products.image,
        description: item.products.description,
        specs: item.products.specs,
        inStock: item.products.inStock,
        code: item.products.code,
        stock: item.products.stock,
      },
      quantity: item.products.quantity || 1
    }));
    
    // Store in cache
    CART_CACHE.data = formattedItems;
    CART_CACHE.lastFetched = Date.now();
    
    return formattedItems;
  } catch (error) {
    console.error('Failed to fetch cart items:', error);
    return [];
  }
}

export async function removeCartItem(productId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return { success: false, error: 'User not authenticated' };
    }

    console.log('Removing cart item:', { productId, userEmail: user.email });

    // Find the record ID first for a more reliable deletion
    const { data: items, error: fetchError } = await supabase
      .from('cart')
      .select('id, products')
      .or(`email.eq.${user.email},user_id.eq.${user.id}`);

    if (fetchError) {
      console.error('Error fetching cart items for deletion:', fetchError);
      return { success: false, error: 'Failed to find item to remove' };
    }

    // Find the specific record that matches the productId
    const itemToDelete = items?.find(item => 
      item.products && (item.products.id?.toString() === productId.toString())
    );

    if (!itemToDelete) {
      console.log('Item not found in database cart, nothing to delete');
      return { success: true }; // Consider it a success if it's already gone
    }

    console.log('Found record to delete with row ID:', itemToDelete.id);

    const { error: deleteError } = await supabase
      .from('cart')
      .delete()
      .eq('id', itemToDelete.id);

    if (deleteError) {
      console.error('Error removing cart item by row ID:', deleteError);
      return { success: false, error: 'Failed to delete item from cart' };
    }

    console.log('Successfully removed cart item from database');
    invalidateCartCache(); // Invalidate cache on delete
    return { success: true };
  } catch (error) {
    console.error('Error in removeCartItem:', error);
    return { success: false, error: 'Unexpected error occurred' };
  }
}

export async function updateCartItemQuantity(productId: string, quantity: number): Promise<{ success: boolean; error?: string }> {
  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return { success: false, error: 'User not authenticated' };
    }

    console.log('Updating cart item quantity:', { productId, quantity, userEmail: user.email });

    // Get the existing item
    const { data: itemToUpdate, error: fetchError } = await supabase
      .from('cart')
      .select('id, products')
      .or(`email.eq.${user.email},user_id.eq.${user.id}`);
    
    // Manual filter to find the correct product
    const existingItem = (itemToUpdate as any[])?.find(item => 
      item.products && (item.products.id?.toString() === productId.toString())
    );

    if (fetchError || !existingItem) {
      console.error('Error fetching cart item for update:', fetchError);
      return { success: false, error: 'Cart item not found' };
    }

    // Update the quantity in the products JSON
    const updatedProducts = {
      ...existingItem.products,
      quantity: quantity
    };

    const { error } = await supabase
      .from('cart')
      .update({ products: updatedProducts })
      .eq('id', existingItem.id);

    if (error) {
      console.error('Error updating cart item quantity:', error);
      return { success: false, error: 'Failed to update quantity' };
    }

    console.log('Successfully updated cart item quantity in database');
    invalidateCartCache(); // Invalidate cache on update
    return { success: true };
  } catch (error) {
    console.error('Error in updateCartItemQuantity:', error);
    return { success: false, error: 'Unexpected error occurred' };
  }
}

export async function clearCart(): Promise<{ success: boolean; error?: string }> {
  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return { success: false, error: 'User not authenticated' };
    }

    console.log('Clearing cart for user:', user.email);

    const { error } = await supabase
      .from('cart')
      .delete()
      .or(`email.eq.${user.email},user_id.eq.${user.id}`);

    if (error) {
      console.error('Error clearing cart:', error);
      return { success: false, error: 'Failed to clear cart' };
    }

    console.log('Successfully cleared cart from database');
    invalidateCartCache(); // Invalidate cache on clear
    return { success: true };
  } catch (error) {
    console.error('Error in clearCart:', error);
    return { success: false, error: 'Unexpected error occurred' };
  }
}

// Debug function to check cart contents in database
export async function debugCartContents(): Promise<void> {
  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      console.log('User not authenticated for debug');
      return;
    }

    const { data, error } = await supabase
      .from('cart')
      .select('*')
      .eq('email', user.email);

    if (error) {
      console.error('Error fetching cart for debug:', error);
      return;
    }

    console.log('Current cart contents in database for', user.email, ':', data);
    console.log('Total items:', data?.length || 0);
  } catch (error) {
    console.error('Error in debugCartContents:', error);
  }
}