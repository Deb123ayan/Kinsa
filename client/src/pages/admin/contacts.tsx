import React, { useEffect, useState } from "react";
import { AdminLayout } from "./layout";
import { withAdminRoute } from "./middleware";
import { supabase } from "@/lib/supabase";
import {
    Mail,
    MessageSquare,
    Trash2,
    Archive,
    ArrowRight,
    Clock,
    User,
    Box
} from "lucide-react";
import { Button } from "@/components/ui/button";

function AdminContacts() {
    const [contacts, setContacts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchContacts() {
            const { data, error } = await supabase
                .from('contact_us')
                .select('*')
                .order('created_at', { ascending: false });

            if (!error && data) {
                setContacts(data);
            }
            setLoading(false);
        }
        fetchContacts();
    }, []);

    return (
        <AdminLayout title="Communication Hub">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6 lg:gap-8 mb-8 lg:mb-16 border-b border-black/5 pb-6 lg:pb-8">
                <div>
                    <h2 className="text-2xl lg:text-5xl font-serif font-black uppercase tracking-tighter leading-none mb-2 lg:mb-4 text-black">Communication</h2>
                    <p className="text-[8px] lg:text-[10px] uppercase font-black tracking-[0.4em] opacity-30">Secure channel communication logs</p>
                </div>
                <div className="w-full lg:w-auto">
                    <div className="flex items-center justify-between lg:justify-end gap-4 lg:gap-6 bg-white border border-black/5 p-4 lg:p-6 lg:min-w-[200px] shadow-sm">
                        <div>
                            <p className="text-[8px] lg:text-[9px] font-black uppercase tracking-[0.2em] opacity-20 mb-1 lg:mb-2">Total Logs</p>
                            <p className="text-2xl lg:text-3xl font-black tracking-tighter text-black/90">{contacts.length}</p>
                        </div>
                        <div className="h-10 w-10 bg-zinc-50 border border-black/5 flex items-center justify-center">
                            <Mail className="h-4 w-4 opacity-40" />
                        </div>
                    </div>
                </div>
            </div>

            <div className="space-y-8 lg:space-y-10 mb-20">
                {loading ? (
                    <div className="py-32 text-center">
                        <div className="h-0.5 bg-black/5 w-48 mx-auto relative overflow-hidden">
                            <div className="absolute inset-0 bg-black/20 animate-progress-ind" />
                        </div>
                        <p className="mt-8 text-[9px] font-black uppercase tracking-widest opacity-20">Decrypting Message Vault...</p>
                    </div>
                ) : contacts.length === 0 ? (
                    <div className="bg-white border border-black/5 p-40 text-center shadow-sm">
                        <Mail className="h-16 w-16 mx-auto mb-8 opacity-5" />
                        <p className="uppercase tracking-[0.3em] text-[10px] font-black opacity-20">No active communication threads detected.</p>
                    </div>
                ) : contacts.map((contact) => (
                    <div key={contact.id} className="bg-white border border-black/5 transition-all duration-300 group hover:border-black hover:shadow-[0_20px_40px_rgba(0,0,0,0.03)]">
                        <div className="p-5 lg:p-10 flex flex-col lg:flex-row gap-6 lg:gap-12">
                            <div className="flex-1 min-w-0">
                                <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6 mb-6 lg:mb-8 pb-4 lg:pb-6 border-b border-black/5">
                                    <h3 className="text-lg lg:text-2xl font-black uppercase tracking-tighter leading-none text-black/80">{contact.name}</h3>
                                    <span className="inline-flex text-[8px] lg:text-[10px] font-black tracking-widest bg-zinc-50 border border-black/5 text-black/40 px-2 lg:px-3 py-1 uppercase w-fit truncate max-w-full">{contact.email}</span>
                                </div>

                                <div className="bg-zinc-50 p-5 lg:p-8 border-l-4 border-black/10 mb-6 lg:mb-8 group-hover:border-black transition-all duration-500">
                                    <p className="text-[8px] lg:text-[9px] font-black uppercase tracking-widest opacity-30 mb-3 flex items-center gap-2">
                                        <MessageSquare className="h-3 w-3" /> SUBJ: {contact.subject || 'GENERAL'}
                                    </p>
                                    <p className="text-xs lg:text-base font-bold leading-relaxed whitespace-pre-wrap text-black/70">{contact.message}</p>
                                </div>

                                <div className="flex flex-wrap items-center gap-x-6 lg:gap-x-8 gap-y-3 lg:gap-y-4 text-[8px] lg:text-[9px] font-black uppercase tracking-widest opacity-30">
                                    <span className="flex items-center gap-1.5"><Clock className="h-3 w-3" /> {new Date(contact.created_at).toLocaleString()}</span>
                                    <span className="flex items-center gap-1.5"><User className="h-3 w-3" /> ORG: {contact.company || 'PENDING'}</span>
                                    <span className="flex items-center gap-1.5"><Box className="h-3 w-3" /> {contact.phone || 'HIDDEN'}</span>
                                </div>
                            </div>

                            <div className="flex flex-row lg:flex-col gap-2 lg:w-56 shrink-0 mt-2 lg:mt-0">
                                <Button className="flex-1 bg-black text-white rounded-none border border-black hover:bg-zinc-800 font-black uppercase tracking-widest text-[8px] lg:text-[9px] h-12 lg:h-14 shadow-md transition-all">
                                    Respond
                                </Button>
                                <Button variant="ghost" className="flex-1 border border-black/5 rounded-none hover:bg-black hover:text-white font-black uppercase tracking-widest text-[8px] lg:text-[9px] h-12 lg:h-14 transition-all">
                                    Archive
                                </Button>
                                <Button variant="ghost" size="icon" className="w-12 h-12 lg:w-auto lg:h-14 border border-black/5 rounded-none hover:bg-destructive hover:text-white hover:border-destructive transition-all shrink-0">
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </AdminLayout>
    );
}

export default withAdminRoute(AdminContacts);
