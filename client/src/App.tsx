import { Switch, Route, useLocation } from "wouter";
import { ErrorBoundary } from "@/components/error-boundary";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/context/auth-context";
import { CartProvider } from "@/context/cart-context";
import { LanguageProvider } from "@/context/language-context";
import { useLanguageDirection } from "@/hooks/use-language-direction";
import React, { lazy, Suspense } from "react";
import NotFound from "@/pages/not-found";
import { IPGuard } from "@/components/ip-guard";

const Home = lazy(() => import("@/pages/home"));
const Catalog = lazy(() => import("@/pages/catalog"));
const ProductDetail = lazy(() => import("@/pages/product-detail"));
const Cart = lazy(() => import("@/pages/cart"));
const Checkout = lazy(() => import("@/pages/checkout"));
const About = lazy(() => import("@/pages/about"));
const Contact = lazy(() => import("@/pages/contact"));
const Auth = lazy(() => import("@/pages/auth"));
const Legal = lazy(() => import("@/pages/legal"));
const Dashboard = lazy(() => import("@/pages/dashboard"));
import { withProtectedRoute } from "@/pages/protected";
const AdminDashboard = lazy(() => import("@/pages/admin/dashboard"));
const AdminLogin = lazy(() => import("@/pages/admin/login"));
const AdminOrders = lazy(() => import("@/pages/admin/orders"));
const AdminPayments = lazy(() => import("@/pages/admin/payments"));
const AdminProducts = lazy(() => import("@/pages/admin/products"));
const AdminContacts = lazy(() => import("@/pages/admin/contacts"));
const AdminManagement = lazy(() => import("@/pages/admin/admins"));

const ProtectedDashboard = withProtectedRoute(Dashboard);

import { motion } from "framer-motion";

const LoadingFallback = () => (
  <div className="min-h-[100svh] w-full flex flex-col items-center justify-center bg-background gap-8 overflow-hidden">
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className="flex flex-col items-center"
    >
      <div className="relative w-20 h-20 sm:w-24 sm:h-24 mb-8">
        {/* Outer slow ring */}
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 3, ease: "linear" }}
          className="absolute inset-0 rounded-full border-t-2 border-r-2 border-accent/20"
        />
        {/* Inner fast ring */}
        <motion.div 
          animate={{ rotate: -360 }}
          transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
          className="absolute inset-2 rounded-full border-b-2 border-l-2 border-accent"
        />
        {/* Logo */}
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.img 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 1 }}
            src="/logo_favicon.jpeg" 
            alt="KINSA Logo" 
            className="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover shadow-xl" 
          />
        </div>
      </div>
      <motion.div 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.6 }}
        className="flex flex-col items-center gap-1"
      >
        <span className="font-serif text-2xl font-bold tracking-widest text-foreground">KINSA</span>
        <motion.span 
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
          className="text-[10px] tracking-[0.3em] uppercase text-muted-foreground font-semibold"
        >
          Loading
        </motion.span>
      </motion.div>
    </motion.div>
  </div>
);

function Router() {
  // Initialize language direction handling
  useLanguageDirection();
  
  const [location] = useLocation();
  const { isAdmin, logout } = useAuth();
  
  React.useEffect(() => {
    const isNowAdminRoute = location.startsWith('/admin');
    const cameFromAdmin = sessionStorage.getItem('was_in_admin') === 'true';
    
    if (isNowAdminRoute) {
      // Mark that we are currently in the admin section
      sessionStorage.setItem('was_in_admin', 'true');
    } else {
      // If we are NOT in admin, but the flag says we came from there
      if (cameFromAdmin && isAdmin) {
        console.log("Navigated away from admin panel. Terminating full user session.");
        logout();
      }
      // Clear the flag since we are no longer in admin
      sessionStorage.removeItem('was_in_admin');
    }
  }, [location, isAdmin, logout]);

  return (
    <Suspense fallback={<LoadingFallback />}>
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/catalog" component={Catalog} />
        <Route path="/product/:id" component={ProductDetail} />
        <Route path="/cart" component={Cart} />
        <Route path="/checkout" component={Checkout} />
        <Route path="/about" component={About} />
        <Route path="/contact" component={Contact} />
        <Route path="/auth" component={Auth} />
        <Route path="/dashboard" component={ProtectedDashboard} />
        {/* Legal routes */}
        <Route path="/privacy" component={() => <Legal slug="privacy" />} />
        <Route path="/terms" component={() => <Legal slug="terms" />} />
        <Route path="/shipping" component={() => <Legal slug="shipping" />} />
        <Route path="/track" component={() => <Legal slug="track" />} />

        {/* Admin routes with secure IP whitelisting */}
        <Route path="/admin/login">
          <IPGuard>
            <AdminLogin />
          </IPGuard>
        </Route>
        <Route path="/admin">
          <IPGuard>
            <AdminDashboard />
          </IPGuard>
        </Route>
        <Route path="/admin/orders">
          <IPGuard>
            <AdminOrders />
          </IPGuard>
        </Route>
        <Route path="/admin/payments">
          <IPGuard>
            <AdminPayments />
          </IPGuard>
        </Route>
        <Route path="/admin/products">
          <IPGuard>
            <AdminProducts />
          </IPGuard>
        </Route>
        <Route path="/admin/contacts">
          <IPGuard>
            <AdminContacts />
          </IPGuard>
        </Route>
        <Route path="/admin/management">
          <IPGuard>
            <AdminManagement />
          </IPGuard>
        </Route>

        <Route component={NotFound} />
      </Switch>
    </Suspense>
  );
}


function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <LanguageProvider>
          <AuthProvider>
            <CartProvider>
              <TooltipProvider>
                <Toaster />
                <Router />
              </TooltipProvider>
            </CartProvider>
          </AuthProvider>
        </LanguageProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
