import React, { useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/context/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { ShieldCheck, ArrowRight, Loader2 } from "lucide-react";

export default function AdminLogin() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { adminLogin } = useAuth();
    const [, setLocation] = useLocation();
    const { toast } = useToast();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            await adminLogin(email, password);
            // Success - useAuth effect will handle checking admin status
            // but we'll point them towards the dashboard
            toast({
                title: "Access Granted",
                description: "Verifying administrative credentials...",
            });
            setLocation("/admin");
        } catch (error: any) {
            toast({
                title: "Access Denied",
                description: error.message || "Invalid administrative credentials.",
                variant: "destructive",
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-white via-[#F9F9F9] to-[#F5F5F5] flex flex-col items-center justify-center p-6 selection:bg-black selection:text-white">
            <div className="w-full max-w-md">
                {/* Logo/Brand Area */}
                <div className="flex flex-col items-center mb-12">
                    <div className="h-16 w-16 bg-white border border-black/5 shadow-2xl flex items-center justify-center mb-6">
                        <ShieldCheck className="h-10 w-10 text-black/80" />
                    </div>
                    <h1 className="font-serif text-3xl lg:text-4xl font-black text-black uppercase tracking-tighter leading-none">
                        KINSA <span className="text-black/20 italic">Admin</span>
                    </h1>
                    <p className="text-[9px] text-black/40 font-black uppercase tracking-[0.4em] mt-4">Login</p>
                </div>

                {/* Login Form Container */}
                <div className="bg-white p-8 lg:p-12 border border-black/5 shadow-[0_20px_50px_rgba(0,0,0,0.04)] relative">
                    <div className="absolute top-0 left-0 w-full h-1.5 bg-black" />

                    <form onSubmit={handleSubmit} className="space-y-8">
                        <div className="space-y-3">
                            <Label htmlFor="email" className="text-[10px] font-black uppercase tracking-widest text-black/40">
                                IDENTITY_ID / EMAIL
                            </Label>
                            <Input
                                id="email"
                                type="email"
                                required
                                className="h-14 border border-black/10 rounded-none bg-zinc-50 font-black text-xs uppercase tracking-widest focus-visible:ring-0 focus-visible:border-black placeholder:text-black/10 transition-all"
                                placeholder="ADMIN@TRADEHUB.COM"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>

                        <div className="space-y-3">
                            <Label htmlFor="password" id="password_id" className="text-[10px] font-black uppercase tracking-widest text-black/40">
                                Password
                            </Label>
                            <Input
                                id="password"
                                type="password"
                                required
                                className="h-14 border border-black/10 rounded-none bg-zinc-50 font-black text-xs tracking-[0.2em] focus-visible:ring-0 focus-visible:border-black transition-all"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>

                        <Button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full h-16 bg-black text-white hover:bg-zinc-800 font-black uppercase tracking-[0.3em] text-[10px] rounded-none group transition-all shadow-lg"
                        >
                            {isSubmitting ? (
                                <Loader2 className="h-5 w-5 animate-spin" />
                            ) : (
                                <div className="flex items-center">
                                    Login <ArrowRight className="ml-3 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                                </div>
                            )}
                        </Button>
                    </form>
                </div>

                {/* Security Footer */}
                <div className="mt-12 text-center text-[9px] text-black/20 font-black uppercase tracking-widest space-y-3 px-8">
                    <p className="border-b border-black/5 pb-3">Authorized Personnel Access Only</p>
                    <p className="opacity-0 lg:opacity-100 transition-opacity">System auditing is active. All interactions are cryptographically logged.</p>
                </div>
            </div>
        </div>
    );
}
