import { ArrowRight, Globe2, ShieldCheck, Leaf } from "lucide-react";
import { Link, useLocation } from "wouter";
import { Layout } from "@/components/layout";
import { CATEGORIES } from "@/data/mock-data";
import { ProductCard } from "@/components/product-card";
import heroImg from "@assets/generated_images/cargo_ship_global_trade_with_wheat_and_spices_overlay.png";
import { useAuth } from "@/context/auth-context";
import { useEffect, useState } from "react";
import { fetchProducts, type Product } from "@/services/products";
import { motion } from "framer-motion";


// Premium Animation Presets
const fadeInUp = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }
  }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15
    }
  }
};

const slideInRight = {
  hidden: { opacity: 0, x: 60 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.9, type: "spring", stiffness: 50 }
  }
};

const popIn = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { duration: 0.6, ease: "easeOut" }
  }
};

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
        setFeaturedProducts(products);
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

  return (
    <Layout>
      {/* Elite Hero Section - Editorial Asymmetry */}
      <section className="relative min-h-[90svh] flex items-center pt-32 pb-20 overflow-hidden bg-background">
        <div className="absolute inset-0 z-0 bg-[radial-gradient(ellipse_at_top_right,_var(--color-bg-subtle),_transparent_50%)]" />

        <div className="container relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-8 items-center">
          
          {/* Typography / Content Side */}
          <motion.div 
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            className="lg:col-span-7 z-20"
          >
            <motion.div variants={fadeInUp} className="flex items-center gap-4 mb-8">
              <div className="h-px w-12 bg-accent" />
              <span className="text-xs font-bold uppercase tracking-[0.25em] text-accent">Premium Agricultural Trading</span>
            </motion.div>
            
            <motion.h1 variants={fadeInUp} className="display text-foreground mb-8">
              Connecting Nature's Bounty to <br className="hidden md:block" />
              <span className="text-accent italic font-serif opacity-90">Global Markets.</span>
            </motion.h1>
            
            <motion.p variants={fadeInUp} className="prose mb-12 text-lg lg:text-xl">
              We specialize in the export of premium grains, spices, and pulses. 
              Meticulously sourced, strictly certified, and delivered with uncompromising reliability from farm to port.
            </motion.p>
            
            <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row gap-4">
              <Link href="/catalog">
                <motion.button 
                  whileHover={{ y: -2 }}
                  className="btn btn-primary h-14 px-10 text-sm tracking-widest uppercase w-full sm:w-auto shadow-xl"
                >
                  Explore Catalog
                </motion.button>
              </Link>
              <Link href="/contact">
                <motion.button 
                  whileHover={{ y: -2 }}
                  className="btn btn-ghost h-14 px-10 text-sm tracking-widest uppercase w-full sm:w-auto"
                >
                  Bulk Inquiry
                </motion.button>
              </Link>
            </motion.div>
          </motion.div>

          {/* Media / Visual Side */}
          <motion.div 
            initial="hidden"
            animate="visible"
            variants={slideInRight}
            className="lg:col-span-5 relative"
          >
            <div className="aspect-[4/5] lg:aspect-[3/4] overflow-hidden rounded-[2rem] relative shadow-2xl transform lg:translate-y-12 border border-border/50">
              <video
                autoPlay
                muted
                loop
                playsInline
                className="absolute inset-0 h-full w-full object-cover"
                poster={heroImg}
                onError={(e) => { e.currentTarget.style.display = 'none'; }}
              >
                <source src="/ad.mp4" type="video/mp4" />
              </video>
              <img
                src={heroImg}
                alt="Global Trade Cargo Ship"
                className="absolute inset-0 h-full w-full object-cover -z-10"
              />
              <div className="absolute inset-0 bg-gradient-to-tr from-black/60 via-black/20 to-transparent" />
              
              {/* Overlay Stat Card */}
              <motion.div 
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6, duration: 0.8 }}
                className="absolute bottom-8 left-8 right-8 bg-card/80 backdrop-blur-md border border-white/10 p-6 rounded-2xl shadow-xl"
              >
                <p className="text-xs uppercase tracking-widest text-muted-foreground font-bold mb-2">Global Reach</p>
                <p className="text-3xl font-serif text-foreground font-bold">100+ <span className="text-lg font-sans text-muted-foreground font-medium">Buying Partners</span></p>
              </motion.div>
            </div>
            
            {/* Decorative background element */}
            <div className="absolute -z-10 top-1/2 -translate-y-1/2 right-12 w-64 h-64 bg-accent/10 rounded-full blur-3xl animate-pulse" />
          </motion.div>
        </div>
      </section>

      {/* Featured Categories - Editorial Grid */}
      <section className="py-32 bg-secondary overflow-hidden">
        <div className="container">
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeInUp}
            className="flex flex-col lg:flex-row justify-between items-end gap-8 mb-20"
          >
            <div className="max-w-2xl">
              <h2 className="display text-4xl lg:text-5xl mb-6">Core Commodities</h2>
              <p className="prose">
                Sourced directly from certified farms across the globe, ensuring purity, nutritional value, and absolute traceability in every single shipment.
              </p>
            </div>
            <Link href="/catalog">
              <motion.button 
                whileHover={{ x: 5 }}
                className="btn btn-ghost hidden lg:flex"
              >
                View All Categories <ArrowRight className="ml-2 h-4 w-4" />
              </motion.button>
            </Link>
          </motion.div>

          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            variants={staggerContainer}
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
          >
            {CATEGORIES.map((cat, idx) => (
              <motion.div key={cat.id} variants={fadeInUp}>
                <Link href={`/catalog?category=${cat.id}`}>
                  <motion.div 
                    whileHover={{ y: -10 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                    className="group block relative overflow-hidden rounded-2xl aspect-[4/5] card-elite p-0 border-0 cursor-pointer"
                  >
                    <div className="absolute inset-0">
                      <img
                        src={cat.image}
                        alt={cat.name}
                        className="h-full w-full object-cover transition-transform duration-[1.5s] ease-out"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent opacity-80 transition-opacity duration-500 group-hover:opacity-90" />
                    </div>
                    <div className="absolute inset-0 flex flex-col justify-end p-8 transform transition-transform duration-500">
                      <span className="text-[10px] font-bold text-accent uppercase tracking-[0.3em] mb-3 opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-500">Explore Collection</span>
                      <h3 className="text-3xl font-serif font-bold text-white mb-3 leading-tight">{cat.name}</h3>
                      <p className="text-white/70 text-sm leading-relaxed">{cat.description}</p>
                    </div>
                  </motion.div>
                </Link>
              </motion.div>
            ))}
          </motion.div>
          
          <div className="mt-12 lg:hidden">
            <Link href="/catalog">
              <button className="btn btn-ghost w-full">
                View All Categories <ArrowRight className="ml-2 h-4 w-4" />
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Products – Infinite Marquee */}
      <section className="py-32 bg-background overflow-hidden">
        {/* Inject keyframes once */}
        <style>{`
          @keyframes marquee-scroll {
            0%   { transform: translateX(0); }
            100% { transform: translateX(-50%); }
          }
          .marquee-track {
            display: flex;
            width: max-content;
            animation: marquee-scroll 40s linear infinite;
            will-change: transform;
          }
          .marquee-track:hover {
            animation-play-state: paused;
          }
        `}</style>

        <div className="container">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeInUp}
            className="text-center max-w-3xl mx-auto mb-20"
          >
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-accent mb-4 block">Premium Selection</span>
            <h2 className="display text-4xl lg:text-5xl mb-6">Featured Exports</h2>
            <p className="prose mx-auto">Browse our bestselling commodities with guaranteed quality and competitive CIF pricing.</p>
          </motion.div>
        </div>

        {/* Full-bleed marquee – no container constraints */}
        {loading ? (
          <div className="flex gap-6 px-6 overflow-hidden">
            {Array.from({ length: 4 }).map((_, idx) => (
              <div key={idx} className="skeleton h-[420px] w-72 shrink-0 rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : featuredProducts.length > 0 ? (
          /* Outer mask – fade edges. dir="ltr" keeps flex order physical even in RTL page mode */
          <div
            dir="ltr"
            className="relative w-full"
            style={{
              maskImage: "linear-gradient(to right, transparent 0%, black 8%, black 92%, transparent 100%)",
              WebkitMaskImage: "linear-gradient(to right, transparent 0%, black 8%, black 92%, transparent 100%)",
            }}
          >
            {/* Duplicate list so the loop is seamless */}
            <div dir="ltr" className="marquee-track gap-6 px-6">
              {[...featuredProducts, ...featuredProducts].map((product, idx) => (
                <div
                  key={`${product.id}-${idx}`}
                  className="shrink-0"
                  style={{ width: "clamp(160px, 44vw, 320px)" }}
                >
                  <ProductCard product={product} />
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="container">
            <div className="py-20 text-center border border-border rounded-2xl bg-secondary/50">
              <p className="text-muted-foreground font-medium uppercase tracking-widest text-sm">No products available at the moment.</p>
            </div>
          </div>
        )}

        <div className="container mt-16 text-center">
          <Link href="/catalog">
            <motion.button whileHover={{ y: -2 }} className="btn btn-ghost">
              View Full Catalog <ArrowRight className="ml-2 h-4 w-4" />
            </motion.button>
          </Link>
        </div>
      </section>

      {/* Value Proposition */}
      <section className="py-32 bg-foreground text-background overflow-hidden">
        <div className="container">
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeInUp}
            className="text-center max-w-3xl mx-auto mb-20"
          >
            <h2 className="display text-4xl lg:text-5xl mb-6 text-background">Why Choose KINSA</h2>
            <p className="text-background/70 text-lg leading-relaxed mx-auto">We deliver excellence through uncompromising quality, radical transparency, and enduring partnerships.</p>
          </motion.div>

          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            variants={staggerContainer}
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
          >
            {[
              {
                icon: ShieldCheck,
                title: "Certified Quality",
                desc: "ISO 22000 certified, lab-tested every batch with complete traceability from origin."
              },
              {
                icon: Globe2,
                title: "Global Logistics",
                desc: "Flexible Incoterms (FOB, CIF, EXW) coordinated by our dedicated freight forwarding experts."
              },
              {
                icon: Leaf,
                title: "Farm Direct",
                desc: "Direct sourcing from over 500 certified farmers ensuring fair trade and peak freshness."
              }
            ].map((item, idx) => {
              const Icon = item.icon;
              return (
                <motion.div 
                  key={idx} 
                  variants={fadeInUp}
                  whileHover={{ y: -4 }}
                  className="p-10 border border-white/10 rounded-3xl bg-white/5 hover:bg-white/10 transition-colors duration-500 cursor-default"
                >
                  <motion.div 
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    variants={popIn}
                    className="h-16 w-16 rounded-2xl bg-accent/20 flex items-center justify-center mb-8"
                  >
                    <Icon className="h-8 w-8 text-accent" />
                  </motion.div>
                  <h3 className="text-2xl font-serif font-bold text-background mb-4">{item.title}</h3>
                  <p className="text-background/60 leading-relaxed">{item.desc}</p>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 bg-background relative overflow-hidden">
        <div className="absolute inset-0 border-y border-border" />
        <div className="absolute top-0 right-0 w-1/2 h-full bg-secondary/30 -z-10" />
        
        <div className="container relative z-10 text-center max-w-4xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
          >
            <motion.span 
              variants={popIn}
              className="h-16 w-16 mx-auto bg-primary text-primary-foreground rounded-full flex items-center justify-center mb-8 shadow-xl"
            >
              <ArrowRight className="h-6 w-6 -rotate-45" />
            </motion.span>
            <motion.h2 variants={fadeInUp} className="display text-4xl lg:text-6xl mb-8">Ready to Source Premium Commodities?</motion.h2>
            <motion.p variants={fadeInUp} className="prose mx-auto text-xl mb-12">
              Join hundreds of wholesale buyers who trust KINSA Global for consistent quality and seamless delivery.
            </motion.p>
            
            <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row gap-6 justify-center">
              <Link href="/auth">
                <motion.button 
                  whileHover={{ y: -2 }}
                  className="btn btn-primary h-16 px-12 text-sm tracking-widest uppercase shadow-2xl"
                >
                  Create Partner Account
                </motion.button>
              </Link>
              <Link href="/contact">
                <motion.button 
                  whileHover={{ y: -2 }}
                  className="btn btn-ghost h-16 px-12 text-sm tracking-widest uppercase"
                >
                  Contact Sales
                </motion.button>
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>
    </Layout>
  );
}
