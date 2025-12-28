import React, { useState, useEffect } from "react";
import { useRoute, Link } from "wouter";
import { Layout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/auth-context";
import { useCart } from "@/context/cart-context";
import { ArrowLeft, Minus, Plus, ShoppingCart, Truck, ShieldCheck, FileCheck } from "lucide-react";
import { formatPriceWithUnit, formatPrice } from "@/lib/currency";
import { fetchProductById, type Product } from "@/services/products";

export default function ProductDetail() {
  const [match, params] = useRoute("/product/:id");
  const { toast } = useToast();
  const { isLoggedIn } = useAuth();
  const { addToCart } = useCart();
  const [quantity, setQuantity] = useState(10);
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProduct = async () => {
      if (!match || !params?.id) return;
      
      try {
        setLoading(true);
        const fetchedProduct = await fetchProductById(params.id);
        setProduct(fetchedProduct);
      } catch (error) {
        console.error('Failed to load product:', error);
        toast({
          title: "Error Loading Product",
          description: "Failed to load product details.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    loadProduct();
  }, [match, params?.id, toast]);

  // Scroll to top when component loads or product changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [params?.id]);

  if (!match || !params) return <div>Product not found</div>;

  if (loading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-12">
          <div className="animate-pulse">
            <div className="h-4 bg-secondary/20 rounded w-1/3 mb-8"></div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              <div className="space-y-4">
                <div className="aspect-[4/3] bg-secondary/20 rounded-lg"></div>
                <div className="grid grid-cols-4 gap-4">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="aspect-square bg-secondary/20 rounded-md"></div>
                  ))}
                </div>
              </div>
              <div className="space-y-6">
                <div className="h-8 bg-secondary/20 rounded w-3/4"></div>
                <div className="h-4 bg-secondary/20 rounded w-full"></div>
                <div className="h-4 bg-secondary/20 rounded w-2/3"></div>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (!product) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-20 text-center">
          <h1 className="text-2xl font-bold mb-4">Product Not Found</h1>
          <Link href="/catalog"><Button>Back to Catalog</Button></Link>
        </div>
      </Layout>
    );
  }

  const handleAddToCart = async () => {
    if (!isLoggedIn) {
      toast({
        title: "Please Login",
        description: "You need to login to add items to your inquiry list.",
        variant: "destructive",
      });
      return;
    }
    
    if (!product) return;
    
    try {
      await addToCart(product, quantity);
      toast({
        title: "Added to Cart",
        description: `${quantity} ${product.unit} of ${product.name} added to your inquiry list.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add item to cart. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <Layout>
      {/* Breadcrumb */}
      <div className="bg-secondary/30 py-4 border-b border-border">
        <div className="container mx-auto px-4 text-sm text-muted-foreground">
          <Link href="/" className="hover:text-primary">Home</Link>
          <span className="mx-2">/</span>
          <Link href="/catalog" className="hover:text-primary">Catalog</Link>
          <span className="mx-2">/</span>
          <span className="text-primary font-medium">{product.name}</span>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
          {/* Image Section */}
          <div className="space-y-4">
             <div className="aspect-[4/3] rounded-lg overflow-hidden bg-secondary border border-border">
               <img 
                src={product.image} 
                alt={product.name} 
                className="w-full h-full object-cover"
               />
             </div>
             <div className="grid grid-cols-4 gap-4">
               {[1, 2, 3, 4].map((i) => (
                 <div key={i} className="aspect-square rounded-md overflow-hidden bg-secondary border border-border cursor-pointer hover:ring-2 hover:ring-accent/50 transition-all">
                   <img src={product.image} alt="" className="w-full h-full object-cover opacity-80 hover:opacity-100" />
                 </div>
               ))}
             </div>
          </div>

          {/* Info Section */}
          <div className="space-y-8">
            <div>
               <div className="flex items-center justify-between mb-4">
                 <Badge variant="outline" className="text-accent border-accent/30">{product.category}</Badge>
                 {product.inStock ? (
                   <span className="text-sm font-medium text-green-600 flex items-center gap-1">
                     <div className="w-2 h-2 rounded-full bg-green-600" /> In Stock
                   </span>
                 ) : (
                   <span className="text-sm font-medium text-destructive flex items-center gap-1">
                      <div className="w-2 h-2 rounded-full bg-destructive" /> Out of Stock
                   </span>
                 )}
               </div>
               <h1 className="font-serif text-4xl font-bold text-primary mb-4">{product.name}</h1>
               <p className="text-lg text-muted-foreground leading-relaxed">{product.description}</p>
            </div>

            <div className="p-6 bg-secondary/20 rounded-lg border border-border">
              <div className="flex items-end gap-2 mb-6">
                <span className="text-3xl font-bold text-primary">{formatPrice(product.price)}</span>
                <span className="text-sm text-muted-foreground mb-1">/ Metric Ton (FOB)</span>
              </div>
              
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <span className="text-sm font-medium w-24">Quantity ({product.unit}):</span>
                  <div className="flex items-center">
                    <Button 
                      variant="outline" size="icon" className="h-10 w-10 rounded-r-none"
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                    <Input 
                      type="number" 
                      value={quantity} 
                      onChange={(e) => setQuantity(Number(e.target.value))}
                      className="h-10 w-20 text-center rounded-none border-x-0 focus-visible:ring-0" 
                    />
                    <Button 
                      variant="outline" size="icon" className="h-10 w-10 rounded-l-none"
                      onClick={() => setQuantity(quantity + 1)}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4">
                  <Button size="lg" className="flex-1 bg-accent hover:bg-accent/90 text-white" onClick={handleAddToCart}>
                    <ShoppingCart className="mr-2 h-5 w-5" /> {isLoggedIn ? "Add to Inquiry" : "Login to Inquire"}
                  </Button>
                  <Button 
                    size="lg" 
                    variant="outline" 
                    className="flex-1 border-primary text-primary hover:bg-primary hover:text-white"
                    onClick={() => {
                      const detailsSection = document.getElementById('product-details');
                      if (detailsSection) {
                        detailsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
                      }
                    }}
                  >
                    View Details
                  </Button>
                </div>
              </div>
            </div>

            {/* Quick Specs */}
            <div className="grid grid-cols-2 gap-4">
              <div className="flex gap-3">
                 <Truck className="h-5 w-5 text-primary mt-1" />
                 <div>
                   <h4 className="font-bold text-sm">Global Shipping</h4>
                   <p className="text-xs text-muted-foreground">FOB, CIF, EXW available</p>
                 </div>
              </div>
              <div className="flex gap-3">
                 <ShieldCheck className="h-5 w-5 text-primary mt-1" />
                 <div>
                   <h4 className="font-bold text-sm">Certified Quality</h4>
                   <p className="text-xs text-muted-foreground">Lab report with every batch</p>
                 </div>
              </div>
            </div>

            {/* Request Sample Button */}
            <div className="pt-4 border-t border-border">
              <Button 
                size="lg" 
                variant="outline" 
                className="w-full border-primary text-primary hover:bg-primary hover:text-white"
                onClick={() => {
                  // Add sample request functionality
                  console.log('Sample requested for:', product.name);
                }}
              >
                Request Sample
              </Button>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-20" id="product-details">
          <Tabs defaultValue="specs">
            <TabsList className="w-full justify-start border-b rounded-none h-auto p-0 bg-transparent overflow-x-auto">
              <TabsTrigger 
                value="specs" 
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-accent data-[state=active]:bg-transparent data-[state=active]:text-primary px-3 sm:px-6 py-3 text-sm sm:text-base whitespace-nowrap"
              >
                Technical Specifications
              </TabsTrigger>
              <TabsTrigger 
                value="shipping" 
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-accent data-[state=active]:bg-transparent data-[state=active]:text-primary px-3 sm:px-6 py-3 text-sm sm:text-base whitespace-nowrap"
              >
                Shipping & Packaging
              </TabsTrigger>
              <TabsTrigger 
                value="docs" 
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-accent data-[state=active]:bg-transparent data-[state=active]:text-primary px-3 sm:px-6 py-3 text-sm sm:text-base whitespace-nowrap"
              >
                Documents & Certs
              </TabsTrigger>
            </TabsList>
            <TabsContent value="specs" className="pt-6">
              <div className="bg-white rounded-lg border border-border w-full max-w-full overflow-x-auto">
                <Table>
                  <TableBody>
                    <TableRow>
                      <TableCell className="font-medium bg-muted/30 w-1/3 min-w-[120px]">Origin</TableCell>
                      <TableCell className="break-words">{product.specs.origin}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium bg-muted/30 min-w-[120px]">Grade</TableCell>
                      <TableCell className="break-words">{product.specs.grade}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium bg-muted/30 min-w-[120px]">Moisture Content</TableCell>
                      <TableCell className="break-words">{product.specs.moisture}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium bg-muted/30 min-w-[120px]">Purity</TableCell>
                      <TableCell className="break-words">{product.specs.purity}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium bg-muted/30 min-w-[120px]">Shelf Life</TableCell>
                      <TableCell className="break-words">12-24 Months (depending on storage)</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
            </TabsContent>
            <TabsContent value="shipping" className="pt-6 w-full max-w-full">
               <div className="prose prose-sm max-w-none text-muted-foreground overflow-x-auto">
                 <h3 className="text-primary font-serif text-lg sm:text-xl">Packaging Options</h3>
                 <ul className="list-disc pl-5 space-y-2 mb-6 text-sm sm:text-base">
                   <li><strong>Bulk:</strong> Loose in container with liner.</li>
                   <li><strong>Bags:</strong> 25kg / 50kg PP Bags (Polypropylene).</li>
                   <li><strong>Jute Bags:</strong> Traditional 50kg Jute bags for breathability.</li>
                   <li><strong>Custom:</strong> Retail packaging (1kg, 5kg) available upon request.</li>
                 </ul>
                 <h3 className="text-primary font-serif text-lg sm:text-xl">Logistics</h3>
                 <p className="text-sm sm:text-base leading-relaxed">We handle all export documentation including Phytosanitary Certificate, Certificate of Origin, and Bill of Lading. Average lead time for shipment is 7-10 days post order confirmation.</p>
               </div>
            </TabsContent>
            <TabsContent value="docs" className="pt-6 w-full max-w-full">
               <div className="flex flex-col sm:flex-row gap-4 overflow-x-auto">
                  <div className="border border-border p-4 rounded-lg flex items-center gap-3 min-w-[250px] flex-shrink-0">
                    <FileCheck className="h-8 w-8 text-muted-foreground flex-shrink-0" />
                    <div className="min-w-0">
                      <p className="font-bold text-sm break-words">ISO 22000 Certificate</p>
                      <span className="text-xs text-accent cursor-pointer hover:underline">View PDF</span>
                    </div>
                  </div>
                  <div className="border border-border p-4 rounded-lg flex items-center gap-3 min-w-[250px] flex-shrink-0">
                    <FileCheck className="h-8 w-8 text-muted-foreground flex-shrink-0" />
                    <div className="min-w-0">
                      <p className="font-bold text-sm break-words">Lab Analysis Report</p>
                      <span className="text-xs text-accent cursor-pointer hover:underline">View Sample</span>
                    </div>
                  </div>
               </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </Layout>
  );
}
