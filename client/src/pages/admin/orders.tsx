import React, { useEffect, useState } from "react";
import { AdminLayout } from "./layout";
import { withAdminRoute } from "./middleware";
import { supabase } from "@/lib/supabase";
import {
    Search,
    Filter,
    MoreHorizontal,
    Eye
} from "lucide-react";
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
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6 lg:gap-8 mb-8 border-b border-border pb-6">
                <div className="relative w-full lg:w-[450px]">
                    <Search className="absolute left-5 lg:left-6 top-1/2 -translate-y-1/2 h-4 lg:h-5 w-4 lg:w-5 text-muted-foreground" />
                    <input
                        placeholder="FILTER_LEDGER..."
                        className="form-input w-full pl-12 lg:pl-16 text-xs"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <div className="flex gap-4 w-full sm:w-auto">
                    <button
                        onClick={() => setIsFilterVisible(!isFilterVisible)}
                        className={`btn h-14 px-8 text-xs ${isFilterVisible ? 'btn-primary' : 'btn-ghost border border-border'}`}
                    >
                        <Filter className="mr-3 h-4 w-4" /> {isFilterVisible ? 'Hide Filters' : 'Advanced Filters'}
                    </button>
                    <button className="btn btn-primary h-14 px-8 text-xs">
                        Export
                    </button>
                </div>
            </div>

            {isFilterVisible && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 p-6 bg-secondary border border-border rounded-xl mb-8 animate-in fade-in slide-in-from-top-2 duration-300">
                    <div className="space-y-2">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Status</label>
                        <Select value={statusFilter} onValueChange={setStatusFilter}>
                            <SelectTrigger className="form-input bg-card border-border h-11 text-xs uppercase tracking-wider">
                                <SelectValue placeholder="All Statuses" />
                            </SelectTrigger>
                            <SelectContent className="rounded-xl border-border bg-card">
                                <SelectItem value="all" className="text-xs uppercase font-bold tracking-wider">ALL_ENTRIES</SelectItem>
                                <SelectItem value="confirmed" className="text-xs uppercase font-bold tracking-wider">CONFIRMED</SelectItem>
                                <SelectItem value="shipped" className="text-xs uppercase font-bold tracking-wider">SHIPPED</SelectItem>
                                <SelectItem value="in transit" className="text-xs uppercase font-bold tracking-wider">IN_TRANSIT</SelectItem>
                                <SelectItem value="cancelled" className="text-xs uppercase font-bold tracking-wider">CANCELLED</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Date Range</label>
                        <div className="flex gap-2">
                            <input
                                type="date"
                                className="form-input h-11 text-xs px-3"
                                value={dateFilter.from}
                                onChange={(e) => setDateFilter(prev => ({ ...prev, from: e.target.value }))}
                            />
                            <input
                                type="date"
                                className="form-input h-11 text-xs px-3"
                                value={dateFilter.to}
                                onChange={(e) => setDateFilter(prev => ({ ...prev, to: e.target.value }))}
                            />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Valuation Range (₹)</label>
                        <div className="flex gap-2">
                            <input
                                placeholder="MIN"
                                type="number"
                                className="form-input h-11 text-xs px-3"
                                value={valuationFilter.min}
                                onChange={(e) => setValuationFilter(prev => ({ ...prev, min: e.target.value }))}
                            />
                            <input
                                placeholder="MAX"
                                type="number"
                                className="form-input h-11 text-xs px-3"
                                value={valuationFilter.max}
                                onChange={(e) => setValuationFilter(prev => ({ ...prev, max: e.target.value }))}
                            />
                        </div>
                    </div>
                    <div className="flex items-end">
                        <button
                            className="btn btn-ghost w-full h-11 border border-border text-xs"
                            onClick={() => {
                                setStatusFilter("all");
                                setDateFilter({ from: "", to: "" });
                                setValuationFilter({ min: "", max: "" });
                                setSearchQuery("");
                            }}
                        >
                            Reset Cluster Filters
                        </button>
                    </div>
                </div>
            )}

            <div className="card-elite p-0 overflow-hidden mb-20">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse min-w-[1000px]">
                        <thead>
                            <tr className="bg-secondary border-b border-border text-muted-foreground uppercase text-[10px] tracking-[0.2em] font-bold">
                                <th className="px-6 lg:px-8 py-5">Date</th>
                                <th className="px-6 lg:px-8 py-5">Identifier</th>
                                <th className="px-6 lg:px-8 py-5">Counterparty</th>
                                <th className="px-6 lg:px-8 py-5">Port / Origin</th>
                                <th className="px-6 lg:px-8 py-5">Valuation</th>
                                <th className="px-6 lg:px-8 py-5">Status</th>
                                <th className="px-6 lg:px-8 py-5 text-right">Verification</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {loading ? (
                                <tr>
                                    <td colSpan={7} className="px-8 py-24 text-center">
                                        <div className="skeleton h-2 w-48 mx-auto rounded-full mb-4" />
                                        <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Accessing Secure Ledger...</p>
                                    </td>
                                </tr>
                            ) : orders.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="px-8 py-24 text-center text-muted-foreground font-bold uppercase tracking-widest text-xs">
                                        No transaction history detected in active cluster.
                                    </td>
                                </tr>
                            ) : filteredOrders.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="px-8 py-24 text-center text-muted-foreground font-bold uppercase tracking-widest text-xs">
                                        No matching entries found through active filters.
                                    </td>
                                </tr>
                            ) : filteredOrders.map((order) => (
                                <tr key={order.id} className="hover:bg-secondary/20 transition-all duration-300 group cursor-default border-b border-border last:border-0">
                                    <td className="px-6 lg:px-8 py-5 text-xs font-bold tracking-widest text-muted-foreground whitespace-nowrap">
                                        {new Date(order.created_at).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 lg:px-8 py-5 text-xs font-bold uppercase tracking-tighter text-foreground whitespace-nowrap">
                                        ID_{order.id.toString().padStart(6, '0')}
                                    </td>
                                    <td className="px-6 lg:px-8 py-5">
                                        <p className="text-sm font-bold uppercase tracking-tight text-foreground whitespace-nowrap">{order.name}</p>
                                        <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest whitespace-nowrap mt-1">{order.email}</p>
                                    </td>
                                    <td className="px-6 lg:px-8 py-5 text-xs font-bold uppercase text-muted-foreground whitespace-nowrap">
                                        {order.port} // {order.country}
                                    </td>
                                    <td className="px-6 lg:px-8 py-5 font-bold text-sm lg:text-base tracking-tighter text-foreground whitespace-nowrap">
                                        {formatPrice(order.total_amount || 0)}
                                    </td>
                                    <td className="px-6 lg:px-8 py-5">
                                        <Select
                                            defaultValue={order.status || 'confirmed'}
                                            onValueChange={(val) => handleStatusUpdate(order.id, val)}
                                        >
                                            <SelectTrigger className={`
                                                h-9 w-fit min-w-[120px] border px-3 py-1 text-[10px] font-bold uppercase tracking-widest rounded-full shadow-none focus:ring-0
                                                ${order.status === 'confirmed' ? "bg-success-bg text-success border-success/20" :
                                                    order.status === 'shipped' ? "bg-info-bg text-info border-info/20" :
                                                        order.status === 'in transit' ? "bg-warning-bg text-warning border-warning/20" :
                                                            order.status === 'cancelled' ? "bg-error-bg text-error border-error/20" :
                                                                "bg-secondary text-muted-foreground border-border"
                                                }
                                            `}>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent className="rounded-xl border-border bg-card">
                                                <SelectItem value="confirmed" className="text-[10px] font-bold uppercase tracking-widest">CONFIRMED</SelectItem>
                                                <SelectItem value="shipped" className="text-[10px] font-bold uppercase tracking-widest">SHIPPED</SelectItem>
                                                <SelectItem value="in transit" className="text-[10px] font-bold uppercase tracking-widest">IN_TRANSIT</SelectItem>
                                                <SelectItem value="cancelled" className="text-[10px] font-bold uppercase tracking-widest">CANCELLED</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </td>
                                    <td className="px-6 lg:px-8 py-5 text-right">
                                        <div className="flex justify-end gap-2">
                                            <button className="h-10 w-10 border border-border text-muted-foreground hover:bg-primary hover:text-primary-foreground flex items-center justify-center rounded-lg transition-all">
                                                <Eye className="h-4 w-4" />
                                            </button>
                                            <button className="h-10 w-10 border border-border text-muted-foreground hover:bg-primary hover:text-primary-foreground flex items-center justify-center rounded-lg transition-all">
                                                <MoreHorizontal className="h-4 w-4" />
                                            </button>
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
