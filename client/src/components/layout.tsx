import React from "react";
import { Link, useLocation } from "wouter";
import { ShoppingCart, Globe, Phone, FileText, Menu, Anchor, LogOut, LayoutDashboard, ShieldCheck, Instagram, Youtube, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/context/auth-context";
import { useCart } from "@/context/cart-context";
import { useLanguage } from "@/context/language-context";
import { LanguageSelector } from "@/components/language-selector";
import { motion, useScroll, useSpring, AnimatePresence } from "framer-motion";

export function Layout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
  const [isScrolled, setIsScrolled] = React.useState(false);
  const { isLoggedIn, logout, isAdmin, loading: authLoading } = useAuth();
  const { cartCount } = useCart();
  const { t } = useLanguage();

  // Scroll tracking and progress indicator spring configuration
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 120,
    damping: 25,
    restDelta: 0.001
  });

  React.useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { href: "/", label: t('nav.home') },
    { href: "/catalog", label: t('nav.catalog') },
    { href: "/about", label: t('nav.about') },
    { href: "/contact", label: t('nav.contact') },
  ];

  const NavContent = ({ className }: { className?: string }) => (
    <nav className={className}>
      {navLinks.map((link, index) => (
        <Link key={link.href} href={link.href}>
          <motion.span
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05, ease: "easeOut" }}
            className={`text-sm font-medium transition-colors hover:text-accent cursor-pointer block relative py-2 group ${location === link.href ? "text-accent font-semibold" : "text-foreground/80"
              }`}
            onClick={() => setIsMobileMenuOpen(false)}
          >
            {link.label}
            {/* Elegant hover line underline slider */}
            <span className={`absolute bottom-0 left-0 w-full h-[2px] bg-accent scale-x-0 transition-transform duration-300 origin-left group-hover:scale-x-100 ${location === link.href ? "scale-x-100" : ""
              }`} />
          </motion.span>
        </Link>
      ))}
    </nav>
  );

  return (
    <div className="flex min-h-screen flex-col bg-background font-sans overflow-x-hidden">
      {/* Premium viewport scroll progress bar */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-1 bg-accent z-[100] origin-left"
        style={{ scaleX }}
      />

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
      <motion.header
        animate={{
          paddingTop: isScrolled ? "0px" : "4px",
          paddingBottom: isScrolled ? "0px" : "4px",
          boxShadow: isScrolled ? "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)" : "0 0px 0px 0px transparent",
          backgroundColor: isScrolled ? "var(--color-bg-elevated)" : "rgba(253, 251, 247, 0.8)",
          backdropFilter: isScrolled ? "blur(12px)" : "blur(4px)"
        }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className="sticky top-0 z-50 w-full border-b overflow-x-hidden"
      >
        <div className={`container mx-auto flex items-center px-2 sm:px-4 transition-all duration-300 ${isScrolled ? 'h-12 sm:h-14' : 'h-14 sm:h-16'}`}>

          {/* Logo */}
          <Link href={isLoggedIn ? "/dashboard" : "/"}>
            <div className="flex items-center gap-1 sm:gap-2 group cursor-pointer drop-shadow-lg hover:drop-shadow-xl transition-all duration-300 hover:scale-105">
              <div className="rounded-full overflow-hidden shadow-lg shadow-black/30 group-hover:ring-2 group-hover:ring-accent/30 group-hover:shadow-xl group-hover:shadow-black/40 transition-all duration-300 shrink-0 group-hover:rotate-3">
                <img
                  src="/logo_favicon.jpeg"
                  alt="KINSA Global Logo"
                  className="h-8 w-8 sm:h-10 sm:w-10 md:h-12 md:w-12 object-cover transition-transform duration-300 group-hover:scale-110"
                />
              </div>
              <div className="flex flex-col min-w-0">
                <span className="font-serif text-lg sm:text-xl font-bold leading-none tracking-tight text-primary whitespace-nowrap drop-shadow-sm group-hover:text-accent transition-colors duration-300">KINSA</span>
                <span className="text-[8px] sm:text-[10px] uppercase tracking-widest text-muted-foreground whitespace-nowrap drop-shadow-sm group-hover:text-accent/70 transition-colors duration-300">Global Exim</span>
              </div>
            </div>
          </Link>

          {/* Desktop Nav */}
          {!authLoading && !isLoggedIn && <NavContent className="hidden lg:flex items-center gap-6 xl:gap-8 mx-4 xl:mx-8 flex-1 justify-center" />}

          {/* Actions */}
          <div className="flex items-center gap-1 sm:gap-2 md:gap-4 min-w-0 justify-end ml-auto">
            {/* Desktop Actions - Hidden on mobile */}
            <div className="hidden lg:flex items-center gap-2 md:gap-4">
              {/* Language Selector */}
              <LanguageSelector variant="compact" className="shrink-0" />

              {!authLoading && (
                isLoggedIn ? (
                  <>
                    {isAdmin && (
                      <Link href="/admin">
                        <Button variant="outline" className="h-10 border-2 border-black bg-black text-white hover:bg-white hover:text-black rounded-none px-4 flex items-center gap-2 transition-all">
                          <ShieldCheck className="h-4 w-4" />
                          <span className="text-[10px] font-black uppercase tracking-widest">Sys_Admin</span>
                        </Button>
                      </Link>
                    )}
                    <Link href="/dashboard">
                      <div className="p-1.5 sm:p-2 hover:bg-accent/10 rounded-full transition-all duration-200 group text-foreground hover:text-accent cursor-pointer hover:shadow-md">
                        <LayoutDashboard className="h-4 w-4 sm:h-5 sm:w-5 shrink-0 transition-transform duration-200 group-hover:rotate-3" />
                      </div>
                    </Link>
                    <Link href="/cart">
                      <div className="relative p-1.5 sm:p-2 hover:bg-accent/10 rounded-full transition-all duration-200 group cursor-pointer hover:shadow-md">
                        <ShoppingCart className="h-4 w-4 sm:h-5 sm:w-5 text-foreground group-hover:text-accent transition-all duration-200 shrink-0 group-hover:animate-pulse" />
                        <AnimatePresence mode="wait">
                          {cartCount > 0 && (
                            <motion.div
                              key={cartCount}
                              initial={{ scale: 0, opacity: 0 }}
                              animate={{ scale: 1, opacity: 1 }}
                              exit={{ scale: 0, opacity: 0 }}
                              transition={{ type: "spring", stiffness: 600, damping: 15 }}
                              className="absolute -top-0.5 -right-0.5 sm:-top-1 sm:-right-1"
                            >
                              <Badge className="h-4 w-4 sm:h-5 sm:w-5 flex items-center justify-center p-0 bg-accent text-accent-foreground rounded-full text-[8px] sm:text-[10px] shrink-0 font-bold">
                                {cartCount}
                              </Badge>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </Link>
                    <Button variant="ghost" size="icon" onClick={logout} title="Logout" className="h-8 w-8 sm:h-10 sm:w-10 shrink-0 hover:bg-destructive/10 transition-all duration-200 group hover:shadow-md">
                      <LogOut className="h-4 w-4 sm:h-5 sm:w-5 text-foreground hover:text-destructive transition-all duration-200 group-hover:rotate-12" />
                    </Button>
                  </>
                ) : (
                  <>
                    <Link href="/cart">
                      <div className="relative p-1.5 sm:p-2 hover:bg-accent/10 rounded-full transition-all duration-200 group cursor-pointer hover:shadow-md">
                        <ShoppingCart className="h-4 w-4 sm:h-5 sm:w-5 text-foreground group-hover:text-accent transition-all duration-200 shrink-0 group-hover:animate-pulse" />
                        <AnimatePresence mode="wait">
                          {cartCount > 0 && (
                            <motion.div
                              key={cartCount}
                              initial={{ scale: 0, opacity: 0 }}
                              animate={{ scale: 1, opacity: 1 }}
                              exit={{ scale: 0, opacity: 0 }}
                              transition={{ type: "spring", stiffness: 600, damping: 15 }}
                              className="absolute -top-0.5 -right-0.5 sm:-top-1 sm:-right-1"
                            >
                              <Badge className="h-4 w-4 sm:h-5 sm:w-5 flex items-center justify-center p-0 bg-accent text-accent-foreground rounded-full text-[8px] sm:text-[10px] shrink-0 font-bold">
                                {cartCount}
                              </Badge>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </Link>

                    <Link href="/auth">
                      <Button variant="outline" className="flex border-primary text-primary hover:bg-primary hover:text-primary-foreground hover:shadow-lg shrink-0 text-xs sm:text-sm px-2 sm:px-4 h-8 sm:h-10 transition-all duration-200 group">
                        <span className="hidden md:inline group-hover:animate-pulse">Partner </span>{t('nav.login').replace('Partner ', '')}
                      </Button>
                    </Link>
                  </>
                )
              )}
            </div>

            {/* Mobile Menu */}
            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="lg:hidden shrink-0 h-8 w-8 sm:h-10 sm:w-10 hover:bg-accent/10 transition-all duration-200 group hover:shadow-md">
                  <Menu className="h-4 w-4 sm:h-5 sm:w-5 transition-transform duration-200 group-hover:rotate-90" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[280px] sm:w-[350px]">
                <div className="flex flex-col gap-6 mt-6">
                  {/* Language Selector */}
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Language</span>
                    <LanguageSelector variant="default" />
                  </div>

                  <NavContent className="flex flex-col gap-4" />

                  <Separator />

                  {!authLoading && (
                    isLoggedIn ? (
                      <div className="flex flex-col gap-4">
                        <Link href="/dashboard">
                          <Button variant="outline" className="w-full justify-start" onClick={() => setIsMobileMenuOpen(false)}>
                            <LayoutDashboard className="h-4 w-4 mr-2" />
                            {t('nav.dashboard')}
                          </Button>
                        </Link>
                        {isAdmin && (
                          <Link href="/admin">
                            <Button variant="outline" className="w-full justify-start border-black bg-black text-white hover:bg-black/90" onClick={() => setIsMobileMenuOpen(false)}>
                              <ShieldCheck className="h-4 w-4 mr-2" />
                              Technical Hub
                            </Button>
                          </Link>
                        )}
                        <Link href="/cart">
                          <Button variant="outline" className="w-full justify-start" onClick={() => setIsMobileMenuOpen(false)}>
                            <ShoppingCart className="h-4 w-4 mr-2" />
                            {t('nav.cart')} {cartCount > 0 && (
                              <Badge className="ml-2 h-5 w-5 flex items-center justify-center p-0 bg-accent text-accent-foreground rounded-full text-[10px]">
                                {cartCount}
                              </Badge>
                            )}
                          </Button>
                        </Link>
                        <Button variant="destructive" className="w-full justify-start" onClick={() => { logout(); setIsMobileMenuOpen(false); }}>
                          <LogOut className="h-4 w-4 mr-2" />
                          {t('nav.logout')}
                        </Button>
                      </div>
                    ) : (
                      <div className="flex flex-col gap-4">
                        <Link href="/cart">
                          <Button variant="outline" className="w-full justify-start" onClick={() => setIsMobileMenuOpen(false)}>
                            <ShoppingCart className="h-4 w-4 mr-2" />
                            {t('nav.cart')} {cartCount > 0 && (
                              <Badge className="ml-2 h-5 w-5 flex items-center justify-center p-0 bg-accent text-accent-foreground rounded-full text-[10px]">
                                {cartCount}
                              </Badge>
                            )}
                          </Button>
                        </Link>
                        <Link href="/auth">
                          <Button className="w-full" onClick={() => setIsMobileMenuOpen(false)}>{t('nav.login')}</Button>
                        </Link>

                      </div>
                    )
                  )}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </motion.header>

      {/* Main Content */}
      <main className="flex-1 overflow-x-hidden">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-primary text-white pt-20 pb-8 overflow-x-hidden border-t border-white/10 font-sans relative">
        {/* Subtle background glow effect */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-32 bg-accent/10 blur-[100px] pointer-events-none" />

        <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-12 mb-16 relative z-10">

          {/* Col 1: Brand Info */}
          <div className="flex flex-col space-y-6">
            <p className="text-sm font-medium text-white max-w-xs leading-relaxed">
              {t('footer.brand_desc')}
            </p>
            <div className="flex items-center gap-5 text-white">
              <Instagram className="h-5 w-5 hover:scale-[1.04] cursor-pointer transition-transform duration-300" />
              <Youtube className="h-5 w-5 hover:scale-[1.04] cursor-pointer transition-transform duration-300" />
              <MessageCircle className="h-5 w-5 hover:scale-[1.04] cursor-pointer transition-transform duration-300" />
              <Globe className="h-5 w-5 hover:scale-[1.04] cursor-pointer transition-transform duration-300" />
            </div>
            <div className="text-xs font-medium text-white mt-auto pt-8">
              {t('footer.copyright')}
            </div>
          </div>

          {/* Col 2: Quick Links */}
          <div className="flex flex-col space-y-4 text-sm font-medium text-white">
            <Link href="/catalog"><span className="hover:scale-[1.04] origin-left inline-block transition-transform duration-300 cursor-pointer">{t('footer.product_catalog')}</span></Link>
            <Link href="/about"><span className="hover:scale-[1.04] origin-left inline-block transition-transform duration-300 cursor-pointer">{t('footer.our_story')}</span></Link>
            <Link href="/contact"><span className="hover:scale-[1.04] origin-left inline-block transition-transform duration-300 cursor-pointer">{t('footer.contact_sales')}</span></Link>
            <Link href="/track"><span className="hover:scale-[1.04] origin-left inline-block transition-transform duration-300 cursor-pointer">{t('footer.track_shipment')}</span></Link>
          </div>

          {/* Col 3: Products */}
          <div className="flex flex-col space-y-4 text-sm font-medium text-white">
            <Link href="/catalog?category=grains"><span className="hover:scale-[1.04] origin-left inline-block transition-transform duration-300 cursor-pointer">{t('footer.premium_grains')}</span></Link>
            <Link href="/catalog?category=spices"><span className="hover:scale-[1.04] origin-left inline-block transition-transform duration-300 cursor-pointer">{t('footer.exotic_spices')}</span></Link>
            <Link href="/catalog?category=pulses"><span className="hover:scale-[1.04] origin-left inline-block transition-transform duration-300 cursor-pointer">{t('footer.organic_pulses')}</span></Link>
          </div>

          {/* Col 4: Newsletter */}
          <div className="flex flex-col space-y-4">
            <h4 className="font-black uppercase text-lg tracking-tight text-white">{t('footer.newsletter_title')}</h4>
            <div className="flex flex-col gap-3">
              <input
                type="email"
                placeholder={t('footer.email_placeholder')}
                className="w-full bg-white/5 border border-white/20 rounded-full px-4 py-3 text-sm font-medium text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent/50 transition-all"
              />
              <button className="w-full bg-accent text-accent-foreground rounded-full px-4 py-3 text-sm font-black uppercase hover:bg-accent/90 transition-all shadow-[0_0_20px_rgba(var(--accent),0.3)] hover:shadow-[0_0_25px_rgba(var(--accent),0.5)]">
                {t('footer.subscribe')}
              </button>
            </div>
            <div className="flex items-center gap-2 pt-4 opacity-70">
              <div className="h-7 w-12 bg-white/10 rounded border border-white/20 flex items-center justify-center text-[9px] font-bold text-white">VISA</div>
              <div className="h-7 w-12 bg-white/10 rounded border border-white/20 flex items-center justify-center text-[9px] font-bold text-white">MC</div>
              <div className="h-7 w-12 bg-white/10 rounded border border-white/20 flex items-center justify-center text-[9px] font-bold text-white">AMEX</div>
              <div className="h-7 w-12 bg-white/10 rounded border border-white/20 flex items-center justify-center text-[9px] font-bold text-white">PAYPAL</div>
            </div>
          </div>
        </div>

        {/* Massive Text */}
        <div className="w-full flex flex-col items-center justify-center px-2 mt-8 leading-[0.8] select-none tracking-tighter overflow-hidden relative z-10">
          <div className="text-[25vw] font-bold text-white whitespace-nowrap notranslate">KINSA</div>
        </div>
      </footer>
    </div>
  );
}
