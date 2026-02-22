import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/context/auth-context";
import { CartProvider } from "@/context/cart-context";
import { LanguageProvider } from "@/context/language-context";
import { useLanguageDirection } from "@/hooks/use-language-direction";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import Catalog from "@/pages/catalog";
import ProductDetail from "@/pages/product-detail";
import Cart from "@/pages/cart";
import Checkout from "@/pages/checkout";
import About from "@/pages/about";
import Contact from "@/pages/contact";
import Auth from "@/pages/auth";
import Legal from "@/pages/legal";
import Dashboard from "@/pages/dashboard";
import { withProtectedRoute } from "@/pages/protected";
import AdminDashboard from "@/pages/admin/dashboard";
import AdminLogin from "@/pages/admin/login";
import AdminOrders from "@/pages/admin/orders";
import AdminPayments from "@/pages/admin/payments";
import AdminProducts from "@/pages/admin/products";
import AdminContacts from "@/pages/admin/contacts";
import AdminManagement from "@/pages/admin/admins";

const ProtectedDashboard = withProtectedRoute(Dashboard);

function Router() {
  // Initialize language direction handling
  useLanguageDirection();

  return (
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

      {/* Admin routes */}
      <Route path="/admin/login" component={AdminLogin} />
      <Route path="/admin" component={AdminDashboard} />
      <Route path="/admin/orders" component={AdminOrders} />
      <Route path="/admin/payments" component={AdminPayments} />
      <Route path="/admin/products" component={AdminProducts} />
      <Route path="/admin/contacts" component={AdminContacts} />
      <Route path="/admin/management" component={AdminManagement} />

      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
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
  );
}

export default App;
