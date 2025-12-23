import React from "react";
import { Link, useLocation } from "wouter";
import { Ship, ShoppingCart, Globe, Phone, FileText, Menu, X, Anchor, LogOut, LayoutDashboard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/context/auth-context";
import { useCart } from "@/context/cart-context";

export function Layout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
  const { isLoggedIn, user, logout } = useAuth();
  const { cartCount } = useCart();

  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/catalog", label: "Catalog" },
    { href: "/about", label: "About Us" },
    { href: "/contact", label: "Contact" },
  ];

  const NavContent = ({ className }: { className?: string }) => (
    <nav className={className}>
      {navLinks.map((link) => (
        <Link key={link.href} href={link.href}>
          <a
            className={`text-sm font-medium transition-colors hover:text-accent ${
              location === link.href ? "text-accent font-semibold" : "text-foreground/80"
            }`}
            onClick={() => setIsMobileMenuOpen(false)}
          >
            {link.label}
          </a>
        </Link>
      ))}
    </nav>
  );

  return (
    <div className="flex min-h-screen flex-col bg-background font-sans">
      {/* Top Bar */}
      <div className="bg-primary px-4 py-2 text-primary-foreground text-xs md:text-sm">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1"><Globe className="h-3 w-3" /> Global Exim Services</span>
            <span className="hidden md:flex items-center gap-1"><Anchor className="h-3 w-3" /> Incoterms: FOB, CIF, EXW</span>
          </div>
          <div className="flex items-center gap-4">
            <a href="mailto:info@kinsa.com" className="hover:text-accent transition-colors">info@kinsa.com</a>
            <span className="hidden md:inline">|</span>
            <span className="hidden md:inline">+1 (555) 123-4567</span>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto flex h-16 md:h-20 items-center justify-between px-4">
          
          {/* Logo */}
          <Link href={isLoggedIn ? "/dashboard" : "/"}>
            <a className="flex items-center gap-2 group">
              <div className="bg-primary text-primary-foreground p-2 rounded-sm group-hover:bg-accent transition-colors">
                <Ship className="h-6 w-6" />
              </div>
              <div className="flex flex-col">
                <span className="font-serif text-xl font-bold leading-none tracking-tight text-primary">KINSA</span>
                <span className="text-[10px] uppercase tracking-widest text-muted-foreground">Global Exim</span>
              </div>
            </a>
          </Link>

          {/* Desktop Nav */}
          {isLoggedIn ? null : <NavContent className="hidden md:flex items-center gap-8" />}

          {/* Actions */}
          <div className="flex items-center gap-4">
            {isLoggedIn ? (
              <>
                <Link href="/dashboard">
                  <a className="p-2 hover:bg-accent/10 rounded-full transition-colors group text-foreground hover:text-accent">
                    <LayoutDashboard className="h-5 w-5" />
                  </a>
                </Link>
                <Link href="/cart">
                  <a className="relative p-2 hover:bg-accent/10 rounded-full transition-colors group">
                    <ShoppingCart className="h-5 w-5 text-foreground group-hover:text-accent transition-colors" />
                    {cartCount > 0 && (
                      <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-accent text-accent-foreground rounded-full text-[10px]">
                        {cartCount}
                      </Badge>
                    )}
                  </a>
                </Link>
                <Button variant="ghost" size="icon" onClick={logout} title="Logout" className="h-10 w-10">
                  <LogOut className="h-5 w-5 text-foreground hover:text-destructive" />
                </Button>
              </>
            ) : (
              <>
                <Link href="/cart">
                  <a className="relative p-2 hover:bg-accent/10 rounded-full transition-colors group hidden md:block">
                    <ShoppingCart className="h-5 w-5 text-foreground group-hover:text-accent transition-colors" />
                    {cartCount > 0 && (
                      <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-accent text-accent-foreground rounded-full text-[10px]">
                        {cartCount}
                      </Badge>
                    )}
                  </a>
                </Link>
                
                <Link href="/auth">
                  <Button variant="outline" className="hidden md:flex border-primary text-primary hover:bg-primary hover:text-primary-foreground">
                    Partner Login
                  </Button>
                </Link>
              </>
            )}

            {/* Mobile Menu */}
            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right">
                <div className="flex flex-col gap-6 mt-6">
                  {!isLoggedIn && <NavContent className="flex flex-col gap-4" />}
                  <Link href="/auth">
                    <Button className="w-full">Partner Login</Button>
                  </Link>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-primary text-primary-foreground pt-16 pb-8">
        <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Ship className="h-6 w-6 text-accent" />
              <span className="font-serif text-xl font-bold">KINSA</span>
            </div>
            <p className="text-primary-foreground/70 text-sm leading-relaxed">
              Connecting global markets with premium quality grains, spices, and pulses. 
              Certified excellence in every shipment.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-serif text-lg mb-4 text-accent">Quick Links</h4>
            <ul className="space-y-2 text-sm text-primary-foreground/70">
              <li><Link href="/catalog"><a className="hover:text-white transition-colors">Product Catalog</a></Link></li>
              <li><Link href="/about"><a className="hover:text-white transition-colors">Our Story</a></Link></li>
              <li><Link href="/contact"><a className="hover:text-white transition-colors">Contact Sales</a></Link></li>
              <li><Link href="/track"><a className="hover:text-white transition-colors">Track Shipment</a></Link></li>
            </ul>
          </div>

          {/* Products */}
          <div>
            <h4 className="font-serif text-lg mb-4 text-accent">Products</h4>
            <ul className="space-y-2 text-sm text-primary-foreground/70">
              <li><Link href="/catalog?category=grains"><a className="hover:text-white transition-colors">Premium Grains</a></Link></li>
              <li><Link href="/catalog?category=spices"><a className="hover:text-white transition-colors">Exotic Spices</a></Link></li>
              <li><Link href="/catalog?category=pulses"><a className="hover:text-white transition-colors">Organic Pulses</a></Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-serif text-lg mb-4 text-accent">Contact</h4>
            <ul className="space-y-2 text-sm text-primary-foreground/70">
              <li className="flex items-start gap-2">
                <Globe className="h-4 w-4 mt-1" />
                <span>123 Trade Harbor Blvd,<br />Mumbai, India 400001</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4" />
                <span>+91 22 1234 5678</span>
              </li>
              <li className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                <span>inquiry@kinsa.com</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="container mx-auto px-4 pt-8 border-t border-primary-foreground/10 flex flex-col md:flex-row justify-between items-center text-xs text-primary-foreground/50">
          <p>© 2024 KINSA Global. All rights reserved.</p>
          <div className="flex gap-4 mt-4 md:mt-0">
            <Link href="/privacy"><a>Privacy Policy</a></Link>
            <Link href="/terms"><a>Terms of Service</a></Link>
            <Link href="/shipping"><a>Shipping Policy</a></Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
