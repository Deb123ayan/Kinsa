import React, { useState, useEffect } from "react";
import { ShieldAlert, Loader2 } from "lucide-react";

const ALLOWED_IP = "49.47.154.121";

interface IPGuardProps {
    children: React.ReactNode;
}

export function IPGuard({ children }: IPGuardProps) {
    const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);
    const [loading, setLoading] = useState(true);
    const [clientIp, setClientIp] = useState<string>("");

    useEffect(() => {
        // Allow localhost and local loopbacks for seamless local development
        const hostname = window.location.hostname;
        const isLocal =
            hostname === "localhost" ||
            hostname === "127.0.0.1" ||
            hostname === "[::1]";

        if (isLocal) {
            setIsAuthorized(true);
            setLoading(false);
            return;
        }

        async function verifyIP() {
            try {
                // Primary IP Resolver (ipify)
                const response = await fetch("https://api.ipify.org?format=json");
                if (!response.ok) throw new Error("Primary IP resolver offline");
                const data = await response.json();
                setClientIp(data.ip);
                if (data.ip === ALLOWED_IP) {
                    setIsAuthorized(true);
                } else {
                    setIsAuthorized(false);
                }
            } catch (error) {
                console.warn("IPGuard: Primary resolver failed, invoking fallback...", error);
                try {
                    // Fallback IP Resolver (ipapi)
                    const fallbackResponse = await fetch("https://ipapi.co/json/");
                    if (!fallbackResponse.ok) throw new Error("Fallback IP resolver offline");
                    const fallbackData = await fallbackResponse.json();
                    setClientIp(fallbackData.ip);
                    if (fallbackData.ip === ALLOWED_IP) {
                        setIsAuthorized(true);
                    } else {
                        setIsAuthorized(false);
                    }
                } catch (fallbackError) {
                    console.error("IPGuard: Critical - All IP resolvers offline", fallbackError);
                    // Deny by default for high-level security containment
                    setIsAuthorized(false);
                }
            } finally {
                setLoading(false);
            }
        }

        verifyIP();
    }, []);

    if (loading) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-black text-white p-6">
                <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
                <p className="font-serif text-lg tracking-wider animate-pulse uppercase text-zinc-400">Verifying Gateway Signature...</p>
            </div>
        );
    }

    if (!isAuthorized) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-white p-8 text-center space-y-6">
                <div className="h-20 w-20 border border-red-500/20 flex items-center justify-center bg-red-50 rounded-full animate-pulse">
                    <ShieldAlert className="h-10 w-10 text-red-500" />
                </div>
                <div className="space-y-3 max-w-md">
                    <h2 className="font-serif text-3xl font-black uppercase tracking-tight text-red-600">Access Containment</h2>
                    <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-zinc-400">Security Rule: IP_UNAUTHORIZED</p>
                    <p className="text-xs text-zinc-600 leading-relaxed pt-2">
                        Connection source <span className="font-mono bg-zinc-100 px-2.5 py-1 rounded border border-zinc-200 text-black font-bold">{clientIp || "Unknown Network"}</span> does not match administrative whitelisting policies.
                    </p>
                </div>
                <div className="pt-8 border-t border-zinc-100 w-full max-w-xs text-[9px] uppercase tracking-widest text-zinc-400 font-bold">
                    System event logged under SecOps ID_IP_BLOCKED.
                </div>
            </div>
        );
    }

    return <>{children}</>;
}
