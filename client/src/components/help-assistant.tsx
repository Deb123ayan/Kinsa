import React, { useState, useEffect, useRef } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import {
  HelpCircle,
  X,
  MessageCircle,
  Package,
  User,
  ShoppingCart,
  ArrowLeft,
  MessageSquare,
  Send,
  Bot,
  CheckCircle,
  Clock,
  Truck,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/context/auth-context";
import { useCart } from "@/context/cart-context";
import { formatPrice } from "@/lib/currency";
import { OrderService, OrderWithPayment } from "@/services/orders";
import { ChatbotService, ChatMessage, ChatContext } from "@/services/chatbot";

type ViewType = "greeting" | "account" | "cart" | "orders" | "chat";

export function HelpAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [currentView, setCurrentView] = useState<ViewType>("greeting");
  const [showNotification, setShowNotification] = useState(true);
  const [orders, setOrders] = useState<OrderWithPayment[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const [, setLocation] = useLocation();

  const { user, getUserDisplayName } = useAuth();
  const { cart, cartTotal, cartCount } = useCart();

  // Hide notification after 5 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowNotification(false);
    }, 5000);
    return () => clearTimeout(timer);
  }, []);

  // Fetch orders when component mounts or user changes
  useEffect(() => {
    if (user?.email) {
      fetchUserOrders();
    }
  }, [user?.email]);

  // Auto-scroll chat to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  const fetchUserOrders = async () => {
    if (!user?.email) {
      console.log("No user email available for fetching orders");
      return;
    }

    console.log("Fetching orders for user:", user.email);
    setLoadingOrders(true);
    try {
      // Use OrderService.getUserOrders directly to get OrderWithPayment[]
      const userOrders = await OrderService.getUserOrders(user.email);
      console.log("Fetched orders:", userOrders);

      setOrders(userOrders);
      console.log("Orders set in state:", userOrders);
    } catch (error) {
      console.error("Failed to fetch orders:", error);
    } finally {
      setLoadingOrders(false);
    }
  };

  // Get only confirmed orders for chatbot context
  const getConfirmedOrdersForChat = (): OrderWithPayment[] => {
    return orders.filter(
      (order) =>
        // Order must have payment = 'paid' in the order table
        order.payment === "paid" &&
        // And either have confirmed status or paid payments
        (order.status === "confirmed" ||
          order.payments?.some((p) => p.status === "paid"))
    );
  };

  const getChatContext = (): ChatContext => ({
    userEmail: user?.email || "",
    userName: getUserDisplayName() || "there",
    orders: getConfirmedOrdersForChat(), // Only pass confirmed orders to chatbot
    currentTopic: currentView,
    cart: cart,
    cartTotal: cartTotal,
    cartCount: cartCount,
  });

  const handleChatSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: "user",
      content: chatInput.trim(),
      timestamp: new Date(),
    };

    setChatMessages((prev) => [...prev, userMessage]);
    setChatInput("");
    setIsTyping(true);

    // Simulate typing delay
    setTimeout(() => {
      const context = getChatContext();
      const response = ChatbotService.generateResponse(
        userMessage.content,
        context
      );

      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: "assistant",
        content: response.content,
        timestamp: new Date(),
        context: response.data,
      };

      setChatMessages((prev) => [...prev, assistantMessage]);
      setIsTyping(false);

      // Handle actions
      if (response.action) {
        handleChatAction(response.action, response.data);
      }
    }, 1000 + Math.random() * 1000);
  };

  const handleChatAction = (action: string, data?: any) => {
    switch (action) {
      case "show_orders":
        setCurrentView("orders");
        // Refresh orders when showing orders view
        fetchUserOrders();
        break;
      case "show_account":
        setCurrentView("account");
        break;
      case "show_cart":
        setCurrentView("cart");
        break;
      case "show_checkout":
        // Add a follow-up message about checkout
        setTimeout(() => {
          const followUp: ChatMessage = {
            id: Date.now().toString(),
            type: "assistant",
            content:
              "Would you like me to guide you to the checkout page, or do you need help with anything else first?",
            timestamp: new Date(),
          };
          setChatMessages((prev) => [...prev, followUp]);
        }, 500);
        break;
      case "suggest_products":
        // Add a follow-up message
        setTimeout(() => {
          const followUp: ChatMessage = {
            id: Date.now().toString(),
            type: "assistant",
            content:
              "Would you like me to show you our product catalog or help you with something else?",
            timestamp: new Date(),
          };
          setChatMessages((prev) => [...prev, followUp]);
        }, 500);
        break;
      case "show_contact_options":
        // Add contact options message
        setTimeout(() => {
          const followUp: ChatMessage = {
            id: Date.now().toString(),
            type: "assistant",
            content:
              "You can reach us at:\n• WhatsApp: +91 8001135771\n• Email: support@kinsa-global.com\n• Or use our contact form\n\nHow would you prefer to get in touch?",
            timestamp: new Date(),
          };
          setChatMessages((prev) => [...prev, followUp]);
        }, 500);
        break;
      case "show_menu":
        // Keep in chat but could suggest main menu
        break;
    }
  };

  const startChat = () => {
    setCurrentView("chat");
    if (chatMessages.length === 0) {
      const welcomeMessage: ChatMessage = {
        id: "welcome",
        type: "assistant",
        content: `Hi ${
          getUserDisplayName() || "there"
        }! I'm ANYA, your personal assistant. I can help you with your orders, account information, and answer any questions you might have. What would you like to know?`,
        timestamp: new Date(),
      };
      setChatMessages([welcomeMessage]);
    }
  };

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
          Choose an option below or start a conversation
        </p>
      </div>

      <div className="space-y-3">
        <Button
          variant="outline"
          className="w-full justify-start h-auto p-4 bg-gradient-to-r from-accent/10 to-accent/5 border-accent/20"
          onClick={startChat}
        >
          <div className="flex items-center gap-3">
            <Bot className="h-5 w-5 text-accent" />
            <div className="text-left">
              <div className="font-medium">Chat with ANYA</div>
              <div className="text-xs text-muted-foreground">
                Ask me anything about your orders or account
              </div>
            </div>
          </div>
        </Button>

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
          onClick={() => {
            setCurrentView("orders");
            fetchUserOrders(); // Refresh orders when clicking the button
          }}
        >
          <div className="flex items-center gap-3">
            <Package className="h-5 w-5 text-accent" />
            <div className="text-left flex-1">
              <div className="font-medium flex items-center gap-2">
                Order Details
                {orders.length > 0 && (
                  <Badge variant="secondary" className="text-xs">
                    {orders.length} orders
                  </Badge>
                )}
              </div>
              <div className="text-xs text-muted-foreground">
                {loadingOrders
                  ? "Loading orders..."
                  : orders.length > 0
                  ? `${
                      orders.filter((o) => o.payment === "paid").length
                    } confirmed`
                  : "No orders yet"}
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

          <ScrollArea className="h-48 sm:h-60">
            <div className="space-y-2 sm:space-y-3">
              {cart.map((item) => (
                <div
                  key={item.product.id}
                  className="border rounded-lg p-2 sm:p-3 space-y-1 sm:space-y-2"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-xs sm:text-sm truncate">
                        {item.product.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {item.quantity} {item.product.unit} ×{" "}
                        {formatPrice(item.product.price)}
                      </p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="font-medium text-xs sm:text-sm">
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
        <Button
          variant="outline"
          size="sm"
          onClick={fetchUserOrders}
          disabled={loadingOrders}
          className="ml-auto"
        >
          {loadingOrders ? "Refreshing..." : "Refresh"}
        </Button>
      </div>

      {loadingOrders ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent mx-auto mb-2"></div>
          <p className="text-sm text-muted-foreground">
            Loading your orders...
          </p>
        </div>
      ) : orders.length === 0 ? (
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
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Your Orders</span>
            <Badge variant="secondary">{orders.length} orders</Badge>
          </div>

          <ScrollArea className="h-60 sm:h-80">
            <div className="space-y-2 sm:space-y-3">
              {orders.map((order) => {
                const isConfirmed = order.payments?.some(
                  (p) => p.status === "paid"
                );
                const status = OrderService.getOrderStatusText(order);
                const statusColor = OrderService.getOrderStatusColor(
                  order.status
                );

                return (
                  <div
                    key={order.id}
                    className="border rounded-lg p-3 sm:p-4 space-y-2 sm:space-y-3"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <p className="font-medium text-xs sm:text-sm">
                            Order #{order.id}
                          </p>
                          <div className="flex items-center gap-1">
                            <div
                              className={`w-2 h-2 rounded-full ${statusColor}`}
                            ></div>
                            <span className="text-xs text-muted-foreground">
                              {status}
                            </span>
                          </div>
                        </div>
                        <p className="text-xs text-muted-foreground mb-2">
                          {new Date(order.created_at).toLocaleDateString()}
                        </p>
                        <p className="text-xs text-muted-foreground break-words">
                          {OrderService.formatOrderProducts(order.products)}
                        </p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        {isConfirmed && (
                          <CheckCircle className="h-4 w-4 text-green-500 mb-1" />
                        )}
                        <p className="font-medium text-xs sm:text-sm">
                          {order.total_amount
                            ? `₹${order.total_amount.toLocaleString()}`
                            : "N/A"}
                        </p>
                      </div>
                    </div>

                    {/* Show payment status from order table for confirmed orders */}
                    <div className="border-t pt-2">
                      <p className="text-xs font-medium text-muted-foreground mb-1">
                        Payment Status:
                      </p>
                      <div className="flex items-center justify-between text-xs">
                        <span className="capitalize font-medium text-green-600">
                          {order.payment || "Paid"}
                        </span>
                        <span>
                          ₹{order.total_amount?.toLocaleString() || "N/A"}
                        </span>
                      </div>

                      {/* Show additional payment details if available */}
                      {order.payments && order.payments.length > 0 && (
                        <div className="mt-1 text-xs text-muted-foreground">
                          Payment ID:{" "}
                          {order.payments[0]?.razorpay_payment_id || "N/A"}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </ScrollArea>

          <div className="bg-muted/30 rounded-lg p-4 space-y-2">
            <h4 className="font-medium text-sm">Order Status Guide</h4>
            <div className="space-y-1 text-xs text-muted-foreground">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                <span>Payment Pending - Awaiting payment confirmation</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span>Processing - Order being prepared for shipment</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                <span>In Transit - Order shipped and on the way</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>Delivered - Order successfully delivered</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );

  const renderChat = () => (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="space-y-4 h-full flex flex-col"
    >
      <div className="flex items-center gap-2 mb-4">
        <Button variant="ghost" size="sm" onClick={resetToGreeting}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex items-center gap-2">
          <Bot className="h-5 w-5 text-accent" />
          <h3 className="font-semibold text-primary">Chat with ANYA</h3>
        </div>
      </div>

      <ScrollArea className="flex-1 h-48 sm:h-64 pr-2 sm:pr-4">
        <div className="space-y-3 sm:space-y-4">
          {chatMessages.map((message) => (
            <div
              key={message.id}
              className={`flex ${
                message.type === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`max-w-[85%] sm:max-w-[80%] rounded-lg p-2 sm:p-3 ${
                  message.type === "user"
                    ? "bg-accent text-white"
                    : "bg-muted text-foreground"
                }`}
              >
                <p className="text-xs sm:text-sm whitespace-pre-wrap break-words">
                  {message.content}
                </p>
                <p className="text-xs opacity-70 mt-1">
                  {message.timestamp.toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
            </div>
          ))}

          {isTyping && (
            <div className="flex justify-start">
              <div className="bg-muted text-foreground rounded-lg p-3">
                <div className="flex items-center gap-1">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-accent rounded-full animate-bounce"></div>
                    <div
                      className="w-2 h-2 bg-accent rounded-full animate-bounce"
                      style={{ animationDelay: "0.1s" }}
                    ></div>
                    <div
                      className="w-2 h-2 bg-accent rounded-full animate-bounce"
                      style={{ animationDelay: "0.2s" }}
                    ></div>
                  </div>
                  <span className="text-xs text-muted-foreground ml-2">
                    ANYA is typing...
                  </span>
                </div>
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>
      </ScrollArea>

      <form onSubmit={handleChatSubmit} className="flex gap-1 sm:gap-2">
        <Input
          value={chatInput}
          onChange={(e) => setChatInput(e.target.value)}
          placeholder="Ask me anything..."
          className="flex-1 text-xs sm:text-sm"
          disabled={isTyping}
        />
        <Button
          type="submit"
          size="icon"
          disabled={!chatInput.trim() || isTyping}
          className="h-8 w-8 sm:h-10 sm:w-10"
        >
          <Send className="h-3 w-3 sm:h-4 sm:w-4" />
        </Button>
      </form>

      <div className="text-xs text-muted-foreground text-center px-2">
        <span className="hidden sm:inline">
          Try asking: "Show my orders", "What's my account info?", or "Help me
          track order #123"
        </span>
        <span className="sm:hidden">
          Ask about orders, account, or tracking
        </span>
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
      case "chat":
        return renderChat();
      default:
        return renderGreeting();
    }
  };

  return (
    <>
      {/* Floating Help Button */}
      <motion.div
        className="fixed bottom-3 right-3 sm:bottom-6 sm:right-6 z-50"
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
            className="relative h-12 w-12 sm:h-14 sm:w-14 rounded-full bg-accent hover:bg-accent/90 text-white shadow-lg hover:shadow-xl transition-all duration-300"
            size="icon"
          >
            <HelpCircle className="h-5 w-5 sm:h-6 sm:w-6" />
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
              className="fixed inset-3 sm:inset-auto sm:bottom-6 sm:right-6 z-50 flex items-end justify-end sm:block"
              initial={{ opacity: 0, scale: 0.8, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: 20 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            >
              <div className="w-full max-w-sm sm:max-w-md lg:max-w-lg sm:w-96 max-h-[calc(100vh-6rem)] sm:max-h-none">
                <Card className="shadow-2xl border-0 max-h-[calc(100vh-6rem)] overflow-hidden">
                  <CardHeader className="pb-3 flex-shrink-0">
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

                  <CardContent className="overflow-y-auto">
                    <div
                      className={`${
                        currentView === "chat"
                          ? "h-80 sm:h-96 max-h-[calc(100vh-12rem)]"
                          : "min-h-[280px] sm:min-h-[300px] max-h-[calc(100vh-12rem)]"
                      }`}
                    >
                      {renderCurrentView()}
                    </div>

                    {/* Contact Support - Show on all views except chat */}
                    {currentView !== "chat" && (
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
                    )}
                  </CardContent>
                </Card>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
