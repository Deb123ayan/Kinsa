import { Layout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { CheckCircle2, History, TrendingUp, Users } from "lucide-react";
import { motion } from "framer-motion";

// High-end animation presets
const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { 
    opacity: 1, 
    y: 0, 
    transition: { duration: 0.8, ease: "easeOut" } 
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

const cardHover = {
  hover: { 
    y: -6, 
    transition: { type: "spring", stiffness: 300, damping: 15 } 
  }
};

export default function About() {
  return (
    <Layout>
      <div className="relative bg-primary py-24 text-primary-foreground text-center overflow-hidden">
        {/* Background Video */}
        <div className="absolute inset-0">
          <video 
            autoPlay 
            muted 
            loop 
            playsInline
            className="h-full w-full object-cover opacity-75 brightness-110 contrast-105 saturate-90 scale-105"
            onError={(e) => {
              console.log('Video failed to load on about page');
              e.currentTarget.style.display = 'none';
            }}
          >
            <source src="/ad.mp4" type="video/mp4" />
          </video>
          <div className="absolute inset-0 bg-gradient-to-b from-primary/60 via-primary/50 to-primary/80" />
        </div>
        
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="container mx-auto px-4 relative z-10"
        >
          <h1 className="font-serif text-5xl md:text-6xl font-bold mb-6">
            Our Legacy of Trust
          </h1>
          <p className="text-xl max-w-2xl mx-auto opacity-90 leading-relaxed font-sans">
            For over two decades, KINSA Global has been the bridge between
            premium Indian agriculture and the world.
          </p>
        </motion.div>
      </div>

      <div className="container mx-auto px-4 py-28 overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-20 items-center">
          
          {/* Narrative Content */}
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
            className="space-y-8"
          >
            <motion.h2 variants={fadeInUp} className="text-4xl md:text-5xl font-serif font-bold text-primary">
              From Soil to Shelf
            </motion.h2>
            <motion.p variants={fadeInUp} className="text-muted-foreground leading-relaxed text-lg">
              Founded in 2000, KINSA Global began as a small family-owned spice
              trading house in Kerala. Today, we are a global conglomerate
              exporting over 50,000 metric tons of agro-commodities annually.
            </motion.p>
            <motion.p variants={fadeInUp} className="text-muted-foreground leading-relaxed text-lg">
              Our mission is simple: To provide the world with the purest,
              highest-quality natural ingredients while empowering the farmers
              who grow them.
            </motion.p>

            {/* Metrics List */}
            <motion.div variants={staggerContainer} className="grid grid-cols-3 gap-6 pt-6">
              {[
                { icon: History, val: "20+ Years", title: "Market Experience" },
                { icon: Users, val: "500+", title: "Partner Farmers" },
                { icon: TrendingUp, val: "$25M+", title: "Annual Trade Value" }
              ].map((m, index) => {
                const Icon = m.icon;
                return (
                  <motion.div 
                    key={index}
                    variants={fadeInUp}
                    whileHover={{ y: -4 }}
                    className="space-y-3 cursor-default"
                  >
                    <div className="h-12 w-12 rounded-xl bg-accent/10 flex items-center justify-center text-accent">
                      <Icon className="h-6 w-6" />
                    </div>
                    <h4 className="font-bold font-serif text-2xl text-foreground">{m.val}</h4>
                    <p className="text-xs text-muted-foreground font-semibold uppercase tracking-widest">{m.title}</p>
                  </motion.div>
                );
              })}
            </motion.div>
          </motion.div>

          {/* Compliance & Certifications Card */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, type: "spring", stiffness: 60 }}
          >
            <motion.div 
              variants={cardHover}
              whileHover="hover"
              className="bg-card-elevated rounded-3xl p-10 border border-border/60 shadow-lg space-y-8 cursor-default"
            >
              <h3 className="font-serif text-3xl font-bold text-primary mb-2">
                Certifications & Compliance
              </h3>
              <ul className="space-y-4">
                {[
                  "ISO 22000:2018 (Food Safety Management)",
                  "APEDA Registered Exporter",
                  "US FDA Registered Facility",
                  "Organic Certified (NPOP/NOP)",
                  "Halal & Kosher Available"
                ].map((cert, index) => (
                  <motion.li 
                    key={index}
                    initial={{ opacity: 0, x: -10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center gap-3"
                  >
                    <CheckCircle2 className="h-5 w-5 text-accent shrink-0" />
                    <span className="font-medium text-foreground/80">{cert}</span>
                  </motion.li>
                ))}
              </ul>
              
              <Button className="w-full mt-4 h-12 bg-accent hover:bg-accent/90 text-white rounded-xl shadow-md uppercase tracking-wider text-xs font-bold transition-transform hover:-translate-y-0.5" variant="default">
                Request Copies of Certificates
              </Button>
            </motion.div>
          </motion.div>

        </div>
      </div>
    </Layout>
  );
}
