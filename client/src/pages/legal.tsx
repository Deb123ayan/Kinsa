import { useLocation } from "wouter";
import { Layout } from "@/components/layout";
import { ScrollArea } from "@/components/ui/scroll-area";

export default function Legal({ slug = "privacy" }: { slug?: string }) {
  const getCurrentSlug = () => {
    const [location] = useLocation();
    if (location === "/privacy") return "privacy";
    if (location === "/terms") return "terms";
    if (location === "/shipping") return "shipping";
    if (location === "/track") return "track";
    return slug;
  };

  const currentSlug = getCurrentSlug();

  const titles: Record<string, string> = {
    privacy: "Privacy Policy",
    terms: "Terms & Conditions",
    shipping: "Shipping & Delivery Policy",
    track: "Track Shipment",
  };

  const title = titles[currentSlug] || "Legal Information";

  return (
    <Layout>
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto bg-white border border-border rounded-lg shadow-sm p-8 md:p-12">
          <h1 className="font-serif text-3xl font-bold text-primary mb-8 border-b pb-4">{title}</h1>
          
          <ScrollArea className="h-[60vh] pr-6">
            <div className="prose prose-sm md:prose-base max-w-none text-muted-foreground space-y-6">
              {currentSlug === "privacy" && (
                <>
                  <div>
                    <p className="text-sm text-muted-foreground italic">Last Updated: December 23, 2025</p>
                  </div>
                  
                  <section>
                    <h2 className="text-2xl font-serif font-bold text-primary mb-4">1. Introduction</h2>
                    <p>
                      KINSA Global ("Company", "we", "our", or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website.
                    </p>
                  </section>

                  <section>
                    <h2 className="text-2xl font-serif font-bold text-primary mb-4">2. Information We Collect</h2>
                    <p>
                      We may collect information about you in a variety of ways. The information we may collect on the Site includes:
                    </p>
                    <ul className="list-disc pl-6 space-y-2">
                      <li><strong>Personal Data:</strong> Name, email address, phone number, company name, and business address</li>
                      <li><strong>Payment Information:</strong> Credit card details (processed securely through third-party providers)</li>
                      <li><strong>Usage Data:</strong> Pages visited, time spent, referring URLs, and browser type</li>
                      <li><strong>Location Data:</strong> IP address and general geographic location</li>
                    </ul>
                  </section>

                  <section>
                    <h2 className="text-2xl font-serif font-bold text-primary mb-4">3. Use of Your Information</h2>
                    <p>We use the information we collect in the following ways:</p>
                    <ul className="list-disc pl-6 space-y-2">
                      <li>To process transactions and send related information</li>
                      <li>To respond to inquiries and provide customer support</li>
                      <li>To send promotional communications (with your consent)</li>
                      <li>To improve our website and services</li>
                      <li>To protect against fraudulent transactions</li>
                      <li>To comply with legal obligations</li>
                    </ul>
                  </section>

                  <section>
                    <h2 className="text-2xl font-serif font-bold text-primary mb-4">4. Data Protection & Security</h2>
                    <p>
                      We implement appropriate technical and organizational measures to protect your personal data against unauthorized access, alteration, disclosure, or destruction. All sensitive information is encrypted using SSL technology.
                    </p>
                  </section>

                  <section>
                    <h2 className="text-2xl font-serif font-bold text-primary mb-4">5. Contact Us</h2>
                    <p>
                      If you have questions about this Privacy Policy, please contact us at:<br />
                      Email: privacy@kinsa.com<br />
                      Phone: +91 22 1234 5678<br />
                      Address: 123 Trade Harbor Blvd, Mumbai, India 400001
                    </p>
                  </section>
                </>
              )}

              {currentSlug === "terms" && (
                <>
                  <div>
                    <p className="text-sm text-muted-foreground italic">Last Updated: December 23, 2025</p>
                  </div>

                  <section>
                    <h2 className="text-2xl font-serif font-bold text-primary mb-4">1. Acceptance of Terms</h2>
                    <p>
                      By accessing and using this website, you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.
                    </p>
                  </section>

                  <section>
                    <h2 className="text-2xl font-serif font-bold text-primary mb-4">2. Use License</h2>
                    <p>
                      Permission is granted to temporarily download one copy of the materials (information or software) on KINSA Global's website for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title, and under this license you may not:
                    </p>
                    <ul className="list-disc pl-6 space-y-2">
                      <li>Modifying or copying the materials</li>
                      <li>Using the materials for any commercial purpose or for any public display</li>
                      <li>Attempting to decompile or reverse engineer any software contained on KINSA Global's website</li>
                      <li>Transferring the materials to another person or "mirroring" the materials on any other server</li>
                      <li>Removing any copyright or other proprietary notations from the materials</li>
                    </ul>
                  </section>

                  <section>
                    <h2 className="text-2xl font-serif font-bold text-primary mb-4">3. Disclaimer</h2>
                    <p>
                      The materials on KINSA Global's website are provided on an 'as is' basis. KINSA Global makes no warranties, expressed or implied, and hereby disclaims and negates all other warranties including, without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights.
                    </p>
                  </section>

                  <section>
                    <h2 className="text-2xl font-serif font-bold text-primary mb-4">4. Limitations</h2>
                    <p>
                      In no event shall KINSA Global or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials on KINSA Global's website, even if KINSA Global or an authorized representative has been notified orally or in writing of the possibility of such damage.
                    </p>
                  </section>

                  <section>
                    <h2 className="text-2xl font-serif font-bold text-primary mb-4">5. Product Warranty</h2>
                    <p>
                      KINSA Global guarantees the quality and purity of all products as specified in the product specifications. Any discrepancies must be reported within 7 days of receipt. All products are subject to quality inspection and lab testing.
                    </p>
                  </section>

                  <section>
                    <h2 className="text-2xl font-serif font-bold text-primary mb-4">6. Contact Information</h2>
                    <p>
                      For any disputes or concerns regarding these Terms & Conditions, please contact us at:<br />
                      Email: legal@kinsa.com<br />
                      Phone: +91 22 1234 5678
                    </p>
                  </section>
                </>
              )}

              {currentSlug === "shipping" && (
                <>
                  <div>
                    <p className="text-sm text-muted-foreground italic">Last Updated: December 23, 2025</p>
                  </div>

                  <section>
                    <h2 className="text-2xl font-serif font-bold text-primary mb-4">1. Shipping Terms</h2>
                    <p>
                      KINSA Global offers flexible shipping arrangements with multiple Incoterms to suit your business needs. All shipments are handled by experienced logistics partners ensuring safe and timely delivery.
                    </p>
                  </section>

                  <section>
                    <h2 className="text-2xl font-serif font-bold text-primary mb-4">2. Available Incoterms</h2>
                    <div className="space-y-4">
                      <div>
                        <h3 className="font-bold text-primary">FOB (Free On Board)</h3>
                        <p>
                          The seller pays for transportation to the port and loading onto the vessel. The buyer assumes responsibility for maritime freight, insurance, and delivery to the final destination. Insurance is the buyer's responsibility.
                        </p>
                      </div>
                      <div>
                        <h3 className="font-bold text-primary">CIF (Cost, Insurance and Freight)</h3>
                        <p>
                          The seller covers the cost of goods, freight, and insurance up to the destination port. The buyer assumes risk upon shipment. This is the most convenient option for international buyers.
                        </p>
                      </div>
                      <div>
                        <h3 className="font-bold text-primary">EXW (Ex Works)</h3>
                        <p>
                          The buyer assumes all costs and risks from the moment goods are available at our facility. We prepare the goods for pickup, but the buyer arranges all transportation and insurance.
                        </p>
                      </div>
                    </div>
                  </section>

                  <section>
                    <h2 className="text-2xl font-serif font-bold text-primary mb-4">3. Delivery Timeline</h2>
                    <ul className="list-disc pl-6 space-y-2">
                      <li><strong>Order Confirmation:</strong> 24 hours</li>
                      <li><strong>Product Preparation:</strong> 5-7 business days</li>
                      <li><strong>Port Loading:</strong> 7-10 business days</li>
                      <li><strong>Transit Time:</strong> Varies by destination (typically 20-45 days)</li>
                      <li><strong>Custom Clearance:</strong> Buyer's responsibility (typically 3-7 days)</li>
                    </ul>
                  </section>

                  <section>
                    <h2 className="text-2xl font-serif font-bold text-primary mb-4">4. Packaging Standards</h2>
                    <ul className="list-disc pl-6 space-y-2">
                      <li><strong>Bulk Shipments:</strong> Standard 20ft/40ft containers with food-grade liners</li>
                      <li><strong>Bagged Products:</strong> 25kg or 50kg PP bags as per requirement</li>
                      <li><strong>Eco-Friendly:</strong> Jute bags available for sustainable packaging</li>
                      <li><strong>Labeling:</strong> Multilingual labels with product specifications and certifications</li>
                    </ul>
                  </section>

                  <section>
                    <h2 className="text-2xl font-serif font-bold text-primary mb-4">5. Damage & Loss Claims</h2>
                    <p>
                      Claims for damaged or lost shipments must be filed within 14 days of receipt. Proper documentation including photos and inspection reports are required. KINSA Global will work with insurance providers to process legitimate claims.
                    </p>
                  </section>

                  <section>
                    <h2 className="text-2xl font-serif font-bold text-primary mb-4">6. Custom Clearance</h2>
                    <p>
                      While we assist with documentation, the buyer is responsible for customs clearance at the destination country. We provide Bill of Lading, Certificate of Origin, and Phytosanitary Certificates to facilitate the clearance process.
                    </p>
                  </section>

                  <section>
                    <h2 className="text-2xl font-serif font-bold text-primary mb-4">7. Tracking & Communication</h2>
                    <p>
                      We provide real-time tracking information for all shipments. You will receive updates at each stage: departure from warehouse, port departure, transit, and arrival at destination port. Our team is available 24/7 for shipment inquiries.
                    </p>
                  </section>

                  <section>
                    <h2 className="text-2xl font-serif font-bold text-primary mb-4">8. Contact Logistics Team</h2>
                    <p>
                      For shipping inquiries and tracking:<br />
                      Email: logistics@kinsa.com<br />
                      Phone: +91 22 5678 1234<br />
                      WhatsApp: +91 9876 543210
                    </p>
                  </section>
                </>
              )}

              {currentSlug === "track" && (
                <div className="text-center py-12">
                   <p className="mb-4 text-lg text-primary font-medium">Track Your Shipment</p>
                   <p className="mb-6 text-muted-foreground">Please enter your Shipment ID / Bill of Lading Number to track your cargo.</p>
                   <div className="max-w-md mx-auto">
                      <p className="text-sm text-muted-foreground">
                        Tracking functionality is available in the dashboard for authenticated users. Please login to track your shipments.
                      </p>
                   </div>
                </div>
              )}
            </div>
          </ScrollArea>
        </div>
      </div>
    </Layout>
  );
}
