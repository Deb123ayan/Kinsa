import React from "react";
import { Link, useLocation } from "wouter";
import { Layout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Trash2, ArrowRight } from "lucide-react";
import { useAuth } from "@/context/auth-context";
import { useCart } from "@/context/cart-context";
import { useToast } from "@/hooks/use-toast";
import { formatPrice } from "@/lib/currency";

export default function Cart() {
  const { isLoggedIn } = useAuth();
  const { cart, removeFromCart, updateQuantity, cartTotal } = useCart();
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const handleRemoveFromCart = async (productId: string) => {
    try {
      await removeFromCart(productId);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to remove item from cart.",
        variant: "destructive",
      });
    }
  };

  const handleUpdateQuantity = async (productId: string, quantity: number) => {
    try {
      await updateQuantity(productId, quantity);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update quantity.",
        variant: "destructive",
      });
    }
  };

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
    if (cart.length === 0) {
      toast({
        title: "Empty Cart",
        description: "Please add items to your cart before checking out.",
        variant: "destructive",
      });
      return;
    }
    setLocation("/checkout");
  };

  const estimatedShipping = 5000; // Reduced for testing (₹50 instead of ₹1200)
  const total = cartTotal + estimatedShipping;

  return (
    <Layout>
      <div className="container mx-auto px-4 py-12">
        <h1 className="font-serif text-3xl font-bold text-primary mb-8">Quote Inquiry / Cart</h1>

        <div className="flex flex-col lg:flex-row gap-12">
          {/* Cart Items List */}
          <div className="flex-1 space-y-6">
            {cart.length > 0 ? (
              <div className="bg-white rounded-lg border border-border shadow-sm overflow-hidden">
                {/* Desktop Header */}
                <div className="hidden md:block p-4 bg-secondary/30 border-b border-border font-medium text-sm grid grid-cols-12 gap-4">
                  <div className="col-span-6">Product</div>
                  <div className="col-span-2 text-center">Price</div>
                  <div className="col-span-2 text-center">Quantity (MT)</div>
                  <div className="col-span-2 text-right">Total</div>
                </div>
                
                <div className="divide-y divide-border">
                  {cart.map((item) => (
                    <div key={item.product.id} className="p-4">
                      {/* Mobile Layout */}
                      <div className="md:hidden space-y-4">
                        <div className="flex gap-4">
                          <div className="h-16 w-16 bg-secondary rounded-md overflow-hidden shrink-0">
                            <img src={item.product.image} alt="" className="h-full w-full object-cover" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-bold text-primary truncate">{item.product.name}</h4>
                            <span className="text-xs text-muted-foreground">Grade: {item.product.specs.grade}</span>
                            <div className="text-sm font-medium text-primary mt-1">
                              {formatPrice(item.product.price)} / MT
                            </div>
                          </div>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 text-muted-foreground hover:text-destructive shrink-0"
                            onClick={() => handleRemoveFromCart(item.product.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="text-sm">Quantity:</span>
                            <Input 
                              type="number" 
                              value={item.quantity} 
                              onChange={(e) => handleUpdateQuantity(item.product.id, Number(e.target.value))}
                              className="w-20 text-center h-8"
                            />
                            <span className="text-sm text-muted-foreground">MT</span>
                          </div>
                          <div className="text-right">
                            <div className="text-sm text-muted-foreground">Total</div>
                            <div className="font-bold text-primary">{formatPrice(item.product.price * item.quantity)}</div>
                          </div>
                        </div>
                      </div>

                      {/* Desktop Layout */}
                      <div className="hidden md:grid grid-cols-12 gap-4 items-center">
                        <div className="col-span-6 flex gap-4">
                          <div className="h-16 w-16 bg-secondary rounded-md overflow-hidden shrink-0">
                            <img src={item.product.image} alt="" className="h-full w-full object-cover" />
                          </div>
                          <div className="min-w-0">
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
                            value={item.quantity} 
                            onChange={(e) => handleUpdateQuantity(item.product.id, Number(e.target.value))}
                            className="w-16 text-center h-8"
                           />
                        </div>
                        <div className="col-span-2 flex items-center justify-end gap-4">
                          <span className="font-bold text-primary">{formatPrice(item.product.price * item.quantity)}</span>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 text-muted-foreground hover:text-destructive"
                            onClick={() => handleRemoveFromCart(item.product.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-20 bg-secondary/20 rounded-lg">
                <h3 className="text-xl font-medium text-muted-foreground">Your cart is empty</h3>
                <p className="text-sm text-muted-foreground mt-2">Browse our products and add items to get started.</p>
              </div>
            )}
            
            <Link href="/catalog">
              <Button variant="link" className="px-0 text-accent">
                <ArrowRight className="mr-2 h-4 w-4 rotate-180" /> Continue Browsing Catalog
              </Button>
            </Link>
          </div>

          {/* Summary */}
          <div className="w-full lg:w-96 shrink-0">
            <div className="bg-white rounded-lg border border-border shadow-sm p-4 md:p-6 lg:sticky lg:top-24">
              <h3 className="font-serif text-xl font-bold text-primary mb-6">Estimated Cost</h3>
              
              <div className="space-y-4 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal (Goods)</span>
                  <span className="font-medium text-primary">{formatPrice(cartTotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Est. Shipping (FOB)</span>
                  <span className="font-medium text-primary">{formatPrice(estimatedShipping)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Tax / Duty</span>
                  <span className="font-medium text-muted-foreground italic text-xs">Calculated at checkout</span>
                </div>
                
                <Separator />
                
                <div className="flex justify-between items-end">
                  <span className="font-bold text-primary text-lg">Est. Total</span>
                  <span className="font-bold text-primary text-xl md:text-2xl">{formatPrice(total)}</span>
                </div>
                
                <p className="text-xs text-muted-foreground mt-4 leading-relaxed">
                  *Final pricing including freight (CIF) will be confirmed by our sales team within 24 hours of inquiry submission.
                </p>
                
                <Button 
                  size="lg" 
                  className="w-full bg-accent hover:bg-accent/90 text-white mt-6"
                  onClick={handleCheckout}
                  disabled={cart.length === 0}
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
