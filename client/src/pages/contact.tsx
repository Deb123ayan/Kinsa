import { Layout } from "@/components/layout";
import { Card, CardContent } from "@/components/ui/card";
import { MapPin, Phone, Mail, Clock } from "lucide-react";
import { ContactForm } from "@/components/ContactForm";
import { motion } from "framer-motion";

const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: "easeOut" }
  }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.12
    }
  }
};

export default function Contact() {
  return (
    <Layout>
      <div className="container mx-auto px-4 py-16 overflow-hidden">

        {/* Header Block */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center max-w-2xl mx-auto mb-20"
        >
          <h1 className="font-serif text-4xl md:text-5xl font-bold text-primary mb-4">Get in Touch</h1>
          <p className="text-muted-foreground text-lg">
            Whether you need a custom quote, sample request, or partnership discussion, our team is here to assist you.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-start">

          {/* Contact Info */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, type: "spring", stiffness: 60 }}
            className="lg:col-span-1"
          >
            <Card className="border-none shadow-xl bg-primary text-primary-foreground rounded-3xl overflow-hidden ">
              <CardContent className="p-10 space-y-8">
                {[
                  {
                    icon: MapPin,
                    title: "Headquarters",
                    content: "123 Trade Harbor Blvd,\nMumbai, Maharashtra 400001\nIndia"
                  },
                  {
                    icon: Phone,
                    title: "Phone",
                    content: "+91 22 1234 5678\n+91 98765 43210"
                  },
                  {
                    icon: Mail,
                    title: "Email",
                    content: "sales@kinsa.com\ninfo@kinsa.com"
                  },
                  {
                    icon: Clock,
                    title: "Office Hours",
                    content: "Mon - Sat: 9:00 AM - 7:00 PM IST"
                  }
                ].map((item, idx) => {
                  const Icon = item.icon;
                  return (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, y: 15 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: idx * 0.15 }}
                      className="flex gap-5"
                    >
                      <div className="h-12 w-12 rounded-xl bg-accent/20 flex items-center justify-center shrink-0 text-accent">
                        <Icon className="h-5 w-5" />
                      </div>
                      <div>
                        <h4 className="font-bold mb-2 text-lg font-serif">{item.title}</h4>
                        <p className="text-sm opacity-80 leading-relaxed whitespace-pre-line font-sans">
                          {item.content}
                        </p>
                      </div>
                    </motion.div>
                  );
                })}
              </CardContent>
            </Card>
          </motion.div>

          {/* Contact Form */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, type: "spring", stiffness: 60 }}
            className="lg:col-span-2"
          >
            <ContactForm />
          </motion.div>
        </div>

      </div>
    </Layout>
  );
}