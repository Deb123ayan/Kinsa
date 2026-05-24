import { Link } from "wouter";
import { ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Product } from "@/data/mock-data";
import { formatPriceWithUnit } from "@/lib/currency";
import { motion } from "framer-motion";
import { useLanguage } from "@/context/language-context";

export function ProductCard({ product }: { product: Product }) {
  const { language } = useLanguage();
  return (
    <Link href={`/product/${product.name.toLowerCase().split(' ').join('-')}`}>
      <motion.div 
        className="group block h-full cursor-pointer"
        whileHover={{ 
          y: -8,
          transition: { type: "spring", stiffness: 300, damping: 18 } 
        }}
      >
        {/* ── Desktop card ── */}
        <div className="card-elite p-0 h-full overflow-hidden flex flex-col border border-border/60 shadow-sm transition-shadow duration-300 group-hover:shadow-xl">

          {/* Image – shorter on mobile */}
          <div className="relative aspect-[3/2] sm:aspect-[4/3] overflow-hidden bg-secondary">
            <img
              src={product.image}
              alt={product.name}
              className="object-cover w-full h-full transition-transform duration-[1.5s] ease-out"
            />
            <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors duration-300" />

            {!product.inStock && (
              <div className="absolute inset-0 bg-background/60 flex items-center justify-center backdrop-blur-sm">
                <Badge variant="destructive" className="text-xs font-bold tracking-widest uppercase animate-pulse">Out of Stock</Badge>
              </div>
            )}

            {/* Category badge – hidden on mobile to save space */}
            <div className="absolute top-3 right-3 hidden sm:block">
              <Badge variant="secondary" className="bg-card/90 text-foreground backdrop-blur-md shadow-sm border border-border text-[10px] uppercase tracking-widest font-bold">
                {product.category}
              </Badge>
            </div>
          </div>

          {/* Body */}
          <div className="p-3 sm:p-6 flex-1 flex flex-col">
            {/* Origin – hidden on mobile */}
            <div className="hidden sm:flex mb-3 items-center justify-between">
              <span className="text-[10px] font-bold text-accent uppercase tracking-[0.2em]">{product.specs.origin}</span>
            </div>

            <h3 className="font-serif text-base sm:text-xl font-bold text-foreground mb-1 sm:mb-3 line-clamp-2 leading-tight">
              {product.name}
            </h3>

            {/* Description – hidden on mobile */}
            <p className="hidden sm:block text-sm text-muted-foreground line-clamp-2 mb-6 leading-relaxed flex-1">
              {product.description}
            </p>

            {/* Grade/Purity specs – hidden on mobile */}
            <div className="hidden sm:grid grid-cols-2 gap-4 text-xs text-muted-foreground border-t border-border pt-4 mt-auto">
              <div>
                <span className="block font-bold text-foreground uppercase tracking-widest text-[9px] mb-1">Grade</span>
                <span className="font-medium text-sm text-foreground/80">{product.specs.grade}</span>
              </div>
              <div>
                <span className="block font-bold text-foreground uppercase tracking-widest text-[9px] mb-1">Purity</span>
                <span className="font-medium text-sm text-foreground/80">{product.specs.purity}</span>
              </div>
            </div>
          </div>

          {/* Footer – price + arrow */}
          <div className="px-3 py-2 sm:p-6 sm:pt-5 flex items-center justify-between border-t border-border bg-secondary/50 group-hover:bg-primary transition-colors duration-500">
            <div className="flex flex-col">
              <span className="text-[9px] font-bold tracking-widest uppercase text-muted-foreground group-hover:text-primary-foreground/70 transition-colors">Est. Price</span>
              <span className="font-bold text-primary text-sm sm:text-lg group-hover:text-primary-foreground transition-colors">
                {formatPriceWithUnit(product.price, product.unit, language)}
              </span>
            </div>
            <div className="h-7 w-7 sm:h-10 sm:w-10 rounded-full border border-border flex items-center justify-center bg-card group-hover:bg-primary-foreground group-hover:border-transparent transition-all shadow-sm group-hover:shadow-md shrink-0">
              <ArrowRight className="h-3 w-3 sm:h-4 sm:w-4 text-foreground group-hover:text-primary transition-colors" />
            </div>
          </div>
        </div>
      </motion.div>
    </Link>
  );
}
