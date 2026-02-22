import React, { useEffect, useState } from "react";
import { AdminLayout } from "./layout";
import { withAdminRoute } from "./middleware";
import { supabase } from "@/lib/supabase";
import {
    Search,
    Filter,
    MoreHorizontal,
    Eye,
    CheckCircle,
    Clock
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatPrice } from "@/lib/currency";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { fetchAllOrders, updateOrderStatus } from "@/services/orders";

function AdminOrders() {
    const { toast } = useToast();
    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [dateFilter, setDateFilter] = useState({ from: "", to: "" });
    const [valuationFilter, setValuationFilter] = useState({ min: "", max: "" });
    const [isFilterVisible, setIsFilterVisible] = useState(false);

    const loadOrders = async () => {
        try {
            setLoading(true);
            const data = await fetchAllOrders();
            setOrders(data);
        } catch (error) {
            console.error("AdminOrders: Failed to fetch ledger:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadOrders();
    }, []);

    const handleStatusUpdate = async (orderId: number, newStatus: string) => {
        try {
            const { success, error } = await updateOrderStatus(orderId, newStatus);
            if (!success) throw new Error(error);

            toast({
                title: "LOG_ENTRY: UPDATED",
                description: `Order ID_${orderId} status transitioned to ${newStatus}.`,
            });

            // Optimistic update
            setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
        } catch (error: any) {
            toast({
                title: "LOG_ENTRY: FAIL",
                description: error.message,
                variant: "destructive",
            });
        }
    };

    const filteredOrders = orders.filter(order => {
        // Search Filter
        const matchesSearch =
            order.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            order.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            order.id.toString().includes(searchQuery);

        // Status Filter
        const matchesStatus = statusFilter === "all" || order.status === statusFilter;

        // Date Filter
        const orderDate = new Date(order.created_at).toISOString().split('T')[0];
        const matchesDateFrom = !dateFilter.from || orderDate >= dateFilter.from;
        const matchesDateTo = !dateFilter.to || orderDate <= dateFilter.to;

        // Valuation Filter
        const matchesValMin = !valuationFilter.min || (order.total_amount || 0) >= parseFloat(valuationFilter.min);
        const matchesValMax = !valuationFilter.max || (order.total_amount || 0) <= parseFloat(valuationFilter.max);

        return matchesSearch && matchesStatus && matchesDateFrom && matchesDateTo && matchesValMin && matchesValMax;
    });

    return (
        <AdminLayout title="Global Orders">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6 lg:gap-8 mb-4 border-b border-black/5 pb-6">
                <div className="relative w-full lg:w-[450px]">
                    <Search className="absolute left-5 lg:left-6 top-1/2 -translate-y-1/2 h-4 lg:h-5 w-4 lg:w-5 opacity-20" />
                    <input
                        placeholder="FILTER_LEDGER..."
                        className="flex h-12 lg:h-14 w-full bg-white border border-black/5 rounded-none px-12 lg:px-16 py-2 text-[10px] lg:text-xs font-black tracking-widest focus:outline-none focus:border-black/20 shadow-sm"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <div className="flex gap-3 lg:gap-4 w-full sm:w-auto">
                    <Button
                        onClick={() => setIsFilterVisible(!isFilterVisible)}
                        variant={isFilterVisible ? "default" : "outline"}
                        className={`flex-1 sm:flex-none border border-black/10 font-black uppercase tracking-widest text-[9px] lg:text-[10px] rounded-none h-12 lg:h-14 px-6 lg:px-10 transition-all shadow-sm ${isFilterVisible ? 'bg-black text-white' : 'bg-white text-black hover:bg-black hover:text-white'}`}
                    >
                        <Filter className="mr-2 lg:mr-3 h-3.5 lg:h-4 w-3.5 lg:w-4" /> {isFilterVisible ? 'Hide Filters' : 'Advanced Filters'}
                    </Button>
                    <Button className="flex-1 sm:flex-none bg-black text-white font-black uppercase tracking-widest text-[9px] lg:text-[10px] rounded-none h-12 lg:h-14 px-6 lg:px-10 hover:bg-zinc-800 transition-all shadow-md">
                        Export
                    </Button>
                </div>
            </div>

            {isFilterVisible && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 p-6 bg-zinc-50 border border-black/5 mb-8 animate-in fade-in slide-in-from-top-2 duration-300">
                    <div className="space-y-2">
                        <label className="text-[9px] font-black uppercase tracking-widest opacity-40">Status</label>
                        <Select value={statusFilter} onValueChange={setStatusFilter}>
                            <SelectTrigger className="bg-white border-black/5 rounded-none h-10 text-[10px] font-black uppercase tracking-widest">
                                <SelectValue placeholder="All Statuses" />
                            </SelectTrigger>
                            <SelectContent className="rounded-none border-black/5">
                                <SelectItem value="all" className="text-[10px] font-black uppercase tracking-widest">ALL_ENTRIES</SelectItem>
                                <SelectItem value="confirmed" className="text-[10px] font-black uppercase tracking-widest">CONFIRMED</SelectItem>
                                <SelectItem value="shipped" className="text-[10px] font-black uppercase tracking-widest">SHIPPED</SelectItem>
                                <SelectItem value="in transit" className="text-[10px] font-black uppercase tracking-widest">IN_TRANSIT</SelectItem>
                                <SelectItem value="cancelled" className="text-[10px] font-black uppercase tracking-widest">CANCELLED</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <label className="text-[9px] font-black uppercase tracking-widest opacity-40">Date Range</label>
                        <div className="flex gap-2">
                            <input
                                type="date"
                                className="w-full bg-white border border-black/5 h-10 px-3 text-[10px] font-black uppercase tracking-widest focus:outline-none focus:border-black/20"
                                value={dateFilter.from}
                                onChange={(e) => setDateFilter(prev => ({ ...prev, from: e.target.value }))}
                            />
                            <input
                                type="date"
                                className="w-full bg-white border border-black/5 h-10 px-3 text-[10px] font-black uppercase tracking-widest focus:outline-none focus:border-black/20"
                                value={dateFilter.to}
                                onChange={(e) => setDateFilter(prev => ({ ...prev, to: e.target.value }))}
                            />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label className="text-[9px] font-black uppercase tracking-widest opacity-40">Valuation Range (₹)</label>
                        <div className="flex gap-2">
                            <input
                                placeholder="MIN"
                                type="number"
                                className="w-full bg-white border border-black/5 h-10 px-3 text-[10px] font-black uppercase tracking-widest focus:outline-none focus:border-black/20"
                                value={valuationFilter.min}
                                onChange={(e) => setValuationFilter(prev => ({ ...prev, min: e.target.value }))}
                            />
                            <input
                                placeholder="MAX"
                                type="number"
                                className="w-full bg-white border border-black/5 h-10 px-3 text-[10px] font-black uppercase tracking-widest focus:outline-none focus:border-black/20"
                                value={valuationFilter.max}
                                onChange={(e) => setValuationFilter(prev => ({ ...prev, max: e.target.value }))}
                            />
                        </div>
                    </div>
                    <div className="flex items-end">
                        <Button
                            variant="ghost"
                            className="w-full h-10 text-[9px] font-black uppercase tracking-widest hover:bg-black hover:text-white rounded-none border border-black/5"
                            onClick={() => {
                                setStatusFilter("all");
                                setDateFilter({ from: "", to: "" });
                                setValuationFilter({ min: "", max: "" });
                                setSearchQuery("");
                            }}
                        >
                            Reset Cluster Filters
                        </Button>
                    </div>
                </div>
            )}

            <div className="bg-white border border-black/5 shadow-sm mb-20">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse min-w-[1000px]">
                        <thead>
                            <tr className="bg-zinc-50 border-b border-black/5 text-black/40 uppercase text-[9px] lg:text-[10px] tracking-[0.2em] font-black">
                                <th className="px-4 lg:px-8 py-4 lg:py-6">Date</th>
                                <th className="px-4 lg:px-8 py-4 lg:py-6">Identifier</th>
                                <th className="px-4 lg:px-8 py-4 lg:py-6">Counterparty</th>
                                <th className="px-4 lg:px-8 py-4 lg:py-6">Port / Origin</th>
                                <th className="px-4 lg:px-8 py-4 lg:py-6">Valuation</th>
                                <th className="px-4 lg:px-8 py-4 lg:py-6">Status</th>
                                <th className="px-4 lg:px-8 py-4 lg:py-6 text-right">Verification</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-black/5">
                            {loading ? (
                                <tr>
                                    <td colSpan={7} className="px-8 py-24 text-center">
                                        <div className="h-0.5 bg-black/5 w-48 mx-auto relative overflow-hidden">
                                            <div className="absolute inset-0 bg-black/20 animate-progress-ind" />
                                        </div>
                                        <p className="mt-8 text-[9px] font-black uppercase tracking-widest opacity-20">Accessing Secure Ledger...</p>
                                    </td>
                                </tr>
                            ) : orders.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="px-8 py-24 text-center opacity-20 font-black uppercase tracking-widest text-xs">
                                        No transaction history detected in active cluster.
                                    </td>
                                </tr>
                            ) : filteredOrders.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="px-8 py-24 text-center opacity-20 font-black uppercase tracking-widest text-xs">
                                        No matching entries found through active filters.
                                    </td>
                                </tr>
                            ) : filteredOrders.map((order) => (
                                <tr key={order.id} className="hover:bg-zinc-50 transition-all duration-300 group cursor-default border-b border-black/5 last:border-0 opacity-100">
                                    <td className="px-4 lg:px-8 py-4 lg:py-6 text-[9px] lg:text-[10px] font-black tracking-widest text-black/40 whitespace-nowrap">
                                        {new Date(order.created_at).toLocaleDateString()}
                                    </td>
                                    <td className="px-4 lg:px-8 py-4 lg:py-6 text-[10px] lg:text-[11px] font-black uppercase tracking-tighter text-black/60 whitespace-nowrap">
                                        ID_{order.id.toString().padStart(6, '0')}
                                    </td>
                                    <td className="px-4 lg:px-8 py-4 lg:py-6">
                                        <p className="text-xs lg:text-sm font-black uppercase tracking-tight text-black/80 whitespace-nowrap">{order.name}</p>
                                        <p className="text-[8px] lg:text-[9px] opacity-30 uppercase font-bold tracking-widest whitespace-nowrap">{order.email}</p>
                                    </td>
                                    <td className="px-4 lg:px-8 py-4 lg:py-6 text-[9px] lg:text-[10px] font-black uppercase text-black/40 whitespace-nowrap">
                                        {order.port} // {order.country}
                                    </td>
                                    <td className="px-4 lg:px-8 py-4 lg:py-6 font-black text-sm lg:text-base tracking-tighter text-black/80 whitespace-nowrap">
                                        {formatPrice(order.total_amount || 0)}
                                    </td>
                                    <td className="px-4 lg:px-8 py-4 lg:py-6">
                                        <Select
                                            defaultValue={order.status || 'confirmed'}
                                            onValueChange={(val) => handleStatusUpdate(order.id, val)}
                                        >
                                            <SelectTrigger className={`
                                                h-8 w-fit min-w-[100px] border px-2 lg:px-3 py-0.5 lg:py-1 text-[8px] lg:text-[9px] font-black uppercase tracking-widest rounded-none shadow-none focus:ring-0
                                                ${order.status === 'confirmed' ? "bg-green-50 text-green-700 border-green-200" :
                                                    order.status === 'shipped' ? "bg-blue-50 text-blue-700 border-blue-200" :
                                                        order.status === 'in transit' ? "bg-purple-50 text-purple-700 border-purple-200" :
                                                            order.status === 'cancelled' ? "bg-red-50 text-red-700 border-red-200" :
                                                                "bg-zinc-50 text-black/40 border-black/5"
                                                }
                                            `}>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent className="rounded-none border-black/5">
                                                <SelectItem value="confirmed" className="text-[9px] font-black uppercase tracking-widest">CONFIRMED</SelectItem>
                                                <SelectItem value="shipped" className="text-[9px] font-black uppercase tracking-widest">SHIPPED</SelectItem>
                                                <SelectItem value="in transit" className="text-[9px] font-black uppercase tracking-widest">IN_TRANSIT</SelectItem>
                                                <SelectItem value="cancelled" className="text-[9px] font-black uppercase tracking-widest">CANCELLED</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </td>
                                    <td className="px-4 lg:px-8 py-4 lg:py-6 text-right">
                                        <div className="flex justify-end gap-1.5 lg:gap-2">
                                            <Button variant="ghost" size="icon" className="h-8 w-8 lg:h-10 lg:w-10 border border-black/5 rounded-none hover:bg-black hover:text-white transition-all scale-90 lg:scale-100">
                                                <Eye className="h-3.5 lg:h-4 w-3.5 lg:w-4" />
                                            </Button>
                                            <Button variant="ghost" size="icon" className="h-8 w-8 lg:h-10 lg:w-10 border border-black/5 rounded-none hover:bg-black hover:text-white transition-all scale-90 lg:scale-100">
                                                <MoreHorizontal className="h-3.5 lg:h-4 w-3.5 lg:w-4" />
                                            </Button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </AdminLayout>
    );
}

export default withAdminRoute(AdminOrders);
