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
        <div className="bg-white border border-black/5 p-5 lg:p-10 hover:border-black transition-all duration-500 group relative overflow-hidden shadow-sm">
            <div className="flex justify-between items-start mb-4 lg:mb-8">
                <div className="h-10 w-10 lg:h-12 lg:w-12 bg-zinc-50 border border-black/5 flex items-center justify-center group-hover:bg-black group-hover:text-white transition-all">
                    <Icon className="h-4 w-4 lg:h-6 lg:w-6" />
                </div>
                <span className="text-[8px] lg:text-[9px] uppercase tracking-[0.2em] font-black opacity-20 group-hover:opacity-40">{label}</span>
            </div>
            <div className="relative z-10">
                <h3 className="text-3xl lg:text-5xl font-serif font-black mb-1 lg:mb-2 tracking-tighter text-black/90 group-hover:text-black">{value}</h3>
                <p className="text-[8px] lg:text-[9px] uppercase tracking-[0.2em] font-black opacity-40">{subValue}</p>
            </div>
            <div className="absolute top-0 right-0 w-24 h-24 lg:w-32 lg:h-32 bg-zinc-50/50 -rotate-45 translate-x-12 -translate-y-12 lg:translate-x-16 lg:-translate-y-16 group-hover:bg-black/5 transition-all" />
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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8 mb-16">
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

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 lg:gap-16">
                {/* System Activity */}
                <div className="lg:col-span-2 space-y-8">
                    <div className="flex justify-between items-end border-b border-black/5 pb-4">
                        <h2 className="font-serif text-xl lg:text-2xl font-black uppercase tracking-tighter">System Activity</h2>
                        <div className="h-2 w-2 bg-black/20 animate-pulse" />
                    </div>

                    <div className="space-y-3 lg:space-y-4">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="group cursor-pointer">
                                <div className="flex justify-between items-center p-4 lg:p-8 bg-white border border-black/5 hover:border-black transition-all duration-300">
                                    <div className="flex gap-4 lg:gap-6 items-center">
                                        <span className="text-[9px] lg:text-[10px] font-black opacity-20">0{i}</span>
                                        <div>
                                            <p className="font-black text-[10px] lg:text-xs uppercase tracking-widest text-black/80">Database sync</p>
                                            <p className="text-[8px] lg:text-[10px] opacity-30 font-bold uppercase">Automated Log Update</p>
                                        </div>
                                    </div>
                                    <span className="text-[9px] lg:text-[10px] font-black uppercase tracking-tighter opacity-40 group-hover:opacity-100 transition-opacity">OK</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Status Console */}
                <div className="space-y-8">
                    <div className="flex justify-between items-end border-b border-black/5 pb-4">
                        <h2 className="font-serif text-xl lg:text-2xl font-black uppercase tracking-tighter">Terminal</h2>
                    </div>
                    <div className="bg-zinc-50 border border-black/5 p-6 lg:p-10 font-mono text-[9px] lg:text-[11px] space-y-3 lg:space-y-4 relative overflow-hidden">
                        <p className="opacity-40 tracking-wider font-bold text-black">{">"} STATUS: ONLINE</p>
                        <p className="opacity-40 tracking-wider font-bold text-black">{">"} HASH: VERIFIED</p>
                        <p className="opacity-40 tracking-wider font-bold text-black">{">"} HUB: RUNNING</p>
                        <p className="text-black font-black tracking-[0.2em] mt-4 lg:mt-6 border-t border-black/5 pt-3 lg:pt-4">SYSTEM READY_</p>

                        <div className="absolute -bottom-8 -right-8 opacity-[0.03] rotate-12">
                            <TrendingUp className="h-32 w-32" />
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}

export default withAdminRoute(AdminDashboard);
