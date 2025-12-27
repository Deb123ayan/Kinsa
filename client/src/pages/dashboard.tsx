import React, { useState, useEffect } from "react";
import { Link } from "wouter";
import { Layout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Package, Truck, Clock, FileText, ShoppingCart, X } from "lucide-react";
import { useAuth } from "@/context/auth-context";
import { useCart } from "@/context/cart-context";
import { ProductCard } from "@/components/product-card";
import { motion } from "framer-motion";
import { formatPrice } from "@/lib/currency";
import { getUserOrders, cancelOrder, type Order } from "@/services/orders";
import { fetchProducts, type Product } from "@/services/products";
import { useToast } from "@/hooks/use-toast";

export default function Dashboard() {
  const { getUserDisplayName, isLoggedIn, loading: authLoading } = useAuth();
  const { cart, removeFromCart, cartTotal } = useCart();
  const { toast } = useToast();
  const [orders, setOrders] = useState<Order[]>([]);
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [productsLoading, setProductsLoading] = useState(true);
  const [ordersError, setOrdersError] = useState<string | null>(null);
  const [productsError, setProductsError] = useState<string | null>(null);

  // Load orders separately
  useEffect(() => {
    const loadOrders = async () => {
      if (!isLoggedIn || authLoading) return;
      
      try {
        setOrdersLoading(true);
        setOrdersError(null);
        const ordersData = await getUserOrders();
        setOrders(ordersData);
      } catch (error) {
        console.error('Failed to load orders:', error);
        setOrdersError('Failed to load order history');
      } finally {
        setOrdersLoading(false);
      }
    };

    loadOrders();
  }, [isLoggedIn, authLoading]);

  // Load products separately
  useEffect(() => {
    const loadProducts = async () => {
      try {
        setProductsLoading(true);
        setProductsError(null);
        const productsData = await fetchProducts();
        setFeaturedProducts(productsData.slice(0, 4));
      } catch (error) {
        console.error('Failed to load products:', error);
        setProductsError('Failed to load featured products');
      } finally {
        setProductsLoading(false);
      }
    };

    loadProducts();
  }, []);

  // Retry functions
  const retryLoadOrders = async () => {
    if (!isLoggedIn || authLoading) return;
    
    try {
      setOrdersLoading(true);
      setOrdersError(null);
      const ordersData = await getUserOrders();
      setOrders(ordersData);
    } catch (error) {
      console.error('Failed to load orders:', error);
      setOrdersError('Failed to load order history');
    } finally {
      setOrdersLoading(false);
    }
  };

  const retryLoadProducts = async () => {
    try {
      setProductsLoading(true);
      setProductsError(null);
      const productsData = await fetchProducts();
      setFeaturedProducts(productsData.slice(0, 4));
    } catch (error) {
      console.error('Failed to load products:', error);
      setProductsError('Failed to load featured products');
    } finally {
      setProductsLoading(false);
    }
  };

  const handleCancelOrder = async (orderId: number) => {
    try {
      const result = await cancelOrder(orderId);
      if (result.success) {
        toast({
          title: "Order Cancelled",
          description: "Order has been cancelled and stock has been restored.",
        });
        // Refresh orders
        setOrdersLoading(true);
        const updatedOrders = await getUserOrders();
        setOrders(updatedOrders);
        setOrdersLoading(false);
      } else {
        toast({
          title: "Cancellation Failed",
          description: result.error || "Failed to cancel order.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Cancellation Failed",
        description: "An error occurred while cancelling the order.",
        variant: "destructive",
      });
    }
  };

  // Show loading state while auth is loading
  if (authLoading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </div>
      </Layout>
    );
  }

  // Calculate stats from real orders
  const activeOrders = orders.filter((order: Order) => order.status === 'processing' || order.status === 'pending').length;
  const totalVolume = orders.reduce((sum: number, order: Order) => {
    return sum + order.items.reduce((itemSum: number, item: any) => itemSum + item.quantity, 0);
  }, 0);
  const pendingOrders = orders.filter((order: Order) => order.status === 'pending').length;

  const statCards = [
    { icon: Truck, label: "Active Orders", value: activeOrders.toString(), sub: `${pendingOrders} pending, ${activeOrders - pendingOrders} processing` },
    { icon: Clock, label: "Total Orders", value: orders.length.toString(), sub: "All time" },
    { icon: Package, label: "Total Volume", value: `${totalVolume} MT`, sub: "Across all orders" },
  ];

  return (
    <Layout>
      <motion.div 
        className="bg-secondary/30 border-b border-border py-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="container mx-auto px-4 flex justify-between items-center">
          <motion.div
            initial={{ x: -20 }}
            animate={{ x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <h1 className="font-serif text-3xl font-bold text-primary">Welcome, {getUserDisplayName()}!</h1>
            <p className="text-muted-foreground">KINSA Global - Your Partner Portal</p>
          </motion.div>
          <motion.div
            initial={{ x: 20 }}
            animate={{ x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <Link href="/catalog">
              <Button>Browse More Products</Button>
            </Link>
          </motion.div>
        </div>
      </motion.div>

      <div className="container mx-auto px-4 py-8">
        {/* Stats Cards */}
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {statCards.map((stat, idx) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                whileHover={{ y: -5 }}
              >
                <Card className="hover:shadow-md transition-shadow">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">{stat.label}</CardTitle>
                    <Icon className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-primary">{stat.value}</div>
                    <p className="text-xs text-muted-foreground">{stat.sub}</p>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Tabs Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="font-serif text-2xl text-primary">Order Management</CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="products" className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-6">
                  <TabsTrigger value="products">
                    <ShoppingCart className="mr-2 h-4 w-4" />
                    Browse Products ({cart.length})
                  </TabsTrigger>
                  <TabsTrigger value="orders">Order History</TabsTrigger>
                </TabsList>

                {/* Products Tab */}
                <TabsContent value="products" className="space-y-6">
                  <div>
                    <h3 className="text-lg font-bold text-primary mb-4">Featured Products</h3>
                    {productsError ? (
                      <div className="text-center py-8 text-muted-foreground">
                        <p>{productsError}</p>
                        <Button 
                          variant="outline" 
                          onClick={retryLoadProducts} 
                          className="mt-2"
                        >
                          Retry
                        </Button>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
                        {productsLoading ? (
                          Array.from({ length: 3 }).map((_, idx) => (
                            <div key={idx} className="animate-pulse">
                              <div className="bg-secondary/20 rounded-lg h-80"></div>
                            </div>
                          ))
                        ) : (
                          featuredProducts.map((product: Product, idx: number) => (
                            <motion.div
                              key={product.id}
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ duration: 0.5, delay: idx * 0.05 }}
                            >
                              <ProductCard product={product} />
                            </motion.div>
                          ))
                        )}
                      </div>
                    )}
                  </div>

                  {/* Current Cart */}
                  {cart.length > 0 && (
                    <div className="bg-accent/10 border border-accent/20 rounded-lg p-6 space-y-4">
                      <h4 className="font-bold text-primary text-lg">Current Inquiry Cart</h4>
                      <div className="space-y-3">
                        {cart.map((item) => (
                          <div key={item.product.id} className="flex justify-between items-center p-3 bg-white rounded-md border border-border">
                            <div>
                              <p className="font-medium text-primary">{item.product.name}</p>
                              <p className="text-sm text-muted-foreground">Quantity: {item.quantity} {item.product.unit}</p>
                            </div>
                            <div className="flex items-center gap-4">
                              <span className="font-bold text-primary">{formatPrice(item.product.price * item.quantity)}</span>
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => removeFromCart(item.product.id)}
                              >
                                Remove
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="border-t pt-4 flex justify-between items-center">
                        <span className="font-bold text-primary">Total:</span>
                        <span className="text-2xl font-bold text-primary">{formatPrice(cartTotal)}</span>
                      </div>
                      <Link href="/checkout">
                        <Button className="w-full bg-accent hover:bg-accent/90 text-white">
                          Proceed to Checkout
                        </Button>
                      </Link>
                    </div>
                  )}
                </TabsContent>

                {/* Order History Tab */}
                <TabsContent value="orders">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Order ID</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Items</TableHead>
                        <TableHead>Total Value</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {ordersError ? (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                            <p>{ordersError}</p>
                            <Button 
                              variant="outline" 
                              onClick={retryLoadOrders} 
                              className="mt-2"
                            >
                              Retry
                            </Button>
                          </TableCell>
                        </TableRow>
                      ) : ordersLoading ? (
                        Array.from({ length: 3 }).map((_, idx) => (
                          <TableRow key={idx}>
                            <TableCell><div className="h-4 bg-secondary/20 rounded animate-pulse"></div></TableCell>
                            <TableCell><div className="h-4 bg-secondary/20 rounded animate-pulse"></div></TableCell>
                            <TableCell><div className="h-4 bg-secondary/20 rounded animate-pulse"></div></TableCell>
                            <TableCell><div className="h-4 bg-secondary/20 rounded animate-pulse"></div></TableCell>
                            <TableCell><div className="h-4 bg-secondary/20 rounded animate-pulse"></div></TableCell>
                            <TableCell><div className="h-4 bg-secondary/20 rounded animate-pulse"></div></TableCell>
                          </TableRow>
                        ))
                      ) : orders.length > 0 ? (
                        orders.map((order, idx) => (
                          <motion.tr
                            key={order.id}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.3, delay: idx * 0.1 }}
                          >
                            <TableCell className="font-medium">ORD-{order.id}</TableCell>
                            <TableCell>{new Date(order.created_at).toLocaleDateString()}</TableCell>
                            <TableCell>
                              {order.items.length > 0 ? (
                                <div>
                                  {order.items[0].product.name} ({order.items[0].quantity} MT)
                                  {order.items.length > 1 && (
                                    <span className="text-muted-foreground"> +{order.items.length - 1} more</span>
                                  )}
                                </div>
                              ) : (
                                'No items'
                              )}
                            </TableCell>
                            <TableCell className="font-medium text-primary">
                              {formatPrice(order.total_amount + order.shipping_cost)}
                            </TableCell>
                            <TableCell>
                              <Badge variant={
                                order.status === 'delivered' ? 'default' :
                                order.status === 'processing' ? 'secondary' :
                                order.status === 'cancelled' ? 'destructive' :
                                'outline'
                              }>
                                {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex gap-2 justify-end">
                                <Button variant="ghost" size="sm">
                                  <FileText className="h-4 w-4 mr-1" /> Details
                                </Button>
                                {order.status === 'pending' && (
                                  <Button 
                                    variant="ghost" 
                                    size="sm" 
                                    onClick={() => handleCancelOrder(order.id)}
                                    className="text-destructive hover:text-destructive"
                                  >
                                    <X className="h-4 w-4 mr-1" /> Cancel
                                  </Button>
                                )}
                              </div>
                            </TableCell>
                          </motion.tr>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                            No orders found. <Link href="/catalog"><Button variant="link" className="p-0 h-auto">Browse products</Button></Link> to get started.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </Layout>
  );
}