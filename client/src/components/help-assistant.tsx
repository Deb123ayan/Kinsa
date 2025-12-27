import React, { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  HelpCircle,
  X,
  MessageCircle,
  Package,
  User,
  ShoppingCart,
  ArrowLeft,
  MessageSquare,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/context/auth-context";
import { useCart } from "@/context/cart-context";
import { formatPrice } from "@/lib/currency";

type ViewType = "greeting" | "account" | "cart" | "orders";

export function HelpAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [currentView, setCurrentView] = useState<ViewType>("greeting");
  const [showNotification, setShowNotification] = useState(true);
  const [, setLocation] = useLocation();

  const { user, getUserDisplayName } = useAuth();
  const { cart, cartTotal, cartCount } = useCart();

  // Hide notification after 5 seconds
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setShowNotification(false);
    }, 5000);
    return () => clearTimeout(timer);
  }, []);

  const resetToGreeting = () => {
    setCurrentView("greeting");
  };

  const openWhatsAppChat = (context: string = "general") => {
    const messages = {
      general: "Hi! I need help with my KINSA Global account.",
      account: "Hi! I have questions about my account details.",
      cart: "Hi! I need help with my cart and checkout process.",
      orders: "Hi! I need help with tracking my orders.",
    };

    const message = encodeURIComponent(
      messages[context as keyof typeof messages] || messages.general
    );
    window.open(`https://wa.me/918001135771?text=${message}`, "_blank");
  };

  const renderGreeting = () => (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      <div className="text-center space-y-2">
        <div className="text-2xl">👋</div>
        <h3 className="font-semibold text-primary">Hi! How can I help you?</h3>
        <p className="text-sm text-muted-foreground">
          Choose an option below to get started
        </p>
      </div>

      <div className="space-y-3">
        <Button
          variant="outline"
          className="w-full justify-start h-auto p-4"
          onClick={() => setCurrentView("account")}
        >
          <div className="flex items-center gap-3">
            <User className="h-5 w-5 text-accent" />
            <div className="text-left">
              <div className="font-medium">Account Details</div>
              <div className="text-xs text-muted-foreground">
                View your profile information
              </div>
            </div>
          </div>
        </Button>

        <Button
          variant="outline"
          className="w-full justify-start h-auto p-4"
          onClick={() => setCurrentView("cart")}
        >
          <div className="flex items-center gap-3">
            <ShoppingCart className="h-5 w-5 text-accent" />
            <div className="text-left flex-1">
              <div className="font-medium flex items-center gap-2">
                Cart Details
                {cartCount > 0 && (
                  <Badge variant="secondary" className="text-xs">
                    {cartCount} items
                  </Badge>
                )}
              </div>
              <div className="text-xs text-muted-foreground">
                {cartCount > 0
                  ? `Total: ${formatPrice(cartTotal)}`
                  : "Your cart is empty"}
              </div>
            </div>
          </div>
        </Button>

        <Button
          variant="outline"
          className="w-full justify-start h-auto p-4"
          onClick={() => setCurrentView("orders")}
        >
          <div className="flex items-center gap-3">
            <Package className="h-5 w-5 text-accent" />
            <div className="text-left">
              <div className="font-medium">Order Details</div>
              <div className="text-xs text-muted-foreground">
                Track your orders and shipments
              </div>
            </div>
          </div>
        </Button>
      </div>
    </motion.div>
  );

  const renderAccountDetails = () => (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="space-y-4"
    >
      <div className="flex items-center gap-2 mb-4">
        <Button variant="ghost" size="sm" onClick={resetToGreeting}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h3 className="font-semibold text-primary">Account Details</h3>
      </div>

      <div className="space-y-4">
        <div className="bg-muted/30 rounded-lg p-4 space-y-3">
          <div>
            <label className="text-sm font-medium text-muted-foreground">
              Display Name
            </label>
            <p className="text-sm font-medium">
              {getUserDisplayName() || "Not set"}
            </p>
          </div>

          <div>
            <label className="text-sm font-medium text-muted-foreground">
              Email
            </label>
            <p className="text-sm font-medium">
              {user?.email || "Not available"}
            </p>
          </div>

          <div>
            <label className="text-sm font-medium text-muted-foreground">
              Account Type
            </label>
            <p className="text-sm font-medium">Partner Account</p>
          </div>

          <div>
            <label className="text-sm font-medium text-muted-foreground">
              Member Since
            </label>
            <p className="text-sm font-medium">
              {user?.created_at
                ? new Date(user.created_at).toLocaleDateString()
                : "Not available"}
            </p>
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-blue-600 font-bold text-sm">G</span>
              </div>
            </div>
            <div>
              <h4 className="text-sm font-medium text-blue-900 mb-1">
                Google Account
              </h4>
              <p className="text-sm text-blue-800">
                Your account is managed through Google. To update your profile
                information or change your password, please visit your{" "}
                <a
                  href="https://myaccount.google.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline hover:text-blue-900"
                >
                  Google Account settings
                </a>
                .
              </p>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );

  const renderCartDetails = () => (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="space-y-4"
    >
      <div className="flex items-center gap-2 mb-4">
        <Button variant="ghost" size="sm" onClick={resetToGreeting}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h3 className="font-semibold text-primary">Cart Details</h3>
      </div>

      {cart.length === 0 ? (
        <div className="text-center py-8 space-y-3">
          <ShoppingCart className="h-12 w-12 text-muted-foreground mx-auto" />
          <div>
            <p className="font-medium text-muted-foreground">
              Your cart is empty
            </p>
            <p className="text-sm text-muted-foreground">
              Add some products to get started
            </p>
          </div>
          <Button
            size="sm"
            onClick={() => {
              setIsOpen(false);
              setLocation("/catalog");
            }}
          >
            Browse Products
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Items in Cart</span>
            <Badge variant="secondary">{cartCount} items</Badge>
          </div>

          <ScrollArea className="h-60">
            <div className="space-y-3">
              {cart.map((item) => (
                <div
                  key={item.product.id}
                  className="border rounded-lg p-3 space-y-2"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">
                        {item.product.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {item.quantity} {item.product.unit} ×{" "}
                        {formatPrice(item.product.price)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-sm">
                        {formatPrice(item.product.price * item.quantity)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>

          <div className="border-t pt-3 space-y-3">
            <div className="flex justify-between items-center">
              <span className="font-medium">Total:</span>
              <span className="font-bold text-lg text-primary">
                {formatPrice(cartTotal)}
              </span>
            </div>
            <Button
              className="w-full"
              onClick={() => {
                setIsOpen(false);
                setLocation("/checkout");
              }}
            >
              Proceed to Checkout
            </Button>
          </div>
        </div>
      )}
    </motion.div>
  );

  const renderOrderDetails = () => (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="space-y-4"
    >
      <div className="flex items-center gap-2 mb-4">
        <Button variant="ghost" size="sm" onClick={resetToGreeting}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h3 className="font-semibold text-primary">Order Details</h3>
      </div>

      <div className="text-center py-8 space-y-3">
        <Package className="h-12 w-12 text-muted-foreground mx-auto" />
        <div>
          <p className="font-medium text-muted-foreground">No orders yet</p>
          <p className="text-sm text-muted-foreground">
            You haven't placed any orders yet. Start by adding items to your
            cart!
          </p>
        </div>
        <div className="space-y-2">
          <Button
            size="sm"
            onClick={() => {
              setIsOpen(false);
              setLocation("/catalog");
            }}
          >
            Browse Products
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentView("cart")}
          >
            View Cart
          </Button>
        </div>
      </div>

      <div className="bg-muted/30 rounded-lg p-4 space-y-2">
        <h4 className="font-medium text-sm">Order Status Guide</h4>
        <div className="space-y-1 text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
            <span>Pending - Order received, awaiting processing</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            <span>Processing - Order being prepared for shipment</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span>In Transit - Order shipped and on the way</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            <span>Delivered - Order successfully delivered</span>
          </div>
        </div>
      </div>
    </motion.div>
  );

  const renderCurrentView = () => {
    switch (currentView) {
      case "account":
        return renderAccountDetails();
      case "cart":
        return renderCartDetails();
      case "orders":
        return renderOrderDetails();
      default:
        return renderGreeting();
    }
  };

  return (
    <>
      {/* Floating Help Button */}
      <motion.div
        className="fixed bottom-6 right-6 z-50"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 1, type: "spring", stiffness: 260, damping: 20 }}
      >
        <div className="relative">
          {/* Pulse animation ring */}
          <div className="absolute inset-0 rounded-full bg-accent/30 animate-ping"></div>

          {/* Notification badge */}
          <AnimatePresence>
            {showNotification && (
              <motion.div
                className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-6 w-6 flex items-center justify-center font-bold"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
                transition={{ delay: 1.5 }}
              >
                ?
              </motion.div>
            )}
          </AnimatePresence>

          <Button
            onClick={() => {
              setIsOpen(true);
              setShowNotification(false);
              setCurrentView("greeting");
            }}
            className="relative h-14 w-14 rounded-full bg-accent hover:bg-accent/90 text-white shadow-lg hover:shadow-xl transition-all duration-300"
            size="icon"
          >
            <HelpCircle className="h-6 w-6" />
          </Button>
        </div>
      </motion.div>

      {/* Help Modal */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              className="fixed inset-0 bg-black/50 z-50"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
            />

            {/* Modal */}
            <motion.div
              className="fixed bottom-6 right-6 z-50 w-96 max-w-[calc(100vw-3rem)]"
              initial={{ opacity: 0, scale: 0.8, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: 20 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            >
              <Card className="shadow-2xl border-0">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <MessageCircle className="h-5 w-5 text-accent" />
                      <CardTitle className="text-lg">ANYA</CardTitle>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setIsOpen(false)}
                      className="h-8 w-8"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>

                <CardContent>
                  <div className="min-h-[300px]">{renderCurrentView()}</div>

                  {/* Contact Support - Show on all views */}
                  <div className="border-t pt-4 mt-4">
                    <p className="text-xs text-muted-foreground mb-3">
                      Need more help? Contact our support team.
                    </p>
                    <div className="space-y-2">
                      {currentView !== "greeting" && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full"
                          onClick={resetToGreeting}
                        >
                          Main Menu
                        </Button>
                      )}

                      <div
                        className={`grid gap-2 ${
                          currentView === "greeting"
                            ? "grid-cols-2"
                            : "grid-cols-1"
                        }`}
                      >
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1 bg-green-50 border-green-200 hover:bg-green-100 text-green-700"
                          onClick={() => {
                            setIsOpen(false);
                            openWhatsAppChat(currentView);
                          }}
                        >
                          <MessageSquare className="h-3 w-3 mr-1" />
                          WhatsApp
                        </Button>

                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1"
                          onClick={() => {
                            setIsOpen(false);
                            setLocation("/contact");
                          }}
                        >
                          <MessageCircle className="h-3 w-3 mr-1" />
                          Contact Form
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
