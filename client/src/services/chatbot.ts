import { OrderWithPayment, OrderService } from "./orders";

export interface ChatMessage {
  id: string;
  type: "user" | "assistant";
  content: string;
  timestamp: Date;
  context?: any;
}

export interface ChatContext {
  userEmail: string;
  userName: string;
  orders: OrderWithPayment[];
  currentTopic?: string;
  cart?: Array<{
    product: {
      id: string;
      name: string;
      price: number;
      unit: string;
    };
    quantity: number;
  }>;
  cartTotal?: number;
  cartCount?: number;
}

export class ChatbotService {
  private static responses = {
    greetings: [
      "Hi there! I'm ANYA, your personal assistant. How can I help you today?",
      "Hello! I'm here to help you with your orders, account, and any questions you might have.",
      "Hey! Welcome back! What can I assist you with today?",
    ],

    orderInquiry: [
      "Let me check your order details for you.",
      "I'll pull up your order information right away.",
      "Looking into your orders now...",
    ],

    noOrders: [
      "I don't see any confirmed orders in your account yet. Would you like to browse our products?",
      "You haven't completed any orders yet. Let me know if you'd like help finding products!",
      "No confirmed orders found. Ready to start shopping? I can help you find what you need.",
    ],

    orderFound: [
      "Great! I found your confirmed orders. Here's what I see:",
      "Here are your confirmed order details:",
      "I've located your confirmed orders. Let me show you the details:",
    ],

    cartEmpty: [
      "Your cart is currently empty. Would you like to browse our products?",
      "No items in your cart yet. Let me help you find some great products!",
      "Your cart is empty. Ready to start shopping?",
    ],

    cartFound: [
      "Here's what's in your cart:",
      "Let me show you your cart contents:",
      "I can see your cart items:",
    ],

    accountInfo: [
      "Here's your account information:",
      "Let me show you your account details:",
      "Your account summary:",
    ],

    helpOffers: [
      "Is there anything specific about your orders you'd like to know?",
      "Would you like me to explain any of these details?",
      "Do you have any questions about your orders or need help with anything else?",
    ],

    generalHelp: [
      "I can help you with order tracking, account information, product inquiries, and more!",
      "I'm here to assist with orders, payments, shipping, and general questions about KINSA Global.",
      "Feel free to ask me about your orders, account details, or if you need help with anything else!",
    ],

    paymentStatus: [
      "Let me check the payment status for your orders.",
      "I'll look into your payment information.",
      "Checking your payment details now...",
    ],

    productSuggestions: [
      "I'd be happy to help you find products! What are you looking for?",
      "Let me help you discover our product range. Any specific items in mind?",
      "Our catalog has great options. What type of products interest you?",
    ],

    checkoutHelp: [
      "I can help you with the checkout process!",
      "Ready to complete your purchase? I'm here to assist!",
      "Let me guide you through checkout.",
    ],

    thankYou: [
      "You're welcome! Is there anything else I can help you with?",
      "Happy to help! Let me know if you need anything else.",
      "Glad I could assist! Feel free to ask if you have more questions.",
    ],
  };

  static generateResponse(
    userInput: string,
    context: ChatContext
  ): { content: string; action?: string; data?: any } {
    const input = userInput.toLowerCase().trim();

    // Greeting detection
    if (this.isGreeting(input)) {
      return {
        content: this.getRandomResponse("greetings"),
        action: "show_menu",
      };
    }

    // Cart-related queries
    if (this.isCartQuery(input)) {
      if (!context.cart || context.cart.length === 0) {
        return {
          content: this.getRandomResponse("cartEmpty"),
          action: "suggest_products",
        };
      } else {
        let response = this.getRandomResponse("cartFound");
        response += `\n\n${this.generateCartSummary(context)}`;

        return {
          content: response,
          action: "show_cart",
          data: context.cart,
        };
      }
    }

    // Account-related queries
    if (this.isAccountQuery(input)) {
      let response = this.getRandomResponse("accountInfo");
      response += `\n\nName: ${context.userName}`;
      response += `\nEmail: ${context.userEmail}`;
      response += `\nAccount Type: Partner Account`;

      if (context.orders.length > 0) {
        response += `\nConfirmed Orders: ${context.orders.length}`;
        const totalSpent = context.orders.reduce(
          (sum, order) => sum + (order.total_amount || 0),
          0
        );
        response += `\nTotal Spent: ₹${totalSpent.toLocaleString()}`;
      }

      return {
        content: response + "\n\nWould you like to see more details?",
        action: "show_account",
      };
    }

    // Checkout-related queries
    if (this.isCheckoutQuery(input)) {
      if (!context.cart || context.cart.length === 0) {
        return {
          content:
            "Your cart is empty. Add some items first before proceeding to checkout!",
          action: "suggest_products",
        };
      } else {
        let response = this.getRandomResponse("checkoutHelp");
        response += `\n\n${this.generateCartSummary(context)}`;
        response += `\n\nReady to proceed to checkout?`;

        return {
          content: response,
          action: "show_checkout",
          data: context.cart,
        };
      }
    }

    // Order-related queries
    if (this.isOrderQuery(input)) {
      if (context.orders.length === 0) {
        return {
          content: this.getRandomResponse("noOrders"),
          action: "suggest_products",
        };
      } else {
        // All orders in context are confirmed, so no need to filter
        let response = this.getRandomResponse("orderFound");
        response += `\n\n${this.generateOrderListResponse(context.orders)}`;

        // Show order details since all are confirmed
        response += `\n\nYour confirmed orders:\n${context.orders
          .slice(0, 3)
          .map(
            (order) =>
              `• Order #${order.id} - ${order.status || "Confirmed"} - ₹${
                order.total_amount?.toLocaleString() || "N/A"
              }`
          )
          .join("\n")}`;

        return {
          content: response,
          action: "show_orders",
          data: context.orders,
        };
      }
    }

    // Payment queries
    if (this.isPaymentQuery(input)) {
      if (context.orders.length === 0) {
        return {
          content:
            "You don't have any confirmed payments yet. Complete an order to see your payment history!",
          action: "suggest_products",
        };
      }

      // All orders in context are confirmed/paid
      let response = "All your orders have confirmed payments! 💳\n\n";
      response += `Confirmed payments: ${context.orders.length} orders\n`;

      const totalPaid = context.orders.reduce(
        (sum, order) => sum + (order.total_amount || 0),
        0
      );
      response += `Total paid: ₹${totalPaid.toLocaleString()}`;

      return {
        content: response,
        action: "show_orders",
        data: context.orders,
      };
    }

    // Status queries
    if (this.isStatusQuery(input)) {
      if (context.orders.length === 0) {
        return {
          content:
            "You don't have any confirmed orders to track yet. Would you like to browse our products?",
          action: "suggest_products",
        };
      }

      const statusSummary = context.orders.reduce((acc, order) => {
        // Use the actual order status, defaulting to 'Confirmed' since all orders are paid
        const status = order.status || "Confirmed";
        acc[status] = (acc[status] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      let response = "Here's the status of your confirmed orders:\n\n";
      Object.entries(statusSummary).forEach(([status, count]) => {
        response += `• ${status}: ${count} order${count > 1 ? "s" : ""}\n`;
      });

      return {
        content: response,
        action: "show_order_status",
        data: context.orders,
      };
    }

    // Help queries
    if (this.isHelpQuery(input)) {
      return {
        content: this.getRandomResponse("generalHelp"),
        action: "show_help_options",
      };
    }

    // Thank you
    if (this.isThankYou(input)) {
      return {
        content: this.getRandomResponse("thankYou"),
        action: "show_menu",
      };
    }

    // Default response with context awareness
    return this.generateContextualResponse(input, context);
  }

  private static isGreeting(input: string): boolean {
    const greetings = [
      "hi",
      "hello",
      "hey",
      "good morning",
      "good afternoon",
      "good evening",
    ];
    return greetings.some((greeting) => input.includes(greeting));
  }

  private static isCartQuery(input: string): boolean {
    const cartKeywords = [
      "cart",
      "basket",
      "shopping cart",
      "my cart",
      "cart items",
      "what's in my cart",
    ];
    return cartKeywords.some((keyword) => input.includes(keyword));
  }

  private static isAccountQuery(input: string): boolean {
    const accountKeywords = [
      "account",
      "profile",
      "my account",
      "account info",
      "my profile",
      "account details",
    ];
    return accountKeywords.some((keyword) => input.includes(keyword));
  }

  private static isCheckoutQuery(input: string): boolean {
    const checkoutKeywords = [
      "checkout",
      "buy",
      "purchase",
      "order now",
      "place order",
      "proceed to checkout",
    ];
    return checkoutKeywords.some((keyword) => input.includes(keyword));
  }

  private static isOrderQuery(input: string): boolean {
    const orderKeywords = [
      "order",
      "orders",
      "purchase",
      "bought",
      "my orders",
      "order history",
    ];
    return orderKeywords.some((keyword) => input.includes(keyword));
  }

  private static isPaymentQuery(input: string): boolean {
    const paymentKeywords = [
      "payment",
      "paid",
      "pay",
      "transaction",
      "billing",
      "invoice",
    ];
    return paymentKeywords.some((keyword) => input.includes(keyword));
  }

  private static isStatusQuery(input: string): boolean {
    const statusKeywords = [
      "status",
      "track",
      "tracking",
      "shipped",
      "delivery",
      "delivered",
    ];
    return statusKeywords.some((keyword) => input.includes(keyword));
  }

  private static isHelpQuery(input: string): boolean {
    const helpKeywords = [
      "help",
      "assist",
      "support",
      "what can you do",
      "how can you help",
    ];
    return helpKeywords.some((keyword) => input.includes(keyword));
  }

  private static isThankYou(input: string): boolean {
    const thankYouKeywords = [
      "thank",
      "thanks",
      "appreciate",
      "great",
      "awesome",
    ];
    return thankYouKeywords.some((keyword) => input.includes(keyword));
  }

  private static getRandomResponse(
    category: keyof typeof this.responses
  ): string {
    const responses = this.responses[category];
    return responses[Math.floor(Math.random() * responses.length)];
  }

  private static generateContextualResponse(
    input: string,
    context: ChatContext
  ): { content: string; action?: string; data?: any } {
    // Analyze input for specific order references
    const orderIdMatch = input.match(/order\s*#?(\d+)/i);
    if (orderIdMatch) {
      const orderId = parseInt(orderIdMatch[1]);
      const order = context.orders.find((o) => o.id === orderId);

      if (order) {
        const status = OrderService.getOrderStatusText(order);
        const products = OrderService.formatOrderProducts(order.products);
        const amount = order.total_amount
          ? `₹${order.total_amount.toLocaleString()}`
          : "Amount not specified";
        const date = new Date(order.created_at).toLocaleDateString();

        return {
          content: `Found Order #${orderId}!\n\nDate: ${date}\nStatus: ${status}\nProducts: ${products}\nAmount: ${amount}\n\nIs there anything specific you'd like to know about this order?`,
          action: "show_specific_order",
          data: order,
        };
      } else {
        return {
          content: `I couldn't find order #${orderId} in your account. Please check the order number or try asking about "my orders" to see all your orders.`,
          action: "show_orders",
          data: context.orders,
        };
      }
    }

    // Company/business queries
    if (
      input.includes("kinsa") ||
      input.includes("company") ||
      input.includes("about") ||
      input.includes("business")
    ) {
      return {
        content:
          "KINSA Global is your trusted partner for agricultural products and international trade. We specialize in:\n\n• Premium quality grains, spices, and pulses\n• Global export and import services\n• Competitive pricing and reliable delivery\n• Expert guidance for international trade\n\nHow can we help you with your agricultural product needs?",
        action: "show_company_info",
      };
    }

    // Pricing and quotes
    if (
      input.includes("quote") ||
      input.includes("pricing") ||
      input.includes("rates") ||
      input.includes("wholesale")
    ) {
      return {
        content:
          "I can help you with pricing information! Our rates vary based on:\n\n• Product type and quality grade\n• Order quantity (bulk discounts available)\n• Delivery location and terms\n• Current market conditions\n\nFor accurate quotes, please contact our sales team or browse our catalog for current pricing. Would you like me to show you our products?",
        action: "suggest_products",
      };
    }

    // Shipping and logistics
    if (
      input.includes("shipping") ||
      input.includes("logistics") ||
      input.includes("delivery time") ||
      input.includes("export")
    ) {
      return {
        content:
          "We handle all aspects of international shipping and logistics:\n\n• FOB, CIF, and EXW terms available\n• Professional packaging and documentation\n• Tracking and insurance included\n• Delivery times: 15-30 days depending on destination\n• Port-to-port and door-to-door options\n\nWould you like specific information about shipping to your location?",
        action: "show_shipping_info",
      };
    }

    // Quality and certifications
    if (
      input.includes("quality") ||
      input.includes("certificate") ||
      input.includes("organic") ||
      input.includes("standard")
    ) {
      return {
        content:
          "Quality is our top priority! We provide:\n\n• Premium grade products with quality certificates\n• Organic and conventional options available\n• Third-party quality testing and verification\n• Compliance with international food safety standards\n• Detailed product specifications and analysis reports\n\nWould you like to know about specific product certifications?",
        action: "show_quality_info",
      };
    }

    // Cart-related queries in contextual responses
    if (
      input.includes("cart") ||
      input.includes("basket") ||
      input.includes("shopping")
    ) {
      if (!context.cart || context.cart.length === 0) {
        return {
          content:
            "Your cart is currently empty. Would you like me to help you find some products to add?",
          action: "suggest_products",
        };
      } else {
        return {
          content: `You have ${context.cartCount} item${
            context.cartCount !== 1 ? "s" : ""
          } in your cart with a total of ₹${
            context.cartTotal?.toLocaleString() || "0"
          }. Would you like to see the details or proceed to checkout?`,
          action: "show_cart",
          data: context.cart,
        };
      }
    }

    // Product-related queries
    if (
      input.includes("product") ||
      input.includes("item") ||
      input.includes("catalog") ||
      input.includes("buy") ||
      input.includes("purchase")
    ) {
      return {
        content:
          "I can help you find products! Our catalog has a wide range of items. Would you like me to show you our product catalog or help you with something specific?",
        action: "suggest_products",
      };
    }

    // Account-related queries
    if (
      input.includes("account") ||
      input.includes("profile") ||
      input.includes("email") ||
      input.includes("name")
    ) {
      return {
        content: `I can show you your account information. Your account is registered with ${context.userEmail} and you're signed in as ${context.userName}. Would you like to see more details?`,
        action: "show_account",
      };
    }

    // Shipping/delivery queries
    if (
      input.includes("ship") ||
      input.includes("deliver") ||
      input.includes("track") ||
      input.includes("when will")
    ) {
      const shippedOrders = context.orders.filter(
        (order) =>
          order.status?.toLowerCase().includes("ship") ||
          order.status?.toLowerCase().includes("transit") ||
          order.status?.toLowerCase().includes("deliver")
      );

      if (shippedOrders.length > 0) {
        return {
          content: `You have ${shippedOrders.length} order${
            shippedOrders.length > 1 ? "s" : ""
          } that ${
            shippedOrders.length > 1 ? "are" : "is"
          } shipped or in transit. Let me show you the details.`,
          action: "show_orders",
          data: shippedOrders,
        };
      } else {
        return {
          content:
            "I don't see any shipped orders in your account yet. Orders typically ship within 2-3 business days after payment confirmation. Would you like to check your order status?",
          action: "show_orders",
          data: context.orders,
        };
      }
    }

    // Price/cost queries
    if (
      input.includes("cost") ||
      input.includes("price") ||
      input.includes("total") ||
      input.includes("amount")
    ) {
      if (context.orders.length === 0) {
        return {
          content:
            "You haven't made any purchases yet. Would you like to browse our products and see current pricing?",
          action: "suggest_products",
        };
      }

      const totalSpent = context.orders.reduce(
        (sum, order) => sum + (order.total_amount || 0),
        0
      );

      let response = `Here's your purchase summary:\n\n`;
      response += `Confirmed orders: ${context.orders.length}\n`;
      response += `Total spent: ₹${totalSpent.toLocaleString()}\n`;

      if (context.orders.length > 0) {
        const avgOrderValue = totalSpent / context.orders.length;
        response += `Average order value: ₹${Math.round(
          avgOrderValue
        ).toLocaleString()}`;
      }

      return {
        content: response + "\n\nWould you like to see the breakdown by order?",
        action: "show_orders",
        data: context.orders,
      };
    }

    // Contact/support queries
    if (
      input.includes("contact") ||
      input.includes("support") ||
      input.includes("phone") ||
      input.includes("email support")
    ) {
      return {
        content:
          "I'm here to help! For additional support, you can:\n\n• Continue chatting with me here\n• Contact us via WhatsApp at +91 8001135771\n• Fill out our contact form\n• Email us directly\n\nWhat would you prefer?",
        action: "show_contact_options",
      };
    }

    // Default intelligent response
    const responses = [
      `I understand you're asking about "${input}". Let me see how I can help you with that.`,
      `That's an interesting question about "${input}". Here's what I can do for you:`,
      `I'd be happy to help you with "${input}". Let me show you some options:`,
    ];

    return {
      content:
        responses[Math.floor(Math.random() * responses.length)] +
        "\n\nI can help you with:\n• Your orders and order status\n• Account information\n• Product inquiries\n• Payment details\n• General support\n\nWhat would you like to know more about?",
      action: "show_menu",
    };
  }

  static formatOrderSummary(order: OrderWithPayment): string {
    const status = OrderService.getOrderStatusText(order);
    const products = OrderService.formatOrderProducts(order.products);
    const amount = order.total_amount
      ? `₹${order.total_amount.toLocaleString()}`
      : "Amount not specified";
    const date = new Date(order.created_at).toLocaleDateString();

    return `Order #${order.id} (${date})\nStatus: ${status}\nProducts: ${products}\nAmount: ${amount}`;
  }

  static generateCartSummary(context: ChatContext): string {
    if (!context.cart || context.cart.length === 0) {
      return "Your cart is empty.";
    }

    let summary = `${context.cartCount} item${
      context.cartCount !== 1 ? "s" : ""
    } in your cart:\n\n`;

    context.cart.forEach((item, index) => {
      const itemTotal = item.product.price * item.quantity;
      summary += `${index + 1}. ${item.product.name}\n`;
      summary += `   ${item.quantity} ${
        item.product.unit
      } × ₹${item.product.price.toLocaleString()} = ₹${itemTotal.toLocaleString()}\n\n`;
    });

    summary += `Total: ₹${context.cartTotal?.toLocaleString() || "0"}`;

    return summary;
  }

  static generateOrderListResponse(orders: OrderWithPayment[]): string {
    if (orders.length === 0) {
      return "You don't have any confirmed orders yet. Ready to start shopping?";
    }

    // All orders passed here are confirmed/paid
    const totalAmount = orders.reduce(
      (sum, order) => sum + (order.total_amount || 0),
      0
    );

    let response = `You have ${orders.length} confirmed order${
      orders.length > 1 ? "s" : ""
    }`;

    if (totalAmount > 0) {
      response += ` with a total value of ₹${totalAmount.toLocaleString()}`;
    }

    return response + ". Would you like to see the details?";
  }
}
