import { useAuth } from "@/context/auth-context";
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

        // If not logged in or not verified as an admin, we serve the standard NotFound 404 screen.
        // This hides the admin routes completely, ensuring no direct URL probe can expose panel existence.
        if (!isLoggedIn || !isAdmin) {
            return <NotFound />;
        }

        return <Component {...props} />;
    };
}
