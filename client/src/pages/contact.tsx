import { Layout } from "@/components/layout";
import { Card, CardContent } from "@/components/ui/card";
import { MapPin, Phone, Mail, Clock } from "lucide-react";
import { ContactForm } from "@/components/ContactForm";

export default function Contact() {
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
                      +91 22 1234 5678<br />
                      +91 98765 43210
                    </p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <Mail className="h-6 w-6 text-accent shrink-0" />
                  <div>
                    <h4 className="font-bold mb-1">Email</h4>
                    <p className="text-sm opacity-80">
                      sales@kinsa.com<br />
                      info@kinsa.com
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

          {/* Contact Form */}
          <div className="lg:col-span-2">
            <ContactForm />
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