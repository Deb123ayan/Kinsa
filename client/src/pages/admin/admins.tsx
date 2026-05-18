import React, { useEffect, useState } from "react";
import { AdminLayout } from "./layout";
import { withAdminRoute } from "./middleware";
import { supabase } from "@/lib/supabase";
import {
    Shield,
    Trash2,
    Plus,
    Mail,
    UserCircle,
    Key,
    X,
    Lock,
    Loader2,
    RefreshCw,
    Wand2,
    Eye,
    EyeOff,
    Check
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter
} from "@/components/ui/dialog";

function AdminManagement() {
    const { toast } = useToast();
    const [admins, setAdmins] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isAdding, setIsAdding] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    // Reset Dialog State
    const [resetDialog, setResetDialog] = useState<{ open: boolean, adminId: string, email: string }>({
        open: false,
        adminId: "",
        email: ""
    });
    const [newPassword, setNewPassword] = useState("");

    // Form state
    const [formData, setFormData] = useState({
        email: "",
        password: ""
    });

    const generatePassword = () => {
        const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+";
        const password = Array.from(crypto.getRandomValues(new Uint32Array(12)))
            .map((x) => charset[x % charset.length])
            .join("");

        if (resetDialog.open) {
            setNewPassword(password);
        } else {
            setFormData({ ...formData, password });
        }

        toast({
            title: "Access Key Generated",
            description: "A secure random key has been created."
        });
    };

    const fetchAdmins = async () => {
        setLoading(true);
        try {
            const adminData = JSON.parse(localStorage.getItem('kinsa_admin') || '{}');
            const { data, error } = await supabase.rpc('get_admin_roster', {
                p_caller_id: adminData.id
            });

            if (error) throw error;
            setAdmins(data || []);
        } catch (error) {
            console.error("Failed to fetch admins:", error);
            toast({
                title: "Fetch Failed",
                description: "Could not retrieve administrative roster.",
                variant: "destructive"
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAdmins();
    }, []);

    const handleCreateAdmin = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.email || !formData.password) return;

        setIsProcessing(true);
        try {
            const adminData = JSON.parse(localStorage.getItem('kinsa_admin') || '{}');
            const { data, error } = await supabase.rpc('provision_new_admin', {
                p_caller_id: adminData.id,
                p_email: formData.email,
                p_password: formData.password
            });

            if (error) throw error;

            toast({
                title: "Admin Provisioned",
                description: `Access granted for ${formData.email}`
            });

            setFormData({ email: "", password: "" });
            setIsAdding(false);
            fetchAdmins();
        } catch (error: any) {
            toast({
                title: "Provisioning Failed",
                description: error.message || "Could not create administrative account.",
                variant: "destructive"
            });
        } finally {
            setIsProcessing(false);
        }
    };

    const handleResetPassword = async () => {
        if (!newPassword) return;
        setIsProcessing(true);
        try {
            const adminData = JSON.parse(localStorage.getItem('kinsa_admin') || '{}');
            const { data, error } = await supabase.rpc('reset_admin_password', {
                p_caller_id: adminData.id,
                p_admin_id: resetDialog.adminId,
                p_new_password: newPassword
            });

            if (error) throw error;

            toast({
                title: "Access Updated",
                description: `New key committed for ${resetDialog.email}`
            });

            setResetDialog({ open: false, adminId: "", email: "" });
            setNewPassword("");
        } catch (error: any) {
            toast({
                title: "Reset Failed",
                description: error.message,
                variant: "destructive"
            });
        } finally {
            setIsProcessing(false);
        }
    };

    const handleDeleteAdmin = async (id: string, email: string) => {
        if (!confirm(`Are you sure you want to revoke access for ${email}?`)) return;

        try {
            const adminData = JSON.parse(localStorage.getItem('kinsa_admin') || '{}');
            const { error } = await supabase.rpc('purge_admin_credential', {
                p_caller_id: adminData.id,
                p_admin_id: id
            });

            if (error) throw error;

            toast({
                title: "Access Revoked",
                description: `Administrative credentials for ${email} have been purged.`
            });
            fetchAdmins();
        } catch (error: any) {
            toast({
                title: "Revocation Failed",
                description: error.message,
                variant: "destructive"
            });
        }
    };

    return (
        <AdminLayout title="Security Control">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-8 mb-16 border-b border-black/5 pb-8">
                <div>
                    <h2 className="text-3xl lg:text-5xl font-serif text-black font-black uppercase tracking-tighter leading-none mb-4">Administrators</h2>
                    <p className="text-[9px] lg:text-[10px] uppercase font-black tracking-[0.4em] opacity-30">Manage users with system-level clearance</p>
                </div>

                <Sheet open={isAdding} onOpenChange={setIsAdding}>
                    <SheetTrigger asChild>
                        <Button className="w-full lg:w-auto bg-black text-white rounded-none border border-black hover:bg-zinc-800 font-black uppercase tracking-widest text-[10px] h-14 px-10 transition-all shadow-md">
                            <Plus className="mr-3 h-4 w-4" /> Provision Admin
                        </Button>
                    </SheetTrigger>
                    <SheetContent className="w-full sm:max-w-md border-l border-black/5 p-0">
                        <div className="h-full flex flex-col bg-white">
                            <div className="p-8 border-b border-black/5 bg-zinc-50 text-black flex justify-between items-center">
                                <h3 className="font-serif text-2xl font-black uppercase tracking-tighter">New Credentials</h3>
                                <Button variant="ghost" size="icon" onClick={() => setIsAdding(false)} className="text-black/40 hover:text-black">
                                    <X className="h-6 w-6" />
                                </Button>
                            </div>

                            <form onSubmit={handleCreateAdmin} className="flex-1 p-8 lg:p-10 space-y-10 overflow-y-auto">
                                <div className="space-y-8">
                                    <div className="space-y-3">
                                        <label className="text-[9px] font-black uppercase tracking-widest opacity-40">Identity_Email</label>
                                        <div className="relative">
                                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 opacity-20" />
                                            <Input
                                                type="email"
                                                required
                                                value={formData.email}
                                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                                placeholder="admin@tradehub.com"
                                                className="h-14 pl-12 border-b-2 border-black/10 rounded-none bg-zinc-50 font-black text-xs uppercase tracking-widest focus:border-black transition-all"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        <div className="flex justify-between items-end">
                                            <label className="text-[9px] font-black uppercase tracking-widest opacity-40">Secret_Access_Key</label>
                                            <button
                                                type="button"
                                                onClick={generatePassword}
                                                className="text-[9px] font-black uppercase tracking-widest flex items-center gap-2 hover:opacity-100 opacity-30 transition-opacity"
                                            >
                                                <Wand2 className="h-3 w-3" /> Auto_Generate
                                            </button>
                                        </div>
                                        <div className="relative">
                                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 opacity-20" />
                                            <Input
                                                type={showPassword ? "text" : "password"}
                                                required
                                                value={formData.password}
                                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                                placeholder="••••••••"
                                                className="h-14 pl-12 pr-12 border-b-2 border-black/10 rounded-none bg-zinc-50 font-black text-xs tracking-[0.2em] focus:border-black transition-all"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowPassword(!showPassword)}
                                                className="absolute right-4 top-1/2 -translate-y-1/2 opacity-20 hover:opacity-100"
                                            >
                                                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                <div className="p-6 bg-zinc-50 border border-black/5">
                                    <p className="text-[9px] font-black uppercase tracking-widest opacity-40 leading-relaxed">
                                        WARNING: Provisioning an administrator grants full system access. Use high-entropy security protocols.
                                    </p>
                                </div>

                                <Button
                                    type="submit"
                                    disabled={isProcessing}
                                    className="w-full h-16 bg-black text-white font-black uppercase tracking-[0.2em] text-[10px] rounded-none hover:bg-zinc-800 transition-all shadow-lg disabled:opacity-50"
                                >
                                    {isProcessing ? <Loader2 className="h-5 w-5 animate-spin" /> : "Authorize & Commit"}
                                </Button>
                            </form>
                        </div>
                    </SheetContent>
                </Sheet>
            </div>

            {/* Admin Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-10">
                {loading ? (
                    <div className="col-span-full py-32 text-center">
                        <div className="h-0.5 bg-black/5 w-48 mx-auto relative overflow-hidden">
                            <div className="absolute inset-0 bg-black/20 animate-progress-ind" />
                        </div>
                        <p className="mt-8 text-[9px] font-black uppercase tracking-widest opacity-20">Retrieving Security Roster...</p>
                    </div>
                ) : admins.length === 0 ? (
                    <div className="col-span-full bg-white border border-black/5 p-40 text-center shadow-sm">
                        <Shield className="h-16 w-16 mx-auto mb-8 opacity-5" />
                        <p className="uppercase tracking-[0.3em] text-[10px] font-black opacity-20">No secondary administrators detected.</p>
                    </div>
                ) : admins.map((admin) => (
                    <div key={admin.id} className="bg-white border border-black/5 group hover:border-black transition-all duration-500 hover:shadow-[0_20px_40px_rgba(0,0,0,0.03)] relative overflow-hidden">
                        <div className="absolute -right-8 -bottom-8 opacity-[0.02] group-hover:opacity-[0.05] transition-opacity rotate-12">
                            <Shield className="h-48 w-48" />
                        </div>

                        <div className="p-8 lg:p-10 relative z-10">
                            <div className="flex justify-between items-start mb-8">
                                <div className="h-14 w-14 lg:h-16 lg:w-16 border border-black/5 flex items-center justify-center bg-zinc-50 group-hover:bg-black group-hover:text-white transition-all">
                                    <UserCircle className="h-6 w-6 lg:h-8 lg:w-8" />
                                </div>
                                <span className="text-[9px] font-black uppercase tracking-[0.2em] opacity-30">Verified Admin</span>
                            </div>

                            <div className="mb-10">
                                <h3 className="text-lg lg:text-xl font-black uppercase tracking-tighter truncate mb-2 text-black/80">{admin.email}</h3>
                                <div className="flex items-center gap-3 text-[9px] font-black uppercase tracking-[0.1em] text-black/40">
                                    <Mail className="h-3 w-3" /> System Account
                                </div>
                            </div>

                            <div className="flex gap-4 border-t border-black/5 pt-8 mt-4">
                                <Button
                                    variant="ghost"
                                    onClick={() => setResetDialog({ open: true, adminId: admin.id, email: admin.email })}
                                    className="flex-1 border border-black/5 rounded-none h-12 text-[9px] font-black uppercase tracking-widest hover:bg-black hover:text-white transition-all"
                                >
                                    <Key className="mr-2 h-3 w-3" /> Reset
                                </Button>
                                <Button
                                    variant="ghost"
                                    onClick={() => handleDeleteAdmin(admin.id, admin.email)}
                                    className="border border-black/5 hover:bg-destructive hover:text-white rounded-none h-12 w-12 flex items-center justify-center transition-all"
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Reset Password Dialog */}
            <Dialog open={resetDialog.open} onOpenChange={(val) => !val && setResetDialog({ ...resetDialog, open: false })}>
                <DialogContent className="border border-black/10 rounded-none max-w-lg p-0 bg-white shadow-2xl">
                    <div className="p-8 lg:p-10 space-y-10">
                        <DialogHeader>
                            <DialogTitle className="font-serif text-3xl font-black uppercase tracking-tighter text-black">Credential Update</DialogTitle>
                            <DialogDescription className="text-[10px] font-black uppercase tracking-widest text-black/40">
                                Generate a new access key for <span className="text-black">{resetDialog.email}</span>
                            </DialogDescription>
                        </DialogHeader>

                        <div className="space-y-4">
                            <div className="flex justify-between items-end px-1">
                                <label className="text-[9px] font-black uppercase tracking-widest opacity-40">New Secret Key</label>
                                <button
                                    type="button"
                                    onClick={generatePassword}
                                    className="text-[9px] font-black uppercase tracking-widest flex items-center gap-2 hover:opacity-100 opacity-30 transition-opacity"
                                >
                                    <Wand2 className="h-3 w-3" /> Auto_Generate
                                </button>
                            </div>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 opacity-20" />
                                <Input
                                    type={showPassword ? "text" : "password"}
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    placeholder="••••••••"
                                    className="h-14 pl-12 pr-12 border-b-2 border-black/10 rounded-none bg-zinc-50 font-black text-xs tracking-[0.5em] focus:border-black transition-all"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 opacity-20 hover:opacity-100"
                                >
                                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </button>
                            </div>
                        </div>

                        <div className="p-6 bg-zinc-50 border border-black/5 space-y-3">
                            <p className="text-[10px] font-black uppercase tracking-widest text-black/80">Commit Changes?</p>
                            <p className="text-[9px] opacity-40 leading-relaxed uppercase">Existing credentials will be invalidated. Ensure secure communication of new key.</p>
                        </div>

                        <DialogFooter className="flex-col sm:flex-row gap-3 pt-4">
                            <Button
                                variant="ghost"
                                onClick={() => setResetDialog({ ...resetDialog, open: false })}
                                className="border border-black/5 rounded-none h-14 font-black uppercase tracking-widest text-[9px] flex-1 sm:flex-none"
                            >
                                Cancel
                            </Button>
                            <Button
                                onClick={handleResetPassword}
                                disabled={isProcessing || !newPassword}
                                className="flex-1 bg-black text-white hover:bg-zinc-800 border border-black rounded-none h-14 font-black uppercase tracking-widest text-[9px] shadow-lg"
                            >
                                {isProcessing ? <Loader2 className="h-5 w-5 animate-spin" /> : "Commit New Key"}
                            </Button>
                        </DialogFooter>
                    </div>
                </DialogContent>
            </Dialog>
        </AdminLayout>
    );
}

export default withAdminRoute(AdminManagement);
