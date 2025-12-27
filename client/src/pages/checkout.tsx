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
import { createOrder, type OrderData } from "@/services/orders";

export default function Checkout() {
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();
  const { isLoggedIn } = useAuth();
  const { cart, clearCart, cartTotal } = useCart();
  const [, setLocation] = useLocation();

  // Form data
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    companyName: '',
    email: '',
    phone: '',
    iecTaxId: '',
    shippingAddress: '',
    city: '',
    country: '',
    incoterms: '',
    specialInstructions: '',
  });

  useEffect(() => {
    if (!isLoggedIn) {
      setLocation("/auth");
    }
  }, [isLoggedIn, setLocation]);

  if (!isLoggedIn) {
    return null;
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleNext = () => setStep(step + 1);
  const handleBack = () => setStep(step - 1);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (cart.length === 0) {
      toast({
        title: "Empty Cart",
        description: "Please add items to your cart before placing an order.",
        variant: "destructive",
      });
      return;
    }

    setSubmitting(true);

    try {
      const estimatedShipping = 120000;
      
      const orderData: OrderData = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        companyName: formData.companyName,
        email: formData.email,
        phone: formData.phone,
        iecTaxId: formData.iecTaxId || undefined,
        shippingAddress: formData.shippingAddress,
        city: formData.city,
        country: formData.country,
        incoterms: formData.incoterms,
        specialInstructions: formData.specialInstructions || undefined,
        items: cart,
        shippingCost: estimatedShipping,
      };

      const result = await createOrder(orderData);

      if (result.success) {
        toast({
          title: "Order Placed Successfully!",
          description: "Your order has been placed and stock has been reserved. Our sales team will contact you within 24 hours.",
        });
        await clearCart();
        setTimeout(() => setLocation("/dashboard"), 2000);
      } else {
        toast({
          title: "Order Failed",
          description: result.error || "Failed to place order. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Order submission error:', error);
      toast({
        title: "Order Failed",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
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
                        <Input 
                          placeholder="John" 
                          value={formData.firstName}
                          onChange={(e) => handleInputChange('firstName', e.target.value)}
                          required 
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Last Name</Label>
                        <Input 
                          placeholder="Doe" 
                          value={formData.lastName}
                          onChange={(e) => handleInputChange('lastName', e.target.value)}
                          required 
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Company Name</Label>
                      <Input 
                        placeholder="Your Company Name" 
                        value={formData.companyName}
                        onChange={(e) => handleInputChange('companyName', e.target.value)}
                        required 
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Business Email</Label>
                      <Input 
                        type="email" 
                        placeholder="email@company.com" 
                        value={formData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        required 
                      />
                    </div>
                    <div className="space-y-2">
                       <Label>Phone Number (WhatsApp preferred)</Label>
                       <Input 
                         placeholder="+91 ..." 
                         value={formData.phone}
                         onChange={(e) => handleInputChange('phone', e.target.value)}
                         required 
                       />
                    </div>
                    <div className="space-y-2">
                      <Label>Import Export Code (IEC) / Tax ID</Label>
                      <Input 
                        placeholder="Optional" 
                        value={formData.iecTaxId}
                        onChange={(e) => handleInputChange('iecTaxId', e.target.value)}
                      />
                    </div>
                  </div>
                )}

                {/* Step 2: Shipping */}
                {step === 2 && (
                  <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                    <div className="space-y-2">
                      <Label>Shipping Address</Label>
                      <Input 
                        placeholder="Street address, Port, etc." 
                        value={formData.shippingAddress}
                        onChange={(e) => handleInputChange('shippingAddress', e.target.value)}
                        required 
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>City / Port</Label>
                        <Input 
                          placeholder="Dubai" 
                          value={formData.city}
                          onChange={(e) => handleInputChange('city', e.target.value)}
                          required 
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Country</Label>
                        <Select value={formData.country} onValueChange={(value) => handleInputChange('country', value)}>
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
                       <Select value={formData.incoterms} onValueChange={(value) => handleInputChange('incoterms', value)}>
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
                      <Input 
                        placeholder="Packaging requirements, delivery windows..." 
                        value={formData.specialInstructions}
                        onChange={(e) => handleInputChange('specialInstructions', e.target.value)}
                      />
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
                    <Button 
                      type="submit" 
                      className="bg-accent text-accent-foreground hover:bg-accent/90 w-full sm:w-auto"
                      disabled={submitting}
                    >
                      {submitting ? "Placing Order..." : "Place Order"}
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
