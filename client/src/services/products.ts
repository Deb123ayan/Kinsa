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
  images: string[] | null;
  specs: Record<string, string> | null;
}

export interface Product {
  id: string;
  name: string;
  category: "Grains" | "Spices" | "Pulses";
  price: number; // Price in INR per metric ton
  unit: string;
  image: string;
  images: string[];
  description: string;
  specs: Record<string, string>;
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
  
  // Use DB specs if available, otherwise fallback to generated specs
  const specs = (dbProduct.specs && Object.keys(dbProduct.specs).length > 0)
    ? dbProduct.specs
    : generateSpecs(dbProduct.name || "", category) as Record<string, string>;

  // Use images array if available, otherwise fallback to img string or default
  const defaultImage = "https://images.unsplash.com/photo-1586201375761-83865001e31c?w=800&h=600&fit=crop";
  const mainImage = dbProduct.img || defaultImage;
  const images = (dbProduct.images && dbProduct.images.length > 0) 
    ? dbProduct.images 
    : [mainImage];

  return {
    id: dbProduct.id.toString(),
    name: dbProduct.name || "Unknown Product",
    category,
    price: Number(dbProduct.price) || 0,
    unit: "MT",
    image: images[0] || mainImage,
    images,
    description: dbProduct.description || "Premium quality product for export.",
    specs,
    inStock: (dbProduct.stock || 0) > 0,
    code: dbProduct.code || undefined,
    stock: dbProduct.stock || undefined,
  };
}

export async function fetchProducts(limit: number = 1000): Promise<Product[]> {
  try {
    const requestId = Date.now();
    console.log(`[${requestId}] Fetching up to ${limit} products from 'Products' table...`);

    const { data, error, count } = await supabase
      .from("Products")
      .select("*", { count: 'exact' })
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) {
      console.error(`[${requestId}] Supabase error fetching products:`, error);
      throw new Error(`Failed to fetch products: ${error.message}`);
    }

    console.log(
      `[${requestId}] Database returned ${data?.length || 0} products. Total in DB: ${count ?? 'unknown'}`
    );
    
    if (!data || data.length === 0) {
      console.warn(`[${requestId}] No products found in the 'Products' table.`);
    }

    return (data || []).map(transformProduct);
  } catch (error) {
    console.error("Failed to fetch products:", error);
    throw error;
  }
}

export async function fetchProductById(idOrSlug: string): Promise<Product | null> {
  try {
    const id = parseInt(idOrSlug);
    let query = supabase.from("Products").select("*");

    if (!isNaN(id) && id.toString() === idOrSlug) {
      // It's a numeric ID
      query = query.eq("id", id);
    } else {
      // It's a slug (product name). We convert 'basmati-rice' back to something searchable
      // We'll search for names that contain the words from the slug
      const namePattern = idOrSlug.split('-').join(' ');
      query = query.ilike("name", `%${namePattern}%`);
    }

    const { data, error } = await query.single();

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
