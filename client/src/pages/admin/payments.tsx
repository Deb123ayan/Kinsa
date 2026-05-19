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
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6 lg:gap-8 mb-8 lg:mb-16 border-b border-border pb-6 lg:pb-8">
                <div className="relative w-full lg:w-[450px]">
                    <Search className="absolute left-5 lg:left-6 top-1/2 -translate-y-1/2 h-4 lg:h-5 w-4 lg:w-5 text-muted-foreground" />
                    <input
                        placeholder="GATEWAY_SEARCH..."
                        className="form-input w-full pl-12 lg:pl-16 text-xs"
                    />
                </div>
                <div className="flex items-center gap-4 lg:gap-6 w-full lg:w-auto justify-between lg:justify-end">
                    <div className="text-right">
                        <p className="text-[10px] uppercase font-bold tracking-[0.2em] text-muted-foreground leading-none mb-2">Settlement</p>
                        <p className="text-[10px] lg:text-xs font-bold uppercase tracking-widest bg-secondary px-4 py-2 border border-border rounded-full text-foreground">INR_GATEWAY</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-6 mb-20 stagger">
                {loading ? (
                    <div className="py-32 text-center">
                        <div className="skeleton h-2 w-48 mx-auto rounded-full mb-6" />
                        <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Synchronizing Settlement Ledger...</p>
                    </div>
                ) : payments.length === 0 ? (
                    <div className="card-elite p-40 text-center">
                        <AlertCircle className="h-16 w-16 mx-auto mb-8 text-muted-foreground opacity-50" />
                        <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">No financial records detected in data cluster.</p>
                    </div>
                ) : payments.map((payment) => (
                    <div key={payment.id} className="card-elite p-6 lg:p-10 flex flex-col md:flex-row justify-between items-center interactive group">
                        <div className="flex items-center gap-6 lg:gap-10 w-full md:w-auto mb-6 md:mb-0">
                            <div className="h-12 w-12 lg:h-16 lg:w-16 border border-border flex items-center justify-center bg-secondary rounded-lg group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300">
                                <ShieldCheck className="h-6 w-6 lg:h-8 lg:w-8" />
                            </div>
                            <div className="min-w-0">
                                <div className="flex items-center gap-3 mb-2">
                                    <span className="text-[10px] font-bold uppercase tracking-widest border border-border px-3 py-1 rounded-full bg-secondary">
                                        {payment.razorpay_payment_id || 'PROVISIONED'}
                                    </span>
                                    <span className="text-[10px] font-bold uppercase text-success bg-success-bg px-3 py-1 rounded-full border border-success/20">
                                        PAID
                                    </span>
                                </div>
                                <p className="text-sm lg:text-lg font-bold uppercase tracking-tight text-foreground truncate max-w-[200px] lg:max-w-none">{payment.user_email}</p>
                                <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider mt-1">{new Date(payment.created_at).toLocaleString()}</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-8 lg:gap-12 w-full md:w-auto justify-between md:justify-end border-t border-border md:border-none pt-6 md:pt-0">
                            <div className="text-right">
                                <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest mb-1">Valuation</p>
                                <p className="text-2xl lg:text-3xl font-serif font-bold tracking-tighter text-foreground">{formatPrice(payment.amount / 100)}</p>
                            </div>
                            <button className="h-12 w-12 lg:h-14 lg:w-14 border border-border flex items-center justify-center transition-all bg-secondary hover:bg-primary hover:text-primary-foreground rounded-lg">
                                <ArrowUpRight className="h-5 w-5 lg:h-6 lg:w-6" />
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </AdminLayout>
    );
}

export default withAdminRoute(AdminPayments);
