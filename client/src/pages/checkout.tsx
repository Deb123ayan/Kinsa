import React, { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { Layout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { CheckCircle2, Truck, CreditCard, Building2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/auth-context";
import { useCart } from "@/context/cart-context";
import { formatPrice } from "@/lib/currency";

export default function Checkout() {
  const [step, setStep] = useState(1);
  const { toast } = useToast();
  const { isLoggedIn } = useAuth();
  const { cart, clearCart, cartTotal } = useCart();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!isLoggedIn) {
      setLocation("/auth");
    }
  }, [isLoggedIn, setLocation]);

  if (!isLoggedIn) {
    return null;
  }

  const handleNext = () => setStep(step + 1);
  const handleBack = () => setStep(step - 1);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Inquiry Sent Successfully!",
      description: "Our sales team will contact you within 24 hours with a formal invoice.",
    });
    clearCart();
    setTimeout(() => setLocation("/dashboard"), 2000);
  };

  const estimatedShipping = 120000;
  const total = cartTotal + estimatedShipping;

  return (
    <Layout>
      <div className="container mx-auto px-4 py-12">
        
        {/* Progress Steps */}
        <div className="max-w-3xl mx-auto mb-12">
          <div className="relative flex justify-between items-center">
            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-0.5 bg-border -z-10" />
            
            <div className={`flex flex-col items-center gap-2 bg-background px-4 ${step >= 1 ? 'text-primary' : 'text-muted-foreground'}`}>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${step >= 1 ? 'border-primary bg-primary text-primary-foreground' : 'border-border bg-background'}`}>
                <Building2 className="w-5 h-5" />
              </div>
              <span className="text-sm font-medium">Company Details</span>
            </div>

            <div className={`flex flex-col items-center gap-2 bg-background px-4 ${step >= 2 ? 'text-primary' : 'text-muted-foreground'}`}>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${step >= 2 ? 'border-primary bg-primary text-primary-foreground' : 'border-border bg-background'}`}>
                <Truck className="w-5 h-5" />
              </div>
              <span className="text-sm font-medium">Shipping</span>
            </div>

            <div className={`flex flex-col items-center gap-2 bg-background px-4 ${step >= 3 ? 'text-primary' : 'text-muted-foreground'}`}>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${step >= 3 ? 'border-primary bg-primary text-primary-foreground' : 'border-border bg-background'}`}>
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <span className="text-sm font-medium">Review</span>
            </div>
          </div>
        </div>

        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle className="font-serif text-2xl text-primary">
                {step === 1 && "Business Details"}
                {step === 2 && "Shipping & Logistics"}
                {step === 3 && "Review & Submit"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                
                {/* Step 1: Business */}
                {step === 1 && (
                  <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>First Name</Label>
                        <Input placeholder="John" required />
                      </div>
                      <div className="space-y-2">
                        <Label>Last Name</Label>
                        <Input placeholder="Doe" required />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Company Name</Label>
                      <Input placeholder="Your Company Name" required />
                    </div>
                    <div className="space-y-2">
                      <Label>Business Email</Label>
                      <Input type="email" placeholder="email@company.com" required />
                    </div>
                    <div className="space-y-2">
                       <Label>Phone Number (WhatsApp preferred)</Label>
                       <Input placeholder="+91 ..." required />
                    </div>
                    <div className="space-y-2">
                      <Label>Import Export Code (IEC) / Tax ID</Label>
                      <Input placeholder="Optional" />
                    </div>
                  </div>
                )}

                {/* Step 2: Shipping */}
                {step === 2 && (
                  <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                    <div className="space-y-2">
                      <Label>Shipping Address</Label>
                      <Input placeholder="Street address, Port, etc." required />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>City / Port</Label>
                        <Input placeholder="Dubai" required />
                      </div>
                      <div className="space-y-2">
                        <Label>Country</Label>
                        <Select>
                          <SelectTrigger>
                            <SelectValue placeholder="Select destination" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="uae">United Arab Emirates</SelectItem>
                            <SelectItem value="uk">United Kingdom</SelectItem>
                            <SelectItem value="usa">United States</SelectItem>
                            <SelectItem value="sg">Singapore</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="space-y-2">
                       <Label>Preferred Incoterms</Label>
                       <Select>
                          <SelectTrigger>
                            <SelectValue placeholder="Select terms" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="fob">FOB (Free On Board)</SelectItem>
                            <SelectItem value="cif">CIF (Cost, Insurance, Freight)</SelectItem>
                            <SelectItem value="exw">EXW (Ex Works)</SelectItem>
                          </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Special Instructions</Label>
                      <Input placeholder="Packaging requirements, delivery windows..." />
                    </div>
                  </div>
                )}

                {/* Step 3: Review */}
                {step === 3 && (
                  <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                    <div className="bg-secondary/30 p-4 rounded-lg space-y-4">
                      <h4 className="font-bold text-primary">Order Summary</h4>
                      {cart.map((item) => (
                        <div key={item.product.id} className="flex justify-between text-sm">
                          <span>{item.product.name} ({item.quantity} {item.product.unit})</span>
                          <span className="font-medium text-primary">{formatPrice(item.product.price * item.quantity)}</span>
                        </div>
                      ))}
                      <Separator className="bg-border/50" />
                      <div className="flex justify-between text-sm font-medium">
                        <span>Subtotal</span>
                        <span className="text-primary">{formatPrice(cartTotal)}</span>
                      </div>
                      <div className="flex justify-between text-sm font-medium">
                        <span>Est. Shipping</span>
                        <span className="text-primary">{formatPrice(estimatedShipping)}</span>
                      </div>
                      <Separator className="bg-border/50" />
                      <div className="flex justify-between text-lg font-bold">
                        <span>Total</span>
                        <span className="text-primary">{formatPrice(total)}</span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-4">
                        By submitting this inquiry, you are requesting a formal proforma invoice. 
                        No payment is taken at this stage. Our team will verify availability and shipping costs.
                      </p>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-start space-x-2">
                        <input type="checkbox" id="terms" className="mt-1" required />
                        <label htmlFor="terms" className="text-sm text-muted-foreground">
                          I agree to the <Link href="/terms"><a className="text-accent underline">Terms & Conditions</a></Link> and understand this is a wholesale trade inquiry.
                        </label>
                      </div>
                    </div>
                  </div>
                )}

                {/* Buttons */}
                <div className="flex justify-between pt-4">
                  {step > 1 ? (
                    <Button type="button" variant="outline" onClick={handleBack}>
                      Back
                    </Button>
                  ) : (
                    <div />
                  )}
                  
                  {step < 3 ? (
                    <Button type="button" onClick={handleNext} className="bg-primary text-primary-foreground hover:bg-primary/90">
                      Next Step
                    </Button>
                  ) : (
                    <Button type="submit" className="bg-accent text-accent-foreground hover:bg-accent/90 w-full sm:w-auto">
                      Submit Inquiry
                    </Button>
                  )}
                </div>

              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}
