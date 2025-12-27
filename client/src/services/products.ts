import { supabase } from "@/lib/supabase";

export interface DatabaseProduct {
  id: number;
  created_at: string;
  name: string | null;
  description: string | null;
  code: string | null;
  stock: number | null;
  price: number | null;
  img: string | null;
}

export interface Product {
  id: string;
  name: string;
  category: "Grains" | "Spices" | "Pulses";
  price: number; // Price in INR per metric ton
  unit: string;
  image: string;
  description: string;
  specs: {
    moisture?: string;
    purity?: string;
    origin?: string;
    grade?: string;
  };
  inStock: boolean;
  code?: string;
  stock?: number;
}

// Helper function to determine category from product name/code
function determineCategory(
  name: string,
  code?: string
): "Grains" | "Spices" | "Pulses" {
  const nameUpper = name.toUpperCase();
  const codeUpper = code?.toUpperCase() || "";

  if (
    nameUpper.includes("RICE") ||
    nameUpper.includes("WHEAT") ||
    nameUpper.includes("MAIZE") ||
    nameUpper.includes("CORN") ||
    codeUpper.includes("RICE") ||
    codeUpper.includes("GRAIN")
  ) {
    return "Grains";
  }

  if (
    nameUpper.includes("LENTIL") ||
    nameUpper.includes("CHICKPEA") ||
    nameUpper.includes("BEAN") ||
    nameUpper.includes("PEA") ||
    nameUpper.includes("DAL") ||
    codeUpper.includes("PULSE")
  ) {
    return "Pulses";
  }

  // Default to Spices for everything else (turmeric, chili, pepper, etc.)
  return "Spices";
}

// Helper function to generate basic specs from product info
function generateSpecs(name: string, category: string): Product["specs"] {
  const nameUpper = name.toUpperCase();

  // Basic specs based on product type
  const specs: Product["specs"] = {};

  if (category === "Grains") {
    specs.moisture = "10-12%";
    specs.purity = "99%";
    if (nameUpper.includes("BASMATI")) {
      specs.origin = "Punjab, India";
      specs.grade = "Premium Long Grain";
    } else if (nameUpper.includes("WHEAT")) {
      specs.origin = "Madhya Pradesh, India";
      specs.grade = "Export Quality";
    } else {
      specs.origin = "India";
      specs.grade = "Premium";
    }
  } else if (category === "Spices") {
    specs.moisture = "8-10%";
    specs.purity = "98%";
    if (nameUpper.includes("TURMERIC")) {
      specs.origin = "Salem, India";
      specs.grade = "High Curcumin";
    } else if (nameUpper.includes("CARDAMOM")) {
      specs.origin = "Kerala, India";
      specs.grade = "Premium Grade";
    } else if (nameUpper.includes("PEPPER")) {
      specs.origin = "Kerala, India";
      specs.grade = "Bold";
    } else {
      specs.origin = "India";
      specs.grade = "Premium";
    }
  } else if (category === "Pulses") {
    specs.moisture = "10-11%";
    specs.purity = "99.5%";
    specs.origin = "India";
    specs.grade = "Sortex Cleaned";
  }

  return specs;
}

// Transform database product to frontend product
function transformProduct(dbProduct: DatabaseProduct): Product {
  const category = determineCategory(
    dbProduct.name || "",
    dbProduct.code || ""
  );
  const specs = generateSpecs(dbProduct.name || "", category);

  return {
    id: dbProduct.id.toString(),
    name: dbProduct.name || "Unknown Product",
    category,
    price: Number(dbProduct.price) || 0,
    unit: "MT",
    image:
      dbProduct.img ||
      "https://images.unsplash.com/photo-1586201375761-83865001e31c?w=800&h=600&fit=crop",
    description: dbProduct.description || "Premium quality product for export.",
    specs,
    inStock: (dbProduct.stock || 0) > 0,
    code: dbProduct.code || undefined,
    stock: dbProduct.stock || undefined,
  };
}

export async function fetchProducts(): Promise<Product[]> {
  try {
    // Add a unique timestamp to prevent caching issues
    const requestId = Date.now();
    console.log(`[${requestId}] Fetching products...`);

    const { data, error } = await supabase
      .from("Products")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error(`[${requestId}] Error fetching products:`, error);
      throw new Error(`Failed to fetch products: ${error.message}`);
    }

    console.log(
      `[${requestId}] Successfully fetched ${data?.length || 0} products`
    );
    return (data || []).map(transformProduct);
  } catch (error) {
    console.error("Failed to fetch products:", error);
    throw error;
  }
}

export async function fetchProductById(id: string): Promise<Product | null> {
  try {
    const { data, error } = await supabase
      .from("Products")
      .select("*")
      .eq("id", parseInt(id))
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        // No rows returned
        return null;
      }
      console.error("Error fetching product:", error);
      throw error;
    }

    return data ? transformProduct(data) : null;
  } catch (error) {
    console.error("Failed to fetch product:", error);
    throw error;
  }
}

export async function fetchProductsByCategory(
  category: string
): Promise<Product[]> {
  try {
    const products = await fetchProducts();
    return products.filter(
      (product) => product.category.toLowerCase() === category.toLowerCase()
    );
  } catch (error) {
    console.error("Failed to fetch products by category:", error);
    throw error;
  }
}

export async function updateProductStock(
  productId: string,
  quantityChange: number
): Promise<boolean> {
  try {
    // First get the current stock
    const { data: product, error: fetchError } = await supabase
      .from("Products")
      .select("stock")
      .eq("id", parseInt(productId))
      .single();

    if (fetchError) {
      console.error("Error fetching product stock:", fetchError);
      return false;
    }

    const currentStock = product?.stock || 0;
    const newStock = currentStock - quantityChange;

    // Check if stock would go negative
    if (newStock < 0) {
      console.error("Insufficient stock for product:", productId);
      return false;
    }

    // Update the stock
    const { error } = await supabase
      .from("Products")
      .update({ stock: newStock })
      .eq("id", parseInt(productId));

    if (error) {
      console.error("Error updating product stock:", error);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Failed to update product stock:", error);
    return false;
  }
}

export async function checkProductStock(
  productId: string,
  requiredQuantity: number
): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from("Products")
      .select("stock")
      .eq("id", parseInt(productId))
      .single();

    if (error) {
      console.error("Error checking product stock:", error);
      return false;
    }

    return (data?.stock || 0) >= requiredQuantity;
  } catch (error) {
    console.error("Failed to check product stock:", error);
    return false;
  }
}
