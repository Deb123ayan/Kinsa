import React from "react";
import { AdminLayout } from "./layout";
import { withAdminRoute } from "./middleware";
import {
    TrendingUp,
    Users,
    Package,
    CreditCard
} from "lucide-react";

import { fetchProducts } from "@/services/products";
import { fetchAllOrders } from "@/services/orders";

function StatCard({ label, value, subValue, icon: Icon }: { label: string, value: string, subValue: string, icon: React.ElementType }) {
    return (
        <div className="card-elite interactive p-6 lg:p-10 relative overflow-hidden group">
            <div className="flex justify-between items-start mb-6">
                <div className="h-12 w-12 bg-secondary border border-border rounded-lg flex items-center justify-center group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300">
                    <Icon className="h-5 w-5" />
                </div>
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">{label}</span>
            </div>
            <div className="relative z-10">
                <h3 className="text-3xl lg:text-4xl font-serif font-bold tracking-tight text-foreground mb-2">{value}</h3>
                <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-muted-foreground">{subValue}</p>
            </div>
            <div className="absolute top-0 right-0 w-32 h-32 bg-secondary/30 -rotate-45 translate-x-16 -translate-y-16 group-hover:bg-primary/5 transition-all duration-500" />
        </div>
    );
}

function AdminDashboard() {
    const [counts, setCounts] = React.useState({ products: 0, orders: 0 });

    React.useEffect(() => {
        const loadCounts = async () => {
            try {
                const products = await fetchProducts();
                const orders = await fetchAllOrders();
                setCounts({
                    products: products.length,
                    orders: orders.length
                });
            } catch (error) {
                console.error("Dashboard: Error syncing stats:", error);
                setCounts({ products: 0, orders: 0 });
            }
        };
        loadCounts();
    }, []);

    return (
        <AdminLayout title="System Overview">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8 mb-16 stagger">
                <StatCard
                    label="Revenue"
                    value="ACTIVE"
                    subValue="Awaiting ledger sync"
                    icon={TrendingUp}
                />
                <StatCard
                    label="Orders"
                    value={counts.orders.toString()}
                    subValue="Total recorded transactions"
                    icon={CreditCard}
                />
                <StatCard
                    label="Logistics"
                    value="SYNC"
                    subValue="Global tracking active"
                    icon={Users}
                />
                <StatCard
                    label="Inventory"
                    value={counts.products.toString()}
                    subValue="System registered SKUs"
                    icon={Package}
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12 stagger">
                {/* System Activity */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="flex justify-between items-end border-b border-border pb-4">
                        <h2 className="font-serif text-2xl font-bold tracking-tight text-foreground">System Activity</h2>
                        <div className="h-2.5 w-2.5 bg-primary/30 rounded-full flex items-center justify-center animate-pulse">
                            <div className="h-1.5 w-1.5 bg-primary rounded-full" />
                        </div>
                    </div>

                    <div className="space-y-4">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="group">
                                <div className="flex justify-between items-center p-6 bg-card border border-border rounded-xl transition-all duration-300 hover:border-accent hover:shadow-md">
                                    <div className="flex gap-4 items-center">
                                        <span className="text-[10px] font-bold text-muted-foreground">0{i}</span>
                                        <div>
                                            <p className="font-bold text-xs uppercase tracking-widest text-foreground">Database sync</p>
                                            <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider mt-1">Automated Log Update</p>
                                        </div>
                                    </div>
                                    <span className="text-[10px] font-bold uppercase tracking-widest text-accent bg-accent/10 px-3 py-1 rounded-full">OK</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Status Console */}
                <div className="space-y-6">
                    <div className="flex justify-between items-end border-b border-border pb-4">
                        <h2 className="font-serif text-2xl font-bold tracking-tight text-foreground">Terminal</h2>
                    </div>
                    <div className="bg-secondary border border-border p-8 rounded-xl font-mono text-xs space-y-4 relative overflow-hidden">
                        <p className="text-muted-foreground tracking-wide font-bold">{">"} STATUS: ONLINE</p>
                        <p className="text-muted-foreground tracking-wide font-bold">{">"} HASH: VERIFIED</p>
                        <p className="text-muted-foreground tracking-wide font-bold">{">"} HUB: RUNNING</p>
                        <p className="text-foreground font-bold tracking-[0.2em] mt-6 border-t border-border pt-4">SYSTEM READY_</p>

                        <div className="absolute -bottom-8 -right-8 opacity-5 rotate-12 pointer-events-none">
                            <TrendingUp className="h-32 w-32 text-primary" />
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}

export default withAdminRoute(AdminDashboard);
