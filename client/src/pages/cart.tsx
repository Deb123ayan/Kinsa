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
  const { isLoggedIn, loading: authLoading } = useAuth();
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

  const estimatedShipping = 5000;
  const total = cartTotal + estimatedShipping;

  return (
    <Layout>
      <div className="container mx-auto px-4 py-12">
        <h1 className="display text-4xl font-bold text-foreground mb-8">Quote Inquiry / Cart</h1>

        <div className="flex flex-col lg:flex-row gap-12">
          {/* Cart Items List */}
          <div className="flex-1 space-y-6">
            {cart.length > 0 ? (
              <div className="card-elite p-0 overflow-hidden">
                {/* Desktop Header */}
                <div className="hidden md:grid grid-cols-12 gap-4 p-4 bg-secondary border-b border-border font-bold text-xs uppercase tracking-widest text-muted-foreground">
                  <div className="col-span-6">Product</div>
                  <div className="col-span-2 text-center">Price</div>
                  <div className="col-span-2 text-center">Quantity (MT)</div>
                  <div className="col-span-2 text-right">Total</div>
                </div>

                <div className="divide-y divide-border">
                  {cart.map((item) => (
                    <div key={item.product.id} className="p-4 md:p-6 hover:bg-secondary/20 transition-colors">
                      {/* Mobile Layout */}
                      <div className="md:hidden space-y-4">
                        <div className="flex gap-4">
                          <div className="h-20 w-20 bg-secondary rounded-lg overflow-hidden shrink-0 border border-border">
                            <img src={item.product.image} alt="" className="h-full w-full object-cover" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-serif font-bold text-lg text-foreground truncate leading-tight mb-1">{item.product.name}</h4>
                            <span className="text-xs uppercase tracking-widest text-muted-foreground font-bold">Grade: {item.product.specs.grade}</span>
                            <div className="text-sm font-bold text-accent mt-2">
                              {formatPrice(item.product.price)} / MT
                            </div>
                          </div>
                          <button
                            className="h-10 w-10 flex items-center justify-center text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-full transition-colors shrink-0"
                            onClick={() => handleRemoveFromCart(item.product.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                        <div className="flex items-center justify-between pt-2 border-t border-border">
                          <div className="flex items-center gap-3">
                            <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Qty:</span>
                            <input
                              type="number"
                              value={item.quantity}
                              onChange={(e) => handleUpdateQuantity(item.product.id, Number(e.target.value))}
                              className="form-input w-24 text-center h-10 px-2"
                            />
                            <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">MT</span>
                          </div>
                          <div className="text-right">
                            <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1">Total</div>
                            <div className="font-bold text-lg text-foreground">{formatPrice(item.product.price * item.quantity)}</div>
                          </div>
                        </div>
                      </div>

                      {/* Desktop Layout */}
                      <div className="hidden md:grid grid-cols-12 gap-4 items-center">
                        <div className="col-span-6 flex gap-6">
                          <div className="h-20 w-20 bg-secondary rounded-lg overflow-hidden shrink-0 border border-border">
                            <img src={item.product.image} alt="" className="h-full w-full object-cover" />
                          </div>
                          <div className="min-w-0 flex flex-col justify-center">
                            <h4 className="font-serif font-bold text-lg text-foreground truncate mb-1">{item.product.name}</h4>
                            <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Grade: {item.product.specs.grade}</span>
                          </div>
                        </div>
                        <div className="col-span-2 text-center font-bold text-accent">
                          {formatPrice(item.product.price)}
                        </div>
                        <div className="col-span-2 flex justify-center">
                          <input
                            type="number"
                            value={item.quantity}
                            onChange={(e) => handleUpdateQuantity(item.product.id, Number(e.target.value))}
                            className="form-input w-20 text-center"
                          />
                        </div>
                        <div className="col-span-2 flex items-center justify-end gap-6">
                          <span className="font-bold text-lg text-foreground">{formatPrice(item.product.price * item.quantity)}</span>
                          <button
                            className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 h-10 w-10 flex items-center justify-center rounded-full transition-colors"
                            onClick={() => handleRemoveFromCart(item.product.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-32 card-elite border border-border">
                <h3 className="font-serif text-2xl font-bold text-foreground mb-4">Your cart is empty</h3>
                <p className="text-muted-foreground max-w-sm mx-auto">Browse our commodities and add items to your quote inquiry to get started.</p>
              </div>
            )}

            <Link href="/catalog">
              <button className="btn btn-ghost mt-4">
                <ArrowRight className="mr-2 h-4 w-4 rotate-180" /> Continue Browsing Catalog
              </button>
            </Link>
          </div>

          {/* Summary */}
          <div className="w-full lg:w-96 shrink-0">
            <div className="card-elite p-6 md:p-8 lg:sticky lg:top-32 transition-transform duration-300">
              <h3 className="font-serif text-2xl font-bold text-foreground mb-8">Estimated Cost</h3>

              <div className="space-y-6 text-sm">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground font-medium uppercase tracking-widest text-xs">Subtotal (Goods)</span>
                  <span className="font-bold text-foreground">{formatPrice(cartTotal)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground font-medium uppercase tracking-widest text-xs">Est. Shipping (FOB)</span>
                  <span className="font-bold text-foreground">{formatPrice(estimatedShipping)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground font-medium uppercase tracking-widest text-xs">Tax / Duty</span>
                  <span className="font-bold text-accent italic text-[10px]">Calculated at checkout</span>
                </div>

                <div className="h-px bg-border my-6" />

                <div className="flex justify-between items-end">
                  <span className="font-bold text-foreground uppercase tracking-widest text-sm">Est. Total</span>
                  <span className="font-serif font-bold text-accent text-2xl md:text-3xl">{formatPrice(total)}</span>
                </div>

                <p className="text-[10px] uppercase tracking-widest text-muted-foreground mt-6 leading-relaxed bg-secondary p-4 rounded-lg border border-border">
                  *Final pricing including freight (CIF) will be confirmed by our sales team within 24 hours of inquiry submission.
                </p>

                <button
                  className="btn btn-primary w-full h-16 text-sm uppercase tracking-widest shadow-xl mt-8"
                  onClick={handleCheckout}
                  disabled={cart.length === 0 || authLoading}
                >
                  {authLoading ? (
                    <div className="flex items-center gap-3">
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                      Verifying Account...
                    </div>
                  ) : isLoggedIn ? (
                    "Proceed to Inquiry"
                  ) : (
                    "Login to Checkout"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
