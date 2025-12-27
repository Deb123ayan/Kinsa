import React, { useState, useEffect } from "react";
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
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

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
          const maxPrice = Math.max(...prices);
          setPriceRange([0, maxPrice]);
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

  // Filter Logic
  const filteredProducts = products.filter((product) => {
    // Search Text
    if (searchQuery && !product.name.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    // Category
    if (selectedCategories.length > 0 && !selectedCategories.includes(product.category.toLowerCase())) {
      return false;
    }
    // Price
    if (product.price < priceRange[0] || product.price > priceRange[1]) {
      return false;
    }
    return true;
  });

  const toggleCategory = (catId: string) => {
    setSelectedCategories(prev => 
      prev.includes(catId) 
        ? prev.filter(c => c !== catId)
        : [...prev, catId]
    );
  };

  const handleProductClick = () => {
    if (!isLoggedIn) {
      toast({
        title: "Please Login",
        description: "You need to login to view product details.",
        variant: "destructive",
      });
      setLocation("/auth");
    }
  };

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
        <Slider 
          defaultValue={[0, 3500000]} 
          max={3500000} 
          step={100000} 
          value={priceRange}
          onValueChange={setPriceRange}
          className="mb-4"
        />
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>₹{priceRange[0].toLocaleString('en-IN')}</span>
          <span>₹{priceRange[1].toLocaleString('en-IN')}</span>
        </div>
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
        onClick={() => {
          setSelectedCategories([]);
          setPriceRange([0, 3500000]);
          setSearchQuery("");
        }}
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
                  <div key={product.id} onClick={handleProductClick}>
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
                  onClick={() => {
                    setSelectedCategories([]);
                    setPriceRange([0, 3500000]);
                    setSearchQuery("");
                  }}
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
