import { useAuth } from "@/context/auth-context";
import { ShieldAlert } from "lucide-react";

export function withAdminRoute<P extends object>(
    Component: React.ComponentType<P>
) {
    return function AdminRoute(props: P) {
        const { isLoggedIn, isAdmin, loading } = useAuth();

        if (loading) {
            return (
                <div className="flex h-screen w-full items-center justify-center bg-black text-white">
                    <div className="animate-pulse text-xl font-serif">Verifying Access Credentials...</div>
                </div>
            );
        }

        // If not an admin, we redirect to login instead of showing 404
        // This makes the admin portal "accessible" but still secured
        if (!isLoggedIn || !isAdmin) {
            return (
                <div className="flex flex-col h-screen w-full items-center justify-center bg-white p-8 text-center space-y-6">
                    <div className="h-20 w-20 border border-black/10 flex items-center justify-center">
                        <ShieldAlert className="h-10 w-10 text-black/20" />
                    </div>
                    <div className="space-y-2">
                        <h2 className="font-serif text-2xl font-black uppercase tracking-tight">Access Restricted</h2>
                        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-black/30">Administrative authorization required</p>
                    </div>
                    <a href="/admin/login" className="h-12 px-10 bg-black text-white flex items-center justify-center font-black uppercase tracking-widest text-[10px] hover:bg-zinc-800 transition-all">
                        Identify Personnel
                    </a>
                </div>
            );
        }

        return <Component {...props} />;
    };
}
