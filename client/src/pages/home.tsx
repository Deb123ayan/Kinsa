import { ArrowRight, CheckCircle2, Globe2, ShieldCheck, Leaf } from "lucide-react";
import { Link, useLocation } from "wouter";
import { Layout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { CATEGORIES } from "@/data/mock-data";
import { ProductCard } from "@/components/product-card";
import heroImg from "@assets/generated_images/cargo_ship_global_trade_with_wheat_and_spices_overlay.png";
import { useAuth } from "@/context/auth-context";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { fetchProducts, type Product } from "@/services/products";

export default function Home() {
  const { isLoggedIn } = useAuth();
  const [, setLocation] = useLocation();
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isLoggedIn) {
      setLocation("/dashboard");
    }
  }, [isLoggedIn, setLocation]);

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const products = await fetchProducts();
        setFeaturedProducts(products.slice(0, 4));
      } catch (error) {
        console.error('Failed to load products:', error);
        setFeaturedProducts([]);
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, []);

  if (isLoggedIn) {
    return null;
  }

  const floatingVariants = {
    animate: {
      y: [0, -20, 0],
      transition: {
        duration: 6,
        repeat: Infinity,
      },
    },
  };

  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative h-[600px] w-full overflow-hidden bg-primary">
        <div className="absolute inset-0">
          {/* Background Video */}
          <video 
            autoPlay 
            muted 
            loop 
            playsInline
            className="h-full w-full object-cover opacity-80 brightness-110 contrast-110 saturate-90"
            poster={heroImg}
            onLoadStart={() => console.log('Video loading started')}
            onError={(e) => {
              console.log('Video failed to load, falling back to image');
              // Hide video and show fallback image
              e.currentTarget.style.display = 'none';
            }}
          >
            <source src="/ad.mp4" type="video/mp4" />
          </video>
          {/* Fallback image - always present but behind video */}
          <img 
            src={heroImg} 
            alt="Global Trade" 
            className="absolute inset-0 h-full w-full object-cover opacity-80 -z-10"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-primary/80 via-primary/40 to-primary/60" />
        </div>

        {/* Animated background elements */}
        <motion.div
          className="absolute top-20 right-0 w-96 h-96 bg-accent/10 rounded-full blur-3xl"
          animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
        
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
                whileHover={{ y: -10, transition: { duration: 0.3 } }}
              >
                <Link href={`/catalog?category=${cat.id}`}>
                  <div className="group block relative overflow-hidden rounded-lg aspect-[4/5] shadow-lg cursor-pointer">
                    <div className="absolute inset-0">
                      <img 
                        src={cat.image} 
                        alt={cat.name} 
                        className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent transition-opacity group-hover:opacity-90" />
                    </div>
                    <motion.div 
                      className="absolute inset-0 flex flex-col justify-end p-6"
                      initial={{ y: 20, opacity: 0 }}
                      whileInView={{ y: 0, opacity: 1 }}
                      viewport={{ once: true }}
                    >
                      <h3 className="text-2xl font-serif font-bold text-white mb-2 group-hover:text-accent transition-colors">{cat.name}</h3>
                      <p className="text-white/70 group-hover:text-white transition-colors text-sm">{cat.description}</p>
                    </motion.div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-20 bg-secondary/30">
        <div className="container mx-auto px-4">
          <motion.div 
            className="text-center mb-16 max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl font-serif font-bold text-primary mb-4">Featured Products</h2>
            <p className="text-muted-foreground">Browse our bestselling commodities with guaranteed quality and competitive pricing.</p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {loading ? (
              // Loading skeleton
              Array.from({ length: 4 }).map((_, idx) => (
                <div key={idx} className="animate-pulse">
                  <div className="bg-secondary/20 rounded-lg h-80 mb-4"></div>
                </div>
              ))
            ) : featuredProducts.length > 0 ? (
              featuredProducts.map((product, idx) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: idx * 0.05 }}
                  viewport={{ once: true }}
                  whileHover={{ y: -8 }}
                >
                  <ProductCard product={product} />
                </motion.div>
              ))
            ) : (
              <div className="col-span-full text-center py-12">
                <p className="text-muted-foreground">No products available at the moment.</p>
              </div>
            )}
          </div>

          <div className="text-center">
            <Link href="/catalog">
              <Button size="lg" variant="outline" className="border-primary text-primary hover:bg-primary hover:text-primary-foreground">
                View Full Catalog <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Why Choose Us - 3D Cards */}
      <section className="py-20 bg-background perspective">
        <div className="container mx-auto px-4">
          <motion.div 
            className="text-center mb-16 max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl font-serif font-bold text-primary mb-4">Why Choose KINSA Global</h2>
            <p className="text-muted-foreground">We deliver excellence through quality, transparency, and trusted partnerships.</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: ShieldCheck,
                title: "Certified Quality",
                desc: "ISO 22000 certified, lab-tested every batch with complete traceability"
              },
              {
                icon: Globe2,
                title: "Global Logistics",
                desc: "Flexible Incoterms (FOB, CIF, EXW) with professional freight partners"
              },
              {
                icon: Leaf,
                title: "Farm Fresh",
                desc: "Direct sourcing from 500+ certified farmers across India"
              }
            ].map((item, idx) => {
              const Icon = item.icon;
              return (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: idx * 0.1 }}
                  viewport={{ once: true }}
                  whileHover={{ scale: 1.05, y: -12 }}
                  className="p-8 border border-border rounded-lg hover:shadow-2xl transition-all duration-300 bg-white/50 backdrop-blur-sm"
                >
                  <motion.div variants={floatingVariants} animate="animate">
                    <Icon className="h-12 w-12 text-accent mb-4" />
                  </motion.div>
                  <h3 className="text-xl font-bold text-primary mb-2">{item.title}</h3>
                  <p className="text-muted-foreground">{item.desc}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Stats Section with 3D Effect */}
      <section className="py-16 bg-gradient-to-r from-primary via-primary/90 to-primary text-primary-foreground">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
              { number: "20+", label: "Years Experience" },
              { number: "500+", label: "Partner Farmers" },
              { number: "50K+", label: "MT Exported Annually" },
              { number: "100+", label: "Global Buyers" },
            ].map((stat, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, scale: 0.5 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: idx * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ scale: 1.1 }}
                className="text-center"
              >
                <motion.div
                  className="text-4xl md:text-5xl font-bold mb-2 text-accent"
                  animate={{ y: [0, -5, 0] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: idx * 0.2 }}
                >
                  {stat.number}
                </motion.div>
                <p className="text-primary-foreground/80">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary text-primary-foreground text-center">
        <motion.div 
          className="container mx-auto px-4 max-w-2xl"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <h2 className="font-serif text-4xl font-bold mb-4">Ready to Source Premium Commodities?</h2>
          <p className="text-lg opacity-90 mb-8">Join hundreds of wholesale buyers who trust KINSA Global for consistent quality and competitive pricing.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/auth">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90">
                  Create Partner Account
                </Button>
              </motion.div>
            </Link>
            <Link href="/contact">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button size="lg" variant="outline" className="text-primary-foreground border-primary-foreground hover:bg-primary-foreground/10">
                  Contact Sales
                </Button>
              </motion.div>
            </Link>
          </div>
        </motion.div>
      </section>
    </Layout>
  );
}
