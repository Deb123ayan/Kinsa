import React from "react";
import { Link, useLocation } from "wouter";
import { Layout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { PRODUCTS } from "@/data/mock-data";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Trash2, ArrowRight } from "lucide-react";
import { useAuth } from "@/context/auth-context";
import { useToast } from "@/hooks/use-toast";
import { formatPrice } from "@/lib/currency";

export default function Cart() {
  const { isLoggedIn } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const handleCheckout = () => {
    if (!isLoggedIn) {
      toast({
        title: "Please Login",
        description: "You need to login to proceed to checkout.",
        variant: "destructive",
      });
      setLocation("/auth");
      return;
    }
    setLocation("/checkout");
  };

  // Mock Cart Items
  const cartItems = [
    { product: PRODUCTS[0], quantity: 20 },
    { product: PRODUCTS[2], quantity: 5 },
  ];

  const subtotal = cartItems.reduce((acc, item) => acc + (item.product.price * item.quantity), 0);
  const estimatedShipping = 120000;
  const total = subtotal + estimatedShipping;

  return (
    <Layout>
      <div className="container mx-auto px-4 py-12">
        <h1 className="font-serif text-3xl font-bold text-primary mb-8">Quote Inquiry / Cart</h1>

        <div className="flex flex-col lg:flex-row gap-12">
          {/* Cart Items List */}
          <div className="flex-1 space-y-6">
            <div className="bg-white rounded-lg border border-border shadow-sm overflow-hidden">
              <div className="p-4 bg-secondary/30 border-b border-border font-medium text-sm grid grid-cols-12 gap-4">
                <div className="col-span-6">Product</div>
                <div className="col-span-2 text-center">Price</div>
                <div className="col-span-2 text-center">Quantity (MT)</div>
                <div className="col-span-2 text-right">Total</div>
              </div>
              
              <div className="divide-y divide-border">
                {cartItems.map((item) => (
                  <div key={item.product.id} className="p-4 grid grid-cols-12 gap-4 items-center">
                    <div className="col-span-6 flex gap-4">
                      <div className="h-16 w-16 bg-secondary rounded-md overflow-hidden shrink-0">
                        <img src={item.product.image} alt="" className="h-full w-full object-cover" />
                      </div>
                      <div>
                        <h4 className="font-bold text-primary">{item.product.name}</h4>
                        <span className="text-xs text-muted-foreground">Grade: {item.product.specs.grade}</span>
                      </div>
                    </div>
                    <div className="col-span-2 text-center text-sm">
                      {formatPrice(item.product.price)}
                    </div>
                    <div className="col-span-2 flex justify-center">
                       <Input 
                        type="number" 
                        defaultValue={item.quantity} 
                        className="w-16 text-center h-8"
                       />
                    </div>
                    <div className="col-span-2 flex items-center justify-end gap-4">
                      <span className="font-bold text-primary">{formatPrice(item.product.price * item.quantity)}</span>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={() => {
                        if (!isLoggedIn) {
                          toast({
                            title: "Please Login",
                            description: "You need to login to manage your cart.",
                            variant: "destructive",
                          });
                          setLocation("/auth");
                        }
                      }}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <Link href="/catalog">
              <Button variant="link" className="px-0 text-accent">
                <ArrowRight className="mr-2 h-4 w-4 rotate-180" /> Continue Browsing Catalog
              </Button>
            </Link>
          </div>

          {/* Summary */}
          <div className="w-full lg:w-96 shrink-0">
            <div className="bg-white rounded-lg border border-border shadow-sm p-6 sticky top-24">
              <h3 className="font-serif text-xl font-bold text-primary mb-6">Estimated Cost</h3>
              
              <div className="space-y-4 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal (Goods)</span>
                  <span className="font-medium text-primary">{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Est. Shipping (FOB)</span>
                  <span className="font-medium text-primary">{formatPrice(estimatedShipping)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Tax / Duty</span>
                  <span className="font-medium text-muted-foreground italic">Calculated at checkout</span>
                </div>
                
                <Separator />
                
                <div className="flex justify-between items-end">
                  <span className="font-bold text-primary text-lg">Est. Total</span>
                  <span className="font-bold text-primary text-2xl">{formatPrice(total)}</span>
                </div>
                
                <p className="text-xs text-muted-foreground mt-4">
                  *Final pricing including freight (CIF) will be confirmed by our sales team within 24 hours of inquiry submission.
                </p>
                
                <Button 
                  size="lg" 
                  className="w-full bg-accent hover:bg-accent/90 text-white mt-6"
                  onClick={handleCheckout}
                >
                  {isLoggedIn ? "Proceed to Inquiry" : "Login to Checkout"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
