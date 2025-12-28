import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useSearch, useLocation } from "wouter";
import { Layout } from "@/components/layout";
import { ProductCard } from "@/components/product-card";
import { CATEGORIES } from "@/data/mock-data";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/auth-context";
import { Search, Filter } from "lucide-react";
import { fetchProducts, type Product } from "@/services/products";

// Debounce hook for performance optimization
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

export default function Catalog() {
  const searchString = useSearch();
  const searchParams = new URLSearchParams(searchString);
  const initialCategory = searchParams.get("category");
  const { isLoggedIn } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>(
    initialCategory ? [initialCategory] : []
  );
  const [priceRange, setPriceRange] = useState([0, 3500000]);
  const [maxPrice, setMaxPrice] = useState(3500000);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  // Debounced values for performance
  const debouncedSearchQuery = useDebounce(searchQuery, 300);
  const debouncedPriceRange = useDebounce(priceRange, 500);

  // Load products from database
  useEffect(() => {
    const loadProducts = async () => {
      try {
        setLoading(true);
        const fetchedProducts = await fetchProducts();
        setProducts(fetchedProducts);
        
        // Update price range based on actual product prices
        if (fetchedProducts.length > 0) {
          const prices = fetchedProducts.map(p => p.price);
          const calculatedMaxPrice = Math.max(...prices);
          const roundedMaxPrice = Math.ceil(calculatedMaxPrice / 100000) * 100000; // Round up to nearest 100k
          
          setMaxPrice(roundedMaxPrice);
          setPriceRange([0, roundedMaxPrice]);
        }
      } catch (error) {
        console.error('Failed to load products:', error);
        toast({
          title: "Error Loading Products",
          description: "Failed to load products from database.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, [toast]);

  // Optimized filter logic with useMemo
  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      // Search Text
      if (debouncedSearchQuery && !product.name.toLowerCase().includes(debouncedSearchQuery.toLowerCase())) {
        return false;
      }
      // Category
      if (selectedCategories.length > 0 && !selectedCategories.includes(product.category.toLowerCase())) {
        return false;
      }
      // Price
      if (product.price < debouncedPriceRange[0] || product.price > debouncedPriceRange[1]) {
        return false;
      }
      return true;
    });
  }, [products, debouncedSearchQuery, selectedCategories, debouncedPriceRange]);

  const toggleCategory = useCallback((catId: string) => {
    setSelectedCategories(prev => 
      prev.includes(catId) 
        ? prev.filter(c => c !== catId)
        : [...prev, catId]
    );
  }, []);

  const handleProductClick = useCallback((productId: string) => {
    // Allow viewing product details regardless of login status
    // Login will be required for actions like adding to cart
    setLocation(`/product/${productId}`);
  }, [setLocation]);

  const resetFilters = useCallback(() => {
    setSelectedCategories([]);
    setPriceRange([0, maxPrice]);
    setSearchQuery("");
  }, [maxPrice]);

  const SidebarFilters = () => (
    <div className="space-y-8">
      <div>
        <h3 className="font-serif font-bold text-primary mb-4">Categories</h3>
        <div className="space-y-3">
          {CATEGORIES.map(cat => (
            <div key={cat.id} className="flex items-center space-x-2">
              <Checkbox 
                id={`cat-${cat.id}`} 
                checked={selectedCategories.includes(cat.id)}
                onCheckedChange={() => toggleCategory(cat.id)}
              />
              <label 
                htmlFor={`cat-${cat.id}`} 
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
              >
                {cat.name}
              </label>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h3 className="font-serif font-bold text-primary mb-4">Price Range (₹)</h3>
        {loading ? (
          <div className="space-y-3">
            <div className="h-2 bg-secondary/20 rounded animate-pulse"></div>
            <div className="flex justify-between">
              <div className="h-4 w-16 bg-secondary/20 rounded animate-pulse"></div>
              <div className="h-4 w-16 bg-secondary/20 rounded animate-pulse"></div>
            </div>
          </div>
        ) : (
          <>
            <Slider 
              value={priceRange}
              onValueChange={setPriceRange}
              max={maxPrice} 
              step={Math.max(1000, Math.floor(maxPrice / 100))} 
              className="mb-4"
            />
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>₹{priceRange[0].toLocaleString('en-IN')}</span>
              <span>₹{priceRange[1].toLocaleString('en-IN')}</span>
            </div>
            <div className="mt-2 text-xs text-muted-foreground text-center">
              Max: ₹{maxPrice.toLocaleString('en-IN')}
            </div>
          </>
        )}
      </div>

      <div>
         <h3 className="font-serif font-bold text-primary mb-4">Availability</h3>
         <div className="flex items-center space-x-2">
            <Checkbox id="instock" defaultChecked />
            <label htmlFor="instock" className="text-sm font-medium leading-none cursor-pointer">In Stock Only</label>
         </div>
      </div>
      
      <Button 
        variant="outline" 
        className="w-full"
        onClick={resetFilters}
      >
        Reset Filters
      </Button>
    </div>
  );

  return (
    <Layout>
      <div className="bg-secondary/30 py-12 border-b border-border">
        <div className="container mx-auto px-4">
           <h1 className="font-serif text-4xl font-bold text-primary mb-4">Product Catalog</h1>
           <p className="text-muted-foreground max-w-2xl">Browse our extensive collection of premium agricultural commodities. Sourced from the best regions and processed with care.</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <div className="flex flex-col lg:flex-row gap-12">
          
          {/* Desktop Sidebar */}
          <aside className="hidden lg:block w-64 shrink-0">
             <SidebarFilters />
          </aside>

          {/* Mobile Filter Toggle */}
          <div className="lg:hidden mb-6 flex gap-4">
             <Sheet>
               <SheetTrigger asChild>
                 <Button variant="outline" className="flex-1">
                   <Filter className="mr-2 h-4 w-4" /> Filters
                 </Button>
               </SheetTrigger>
               <SheetContent side="left">
                 <div className="mt-8">
                   <SidebarFilters />
                 </div>
               </SheetContent>
             </Sheet>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {/* Search Bar */}
            <div className="relative mb-8">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search products (e.g. Basmati, Turmeric)..." 
                className="pl-10 h-12 text-base"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* Results Grid */}
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {Array.from({ length: 6 }).map((_, idx) => (
                  <div key={idx} className="animate-pulse">
                    <div className="bg-secondary/20 rounded-lg h-80"></div>
                  </div>
                ))}
              </div>
            ) : filteredProducts.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredProducts.map(product => (
                  <div key={product.id} onClick={() => handleProductClick(product.id)} className="cursor-pointer">
                    <ProductCard product={product} />
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-20 bg-secondary/20 rounded-lg">
                <h3 className="text-xl font-medium text-muted-foreground">No products found matching your criteria.</h3>
                <Button 
                  variant="link" 
                  className="mt-2 text-accent"
                  onClick={resetFilters}
                >
                  Clear all filters
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
