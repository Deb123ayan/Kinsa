import React, { useState } from "react";
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
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

interface AdminLayoutProps {
    children: React.ReactNode;
    title: string;
}

export function AdminLayout({ children, title }: AdminLayoutProps) {
    const [location] = useLocation();
    const { logout, user } = useAuth();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const menuItems = [
        { href: "/admin", icon: LayoutDashboard, label: "Overview" },
        { href: "/admin/orders", icon: ShoppingBag, label: "Orders" },
        { href: "/admin/payments", icon: CreditCard, label: "Payments" },
        { href: "/admin/products", icon: Box, label: "Products" },
        { href: "/admin/contacts", icon: MessageSquare, label: "Contacts" },
        { href: "/admin/management", icon: Shield, label: "Sec Control" },
    ];

    const SidebarContent = () => (
        <div className="flex flex-col h-full bg-card text-foreground border-r border-border overflow-y-auto">
            <div className="p-6 lg:p-10 shrink-0">
                <div className="flex items-center gap-3 mb-1">
                    <div className="h-10 w-10 bg-primary flex items-center justify-center rounded-sm">
                        <span className="text-primary-foreground font-serif font-black text-2xl">K</span>
                    </div>
                    <span className="font-serif text-2xl font-black tracking-tight">ADMIN</span>
                </div>
                <p className="text-xs text-muted-foreground uppercase tracking-widest font-semibold mt-2">Exim Trade Hub</p>
            </div>

            <nav className="flex-1 mt-4 space-y-1 px-4">
                {menuItems.map((item) => (
                    <Link key={item.href} href={item.href}>
                        <div
                            onClick={() => setIsMobileMenuOpen(false)}
                            className={`
                            flex items-center gap-3 px-4 py-3 cursor-pointer transition-all duration-300 rounded-md group
                            ${location === item.href
                                    ? "bg-primary text-primary-foreground shadow-sm"
                                    : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                                }
                        `}
                        >
                            <item.icon className={`h-4 w-4 transition-transform group-hover:scale-110 ${location === item.href ? "text-primary-foreground" : "text-muted-foreground group-hover:text-foreground"}`} />
                            <span className="text-sm font-medium tracking-wide">{item.label}</span>
                            {location === item.href && <ChevronRight className="ml-auto h-4 w-4 text-primary-foreground" />}
                        </div>
                    </Link>
                ))}
            </nav>

            <div className="p-6 lg:p-8 border-t border-border bg-card mt-auto">
                <div className="flex items-center gap-3 mb-6">
                    <div className="h-10 w-10 border border-border flex items-center justify-center bg-secondary rounded-full overflow-hidden shrink-0">
                        <span className="text-foreground font-serif font-bold text-lg">{user?.email?.[0].toUpperCase()}</span>
                    </div>
                    <div className="min-w-0">
                        <p className="text-sm font-semibold truncate text-foreground">{user?.email}</p>
                        <p className="text-xs text-muted-foreground uppercase tracking-widest font-medium">System Admin</p>
                    </div>
                </div>
                <button
                    className="btn btn-ghost w-full justify-start"
                    onClick={() => logout()}
                >
                    <LogOut className="mr-3 h-4 w-4 group-hover:-translate-x-1 transition-transform" />
                    Term. Session
                </button>
            </div>
        </div>
    );

    return (
        <div className="flex h-screen bg-background text-foreground font-sans">
            {/* Desktop Sidebar */}
            <aside className="hidden lg:flex w-72 flex-col z-20">
                <SidebarContent />
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col overflow-hidden bg-background">
                {/* Header */}
                <header className="h-20 border-b border-border flex items-center justify-between px-6 lg:px-10 bg-card/80 backdrop-blur-md z-10 shrink-0 sticky top-0">
                    <div className="flex items-center gap-4">
                        <div className="lg:hidden">
                            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
                                <SheetTrigger asChild>
                                    <button className="btn btn-ghost p-2 h-10 w-10">
                                        <Menu className="h-5 w-5" />
                                    </button>
                                </SheetTrigger>
                                <SheetContent side="left" className="p-0 w-72 border-r border-border transition-transform duration-500 ease-in-out">
                                    <SidebarContent />
                                </SheetContent>
                            </Sheet>
                        </div>
                        <div className="hidden lg:block w-1 h-8 bg-primary rounded-full" />
                        <h1 className="font-serif text-2xl lg:text-3xl font-bold tracking-tight">{title}</h1>
                    </div>
                    <div className="flex items-center gap-4 lg:gap-8">
                        <div className="text-right hidden sm:block">
                            <p className="text-xs uppercase tracking-widest font-semibold text-muted-foreground mb-1">Global Sync Active</p>
                            <p className="text-sm font-medium text-foreground">{new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: '2-digit', year: 'numeric' })}</p>
                        </div>
                        <div className="h-3 w-3 border border-primary rounded-full flex items-center justify-center animate-pulse">
                            <div className="h-1.5 w-1.5 bg-primary rounded-full" />
                        </div>
                    </div>
                </header>

                {/* Page Area */}
                <div className="flex-1 overflow-y-auto p-6 lg:p-10 custom-scrollbar">
                    <div className="container animate-fade-in">
                        {children}
                    </div>
                </div>
            </main>
        </div>
    );
}
