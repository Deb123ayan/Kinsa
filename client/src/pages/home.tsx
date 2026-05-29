import { ArrowRight } from "lucide-react";
import { Link, useLocation } from "wouter";
import { Layout } from "@/components/layout";
import { CATEGORIES } from "@/data/mock-data";
import { ProductCard } from "@/components/product-card";
import heroImg from "@assets/generated_images/cargo_ship_global_trade_with_wheat_and_spices_overlay.png";
import { useAuth } from "@/context/auth-context";
import { useEffect, useState, useRef } from "react";
import { fetchProducts, type Product } from "@/services/products";
import { motion, useScroll, useTransform } from "framer-motion";

function Word({ children, progress, range }: { children: string, progress: any, range: [number, number] }) {
  const opacity = useTransform(progress, range, [0.15, 1]);
  return <motion.span style={{ opacity }} className="text-foreground">{children}</motion.span>;
}

function StorySection() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 80%", "end 50%"]
  });

  const text = "We don't just export commodities. We export trust. Every harvest is meticulously sourced, strictly certified, and delivered with absolute reverence.";
  const words = text.split(" ");

  return (
    <section ref={ref} className="py-24 lg:py-48 bg-background relative border-t border-border">
      <div className="container max-w-5xl mx-auto px-4 lg:px-8">
        <p className="text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-serif leading-snug lg:leading-tight text-center flex flex-wrap justify-center gap-x-[0.25em] gap-y-2 lg:gap-y-4">
          {words.map((word, i) => {
            const start = i / words.length;
            const end = start + (1 / words.length);
            return <Word key={i} progress={scrollYProgress} range={[start, end]}>{word}</Word>
          })}
        </p>
      </div>
    </section>
  );
}

// Premium Animation Presets
const fadeInUp = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.23, 1, 0.32, 1] } }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.15 } }
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
      {/* 1. HERO - Full Bleed Split */}
      <section className="relative min-h-[100svh] w-full flex flex-col lg:flex-row overflow-hidden bg-background">
        {/* Left: Typography Block */}
        <div className="w-full lg:w-1/2 flex flex-col justify-center px-8 lg:px-20 pt-24 pb-12 lg:pt-0 lg:pb-0 bg-accent text-accent-subtle z-10">
          <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="max-w-xl">
            <motion.h1 variants={fadeInUp} className="text-5xl sm:text-6xl lg:text-[5.5rem] font-serif leading-[0.9] tracking-tight mb-8 text-white">
              Cultivated <br />
              with rigor. <br />
              <span className="italic opacity-80">Traded globally.</span>
            </motion.h1>
            
            <motion.p variants={fadeInUp} className="text-lg lg:text-xl text-white/80 mb-12 max-w-md font-sans font-light leading-relaxed">
              Exporting premium grains, spices, and pulses. Meticulously sourced, strictly certified, and delivered with uncompromising reliability.
            </motion.p>
            
            <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row gap-4">
              <Link href="/catalog">
                <motion.button 
                  whileTap={{ scale: 0.97 }}
                  className="inline-flex items-center justify-center gap-2 px-8 h-14 bg-white text-accent font-sans font-semibold text-sm tracking-widest uppercase hover:bg-white/90 transition-colors"
                >
                  Explore Catalog
                </motion.button>
              </Link>
              <Link href="/contact">
                <motion.button 
                  whileTap={{ scale: 0.97 }}
                  className="inline-flex items-center justify-center gap-2 px-8 h-14 border border-white/30 text-white font-sans font-semibold text-sm tracking-widest uppercase hover:bg-white/10 transition-colors"
                >
                  Bulk Inquiry
                </motion.button>
              </Link>
            </motion.div>
          </motion.div>
        </div>

        {/* Right: Media Block */}
        <div className="w-full lg:w-1/2 min-h-[50vh] lg:min-h-screen relative overflow-hidden">
          <motion.div 
            initial={{ scale: 1.05, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 1.5, ease: [0.23, 1, 0.32, 1] }}
            className="absolute inset-0"
          >
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
          </motion.div>
        </div>
      </section>

      {/* 2. CATEGORIES - Sticky Scroll-Stack */}
      <section className="relative py-16 lg:py-32 bg-background border-t border-border">
        <div className="container px-4 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-8 items-start relative">
            
            <div className="lg:col-span-4 lg:sticky lg:top-32 z-10 max-w-sm">
              <motion.div
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-100px" }}
                variants={staggerContainer}
              >
                <motion.h2 variants={fadeInUp} className="text-4xl lg:text-5xl font-serif text-foreground mb-6 leading-tight">
                  Core <br className="hidden lg:block"/>Commodities
                </motion.h2>
                <motion.p variants={fadeInUp} className="text-lg text-text-secondary leading-relaxed mb-8">
                  Sourced directly from certified farms across the globe, ensuring absolute traceability in every single shipment.
                </motion.p>
                <motion.div variants={fadeInUp}>
                  <Link href="/catalog">
                    <button className="group flex items-center gap-3 text-sm font-bold uppercase tracking-widest text-accent hover:text-accent-hover transition-colors">
                      View Catalog
                      <ArrowRight className="h-4 w-4 transform group-hover:translate-x-1 transition-transform" />
                    </button>
                  </Link>
                </motion.div>
              </motion.div>
            </div>

            <div className="lg:col-span-8 flex flex-col gap-8 lg:gap-12 w-full">
              {CATEGORIES.map((cat, idx) => (
                <motion.div 
                  key={cat.id}
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-100px" }}
                  transition={{ duration: 0.8, delay: idx * 0.1, ease: [0.23, 1, 0.32, 1] }}
                >
                  <Link href={`/catalog?category=${cat.id}`}>
                    <motion.div 
                      whileTap={{ scale: 0.98 }}
                      className="group block relative w-full h-[50vh] lg:h-[60vh] bg-border overflow-hidden cursor-pointer"
                    >
                      <div className="absolute inset-0">
                        <img
                          src={cat.image}
                          alt={cat.name}
                          className="h-full w-full object-cover transition-transform duration-[1.5s] ease-out group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-black/40 transition-opacity duration-700 group-hover:bg-black/20" />
                      </div>
                      <div className="absolute inset-0 p-8 lg:p-12 flex flex-col justify-end">
                        <h3 className="text-4xl lg:text-5xl font-serif text-white mb-4 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">{cat.name}</h3>
                        <p className="text-white/80 max-w-md opacity-0 transform translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-500 delay-100">{cat.description}</p>
                      </div>
                    </motion.div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 3. MARQUEE - Brutalist */}
      <section className="py-12 lg:py-32 bg-foreground text-background overflow-hidden flex flex-col justify-center">
        <style>{`
          @keyframes scroll-left {
            0% { transform: translateX(0); }
            100% { transform: translateX(-100%); }
          }
          .animate-scroll {
            display: flex;
            white-space: nowrap;
            animation: scroll-left 40s linear infinite;
            will-change: transform;
          }
        `}</style>
        
        {/* Massive Text Marquee */}
        <div className="w-full overflow-hidden flex mb-16 lg:mb-24 opacity-90">
          <div className="animate-scroll">
            <span className="text-[10vw] font-serif font-bold uppercase leading-none tracking-tight text-background shrink-0 pr-8">
              PREMIUM EXPORTS • CERTIFIED QUALITY • DIRECT SOURCING • GLOBAL REACH •
            </span>
          </div>
          <div className="animate-scroll" aria-hidden="true">
            <span className="text-[10vw] font-serif font-bold uppercase leading-none tracking-tight text-background shrink-0 pr-8">
              PREMIUM EXPORTS • CERTIFIED QUALITY • DIRECT SOURCING • GLOBAL REACH •
            </span>
          </div>
          <div className="animate-scroll" aria-hidden="true">
            <span className="text-[10vw] font-serif font-bold uppercase leading-none tracking-tight text-background shrink-0 pr-8">
              PREMIUM EXPORTS • CERTIFIED QUALITY • DIRECT SOURCING • GLOBAL REACH •
            </span>
          </div>
        </div>

        {/* Product Slider (Edge to Edge) */}
        <div className="w-full">
          {loading ? (
            <div className="flex gap-6 px-6 overflow-hidden">
              {Array.from({ length: 4 }).map((_, idx) => (
                <div key={idx} className="skeleton h-[420px] w-72 shrink-0 animate-pulse bg-white/10" />
              ))}
            </div>
          ) : featuredProducts.length > 0 ? (
            <div dir="ltr" className="relative w-full" style={{ maskImage: "linear-gradient(to right, transparent 0%, black 5%, black 95%, transparent 100%)", WebkitMaskImage: "linear-gradient(to right, transparent 0%, black 5%, black 95%, transparent 100%)" }}>
              <div dir="ltr" className="animate-scroll gap-6 px-6 hover:[animation-play-state:paused]">
                {[...featuredProducts, ...featuredProducts].map((product, idx) => (
                  <div key={`${product.id}-${idx}`} className="shrink-0" style={{ width: "clamp(260px, 25vw, 360px)" }}>
                    <ProductCard product={product} />
                  </div>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      </section>

      {/* 3.5 STORYTELLING - Scroll Reveal */}
      <StorySection />

      {/* 4. VALUE PROP - Minimalist Index */}
      <section className="py-16 lg:py-32 bg-background border-t border-border">
        <div className="container px-4 lg:px-8 max-w-5xl mx-auto">
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeInUp}
            className="mb-20"
          >
            <h2 className="text-4xl lg:text-6xl font-serif text-foreground mb-6">Uncompromising <br className="hidden md:block"/>Standards.</h2>
          </motion.div>

          <div className="flex flex-col border-t border-border">
            {[
              {
                id: "01",
                title: "Certified Quality",
                desc: "ISO 22000 certified, lab-tested every batch with complete traceability from origin. We never compromise on purity."
              },
              {
                id: "02",
                title: "Global Logistics",
                desc: "Flexible Incoterms (FOB, CIF, EXW) coordinated by our dedicated freight forwarding experts for seamless delivery."
              },
              {
                id: "03",
                title: "Farm Direct",
                desc: "Direct sourcing from over 500 certified farmers ensuring fair trade, peak freshness, and stable supply chains."
              }
            ].map((item, idx) => (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, x: -40 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.8, delay: idx * 0.15, ease: [0.22, 1, 0.36, 1] }}
                className="group flex flex-col md:flex-row md:items-baseline gap-4 md:gap-12 py-10 border-b border-border hover:bg-bg-subtle transition-colors duration-300 px-4 -mx-4"
              >
                <span className="text-sm font-mono text-text-muted w-8 shrink-0">{item.id}</span>
                <h3 className="text-2xl lg:text-3xl font-serif text-foreground w-full md:w-1/3 shrink-0">{item.title}</h3>
                <p className="text-text-secondary text-lg leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. CTA SECTION - Clean Block */}
      <section className="py-16 lg:py-32 bg-bg-subtle border-t border-border text-center">
        <div className="container max-w-3xl">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl lg:text-5xl font-serif mb-8 text-foreground"
          >
            Ready to source premium commodities?
          </motion.h2>
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Link href="/auth">
              <motion.button 
                whileTap={{ scale: 0.97 }}
                className="h-14 px-10 bg-accent text-white font-sans font-semibold text-sm tracking-widest uppercase hover:bg-accent-hover transition-colors"
              >
                Create Account
              </motion.button>
            </Link>
            <Link href="/contact">
              <motion.button 
                whileTap={{ scale: 0.97 }}
                className="h-14 px-10 border border-border-strong text-foreground font-sans font-semibold text-sm tracking-widest uppercase hover:bg-border transition-colors"
              >
                Contact Sales
              </motion.button>
            </Link>
          </motion.div>
        </div>
      </section>
    </Layout>
  );
}
