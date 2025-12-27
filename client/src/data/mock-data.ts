import grainsImg from "@assets/generated_images/texture_of_golden_wheat_and_rice_grains.png";
import spicesImg from "@assets/generated_images/vibrant_colorful_spices_mounds.png";
import pulsesImg from "@assets/generated_images/assorted_lentils_and_legumes_texture.png";

// Re-export the Product interface from the products service
export type { Product } from '@/services/products';

export const CATEGORIES = [
  {
    id: "grains",
    name: "Premium Grains",
    description: "Finest selection of wheat, rice, and maize from sustainable farms.",
    image: grainsImg,
  },
  {
    id: "spices",
    name: "Exotic Spices",
    description: "Aromatic and potent spices sourced directly from origin.",
    image: spicesImg,
  },
  {
    id: "pulses",
    name: "Organic Pulses",
    description: "High-protein lentils and beans for global nutrition.",
    image: pulsesImg,
  },
];

// Products are now fetched from the database
// Use the products service instead of this static data
export const PRODUCTS = []; // Deprecated - use fetchProducts() from @/services/products
