import React, { useEffect, useState } from "react";
import { AdminLayout } from "./layout";
import { withAdminRoute } from "./middleware";
import { supabase } from "@/lib/supabase";
import {
    ShieldCheck,
    AlertCircle,
    ArrowUpRight,
    Search
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { formatPrice } from "@/lib/currency";

function AdminPayments() {
    const [payments, setPayments] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchPayments() {
            const { data, error } = await supabase
                .from('payments')
                .select('*')
                .order('created_at', { ascending: false });

            if (!error && data) {
                setPayments(data);
            }
            setLoading(false);
        }
        fetchPayments();
    }, []);

    return (
        <AdminLayout title="Transaction Logs">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6 lg:gap-8 mb-8 lg:mb-16 border-b border-black/5 pb-6 lg:pb-8">
                <div className="relative w-full lg:w-[450px]">
                    <Search className="absolute left-5 lg:left-6 top-1/2 -translate-y-1/2 h-4 lg:h-5 w-4 lg:w-5 opacity-20" />
                    <input
                        placeholder="GATEWAY_SEARCH..."
                        className="flex h-12 lg:h-14 w-full bg-white border border-black/5 rounded-none px-12 lg:px-16 py-2 text-[10px] lg:text-xs font-black tracking-widest focus:outline-none focus:border-black/20 transition-all shadow-sm"
                    />
                </div>
                <div className="flex items-center gap-4 lg:gap-6 w-full lg:w-auto justify-between lg:justify-end">
                    <div className="text-right">
                        <p className="text-[8px] lg:text-[9px] uppercase font-black tracking-[0.2em] opacity-30 leading-none mb-1 lg:mb-2">Settlement</p>
                        <p className="text-[10px] lg:text-xs font-black uppercase tracking-tighter bg-white px-3 lg:px-4 py-1.5 lg:py-2 border border-black/10 shadow-sm">INR_GATEWAY</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-6 mb-20">
                {loading ? (
                    <div className="py-32 text-center">
                        <div className="h-0.5 bg-black/5 w-48 mx-auto relative overflow-hidden">
                            <div className="absolute inset-0 bg-black/20 animate-progress-ind" />
                        </div>
                        <p className="mt-8 text-[9px] font-black uppercase tracking-widest opacity-20">Synchronizing Settlement Ledger...</p>
                    </div>
                ) : payments.length === 0 ? (
                    <div className="bg-white border border-black/5 p-40 text-center shadow-sm">
                        <AlertCircle className="h-16 w-16 mx-auto mb-8 opacity-5" />
                        <p className="text-[10px] font-black uppercase tracking-widest opacity-20">No financial records detected in data cluster.</p>
                    </div>
                ) : payments.map((payment) => (
                    <div key={payment.id} className="bg-white border border-black/5 p-5 lg:p-10 flex flex-col md:flex-row justify-between items-center group hover:border-black transition-all duration-500 hover:shadow-[0_20px_40px_rgba(0,0,0,0.03)] relative">
                        <div className="flex items-center gap-5 lg:gap-10 w-full md:w-auto mb-6 md:mb-0">
                            <div className={`h-12 w-12 lg:h-16 lg:w-16 border border-black/5 flex items-center justify-center bg-zinc-50 group-hover:bg-black group-hover:text-white transition-all`}>
                                <ShieldCheck className="h-5 w-5 lg:h-8 lg:w-8" />
                            </div>
                            <div className="min-w-0">
                                <div className="flex items-center gap-3 mb-1.5 lg:mb-3">
                                    <span className="text-[8px] lg:text-[10px] font-black uppercase tracking-widest border border-black/10 px-2 lg:px-3 py-0.5 lg:py-1 bg-zinc-50 group-hover:bg-transparent">
                                        {payment.razorpay_payment_id || 'PROVISIONED'}
                                    </span>
                                    <span className="text-[7px] lg:text-[9px] font-black uppercase text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
                                        PAID
                                    </span>
                                </div>
                                <p className="text-sm lg:text-lg font-black uppercase tracking-tighter leading-tight text-black/80 group-hover:text-black truncate max-w-[200px] lg:max-w-none">{payment.user_email}</p>
                                <p className="text-[8px] lg:text-[9px] opacity-30 font-black uppercase tracking-[0.1em] mt-0.5 lg:mt-1">{new Date(payment.created_at).toLocaleString()}</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-8 lg:gap-12 w-full md:w-auto justify-between md:justify-end border-t border-black/5 md:border-none pt-6 md:pt-0">
                            <div className="text-right">
                                <p className="text-[8px] lg:text-[9px] uppercase font-black opacity-20 tracking-widest mb-0.5 lg:mb-1">Valuation</p>
                                <p className="text-2xl lg:text-4xl font-serif font-black tracking-tighter text-black/90">{formatPrice(payment.amount / 100)}</p>
                            </div>
                            <button className="h-10 w-10 lg:h-16 lg:w-16 border border-black/5 flex items-center justify-center transition-all bg-zinc-50 hover:bg-black hover:text-white rounded-none">
                                <ArrowUpRight className="h-4 w-4 lg:h-6 lg:w-6" />
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </AdminLayout>
    );
}

export default withAdminRoute(AdminPayments);
