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
    Wand2,
    Eye,
    EyeOff
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
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
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-8 mb-12 border-b border-border pb-8">
                <div>
                    <h2 className="display text-primary mb-2">Administrators</h2>
                    <p className="text-sm font-medium tracking-widest uppercase text-muted-foreground">Manage users with system-level clearance</p>
                </div>

                <Sheet open={isAdding} onOpenChange={setIsAdding}>
                    <SheetTrigger asChild>
                        <button className="btn btn-primary shadow-lg animate-fade-in">
                            <Plus className="mr-2 h-4 w-4" /> Provision Admin
                        </button>
                    </SheetTrigger>
                    <SheetContent side="right" className="w-full sm:max-w-md border-l border-border p-0 bg-card text-foreground">
                        <div className="h-full flex flex-col">
                            <div className="p-8 border-b border-border bg-secondary flex justify-between items-center">
                                <h3 className="font-serif text-2xl font-bold tracking-tight">New Credentials</h3>
                                <button onClick={() => setIsAdding(false)} className="text-muted-foreground hover:text-foreground transition-colors">
                                    <X className="h-6 w-6" />
                                </button>
                            </div>

                            <form onSubmit={handleCreateAdmin} className="flex-1 p-8 space-y-8 overflow-y-auto">
                                <div className="space-y-6">
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Identity Email</label>
                                        <div className="relative">
                                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                            <input
                                                type="email"
                                                required
                                                value={formData.email}
                                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                                placeholder="admin@tradehub.com"
                                                className="form-input pl-12"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <div className="flex justify-between items-end">
                                            <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Secret Access Key</label>
                                            <button
                                                type="button"
                                                onClick={generatePassword}
                                                className="text-xs font-bold uppercase tracking-widest flex items-center gap-2 text-primary hover:text-primary/80 transition-colors"
                                            >
                                                <Wand2 className="h-3 w-3" /> Generate
                                            </button>
                                        </div>
                                        <div className="relative">
                                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                            <input
                                                type={showPassword ? "text" : "password"}
                                                required
                                                value={formData.password}
                                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                                placeholder="••••••••"
                                                className="form-input pl-12 pr-12 tracking-widest"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowPassword(!showPassword)}
                                                className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                            >
                                                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                <div className="p-4 bg-secondary border border-border rounded-lg">
                                    <p className="text-xs font-medium text-muted-foreground leading-relaxed">
                                        <strong className="text-foreground">WARNING:</strong> Provisioning an administrator grants full system access. Use high-entropy security protocols.
                                    </p>
                                </div>

                                <button
                                    type="submit"
                                    disabled={isProcessing}
                                    className="btn btn-primary w-full h-14 text-sm tracking-widest shadow-md"
                                >
                                    {isProcessing ? <Loader2 className="h-5 w-5 animate-spin" /> : "Authorize & Commit"}
                                </button>
                            </form>
                        </div>
                    </SheetContent>
                </Sheet>
            </div>

            {/* Admin Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 stagger">
                {loading ? (
                    <div className="col-span-full py-32 text-center">
                        <div className="skeleton h-2 w-48 mx-auto mb-6" />
                        <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Retrieving Security Roster...</p>
                    </div>
                ) : admins.length === 0 ? (
                    <div className="col-span-full card-elite p-32 text-center flex flex-col items-center justify-center">
                        <Shield className="h-16 w-16 text-muted-foreground mb-6 opacity-50" />
                        <p className="uppercase tracking-widest text-sm font-bold text-muted-foreground">No secondary administrators detected.</p>
                    </div>
                ) : admins.map((admin) => (
                    <div key={admin.id} className="card-elite interactive relative overflow-hidden group">
                        <div className="absolute -right-8 -bottom-8 opacity-5 group-hover:opacity-10 transition-opacity rotate-12 pointer-events-none">
                            <Shield className="h-48 w-48 text-primary" />
                        </div>

                        <div className="relative z-10 flex flex-col h-full">
                            <div className="flex justify-between items-start mb-6">
                                <div className="h-14 w-14 border border-border flex items-center justify-center bg-secondary rounded-lg group-hover:bg-primary group-hover:text-primary-foreground transition-colors duration-300">
                                    <UserCircle className="h-6 w-6" />
                                </div>
                                <span className="text-xs font-bold uppercase tracking-widest text-primary bg-primary/10 px-3 py-1 rounded-full">Verified Admin</span>
                            </div>

                            <div className="flex-1 mb-8">
                                <h3 className="text-lg font-bold tracking-tight text-foreground truncate mb-2">{admin.email}</h3>
                                <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-widest text-muted-foreground">
                                    <Mail className="h-3 w-3" /> System Account
                                </div>
                            </div>

                            <div className="flex gap-3 border-t border-border pt-6">
                                <button
                                    onClick={() => setResetDialog({ open: true, adminId: admin.id, email: admin.email })}
                                    className="btn btn-ghost flex-1 text-xs tracking-widest"
                                >
                                    <Key className="mr-2 h-3 w-3" /> Reset
                                </button>
                                <button
                                    onClick={() => handleDeleteAdmin(admin.id, admin.email)}
                                    className="btn btn-ghost border-error text-error hover:bg-error-bg px-4"
                                >
                                    <Trash2 className="h-4 w-4" />
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Reset Password Dialog */}
            <Dialog open={resetDialog.open} onOpenChange={(val) => !val && setResetDialog({ ...resetDialog, open: false })}>
                <DialogContent className="border border-border rounded-xl max-w-md p-0 bg-card shadow-2xl">
                    <div className="p-8 space-y-8">
                        <DialogHeader>
                            <DialogTitle className="font-serif text-2xl font-bold tracking-tight">Credential Update</DialogTitle>
                            <DialogDescription className="text-sm text-muted-foreground mt-2">
                                Generate a new access key for <strong className="text-foreground">{resetDialog.email}</strong>
                            </DialogDescription>
                        </DialogHeader>

                        <div className="space-y-4">
                            <div className="flex justify-between items-end px-1">
                                <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">New Secret Key</label>
                                <button
                                    type="button"
                                    onClick={generatePassword}
                                    className="text-xs font-bold uppercase tracking-widest flex items-center gap-2 text-primary hover:text-primary/80 transition-colors"
                                >
                                    <Wand2 className="h-3 w-3" /> Generate
                                </button>
                            </div>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <input
                                    type={showPassword ? "text" : "password"}
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    placeholder="••••••••"
                                    className="form-input pl-12 pr-12 tracking-[0.25em]"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                >
                                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </button>
                            </div>
                        </div>

                        <div className="p-4 bg-secondary border border-border rounded-lg">
                            <p className="text-sm font-bold text-foreground mb-1">Commit Changes?</p>
                            <p className="text-xs text-muted-foreground leading-relaxed">Existing credentials will be invalidated. Ensure secure communication of new key.</p>
                        </div>

                        <DialogFooter className="flex gap-3">
                            <button
                                onClick={() => setResetDialog({ ...resetDialog, open: false })}
                                className="btn btn-ghost flex-1 text-xs"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleResetPassword}
                                disabled={isProcessing || !newPassword}
                                className="btn btn-primary flex-1 text-xs"
                            >
                                {isProcessing ? <Loader2 className="h-4 w-4 animate-spin" /> : "Commit Key"}
                            </button>
                        </DialogFooter>
                    </div>
                </DialogContent>
            </Dialog>
        </AdminLayout>
    );
}

export default withAdminRoute(AdminManagement);
