import React from "react";
import { Link, useLocation } from "wouter";
import {
    LayoutDashboard,
    ShoppingBag,
    CreditCard,
    Box,
    MessageSquare,
    LogOut,
    Shield,
    Menu,
    X,
    ChevronRight
} from "lucide-react";
import { useAuth } from "@/context/auth-context";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useState } from "react";

interface AdminLayoutProps {
    children: React.ReactNode;
    title: string;
}

export function AdminLayout({ children, title }: AdminLayoutProps) {
    const [location] = useLocation();
    const { logout, user } = useAuth();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const menuItems = [
        { href: "/admin", icon: LayoutDashboard, label: "OVERVIEW" },
        { href: "/admin/orders", icon: ShoppingBag, label: "ORDERS" },
        { href: "/admin/payments", icon: CreditCard, label: "PAYMENTS" },
        { href: "/admin/products", icon: Box, label: "PRODUCTS" },
        { href: "/admin/contacts", icon: MessageSquare, label: "CONTACTS" },
        { href: "/admin/management", icon: Shield, label: "SEC_CONTROL" },
    ];

    const SidebarContent = () => (
        <div className="flex flex-col h-full bg-white text-black border-r border-black/5 overflow-y-auto">
            <div className="p-6 lg:p-10 shrink-0">
                <div className="flex items-center gap-3 mb-1">
                    <div className="h-10 w-10 bg-black flex items-center justify-center">
                        <span className="text-white font-serif font-black text-2xl">K</span>
                    </div>
                    <span className="font-serif text-2xl font-black tracking-tighter">ADMIN</span>
                </div>
                <p className="text-[9px] text-black/30 uppercase tracking-[0.3em] font-bold">Exim Trade Hub</p>
            </div>

            <nav className="flex-1 mt-4">
                {menuItems.map((item) => (
                    <Link key={item.href} href={item.href}>
                        <div
                            onClick={() => setIsMobileMenuOpen(false)}
                            className={`
                            flex items-center gap-3 lg:gap-4 px-6 lg:px-10 py-4 lg:py-5 cursor-pointer transition-all duration-300 group
                            ${location === item.href
                                    ? "bg-black/5 text-black border-r-4 border-black"
                                    : "text-black/40 hover:text-black hover:bg-black/5"
                                }
                        `}>
                            <item.icon className={`h-4 w-4 transition-transform group-hover:scale-110 ${location === item.href ? "text-black" : "text-black/30 group-hover:text-black"}`} />
                            <span className={`text-[11px] font-black tracking-[0.15em]`}>{item.label}</span>
                            {location === item.href && <ChevronRight className="ml-auto h-3 w-3 text-black" />}
                        </div>
                    </Link>
                ))}
            </nav>

            <div className="p-6 lg:p-8 border-t border-black/5 bg-gradient-to-b from-transparent to-black/5 mt-auto">
                <div className="flex items-center gap-3 mb-6 px-1">
                    <div className="h-10 w-10 border border-black/5 flex items-center justify-center bg-white shadow-sm overflow-hidden shrink-0">
                        <span className="text-black font-serif font-black text-lg opacity-30">{user?.email?.[0].toUpperCase()}</span>
                    </div>
                    <div className="min-w-0">
                        <p className="text-[10px] font-black truncate text-black">{user?.email}</p>
                        <p className="text-[8px] text-black/30 uppercase tracking-widest font-bold">System Admin</p>
                    </div>
                </div>
                <Button
                    variant="ghost"
                    className="w-full border border-black text-black/40 hover:bg-black hover:text-white rounded-none h-12 transition-all group tracking-widest font-black text-[10px] uppercase"
                    onClick={() => logout()}
                >
                    <LogOut className="mr-3 h-4 w-4 group-hover:rotate-45 transition-transform" />
                    Term. Session
                </Button>
            </div>
        </div>
    );

    return (
        <div className="flex h-screen bg-[#F5F5F5] text-black font-sans selection:bg-black selection:text-white">
            {/* Desktop Sidebar */}
            <aside className="hidden lg:flex w-64 flex-col z-20">
                <SidebarContent />
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col overflow-hidden bg-gradient-to-br from-white via-[#F9F9F9] to-[#F0F0F0]">
                {/* Header */}
                <header className="h-16 lg:h-24 border-b border-black/5 flex items-center justify-between px-4 lg:px-16 bg-white/50 backdrop-blur-md z-10 shrink-0">
                    <div className="flex items-center gap-4">
                        <div className="lg:hidden">
                            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
                                <SheetTrigger asChild>
                                    <Button variant="ghost" size="icon" className="h-10 w-10 hover:bg-black hover:text-white rounded-none border border-black/10">
                                        <Menu className="h-5 w-5" />
                                    </Button>
                                </SheetTrigger>
                                <SheetContent side="left" className="p-0 w-64 border-r-4 border-black transition-transform duration-500 ease-in-out">
                                    <SidebarContent />
                                </SheetContent>
                            </Sheet>
                        </div>
                        <div className="hidden lg:block w-1.5 h-12 bg-black" />
                        <h1 className="font-serif text-xl lg:text-3xl font-black uppercase tracking-tighter">{title}</h1>
                    </div>
                    <div className="flex items-center gap-4 lg:gap-8">
                        <div className="text-right hidden sm:block">
                            <p className="text-[8px] lg:text-[9px] uppercase tracking-[0.2em] font-black text-black/20 mb-1 leading-none">Global Sync Active</p>
                            <p className="text-[10px] lg:text-[11px] font-black text-black uppercase">{new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: '2-digit', year: 'numeric' })}</p>
                        </div>
                        <div className="h-3 w-3 border border-black flex items-center justify-center animate-pulse">
                            <div className="h-1 w-1 bg-black" />
                        </div>
                    </div>
                </header>

                {/* Page Area */}
                <div className="flex-1 overflow-y-auto p-4 lg:p-16 custom-scrollbar">
                    {children}
                </div>
            </main>
        </div>
    );
}
