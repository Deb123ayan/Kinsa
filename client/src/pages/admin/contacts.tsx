import React, { useEffect, useState } from "react";
import { AdminLayout } from "./layout";
import { withAdminRoute } from "./middleware";
import { supabase } from "@/lib/supabase";
import {
    Mail,
    MessageSquare,
    Trash2,
    Clock,
    User,
    Box
} from "lucide-react";

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
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6 lg:gap-8 mb-8 lg:mb-16 border-b border-border pb-6 lg:pb-8">
                <div>
                    <h2 className="display text-4xl lg:text-5xl mb-2 lg:mb-4 text-foreground">Communication</h2>
                    <p className="text-xs uppercase font-bold tracking-[0.4em] text-muted-foreground">Secure channel communication logs</p>
                </div>
                <div className="w-full lg:w-auto">
                    <div className="card-elite p-4 lg:p-6 lg:min-w-[200px] flex items-center justify-between lg:justify-end gap-4 lg:gap-6 shadow-sm">
                        <div>
                            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground mb-1">Total Logs</p>
                            <p className="font-serif text-3xl font-bold tracking-tighter text-foreground">{contacts.length}</p>
                        </div>
                        <div className="h-12 w-12 bg-secondary border border-border rounded-full flex items-center justify-center">
                            <Mail className="h-5 w-5 text-muted-foreground" />
                        </div>
                    </div>
                </div>
            </div>

            <div className="space-y-8 lg:space-y-10 mb-20 stagger">
                {loading ? (
                    <div className="py-32 text-center">
                        <div className="skeleton h-2 w-48 mx-auto relative overflow-hidden rounded-full mb-8" />
                        <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Decrypting Message Vault...</p>
                    </div>
                ) : contacts.length === 0 ? (
                    <div className="card-elite p-40 text-center">
                        <Mail className="h-16 w-16 mx-auto mb-8 text-muted-foreground opacity-50" />
                        <p className="uppercase tracking-[0.3em] text-xs font-bold text-muted-foreground">No active communication threads detected.</p>
                    </div>
                ) : contacts.map((contact) => (
                    <div key={contact.id} className="card-elite p-0 interactive overflow-hidden">
                        <div className="p-6 lg:p-10 flex flex-col lg:flex-row gap-8 lg:gap-12">
                            <div className="flex-1 min-w-0">
                                <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6 mb-8 pb-6 border-b border-border">
                                    <h3 className="font-serif text-2xl font-bold text-foreground leading-none">{contact.name}</h3>
                                    <span className="inline-flex text-[10px] font-bold tracking-widest bg-secondary border border-border text-foreground px-3 py-1 uppercase rounded-full w-fit max-w-full truncate">
                                        {contact.email}
                                    </span>
                                </div>

                                <div className="bg-secondary p-6 lg:p-8 rounded-xl border border-border mb-8 transition-colors duration-500 hover:bg-secondary/50">
                                    <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-4 flex items-center gap-2">
                                        <MessageSquare className="h-4 w-4" /> SUBJ: {contact.subject || 'GENERAL'}
                                    </p>
                                    <p className="text-sm lg:text-base leading-relaxed whitespace-pre-wrap text-foreground/90">{contact.message}</p>
                                </div>

                                <div className="flex flex-wrap items-center gap-x-8 gap-y-4 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                                    <span className="flex items-center gap-2"><Clock className="h-4 w-4" /> {new Date(contact.created_at).toLocaleString()}</span>
                                    <span className="flex items-center gap-2"><User className="h-4 w-4" /> ORG: {contact.company || 'PENDING'}</span>
                                    <span className="flex items-center gap-2"><Box className="h-4 w-4" /> {contact.phone || 'HIDDEN'}</span>
                                </div>
                            </div>

                            <div className="flex flex-row lg:flex-col gap-3 lg:w-48 shrink-0 mt-4 lg:mt-0">
                                <button className="btn btn-primary flex-1 h-14 text-xs">
                                    Respond
                                </button>
                                <button className="btn btn-ghost flex-1 h-14 text-xs">
                                    Archive
                                </button>
                                <button className="h-14 w-14 lg:w-full lg:h-14 flex items-center justify-center rounded-lg border border-border text-muted-foreground hover:bg-error-bg hover:text-error hover:border-error transition-colors shrink-0">
                                    <Trash2 className="h-5 w-5" />
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </AdminLayout>
    );
}

export default withAdminRoute(AdminContacts);
