import { Link } from "wouter";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Product } from "@/data/mock-data";
import { formatPriceWithUnit } from "@/lib/currency";

export function ProductCard({ product }: { product: Product }) {
  return (
    <Link href={`/product/${product.id}`}>
      <a className="group block h-full">
        <Card className="h-full overflow-hidden border-none shadow-sm hover:shadow-md transition-shadow duration-300 flex flex-col">
          <div className="relative aspect-[4/3] overflow-hidden bg-secondary">
            <img 
              src={product.image} 
              alt={product.name}
              className="object-cover w-full h-full transition-transform duration-700 group-hover:scale-105"
            />
            {!product.inStock && (
              <div className="absolute inset-0 bg-background/60 flex items-center justify-center backdrop-blur-sm">
                <Badge variant="destructive" className="text-sm font-medium">Out of Stock</Badge>
              </div>
            )}
            <div className="absolute top-2 right-2">
              <Badge variant="secondary" className="bg-white/90 text-primary backdrop-blur-sm shadow-sm border-none">
                {product.category}
              </Badge>
            </div>
          </div>
          
          <CardContent className="p-4 flex-1">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-xs font-medium text-accent uppercase tracking-wider">{product.specs.origin}</span>
            </div>
            <h3 className="font-serif text-lg font-bold text-primary mb-2 line-clamp-2 group-hover:text-accent transition-colors">
              {product.name}
            </h3>
            <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
              {product.description}
            </p>
            <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground border-t pt-3 mt-auto">
              <div>
                <span className="block font-medium text-foreground">Grade</span>
                {product.specs.grade}
              </div>
              <div>
                <span className="block font-medium text-foreground">Purity</span>
                {product.specs.purity}
              </div>
            </div>
          </CardContent>
          
          <CardFooter className="p-4 pt-0 mt-auto flex items-center justify-between border-t border-border/50 bg-secondary/20">
            <div className="flex flex-col">
              <span className="text-xs text-muted-foreground">Price Estimate</span>
              <span className="font-bold text-primary text-lg">
                {formatPriceWithUnit(product.price, product.unit)}
              </span>
            </div>
            <Button size="sm" variant="outline" className="group-hover:bg-primary group-hover:text-primary-foreground transition-colors border-primary/20">
              Details <ArrowRight className="ml-2 h-3 w-3" />
            </Button>
          </CardFooter>
        </Card>
      </a>
    </Link>
  );
}
