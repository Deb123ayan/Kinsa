import { ArrowRight, CheckCircle2, Globe2, ShieldCheck, Leaf } from "lucide-react";
import { Link, useLocation } from "wouter";
import { Layout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { CATEGORIES, PRODUCTS } from "@/data/mock-data";
import { ProductCard } from "@/components/product-card";
import heroImg from "@assets/generated_images/cargo_ship_global_trade_with_wheat_and_spices_overlay.png";
import { useAuth } from "@/context/auth-context";
import { useEffect } from "react";
import { motion } from "framer-motion";

export default function Home() {
  const { isLoggedIn } = useAuth();
  const [, setLocation] = useLocation();
  const featuredProducts = PRODUCTS.slice(0, 4);

  useEffect(() => {
    if (isLoggedIn) {
      setLocation("/dashboard");
    }
  }, [isLoggedIn, setLocation]);

  if (isLoggedIn) {
    return null;
  }

  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative h-[600px] w-full overflow-hidden bg-primary">
        <div className="absolute inset-0">
          <img 
            src={heroImg} 
            alt="Global Trade" 
            className="h-full w-full object-cover opacity-60"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-primary/90 via-primary/50 to-transparent" />
        </div>
        
        <div className="container relative mx-auto h-full flex flex-col justify-center px-4">
          <motion.div 
            className="max-w-2xl"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            <motion.span 
              className="inline-block px-3 py-1 mb-6 text-xs font-semibold tracking-widest text-accent uppercase bg-accent/10 border border-accent/20 rounded-full backdrop-blur-sm"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              Global Agricultural Trading
            </motion.span>
            <motion.h1 
              className="mb-6 font-serif text-5xl font-bold leading-tight text-white md:text-6xl lg:text-7xl"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              Connecting Nature's Bounty to <span className="text-accent italic">Global Markets</span>
            </motion.h1>
            <motion.p 
              className="mb-8 text-lg text-primary-foreground/80 md:text-xl max-w-lg"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
            >
              We specialize in the export of premium grains, spices, and pulses. 
              Ensuring quality from farm to port with certified logistics.
            </motion.p>
            <motion.div 
              className="flex flex-col gap-4 sm:flex-row"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.8 }}
            >
              <Link href="/catalog">
                <Button size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90 text-base h-12 px-8">
                  Explore Catalog
                </Button>
              </Link>
              <Link href="/contact">
                <Button size="lg" variant="outline" className="text-white border-white/30 hover:bg-white/10 hover:text-white text-base h-12 px-8">
                  Bulk Inquiry
                </Button>
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Featured Categories */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <motion.div 
            className="text-center mb-16 max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl font-serif font-bold text-primary mb-4">Our Core Commodities</h2>
            <p className="text-muted-foreground">Sourced directly from certified farms across the globe, ensuring purity and nutritional value in every shipment.</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {CATEGORIES.map((cat, idx) => (
              <motion.div
                key={cat.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: idx * 0.1 }}
                viewport={{ once: true }}
              >
                <Link href={`/catalog?category=${cat.id}`}>
                  <a className="group block relative overflow-hidden rounded-lg aspect-[4/5] shadow-lg">
                    <div className="absolute inset-0">
                      <img 
                        src={cat.image} 
                        alt={cat.name} 
                        className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent transition-opacity group-hover:opacity-90" />
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 p-8 text-white transform translate-y-2 transition-transform duration-300 group-hover:translate-y-0">
                      <h3 className="text-2xl font-serif font-bold mb-2">{cat.name}</h3>
                      <p className="text-white/80 text-sm mb-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-100">
                        {cat.description}
                      </p>
                      <span className="inline-flex items-center text-accent text-sm font-medium">
                        View Products <ArrowRight className="ml-2 h-4 w-4" />
                      </span>
                    </div>
                  </a>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-20 bg-secondary/30 border-y border-border">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row gap-12 items-center">
            <motion.div 
              className="flex-1 space-y-8"
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl md:text-4xl font-serif font-bold text-primary">
                Reliable Partners in <br />Global Trade
              </h2>
              <p className="text-lg text-muted-foreground">
                With over 20 years of experience in agricultural exports, we understand the nuances of international logistics and quality control.
              </p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-6">
                <motion.div 
                  className="flex gap-4"
                  whileHover={{ x: 5 }}
                >
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <ShieldCheck className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-bold text-primary mb-1">Quality Certified</h4>
                    <p className="text-sm text-muted-foreground">ISO 22000 & APEDA certified processes.</p>
                  </div>
                </motion.div>
                <motion.div 
                  className="flex gap-4"
                  whileHover={{ x: 5 }}
                >
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <Globe2 className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-bold text-primary mb-1">Global Logistics</h4>
                    <p className="text-sm text-muted-foreground">Seamless shipping to 50+ countries.</p>
                  </div>
                </motion.div>
                <motion.div 
                  className="flex gap-4"
                  whileHover={{ x: 5 }}
                >
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <Leaf className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-bold text-primary mb-1">Direct Sourcing</h4>
                    <p className="text-sm text-muted-foreground">Farm-to-port traceability guaranteed.</p>
                  </div>
                </motion.div>
                <motion.div 
                  className="flex gap-4"
                  whileHover={{ x: 5 }}
                >
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <CheckCircle2 className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-bold text-primary mb-1">Buyer Protection</h4>
                    <p className="text-sm text-muted-foreground">Transparent pricing and secure contracts.</p>
                  </div>
                </motion.div>
              </div>
            </motion.div>
            
            <motion.div 
              className="flex-1 relative"
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <div className="relative z-10 grid grid-cols-2 gap-4">
                 <div className="space-y-4 translate-y-8">
                    <img src={CATEGORIES[0].image} alt="" className="rounded-lg shadow-xl" />
                    <div className="bg-primary text-primary-foreground p-6 rounded-lg shadow-xl">
                      <h3 className="font-serif text-3xl font-bold text-accent mb-2">50k+</h3>
                      <p className="text-sm">Metric Tons Exported Annually</p>
                    </div>
                 </div>
                 <div className="space-y-4">
                    <div className="bg-white p-6 rounded-lg shadow-xl border border-border">
                      <h3 className="font-serif text-3xl font-bold text-primary mb-2">24/7</h3>
                      <p className="text-sm text-muted-foreground">Logistics Support & Tracking</p>
                    </div>
                    <img src={CATEGORIES[1].image} alt="" className="rounded-lg shadow-xl" />
                 </div>
              </div>
              {/* Decor */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-accent/5 rounded-full blur-3xl -z-0" />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-end mb-12">
            <div>
              <span className="text-accent text-sm font-bold uppercase tracking-widest">In Demand</span>
              <h2 className="text-3xl font-serif font-bold text-primary mt-2">Featured Products</h2>
            </div>
            <Link href="/catalog">
              <Button variant="outline">View All Products</Button>
            </Link>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredProducts.map((product, idx) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                viewport={{ once: true }}
              >
                <ProductCard product={product} />
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </Layout>
  );
}
