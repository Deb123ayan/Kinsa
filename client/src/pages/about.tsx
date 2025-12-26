import { Layout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { CheckCircle2, History, TrendingUp, Users } from "lucide-react";

export default function About() {
  return (
    <Layout>
      <div className="bg-primary py-20 text-primary-foreground text-center">
        <div className="container mx-auto px-4">
          <h1 className="font-serif text-5xl font-bold mb-6">
            Our Legacy of Trust
          </h1>
          <p className="text-xl max-w-2xl mx-auto opacity-90">
            For over two decades, KINSA Global has been the bridge between
            premium Indian agriculture and the world.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
          <div className="space-y-6">
            <h2 className="text-3xl font-serif font-bold text-primary">
              From Soil to Shelf
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              Founded in 2000, KINSA Global began as a small family-owned spice
              trading house in Kerala. Today, we are a global conglomerate
              exporting over 50,000 metric tons of agro-commodities annually.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              Our mission is simple: To provide the world with the purest,
              highest-quality natural ingredients while empowering the farmers
              who grow them.
            </p>

            <div className="grid grid-cols-2 gap-6 pt-6">
              <div className="space-y-2">
                <History className="h-8 w-8 text-accent" />
                <h4 className="font-bold">20+ Years</h4>
                <p className="text-sm text-muted-foreground">
                  Market Experience
                </p>
              </div>
              <div className="space-y-2">
                <Users className="h-8 w-8 text-accent" />
                <h4 className="font-bold">500+</h4>
                <p className="text-sm text-muted-foreground">Partner Farmers</p>
              </div>
              <div className="space-y-2">
                <TrendingUp className="h-8 w-8 text-accent" />
                <h4 className="font-bold">$25M+</h4>
                <p className="text-sm text-muted-foreground">
                  Annual Trade Value
                </p>
              </div>
            </div>
          </div>

          <div className="bg-secondary rounded-lg p-8 space-y-6">
            <h3 className="font-serif text-2xl font-bold text-primary mb-4">
              Certifications & Compliance
            </h3>
            <ul className="space-y-4">
              <li className="flex items-center gap-3">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
                <span className="font-medium">
                  ISO 22000:2018 (Food Safety Management)
                </span>
              </li>
              <li className="flex items-center gap-3">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
                <span className="font-medium">APEDA Registered Exporter</span>
              </li>
              <li className="flex items-center gap-3">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
                <span className="font-medium">US FDA Registered Facility</span>
              </li>
              <li className="flex items-center gap-3">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
                <span className="font-medium">
                  Organic Certified (NPOP/NOP)
                </span>
              </li>
              <li className="flex items-center gap-3">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
                <span className="font-medium">Halal & Kosher Available</span>
              </li>
            </ul>
            <Button className="w-full mt-4" variant="outline">
              Request Copies of Certificates
            </Button>
          </div>
        </div>
      </div>
    </Layout>
  );
}
