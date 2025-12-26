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
  const { isLoggedIn, user, logout, getUserDisplayName } = useAuth();
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
          <span
            className={`text-sm font-medium transition-colors hover:text-accent cursor-pointer block ${
              location === link.href ? "text-accent font-semibold" : "text-foreground/80"
            }`}
            onClick={() => setIsMobileMenuOpen(false)}
          >
            {link.label}
          </span>
        </Link>
      ))}
    </nav>
  );

  return (
    <div className="flex min-h-screen flex-col bg-background font-sans overflow-x-hidden">
      {/* Top Bar */}
      <div className="bg-primary px-4 py-2 text-primary-foreground text-xs md:text-sm overflow-x-hidden">
        <div className="container mx-auto flex justify-between items-center gap-4">
          <div className="flex items-center gap-4 min-w-0">
            <span className="flex items-center gap-1 whitespace-nowrap"><Globe className="h-3 w-3 shrink-0" /> Global Exim Services</span>
            <span className="hidden md:flex items-center gap-1 whitespace-nowrap"><Anchor className="h-3 w-3 shrink-0" /> Incoterms: FOB, CIF, EXW</span>
          </div>
          <div className="flex items-center gap-4 min-w-0 justify-end">
            <a href="mailto:info@kinsa.com" className="hover:text-accent transition-colors truncate">info@kinsa.com</a>
            <span className="hidden md:inline shrink-0">|</span>
            <span className="hidden md:inline whitespace-nowrap shrink-0">+1 (555) 123-4567</span>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 overflow-x-hidden">
        <div className="container mx-auto flex h-16 md:h-20 items-center justify-between px-4">
          
          {/* Logo */}
          <Link href={isLoggedIn ? "/dashboard" : "/"}>
            <div className="flex items-center gap-2 group cursor-pointer">
              <div className="bg-primary text-primary-foreground p-2 rounded-sm group-hover:bg-accent transition-colors shrink-0">
                <Ship className="h-6 w-6" />
              </div>
              <div className="flex flex-col min-w-0">
                <span className="font-serif text-xl font-bold leading-none tracking-tight text-primary whitespace-nowrap">KINSA</span>
                <span className="text-[10px] uppercase tracking-widest text-muted-foreground whitespace-nowrap">Global Exim</span>
              </div>
            </div>
          </Link>

          {/* Desktop Nav */}
          {isLoggedIn ? null : <NavContent className="hidden md:flex items-center gap-8" />}

          {/* Actions */}
          <div className="flex items-center gap-2 md:gap-4 min-w-0 justify-end ml-auto">
            {isLoggedIn ? (
              <>
                <Link href="/dashboard">
                  <div className="p-2 hover:bg-accent/10 rounded-full transition-colors group text-foreground hover:text-accent cursor-pointer">
                    <LayoutDashboard className="h-5 w-5 shrink-0" />
                  </div>
                </Link>
                <Link href="/cart">
                  <div className="relative p-2 hover:bg-accent/10 rounded-full transition-colors group cursor-pointer">
                    <ShoppingCart className="h-5 w-5 text-foreground group-hover:text-accent transition-colors shrink-0" />
                    {cartCount > 0 && (
                      <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-accent text-accent-foreground rounded-full text-[10px] shrink-0">
                        {cartCount}
                      </Badge>
                    )}
                  </div>
                </Link>
                <Button variant="ghost" size="icon" onClick={logout} title="Logout" className="h-10 w-10 shrink-0">
                  <LogOut className="h-5 w-5 text-foreground hover:text-destructive" />
                </Button>
              </>
            ) : (
              <>
                <Link href="/cart">
                  <div className="relative p-2 hover:bg-accent/10 rounded-full transition-colors group hidden md:flex cursor-pointer">
                    <ShoppingCart className="h-5 w-5 text-foreground group-hover:text-accent transition-colors shrink-0" />
                    {cartCount > 0 && (
                      <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-accent text-accent-foreground rounded-full text-[10px] shrink-0">
                        {cartCount}
                      </Badge>
                    )}
                  </div>
                </Link>
                
                <Link href="/auth">
                  <Button variant="outline" className="hidden md:flex border-primary text-primary hover:bg-primary hover:text-primary-foreground shrink-0">
                    Partner Login
                  </Button>
                </Link>
              </>
            )}

            {/* Mobile Menu */}
            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden shrink-0">
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
      <main className="flex-1 overflow-x-hidden">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-primary text-primary-foreground pt-16 pb-8 overflow-x-hidden">
        <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Ship className="h-6 w-6 text-accent shrink-0" />
              <span className="font-serif text-xl font-bold whitespace-nowrap">KINSA</span>
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
              <li><Link href="/catalog"><span className="hover:text-white transition-colors cursor-pointer">Product Catalog</span></Link></li>
              <li><Link href="/about"><span className="hover:text-white transition-colors cursor-pointer">Our Story</span></Link></li>
              <li><Link href="/contact"><span className="hover:text-white transition-colors cursor-pointer">Contact Sales</span></Link></li>
              <li><Link href="/track"><span className="hover:text-white transition-colors cursor-pointer">Track Shipment</span></Link></li>
            </ul>
          </div>

          {/* Products */}
          <div>
            <h4 className="font-serif text-lg mb-4 text-accent">Products</h4>
            <ul className="space-y-2 text-sm text-primary-foreground/70">
              <li><Link href="/catalog?category=grains"><span className="hover:text-white transition-colors cursor-pointer">Premium Grains</span></Link></li>
              <li><Link href="/catalog?category=spices"><span className="hover:text-white transition-colors cursor-pointer">Exotic Spices</span></Link></li>
              <li><Link href="/catalog?category=pulses"><span className="hover:text-white transition-colors cursor-pointer">Organic Pulses</span></Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-serif text-lg mb-4 text-accent">Contact</h4>
            <ul className="space-y-2 text-sm text-primary-foreground/70">
              <li className="flex items-start gap-2">
                <Globe className="h-4 w-4 mt-1 shrink-0" />
                <span>123 Trade Harbor Blvd,<br />Mumbai, India 400001</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4 shrink-0" />
                <span>+91 22 1234 5678</span>
              </li>
              <li className="flex items-center gap-2">
                <FileText className="h-4 w-4 shrink-0" />
                <span>inquiry@kinsa.com</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="container mx-auto px-4 pt-8 border-t border-primary-foreground/10 flex flex-col md:flex-row justify-between items-center text-xs text-primary-foreground/50 gap-4">
          <p>© 2024 KINSA Global. All rights reserved.</p>
          <div className="flex gap-4">
            <Link href="/privacy"><span className="hover:text-white transition-colors cursor-pointer">Privacy Policy</span></Link>
            <Link href="/terms"><span className="hover:text-white transition-colors cursor-pointer">Terms of Service</span></Link>
            <Link href="/shipping"><span className="hover:text-white transition-colors cursor-pointer">Shipping Policy</span></Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
