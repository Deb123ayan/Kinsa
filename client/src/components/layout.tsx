import React from "react";
import { Link, useLocation } from "wouter";
import { ShoppingCart, Globe, Phone, FileText, Menu, Anchor, LogOut, LayoutDashboard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/context/auth-context";
import { useCart } from "@/context/cart-context";

export function Layout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
  const { isLoggedIn, logout } = useAuth();
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
      <div className="bg-primary px-2 sm:px-4 py-1 sm:py-2 text-primary-foreground text-xs overflow-x-hidden">
        <div className="container mx-auto flex justify-between items-center gap-2 sm:gap-4">
          <div className="flex items-center gap-2 sm:gap-4 min-w-0">
            <span className="flex items-center gap-1 whitespace-nowrap text-xs group cursor-default">
              <Globe className="h-3 w-3 shrink-0 transition-transform duration-200 group-hover:rotate-12 group-hover:scale-110" /> 
              <span className="hidden xs:inline group-hover:text-accent transition-colors duration-200">Global Exim</span>
              <span className="xs:hidden group-hover:text-accent transition-colors duration-200">Exim</span>
            </span>
            <span className="hidden sm:flex items-center gap-1 whitespace-nowrap text-xs group cursor-default">
              <Anchor className="h-3 w-3 shrink-0 transition-transform duration-200 group-hover:rotate-12 group-hover:scale-110" /> 
              <span className="group-hover:text-accent transition-colors duration-200">FOB, CIF, EXW</span>
            </span>
          </div>
          <div className="flex items-center gap-2 sm:gap-4 min-w-0 justify-end">
            <a href="mailto:info@kinsa.com" className="hover:text-accent transition-all duration-200 text-xs hidden sm:block hover:scale-105 hover:underline">info@kinsa.com</a>
            <span className="hidden lg:inline shrink-0 text-xs">|</span>
            <span className="hidden lg:inline whitespace-nowrap shrink-0 text-xs hover:text-accent transition-colors duration-200 cursor-default">+1 (555) 123-4567</span>
            <span className="sm:hidden text-xs hover:text-accent transition-all duration-200 cursor-pointer hover:scale-105">Contact</span>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 overflow-x-hidden">
        <div className="container mx-auto flex h-14 sm:h-16 md:h-20 items-center px-2 sm:px-4">
          
          {/* Logo */}
          <Link href={isLoggedIn ? "/dashboard" : "/"}>
            <div className="flex items-center gap-1 sm:gap-2 group cursor-pointer drop-shadow-lg hover:drop-shadow-xl transition-all duration-300 hover:scale-105">
              <div className="rounded-full overflow-hidden shadow-lg shadow-black/30 group-hover:ring-2 group-hover:ring-accent/30 group-hover:shadow-xl group-hover:shadow-black/40 transition-all duration-300 shrink-0 group-hover:rotate-3">
                <img 
                  src="/logo_favicon.jpeg" 
                  alt="KINSA Global Logo" 
                  className="h-10 w-10 sm:h-12 sm:w-12 md:h-16 md:w-16 object-cover transition-transform duration-300 group-hover:scale-110"
                />
              </div>
              <div className="flex flex-col min-w-0">
                <span className="font-serif text-lg sm:text-xl font-bold leading-none tracking-tight text-primary whitespace-nowrap drop-shadow-sm group-hover:text-accent transition-colors duration-300">KINSA</span>
                <span className="text-[8px] sm:text-[10px] uppercase tracking-widest text-muted-foreground whitespace-nowrap drop-shadow-sm group-hover:text-accent/70 transition-colors duration-300">Global Exim</span>
              </div>
            </div>
          </Link>

          {/* Desktop Nav */}
          {isLoggedIn ? null : <NavContent className="hidden lg:flex items-center gap-6 xl:gap-8 mx-4 xl:mx-8 flex-1 justify-center" />}

          {/* Actions */}
          <div className="flex items-center gap-1 sm:gap-2 md:gap-4 min-w-0 justify-end ml-auto">
            {isLoggedIn ? (
              <>
                <Link href="/dashboard">
                  <div className="p-1.5 sm:p-2 hover:bg-accent/10 hover:scale-110 rounded-full transition-all duration-200 group text-foreground hover:text-accent cursor-pointer hover:shadow-md">
                    <LayoutDashboard className="h-4 w-4 sm:h-5 sm:w-5 shrink-0 transition-transform duration-200 group-hover:rotate-3" />
                  </div>
                </Link>
                <Link href="/cart">
                  <div className="relative p-1.5 sm:p-2 hover:bg-accent/10 hover:scale-110 rounded-full transition-all duration-200 group cursor-pointer hover:shadow-md">
                    <ShoppingCart className="h-4 w-4 sm:h-5 sm:w-5 text-foreground group-hover:text-accent transition-all duration-200 shrink-0 group-hover:animate-pulse" />
                    {cartCount > 0 && (
                      <Badge className="absolute -top-0.5 -right-0.5 sm:-top-1 sm:-right-1 h-4 w-4 sm:h-5 sm:w-5 flex items-center justify-center p-0 bg-accent text-accent-foreground rounded-full text-[8px] sm:text-[10px] shrink-0 group-hover:animate-bounce">
                        {cartCount}
                      </Badge>
                    )}
                  </div>
                </Link>
                <Button variant="ghost" size="icon" onClick={logout} title="Logout" className="h-8 w-8 sm:h-10 sm:w-10 shrink-0 hover:bg-destructive/10 hover:scale-110 transition-all duration-200 group hover:shadow-md">
                  <LogOut className="h-4 w-4 sm:h-5 sm:w-5 text-foreground hover:text-destructive transition-all duration-200 group-hover:rotate-12" />
                </Button>
              </>
            ) : (
              <>
                <Link href="/cart">
                  <div className="relative p-1.5 sm:p-2 hover:bg-accent/10 hover:scale-110 rounded-full transition-all duration-200 group cursor-pointer hover:shadow-md">
                    <ShoppingCart className="h-4 w-4 sm:h-5 sm:w-5 text-foreground group-hover:text-accent transition-all duration-200 shrink-0 group-hover:animate-pulse" />
                    {cartCount > 0 && (
                      <Badge className="absolute -top-0.5 -right-0.5 sm:-top-1 sm:-right-1 h-4 w-4 sm:h-5 sm:w-5 flex items-center justify-center p-0 bg-accent text-accent-foreground rounded-full text-[8px] sm:text-[10px] shrink-0 group-hover:animate-bounce">
                        {cartCount}
                      </Badge>
                    )}
                  </div>
                </Link>
                
                <Link href="/auth">
                  <Button variant="outline" className="hidden sm:flex border-primary text-primary hover:bg-primary hover:text-primary-foreground hover:scale-105 hover:shadow-lg shrink-0 text-xs sm:text-sm px-2 sm:px-4 h-8 sm:h-10 transition-all duration-200 group">
                    <span className="hidden md:inline group-hover:animate-pulse">Partner </span>Login
                  </Button>
                </Link>
              </>
            )}

            {/* Mobile Menu */}
            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="lg:hidden shrink-0 h-8 w-8 sm:h-10 sm:w-10 hover:bg-accent/10 hover:scale-110 transition-all duration-200 group hover:shadow-md">
                  <Menu className="h-4 w-4 sm:h-5 sm:w-5 transition-transform duration-200 group-hover:rotate-90" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[280px] sm:w-[350px]">
                <div className="flex flex-col gap-6 mt-6">
                  {!isLoggedIn && <NavContent className="flex flex-col gap-4" />}
                  {!isLoggedIn && (
                    <Link href="/auth">
                      <Button className="w-full" onClick={() => setIsMobileMenuOpen(false)}>Partner Login</Button>
                    </Link>
                  )}
                  {isLoggedIn && (
                    <div className="flex flex-col gap-4">
                      <Link href="/dashboard">
                        <Button variant="outline" className="w-full justify-start" onClick={() => setIsMobileMenuOpen(false)}>
                          <LayoutDashboard className="h-4 w-4 mr-2" />
                          Dashboard
                        </Button>
                      </Link>
                      <Link href="/cart">
                        <Button variant="outline" className="w-full justify-start" onClick={() => setIsMobileMenuOpen(false)}>
                          <ShoppingCart className="h-4 w-4 mr-2" />
                          Cart {cartCount > 0 && `(${cartCount})`}
                        </Button>
                      </Link>
                      <Button variant="destructive" className="w-full justify-start" onClick={() => { logout(); setIsMobileMenuOpen(false); }}>
                        <LogOut className="h-4 w-4 mr-2" />
                        Logout
                      </Button>
                    </div>
                  )}
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
            <div className="flex items-center gap-2 drop-shadow-md">
              <div className="rounded-full overflow-hidden shadow-lg shadow-black/20 shrink-0">
                <img 
                  src="/logo_favicon.jpeg" 
                  alt="KINSA Global Logo" 
                  className="h-12 w-12 object-cover"
                />
              </div>
              <span className="font-serif text-xl font-bold whitespace-nowrap drop-shadow-sm">KINSA</span>
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
