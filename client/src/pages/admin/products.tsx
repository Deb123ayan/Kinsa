import React, { useEffect, useState } from "react";
import { AdminLayout } from "./layout";
import { withAdminRoute } from "./middleware";
import { supabase } from "@/lib/supabase";
import {
    Plus,
    Edit2,
    Trash2,
    Package,
    Search,
    Box,
    X,
    Upload
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatPrice } from "@/lib/currency";
import { useToast } from "@/hooks/use-toast";
import { fetchProducts, type Product } from "@/services/products";

function AdminProducts() {
    const { toast } = useToast();
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [newProduct, setNewProduct] = useState({
        name: "",
        description: "",
        code: "",
        price: "",
        stock: "",
        img: ""
    });

    const loadProducts = async () => {
        try {
            setLoading(true);
            const data = await fetchProducts();
            setProducts(data);
        } catch (error) {
            console.error("Failed to load admin products:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadProducts();
    }, []);

    const handleAddProduct = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setIsSubmitting(true);
            const { error } = await supabase
                .from("Products")
                .insert([{
                    name: newProduct.name,
                    description: newProduct.description,
                    code: newProduct.code,
                    price: parseFloat(newProduct.price),
                    stock: parseInt(newProduct.stock),
                    img: newProduct.img || "https://images.unsplash.com/photo-1511067007398-7e4b90cfa4bc?q=80&w=600&h=600&fit=crop"
                }]);

            if (error) throw error;

            toast({
                title: "LOG_ENTRY: SUCCESS",
                description: "Product committed to database cluster.",
            });

            setIsAddModalOpen(false);
            setNewProduct({ name: "", description: "", code: "", price: "", stock: "", img: "" });
            loadProducts();
        } catch (error: any) {
            toast({
                title: "LOG_ENTRY: FAIL",
                description: error.message,
                variant: "destructive",
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteProduct = async (id: string) => {
        if (!confirm("CONFIRM_DELETION: Permanent removal of SKU?")) return;
        try {
            const { error } = await supabase
                .from("Products")
                .delete()
                .eq("id", id);

            if (error) throw error;

            toast({
                title: "LOG_ENTRY: DELETED",
                description: "SKU purged from active inventory.",
            });
            loadProducts();
        } catch (error: any) {
            toast({
                title: "LOG_ENTRY: ERR",
                description: error.message,
                variant: "destructive",
            });
        }
    };

    const filteredProducts = products.filter(p =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.code && p.code.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    return (
        <AdminLayout title="Inventory Control">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6 lg:gap-8 mb-8 lg:mb-16 border-b border-black/5 pb-6 lg:pb-8">
                <div className="relative w-full lg:w-[450px]">
                    <Search className="absolute left-5 lg:left-6 top-1/2 -translate-y-1/2 h-4 lg:h-5 w-4 lg:w-5 opacity-20" />
                    <input
                        placeholder="FILTER_SKU..."
                        className="flex h-12 lg:h-14 w-full bg-white border border-black/5 rounded-none px-12 lg:px-16 py-2 text-[10px] lg:text-xs font-black tracking-widest focus:outline-none focus:border-black/20 shadow-sm"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <Button
                    onClick={() => setIsAddModalOpen(true)}
                    className="w-full lg:w-auto bg-black text-white hover:bg-zinc-800 border border-black rounded-none h-12 lg:h-14 px-8 lg:px-12 font-black uppercase tracking-[0.2em] text-[10px] transition-all duration-300 shadow-md"
                >
                    <Plus className="mr-2 lg:mr-3 h-4 lg:h-5 w-4 lg:w-5" /> Commit New SKU
                </Button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-8 lg:gap-10">
                {loading ? (
                    <div className="col-span-full py-20 lg:py-40 text-center">
                        <div className="h-0.5 bg-black/5 w-48 lg:w-64 mx-auto relative overflow-hidden">
                            <div className="absolute inset-0 bg-black/20 animate-progress-ind" />
                        </div>
                        <p className="mt-6 lg:mt-8 text-[8px] lg:text-[9px] font-black uppercase tracking-widest opacity-20">Synchronizing Ledger...</p>
                    </div>
                ) : filteredProducts.length === 0 ? (
                    <div className="col-span-full bg-white border border-black/5 p-40 text-center shadow-sm">
                        <Package className="h-16 w-16 mx-auto mb-8 opacity-5" />
                        <p className="text-[10px] font-black uppercase tracking-widest opacity-20">No matching entries found in system database.</p>
                    </div>
                ) : filteredProducts.map((product) => (
                    <div key={product.id} className="bg-white border border-black/5 flex flex-col group relative overflow-hidden transition-all duration-500 hover:border-black hover:shadow-[0_20px_40px_rgba(0,0,0,0.03)]">
                        <div className="aspect-square bg-zinc-50 border-b border-black/5 overflow-hidden relative">
                            <img
                                src={product.image || "https://images.unsplash.com/photo-1511067007398-7e4b90cfa4bc?q=80&w=600&h=600&fit=crop"}
                                alt={product.name}
                                className="w-full h-full object-cover grayscale opacity-80 transition-all duration-700 group-hover:grayscale-0 group-hover:opacity-100 group-hover:scale-110"
                            />
                            <div className="absolute inset-0 bg-black/80 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-500 backdrop-blur-sm">
                                <div className="flex flex-col gap-3 w-full px-10">
                                    <Button variant="outline" className="w-full bg-white border-white text-black hover:bg-black hover:text-white rounded-none font-black uppercase tracking-widest text-[9px] h-11 transition-all">
                                        <Edit2 className="mr-2 h-3.5 w-3.5" /> Modify
                                    </Button>
                                    <Button
                                        onClick={() => handleDeleteProduct(product.id)}
                                        variant="outline"
                                        className="w-full bg-transparent border-white/30 text-white hover:bg-destructive hover:border-destructive rounded-none font-black uppercase tracking-widest text-[9px] h-11 transition-all"
                                    >
                                        <Trash2 className="mr-2 h-3.5 w-3.5" /> Purge
                                    </Button>
                                </div>
                            </div>
                        </div>

                        <div className="p-5 lg:p-8 flex-1 flex flex-col">
                            <div className="flex justify-between items-start mb-3 lg:mb-4">
                                <span className="text-[8px] lg:text-[9px] font-black uppercase border border-black/10 bg-zinc-50 px-2 lg:px-3 py-1 tracking-widest text-black/40">
                                    {product.code || 'NO-SKU'}
                                </span>
                                <div className="flex items-center gap-1.5 lg:gap-2 text-[8px] lg:text-[9px] uppercase font-black opacity-30">
                                    <Box className="h-3 w-3" /> {product.stock || 0} MT
                                </div>
                            </div>
                            <h3 className="font-serif text-lg lg:text-xl font-black leading-tight mb-2 lg:mb-3 uppercase tracking-tighter text-black/80">{product.name}</h3>
                            <p className="text-[8px] lg:text-[9px] font-bold uppercase opacity-30 mb-4 lg:mb-6 line-clamp-2">{product.description}</p>
                            <div className="mt-auto pt-4 lg:pt-6 border-t border-black/5 flex justify-between items-end">
                                <p className="text-xl lg:text-2xl font-black tracking-tighter text-black/90">{formatPrice(product.price)}</p>
                                <span className="text-[8px] lg:text-[9px] font-black opacity-20 pb-0.5 lg:pb-1">/ UNIT</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Add Product Modal */}
            {isAddModalOpen && (
                <div className="fixed inset-0 bg-white/95 backdrop-blur-md z-50 flex items-center justify-center p-4 lg:p-10 overflow-y-auto">
                    <div className="bg-white w-full max-w-4xl p-6 lg:p-12 relative shadow-2xl border border-black/5 my-auto">
                        <button
                            onClick={() => setIsAddModalOpen(false)}
                            className="absolute top-4 right-4 lg:top-8 lg:right-8 text-black/40 hover:text-black hover:rotate-90 transition-all p-2"
                        >
                            <X className="h-6 w-6 lg:h-8 lg:w-8" />
                        </button>

                        <div className="mb-8 lg:mb-16">
                            <h2 className="font-serif text-2xl lg:text-6xl font-black uppercase tracking-tighter leading-none mb-2 lg:mb-4 text-black">COMMIT SKU</h2>
                            <p className="text-[8px] lg:text-xs font-black uppercase tracking-[0.4em] opacity-30">Initialize new inventory entry.</p>
                        </div>

                        <form onSubmit={handleAddProduct} className="grid grid-cols-1 md:grid-cols-2 gap-x-12 lg:gap-x-16 gap-y-8 lg:gap-y-10">
                            <div className="space-y-3">
                                <label className="text-[9px] lg:text-[10px] font-black uppercase tracking-widest opacity-40">SKU_IDENTIFIER</label>
                                <input
                                    className="w-full bg-zinc-50 border-b-2 border-black/10 p-4 text-xs lg:text-sm font-black focus:outline-none focus:border-black transition-all"
                                    placeholder="e.g. SPICE-TUR-001"
                                    value={newProduct.code}
                                    onChange={(e) => setNewProduct({ ...newProduct, code: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="space-y-3">
                                <label className="text-[9px] lg:text-[10px] font-black uppercase tracking-widest opacity-40">PRODUCT_DESIGNATION</label>
                                <input
                                    className="w-full bg-zinc-50 border-b-2 border-black/10 p-4 text-xs lg:text-sm font-black focus:outline-none focus:border-black transition-all"
                                    placeholder="e.g. Organic Turmeric Powder"
                                    value={newProduct.name}
                                    onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="md:col-span-2 space-y-3">
                                <label className="text-[9px] lg:text-[10px] font-black uppercase tracking-widest opacity-40">TECHNICAL_DESCRIPTION</label>
                                <textarea
                                    className="w-full bg-zinc-50 border-2 border-black/10 p-6 text-xs lg:text-sm font-black focus:outline-none focus:border-black min-h-[120px] transition-all lg:min-h-[150px]"
                                    placeholder="Enter full technical specifications and export quality details..."
                                    value={newProduct.description}
                                    onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="space-y-3">
                                <label className="text-[9px] lg:text-[10px] font-black uppercase tracking-widest opacity-40">UNIT_VALUATION (INR)</label>
                                <input
                                    type="number"
                                    className="w-full bg-zinc-50 border-b-2 border-black/10 p-4 text-xs lg:text-sm font-black focus:outline-none focus:border-black transition-all"
                                    placeholder="0.00"
                                    value={newProduct.price}
                                    onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="space-y-3">
                                <label className="text-[9px] lg:text-[10px] font-black uppercase tracking-widest opacity-40">INVENTORY_QUANTITY (MT)</label>
                                <input
                                    type="number"
                                    className="w-full bg-zinc-50 border-b-2 border-black/10 p-4 text-xs lg:text-sm font-black focus:outline-none focus:border-black transition-all"
                                    placeholder="0"
                                    value={newProduct.stock}
                                    onChange={(e) => setNewProduct({ ...newProduct, stock: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="md:col-span-2 space-y-3">
                                <label className="text-[9px] lg:text-[10px] font-black uppercase tracking-widest opacity-40">RESOURCES_CDN_LINK</label>
                                <div className="flex gap-4">
                                    <input
                                        className="flex-1 bg-zinc-50 border-b-2 border-black/10 p-4 text-xs lg:text-sm font-black focus:outline-none focus:border-black transition-all"
                                        placeholder="https://image-server.com/resource.jpg"
                                        value={newProduct.img}
                                        onChange={(e) => setNewProduct({ ...newProduct, img: e.target.value })}
                                    />
                                    <div className="w-14 h-14 bg-zinc-50 border border-black/10 flex items-center justify-center opacity-30">
                                        <Upload className="h-5 w-5" />
                                    </div>
                                </div>
                            </div>

                            <div className="md:col-span-2 mt-8 lg:mt-10">
                                <Button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="w-full h-16 lg:h-20 bg-black text-white rounded-none font-black text-[10px] lg:text-xs uppercase tracking-[0.5em] hover:bg-zinc-800 disabled:opacity-50 transition-all shadow-lg"
                                >
                                    {isSubmitting ? "TRANSMITTING_DATA..." : "EXECUTE_COMMIT"}
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}

export default withAdminRoute(AdminProducts);
