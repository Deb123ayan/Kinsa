import { Layout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { MapPin, Phone, Mail, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function Contact() {
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Message Sent",
      description: "We'll get back to you shortly.",
    });
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-12">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h1 className="font-serif text-4xl font-bold text-primary mb-4">Get in Touch</h1>
          <p className="text-muted-foreground">
            Whether you need a custom quote, sample request, or partnership discussion, our team is here to assist you.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Contact Info */}
          <div className="lg:col-span-1 space-y-8">
            <Card className="border-none shadow-md bg-primary text-primary-foreground">
              <CardContent className="p-8 space-y-6">
                <div className="flex gap-4">
                  <MapPin className="h-6 w-6 text-accent shrink-0" />
                  <div>
                    <h4 className="font-bold mb-1">Headquarters</h4>
                    <p className="text-sm opacity-80">
                      123 Trade Harbor Blvd,<br />
                      Mumbai, Maharashtra 400001<br />
                      India
                    </p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <Phone className="h-6 w-6 text-accent shrink-0" />
                  <div>
                    <h4 className="font-bold mb-1">Phone</h4>
                    <p className="text-sm opacity-80">
                      +91 22 1234 5678 (Sales)<br />
                      +91 22 8765 4321 (Support)
                    </p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <Mail className="h-6 w-6 text-accent shrink-0" />
                  <div>
                    <h4 className="font-bold mb-1">Email</h4>
                    <p className="text-sm opacity-80">
                      sales@terratrade.com<br />
                      info@terratrade.com
                    </p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <Clock className="h-6 w-6 text-accent shrink-0" />
                  <div>
                    <h4 className="font-bold mb-1">Office Hours</h4>
                    <p className="text-sm opacity-80">
                      Mon - Sat: 9:00 AM - 7:00 PM IST
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Form */}
          <div className="lg:col-span-2">
             <Card>
               <CardContent className="p-8">
                 <form onSubmit={handleSubmit} className="space-y-6">
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                     <div className="space-y-2">
                       <label className="text-sm font-medium">Name</label>
                       <Input placeholder="Your Name" required />
                     </div>
                     <div className="space-y-2">
                       <label className="text-sm font-medium">Email</label>
                       <Input type="email" placeholder="email@company.com" required />
                     </div>
                   </div>
                   
                   <div className="space-y-2">
                     <label className="text-sm font-medium">Subject</label>
                     <Input placeholder="Product Inquiry: ..." required />
                   </div>

                   <div className="space-y-2">
                     <label className="text-sm font-medium">Message</label>
                     <Textarea placeholder="Tell us about your requirements (Quantity, Destination, Grade)..." className="min-h-[150px]" required />
                   </div>

                   <Button type="submit" className="bg-primary text-primary-foreground hover:bg-primary/90 w-full md:w-auto">
                     Send Message
                   </Button>
                 </form>
               </CardContent>
             </Card>
          </div>
        </div>

        {/* Map Placeholder */}
        <div className="mt-16 h-80 bg-secondary/50 rounded-lg flex items-center justify-center border border-border">
          <p className="text-muted-foreground flex items-center gap-2">
            <MapPin className="h-5 w-5" /> Google Maps Embed Placeholder
          </p>
        </div>
      </div>
    </Layout>
  );
}
