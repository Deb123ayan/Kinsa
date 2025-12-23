import { useRoute } from "wouter";
import { Layout } from "@/components/layout";
import { ScrollArea } from "@/components/ui/scroll-area";

export default function Legal() {
  const [match, params] = useRoute("/:slug");
  const slug = params?.slug || "privacy";

  const titles: Record<string, string> = {
    privacy: "Privacy Policy",
    terms: "Terms & Conditions",
    shipping: "Shipping & Delivery Policy",
    track: "Track Shipment", // Reusing this template for simplicity
  };

  const title = titles[slug] || "Legal Information";

  return (
    <Layout>
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto bg-white border border-border rounded-lg shadow-sm p-8 md:p-12">
          <h1 className="font-serif text-3xl font-bold text-primary mb-8 border-b pb-4">{title}</h1>
          
          <ScrollArea className="h-[60vh] pr-6">
            <div className="prose prose-sm md:prose-base max-w-none text-muted-foreground">
              {slug === 'track' ? (
                <div className="text-center py-12">
                   <p className="mb-4">Please enter your Shipment ID / Bill of Lading Number to track your cargo.</p>
                   <div className="max-w-md mx-auto flex gap-2">
                      <input className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50" placeholder="e.g. BL-123456789" />
                      <button className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2">Track</button>
                   </div>
                </div>
              ) : (
                <>
                  <p>Last Updated: December 23, 2025</p>
                  
                  <h3>1. Introduction</h3>
                  <p>Welcome to TerraTrade Global. These terms and conditions outline the rules and regulations for the use of our website and services.</p>
                  
                  <h3>2. Intellectual Property Rights</h3>
                  <p>Other than the content you own, under these Terms, TerraTrade Global and/or its licensors own all the intellectual property rights and materials contained in this Website.</p>
                  
                  <h3>3. Restrictions</h3>
                  <p>You are specifically restricted from all of the following:</p>
                  <ul>
                    <li>publishing any Website material in any other media;</li>
                    <li>selling, sublicensing and/or otherwise commercializing any Website material;</li>
                    <li>publicly performing and/or showing any Website material;</li>
                    <li>using this Website in any way that is or may be damaging to this Website;</li>
                  </ul>

                  <h3>4. Limitation of Liability</h3>
                  <p>In no event shall TerraTrade Global, nor any of its officers, directors and employees, be held liable for anything arising out of or in any way connected with your use of this Website.</p>

                  <p className="italic">This is a mockup legal document for demonstration purposes.</p>
                </>
              )}
            </div>
          </ScrollArea>
        </div>
      </div>
    </Layout>
  );
}
