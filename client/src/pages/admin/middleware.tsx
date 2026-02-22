import { useAuth } from "@/context/auth-context";
import { useEffect } from "react";
import NotFound from "@/pages/not-found";

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

        // Stealth Security: If not an admin, we act as if the route doesn't exist
        if (!isLoggedIn || !isAdmin) {
            return <NotFound />;
        }

        return <Component {...props} />;
    };
}
