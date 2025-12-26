import React, { useState } from "react";
import { Link } from "wouter";
import { Layout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Package, Truck, Clock, CheckCircle2, FileText, ShoppingCart } from "lucide-react";
import { useAuth } from "@/context/auth-context";
import { useCart } from "@/context/cart-context";
import { ProductCard } from "@/components/product-card";
import { PRODUCTS } from "@/data/mock-data";
import { motion } from "framer-motion";
import { formatPrice } from "@/lib/currency";

export default function Dashboard() {
  const { user, getUserDisplayName } = useAuth();
  const { cart, addToCart, removeFromCart, cartTotal } = useCart();

  // Mock Orders
  const orders = [
    { id: "ORD-2024-001", date: "2024-12-01", items: "Sharbati Wheat (50 MT)", total: formatPrice(1750000), status: "Delivered", statusColor: "default" },
    { id: "ORD-2024-005", date: "2024-12-15", items: "Teja Red Chili (10 MT)", total: formatPrice(2500000), status: "In Transit", statusColor: "secondary" },
    { id: "ORD-2024-008", date: "2024-12-20", items: "Basmati Rice (100 MT)", total: formatPrice(9500000), status: "Processing", statusColor: "outline" },
  ];

  const statCards = [
    { icon: Truck, label: "Active Shipments", value: "2", sub: "1 at sea, 1 at port" },
    { icon: Clock, label: "Pending Invoices", value: "1", sub: "Due in 5 days" },
    { icon: Package, label: "Total Volume (YTD)", value: "450 MT", sub: "+12% from last year" },
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
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
                      {PRODUCTS.map((product, idx) => (
                        <motion.div
                          key={product.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.5, delay: idx * 0.05 }}
                        >
                          <ProductCard product={product} />
                        </motion.div>
                      ))}
                    </div>
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
                      {orders.map((order, idx) => (
                        <motion.tr
                          key={order.id}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.3, delay: idx * 0.1 }}
                        >
                          <TableCell className="font-medium">{order.id}</TableCell>
                          <TableCell>{order.date}</TableCell>
                          <TableCell>{order.items}</TableCell>
                          <TableCell className="font-medium text-primary">{order.total}</TableCell>
                          <TableCell>
                            <Badge variant={order.statusColor as "default" | "secondary" | "outline" | "destructive"}>
                              {order.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button variant="ghost" size="sm">
                              <FileText className="h-4 w-4 mr-1" /> Invoice
                            </Button>
                          </TableCell>
                        </motion.tr>
                      ))}
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
