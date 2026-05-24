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
        img: "",
        images: "",
        specs: "{}"
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
                    img: newProduct.img || "https://images.unsplash.com/photo-1511067007398-7e4b90cfa4bc?q=80&w=600&h=600&fit=crop",
                    images: newProduct.images ? newProduct.images.split(',').map(s => s.trim()).filter(Boolean) : (newProduct.img ? [newProduct.img] : ["https://images.unsplash.com/photo-1511067007398-7e4b90cfa4bc?q=80&w=600&h=600&fit=crop"]),
                    specs: JSON.parse(newProduct.specs || '{}')
                }]);

            if (error) throw error;

            toast({
                title: "LOG_ENTRY: SUCCESS",
                description: "Product committed to database cluster.",
            });

            setIsAddModalOpen(false);
            setNewProduct({ name: "", description: "", code: "", price: "", stock: "", img: "", images: "", specs: "{}" });
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
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6 lg:gap-8 mb-16 border-b border-border pb-6 lg:pb-8">
                <div className="relative w-full lg:w-[450px]">
                    <Search className="absolute left-5 lg:left-6 top-1/2 -translate-y-1/2 h-4 lg:h-5 w-4 lg:w-5 text-muted-foreground" />
                    <input
                        placeholder="FILTER_SKU..."
                        className="form-input w-full pl-12 lg:pl-16 text-xs"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <button
                    onClick={() => setIsAddModalOpen(true)}
                    className="btn btn-primary w-full lg:w-auto h-14 px-8 text-xs uppercase tracking-widest"
                >
                    <Plus className="mr-3 h-5 w-5" /> Commit New SKU
                </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-8 lg:gap-10 stagger">
                {loading ? (
                    <div className="col-span-full py-20 lg:py-40 text-center">
                        <div className="skeleton h-2 w-48 lg:w-64 mx-auto rounded-full mb-6" />
                        <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Synchronizing Ledger...</p>
                    </div>
                ) : filteredProducts.length === 0 ? (
                    <div className="col-span-full card-elite p-40 text-center">
                        <Package className="h-16 w-16 mx-auto mb-8 text-muted-foreground opacity-50" />
                        <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">No matching entries found in system database.</p>
                    </div>
                ) : filteredProducts.map((product) => (
                    <div key={product.id} className="card-elite p-0 interactive overflow-hidden flex flex-col">
                        <div className="aspect-square bg-secondary border-b border-border overflow-hidden relative">
                            <img
                                src={product.image || "https://images.unsplash.com/photo-1511067007398-7e4b90cfa4bc?q=80&w=600&h=600&fit=crop"}
                                alt={product.name}
                                className="w-full h-full object-cover grayscale opacity-80 transition-all duration-700 hover:grayscale-0 hover:opacity-100 hover:scale-105"
                            />
                            <div className="absolute inset-0 bg-black/80 flex items-center justify-center opacity-0 hover:opacity-100 transition-all duration-500 backdrop-blur-sm">
                                <div className="flex flex-col gap-3 w-full px-10">
                                    <button className="btn btn-ghost bg-white text-black hover:bg-black hover:text-white rounded-lg h-11 text-xs">
                                        <Edit2 className="mr-2 h-4 w-4" /> Modify
                                    </button>
                                    <button
                                        onClick={() => handleDeleteProduct(product.id)}
                                        className="btn btn-ghost border-white/30 text-white hover:bg-error hover:border-error rounded-lg h-11 text-xs"
                                    >
                                        <Trash2 className="mr-2 h-4 w-4" /> Purge
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="p-6 flex-1 flex flex-col">
                            <div className="flex justify-between items-start mb-4">
                                <span className="text-[10px] font-bold uppercase border border-border bg-secondary px-3 py-1 rounded-full text-muted-foreground">
                                    {product.code || 'NO-SKU'}
                                </span>
                                <div className="flex items-center gap-1.5 text-[10px] uppercase font-bold text-muted-foreground">
                                    <Box className="h-4 w-4" /> {product.stock || 0} MT
                                </div>
                            </div>
                            <h3 className="font-serif text-lg lg:text-xl font-bold text-foreground leading-tight mb-2 uppercase">{product.name}</h3>
                            <p className="text-xs text-muted-foreground mb-6 line-clamp-2">{product.description}</p>
                            <div className="mt-auto pt-4 border-t border-border flex justify-between items-end">
                                <p className="text-xl lg:text-2xl font-bold tracking-tighter text-foreground">{formatPrice(product.price)}</p>
                                <span className="text-[10px] font-bold text-muted-foreground pb-1">/ UNIT</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Add Product Modal */}
            {isAddModalOpen && (
                <div className="fixed inset-0 bg-background/95 backdrop-blur-md z-50 flex items-center justify-center p-4 lg:p-10 overflow-y-auto">
                    <div className="card-elite w-full max-w-4xl p-6 lg:p-12 relative shadow-2xl my-auto">
                        <button
                            onClick={() => setIsAddModalOpen(false)}
                            className="absolute top-6 right-6 text-muted-foreground hover:text-foreground hover:rotate-90 transition-all p-2"
                        >
                            <X className="h-6 w-6 lg:h-8 lg:w-8" />
                        </button>

                        <div className="mb-8 lg:mb-12">
                            <h2 className="display text-4xl lg:text-5xl mb-2 text-foreground">COMMIT SKU</h2>
                            <p className="text-xs font-bold uppercase tracking-[0.4em] text-muted-foreground">Initialize new inventory entry.</p>
                        </div>

                        <form onSubmit={handleAddProduct} className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">SKU_IDENTIFIER</label>
                                <input
                                    className="form-input w-full"
                                    placeholder="e.g. SPICE-TUR-001"
                                    value={newProduct.code}
                                    onChange={(e) => setNewProduct({ ...newProduct, code: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">PRODUCT_DESIGNATION</label>
                                <input
                                    className="form-input w-full"
                                    placeholder="e.g. Organic Turmeric Powder"
                                    value={newProduct.name}
                                    onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="md:col-span-2 space-y-2">
                                <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">TECHNICAL_DESCRIPTION</label>
                                <textarea
                                    className="form-input w-full min-h-[120px] py-4"
                                    placeholder="Enter full technical specifications and export quality details..."
                                    value={newProduct.description}
                                    onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="md:col-span-2 space-y-2">
                                <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">TECHNICAL_SPECS (JSON)</label>
                                <textarea
                                    className="form-input w-full font-mono text-xs min-h-[120px] py-4"
                                    placeholder='{"Origin": "India", "Grade": "Premium", "Moisture Content": "10-12%", "Purity": "99%"}'
                                    value={newProduct.specs}
                                    onChange={(e) => setNewProduct({ ...newProduct, specs: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">UNIT_VALUATION (INR)</label>
                                <input
                                    type="number"
                                    className="form-input w-full"
                                    placeholder="0.00"
                                    value={newProduct.price}
                                    onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">INVENTORY_QUANTITY (MT)</label>
                                <input
                                    type="number"
                                    className="form-input w-full"
                                    placeholder="0"
                                    value={newProduct.stock}
                                    onChange={(e) => setNewProduct({ ...newProduct, stock: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="md:col-span-2 space-y-2">
                                <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">RESOURCES_CDN_LINK (Primary)</label>
                                <div className="flex gap-4">
                                    <input
                                        className="form-input flex-1"
                                        placeholder="https://image-server.com/resource.jpg"
                                        value={newProduct.img}
                                        onChange={(e) => setNewProduct({ ...newProduct, img: e.target.value })}
                                    />
                                    <div className="w-14 h-14 bg-secondary border border-border rounded-lg flex items-center justify-center text-muted-foreground">
                                        <Upload className="h-5 w-5" />
                                    </div>
                                </div>
                            </div>
                            <div className="md:col-span-2 space-y-2">
                                <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">ADDITIONAL_IMAGES (Comma Separated URLs)</label>
                                <textarea
                                    className="form-input w-full min-h-[80px] py-4"
                                    placeholder="https://img1.jpg, https://img2.jpg..."
                                    value={newProduct.images}
                                    onChange={(e) => setNewProduct({ ...newProduct, images: e.target.value })}
                                />
                            </div>

                            <div className="md:col-span-2 mt-6">
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="btn btn-primary w-full h-16 text-xs uppercase tracking-[0.5em]"
                                >
                                    {isSubmitting ? "TRANSMITTING_DATA..." : "EXECUTE_COMMIT"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}

export default withAdminRoute(AdminProducts);
