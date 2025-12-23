import React from "react";
import { Link } from "wouter";
import { Layout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Package, Truck, Clock, CheckCircle2, FileText } from "lucide-react";
import { useAuth } from "@/context/auth-context";
import { motion } from "framer-motion";

export default function Dashboard() {
  const { user } = useAuth();

  // Mock Orders
  const orders = [
    { id: "ORD-2024-001", date: "2024-12-01", items: "Sharbati Wheat (50 MT)", total: "$22,500", status: "Delivered", statusColor: "default" },
    { id: "ORD-2024-005", date: "2024-12-15", items: "Teja Red Chili (10 MT)", total: "$32,000", status: "In Transit", statusColor: "secondary" },
    { id: "ORD-2024-008", date: "2024-12-20", items: "Basmati Rice (100 MT)", total: "$120,000", status: "Processing", statusColor: "outline" },
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
            <h1 className="font-serif text-3xl font-bold text-primary">Welcome, {user?.name}!</h1>
            <p className="text-muted-foreground">{user?.company}</p>
          </motion.div>
          <motion.div
            initial={{ x: 20 }}
            animate={{ x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <Link href="/catalog">
              <Button>New Order</Button>
            </Link>
          </motion.div>
        </div>
      </motion.div>

      <div className="container mx-auto px-4 py-8">
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
                    <div className="text-2xl font-bold">{stat.value}</div>
                    <p className="text-xs text-muted-foreground">{stat.sub}</p>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="font-serif text-xl">Recent Order History</CardTitle>
            </CardHeader>
            <CardContent>
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
                      <TableCell>{order.total}</TableCell>
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
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </Layout>
  );
}
