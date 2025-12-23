import grainsImg from "@assets/generated_images/texture_of_golden_wheat_and_rice_grains.png";
import spicesImg from "@assets/generated_images/vibrant_colorful_spices_mounds.png";
import pulsesImg from "@assets/generated_images/assorted_lentils_and_legumes_texture.png";

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
}

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

export const PRODUCTS: Product[] = [
  {
    id: "wheat-sharbati",
    name: "Sharbati Wheat Premium",
    category: "Grains",
    price: 35000,
    unit: "MT",
    image: grainsImg,
    description: "Known as the 'Golden Grain', Sharbati wheat is sweet, nutty, and produces the softest rotis. Premium export quality.",
    specs: {
      moisture: "10-11%",
      purity: "99.5%",
      origin: "Madhya Pradesh, India",
      grade: "A++ Export Quality",
    },
    inStock: true,
  },
  {
    id: "rice-basmati",
    name: "Royal Basmati Rice 1121",
    category: "Grains",
    price: 95000,
    unit: "MT",
    image: grainsImg,
    description: "Extra long grain Basmati rice with an exquisite aroma. Aged for 12 months for perfect fluffiness.",
    specs: {
      moisture: "12%",
      purity: "98%",
      origin: "Punjab, India",
      grade: "Extra Long Grain",
    },
    inStock: true,
  },
  {
    id: "turmeric-powder",
    name: "Salem Turmeric Powder",
    category: "Spices",
    price: 200000,
    unit: "MT",
    image: spicesImg,
    description: "High curcumin content turmeric powder with a vibrant golden yellow color. Lab tested for purity.",
    specs: {
      moisture: "8%",
      purity: "99%",
      origin: "Salem, India",
      grade: "High Curcumin >3%",
    },
    inStock: true,
  },
  {
    id: "cardamom-green",
    name: "Green Cardamom 8mm",
    category: "Spices",
    price: 3500000,
    unit: "MT",
    image: spicesImg,
    description: "Hand-picked jumbo green cardamom pods. Intense fragrance and bold flavor.",
    specs: {
      moisture: "9%",
      purity: "98%",
      origin: "Kerala, India",
      grade: "Jumbo 8mm",
    },
    inStock: true,
  },
  {
    id: "chili-teja",
    name: "Teja Red Chili Whole",
    category: "Spices",
    price: 250000,
    unit: "MT",
    image: spicesImg,
    description: "One of the hottest chili varieties available. Deep red color and high pungency.",
    specs: {
      moisture: "10%",
      purity: "97%",
      origin: "Guntur, India",
      grade: "Stemless",
    },
    inStock: true,
  },
  {
    id: "lentils-red",
    name: "Red Split Lentils (Masoor Dal)",
    category: "Pulses",
    price: 65000,
    unit: "MT",
    image: pulsesImg,
    description: "Quick-cooking red lentils, polished and sortex cleaned. High protein content.",
    specs: {
      moisture: "11%",
      purity: "99.5%",
      origin: "Canada/India",
      grade: "Sortex Cleaned",
    },
    inStock: true,
  },
  {
    id: "chickpeas-kabuli",
    name: "Kabuli Chickpeas 12mm",
    category: "Pulses",
    price: 85000,
    unit: "MT",
    image: pulsesImg,
    description: "Large size creamy white chickpeas. Perfect for hummus and canning.",
    specs: {
      moisture: "10%",
      purity: "99%",
      origin: "Mexico/India",
      grade: "12mm Jumbo",
    },
    inStock: true,
  },
];
