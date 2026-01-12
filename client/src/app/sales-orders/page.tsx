"use client";

import { useState } from "react";
import {
    Plus,
    Search,
    Calendar,
    Truck,
    Package,
    Trash2,
    Edit2,
    X,
    CheckCircle2,
    FileText,
    AlertCircle,
    ArrowLeft,
    TrendingUp
} from "lucide-react";
import { useSalesOrders, useCreateSalesOrder, useUpdateSalesOrder, useDeleteSalesOrder } from "@/hooks/useSalesOrders";
import { useCustomers } from "@/hooks/useCustomers";
import { useProducts } from "@/hooks/useProducts";
import { format } from "date-fns";

export default function SalesOrdersPage() {
    const [selectedSO, setSelectedSO] = useState<any>(null);
    const [isAdding, setIsAdding] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [editingSO, setEditingSO] = useState<any>(null);

    const { data: sos = [], isLoading } = useSalesOrders();
    const { data: customers = [] } = useCustomers();
    const { data: products = [] } = useProducts();
    const createSO = useCreateSalesOrder();
    const updateSO = useUpdateSalesOrder();
    const deleteSO = useDeleteSalesOrder();

    const [formData, setFormData] = useState({
        customerId: "",
        date: format(new Date(), 'yyyy-MM-dd'),
        items: [{ productId: "", quantity: 1, unitPrice: 0 }]
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editingSO) {
                await updateSO.mutateAsync({ id: editingSO.id, data: formData });
            } else {
                await createSO.mutateAsync(formData);
            }
            setIsAdding(false);
            setEditingSO(null);
            setFormData({
                customerId: "",
                date: format(new Date(), 'yyyy-MM-dd'),
                items: [{ productId: "", quantity: 1, unitPrice: 0 }]
            });
        } catch (error) {
            console.error("Failed to save SO:", error);
        }
    };

    const handleUpdateStatus = async (id: string, status: string) => {
        try {
            await updateSO.mutateAsync({ id, data: { status } });
            if (selectedSO?.id === id) {
                setSelectedSO((prev: any) => ({ ...prev, status }));
            }
        } catch (error: any) {
            alert(error.response?.data?.message || "Failed to update status");
        }
    };

    const handleEdit = (so: any) => {
        setEditingSO(so);
        setFormData({
            customerId: so.customerId,
            date: so.date ? format(new Date(so.date), 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd'),
            items: so.items.map((i: any) => ({
                productId: i.productId,
                quantity: i.quantity,
                unitPrice: i.unitPrice
            }))
        });
        setIsAdding(true);
    };

    const handleDelete = async (id: string) => {
        if (confirm("Delete this sales order?")) {
            await deleteSO.mutateAsync(id);
            if (selectedSO?.id === id) setSelectedSO(null);
        }
    };

    const addItem = () => {
        setFormData({
            ...formData,
            items: [...formData.items, { productId: "", quantity: 1, unitPrice: 0 }]
        });
    };

    const removeItem = (index: number) => {
        setFormData({
            ...formData,
            items: formData.items.filter((_, i) => i !== index)
        });
    };

    const updateItem = (index: number, field: string, value: any) => {
        const newItems = [...formData.items];
        (newItems[index] as any)[field] = value;

        if (field === 'productId') {
            const product = products.find(p => p.id === value);
            if (product) newItems[index].unitPrice = product.price;
        }

        setFormData({ ...formData, items: newItems });
    };

    const filteredSOs = sos.filter(so =>
        so.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        so.customer.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'DRAFT': return 'bg-slate-100 text-slate-600';
            case 'SHIPPED': return 'bg-blue-100 text-blue-600';
            case 'DELIVERED': return 'bg-emerald-100 text-emerald-600';
            case 'CANCELLED': return 'bg-red-100 text-red-600';
            default: return 'bg-slate-100 text-slate-600';
        }
    };

    return (
        <div className="flex flex-col lg:flex-row h-[calc(100vh-160px)] gap-8 max-w-[1600px] mx-auto">
            {/* Sidebar List */}
            <div className="w-full lg:w-[450px] flex flex-col space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-3xl font-black text-slate-900 tracking-tight">Sales</h2>
                        <p className="text-sm text-slate-500 font-medium">Customer orders and fulfillment.</p>
                    </div>
                    <button
                        onClick={() => { setEditingSO(null); setIsAdding(true); }}
                        className="p-4 bg-slate-900 text-white rounded-2xl hover:shadow-xl hover:shadow-slate-900/20 active:scale-95 transition-all"
                    >
                        <Plus className="w-5 h-5" />
                    </button>
                </div>

                <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Search orders..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-11 pr-4 py-4 bg-white border border-slate-100 rounded-[20px] text-sm focus:outline-none focus:ring-4 focus:ring-slate-900/5 transition-all font-medium shadow-sm"
                    />
                </div>

                <div className="flex-1 overflow-y-auto pr-1 space-y-3 custom-scrollbar">
                    {isLoading ? (
                        [1, 2, 3].map(i => <div key={i} className="h-24 bg-white animate-pulse rounded-[24px]" />)
                    ) : filteredSOs.length === 0 ? (
                        <div className="text-center py-20 bg-slate-50/50 rounded-[32px] border-2 border-dashed border-slate-100">
                            <p className="text-slate-400 font-bold">No orders found.</p>
                        </div>
                    ) : (
                        filteredSOs.map((so) => (
                            <div
                                key={so.id}
                                onClick={() => setSelectedSO(so)}
                                className={`p-6 rounded-[24px] cursor-pointer transition-all border ${selectedSO?.id === so.id
                                        ? "bg-slate-900 border-slate-900 text-white shadow-xl shadow-slate-900/10 translate-x-1"
                                        : "bg-white border-slate-100 hover:border-slate-300 text-slate-900"
                                    }`}
                            >
                                <div className="flex justify-between items-start mb-3">
                                    <span className="text-[10px] font-black tracking-widest uppercase opacity-60">{so.orderNumber}</span>
                                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest ${selectedSO?.id === so.id ? 'bg-white/20 text-white' : getStatusColor(so.status)
                                        }`}>
                                        {so.status}
                                    </span>
                                </div>
                                <h4 className="font-black text-lg mb-1 truncate">{so.customer.name}</h4>
                                <div className="flex justify-between items-end">
                                    <span className="text-xs font-bold opacity-60">
                                        {format(new Date(so.date), 'MMM d, yyyy')}
                                    </span>
                                    <span className="text-lg font-black">${so.totalAmount.toLocaleString()}</span>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 min-h-0">
                {selectedSO ? (
                    <div className="h-full bg-white rounded-[40px] border border-slate-100 shadow-sm overflow-hidden flex flex-col animate-in slide-in-from-right-4 duration-300">
                        {/* Header */}
                        <div className="p-10 border-b border-slate-50 flex flex-col md:flex-row md:items-center justify-between gap-6 bg-slate-50/30">
                            <div className="flex items-center gap-6">
                                <div className="w-16 h-16 bg-white border border-slate-100 rounded-[24px] flex items-center justify-center shadow-sm">
                                    <TrendingUp className="w-8 h-8 text-slate-900" />
                                </div>
                                <div>
                                    <div className="flex items-center gap-3 mb-1">
                                        <h3 className="text-2xl font-black text-slate-900 tracking-tight">{selectedSO.orderNumber}</h3>
                                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${getStatusColor(selectedSO.status)}`}>
                                            {selectedSO.status}
                                        </span>
                                    </div>
                                    <p className="text-sm text-slate-500 font-medium">Customer: <span className="text-slate-900 font-black">{selectedSO.customer.name}</span></p>
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                {selectedSO.status === 'DRAFT' && (
                                    <>
                                        <button
                                            onClick={() => handleEdit(selectedSO)}
                                            className="p-2.5 bg-white border border-slate-100 text-slate-400 hover:text-slate-900 rounded-xl transition-all"
                                            title="Edit Order"
                                        >
                                            <Edit2 className="w-5 h-5" />
                                        </button>
                                        <button
                                            onClick={() => handleUpdateStatus(selectedSO.id, 'SHIPPED')}
                                            className="px-6 py-2.5 bg-slate-900 text-white rounded-xl font-bold text-sm hover:shadow-lg hover:shadow-slate-900/20 active:scale-95 transition-all"
                                        >
                                            Ship Order
                                        </button>
                                    </>
                                )}
                                {selectedSO.status === 'SHIPPED' && (
                                    <button
                                        onClick={() => handleUpdateStatus(selectedSO.id, 'DELIVERED')}
                                        className="px-6 py-2.5 bg-emerald-600 text-white rounded-xl font-bold text-sm hover:shadow-lg hover:shadow-emerald-600/20 active:scale-95 transition-all flex items-center gap-2"
                                    >
                                        <CheckCircle2 className="w-4 h-4" /> Mark as Delivered
                                    </button>
                                )}
                                {['DRAFT', 'SHIPPED'].includes(selectedSO.status) && (
                                    <>
                                        <button
                                            onClick={() => handleUpdateStatus(selectedSO.id, 'CANCELLED')}
                                            className="px-6 py-2.5 bg-white text-orange-600 border border-orange-100 rounded-xl font-bold text-sm hover:bg-orange-50 active:scale-95 transition-all"
                                        >
                                            Cancel Order
                                        </button>
                                        {selectedSO.status === 'DRAFT' && (
                                            <button
                                                onClick={() => handleDelete(selectedSO.id)}
                                                className="p-2.5 bg-white border border-red-100 text-red-400 hover:text-red-600 rounded-xl transition-all"
                                                title="Delete Order"
                                            >
                                                <Trash2 className="w-5 h-5" />
                                            </button>
                                        )}
                                    </>
                                )}
                            </div>
                        </div>

                        {/* Items Table */}
                        <div className="flex-1 overflow-y-auto p-10">
                            <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] mb-6">Order Items</h4>
                            <div className="border border-slate-50 rounded-[32px] overflow-hidden">
                                <table className="w-full text-left">
                                    <thead className="bg-slate-50 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-50">
                                        <tr>
                                            <th className="px-8 py-4">Product</th>
                                            <th className="px-8 py-4">SKU</th>
                                            <th className="px-8 py-4 text-center">Qty</th>
                                            <th className="px-8 py-4 text-right">Price</th>
                                            <th className="px-8 py-4 text-right">Total</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-50 font-bold text-slate-700">
                                        {selectedSO.items.map((item: any) => (
                                            <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                                                <td className="px-8 py-5">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center">
                                                            <Package className="w-5 h-5 text-slate-400" />
                                                        </div>
                                                        <span className="font-black text-slate-900">{item.product.name}</span>
                                                    </div>
                                                </td>
                                                <td className="px-8 py-5 text-xs font-mono text-slate-400">{item.product.sku}</td>
                                                <td className="px-8 py-5 text-center">{item.quantity}</td>
                                                <td className="px-8 py-5 text-right">${item.unitPrice.toLocaleString()}</td>
                                                <td className="px-8 py-5 text-right font-black text-slate-900">${(item.quantity * item.unitPrice).toLocaleString()}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                    <tfoot className="bg-slate-50/50">
                                        <tr>
                                            <td colSpan={4} className="px-8 py-6 text-right text-sm font-black text-slate-600">Order Total</td>
                                            <td className="px-8 py-6 text-right text-2xl font-black text-slate-900">${selectedSO.totalAmount.toLocaleString()}</td>
                                        </tr>
                                    </tfoot>
                                </table>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="h-full bg-slate-50/50 rounded-[40px] border border-dashed border-slate-200 flex flex-col items-center justify-center text-center p-10 animate-in fade-in duration-500">
                        <div className="w-24 h-24 bg-white rounded-3xl mb-6 flex items-center justify-center shadow-sm">
                            <TrendingUp className="w-10 h-10 text-slate-200" />
                        </div>
                        <h3 className="text-xl font-black text-slate-400 mb-2 tracking-tight">No Order Selected</h3>
                        <p className="text-sm text-slate-400 font-medium max-w-[280px]">Select an order from the list to view details and fulfillment options.</p>
                    </div>
                )}
            </div>

            {/* Add/Edit SO Sidebar */}
            {isAdding && (
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex justify-end">
                    <div className="w-full max-w-2xl bg-white h-full shadow-2xl animate-in slide-in-from-right duration-300 flex flex-col">
                        <div className="p-8 border-b border-slate-50 flex items-center justify-between bg-slate-50/50">
                            <div>
                                <h3 className="text-2xl font-black text-slate-900 tracking-tight">
                                    {editingSO ? `Edit Order ${editingSO.orderNumber}` : 'Create Sales Order'}
                                </h3>
                                <p className="text-sm text-slate-500 font-medium">{editingSO ? 'Update order details and items.' : 'New outgoing order for customer.'}</p>
                            </div>
                            <button onClick={() => { setIsAdding(false); setEditingSO(null); }} className="w-10 h-10 flex items-center justify-center rounded-full bg-white border border-slate-100 hover:bg-slate-50 transition-colors">
                                <ArrowLeft className="w-5 h-5 text-slate-400" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-8 space-y-10 custom-scrollbar">
                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-1.5">
                                    <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Customer</label>
                                    <select
                                        required
                                        value={formData.customerId}
                                        onChange={(e) => setFormData({ ...formData, customerId: e.target.value })}
                                        className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:bg-white focus:ring-4 focus:ring-slate-100 transition-all text-sm font-bold appearance-none"
                                    >
                                        <option value="">Select Customer...</option>
                                        {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                    </select>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Order Date</label>
                                    <input
                                        type="date"
                                        required
                                        value={formData.date}
                                        onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                        className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:bg-white focus:ring-4 focus:ring-slate-100 transition-all text-sm font-bold"
                                    />
                                </div>
                            </div>

                            <div className="space-y-6">
                                <div className="flex items-center justify-between">
                                    <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Order Items</h4>
                                    <button
                                        type="button"
                                        onClick={addItem}
                                        className="text-xs font-black text-slate-900 border-b-2 border-slate-900 pb-0.5 hover:opacity-50 transition-all"
                                    >
                                        + Add Product
                                    </button>
                                </div>

                                <div className="space-y-4">
                                    {formData.items.map((item, index) => (
                                        <div key={index} className="flex gap-4 items-end bg-slate-50/50 p-6 rounded-3xl border border-slate-50">
                                            <div className="flex-1 space-y-1.5">
                                                <label className="text-[10px] font-black text-slate-400 uppercase">Product</label>
                                                <select
                                                    required
                                                    value={item.productId}
                                                    onChange={(e) => updateItem(index, 'productId', e.target.value)}
                                                    className="w-full px-4 py-3 bg-white border border-slate-100 rounded-xl focus:outline-none focus:ring-4 focus:ring-slate-100 transition-all text-sm font-bold"
                                                >
                                                    <option value="">Select Product...</option>
                                                    {products.map(p => <option key={p.id} value={p.id}>{p.name} (${p.price})</option>)}
                                                </select>
                                            </div>
                                            <div className="w-24 space-y-1.5">
                                                <label className="text-[10px] font-black text-slate-400 uppercase">Qty</label>
                                                <input
                                                    type="number"
                                                    required
                                                    min="1"
                                                    value={item.quantity}
                                                    onChange={(e) => updateItem(index, 'quantity', parseInt(e.target.value))}
                                                    className="w-full px-4 py-3 bg-white border border-slate-100 rounded-xl focus:outline-none focus:ring-4 focus:ring-slate-100 transition-all text-sm font-bold text-center"
                                                />
                                            </div>
                                            <div className="w-32 space-y-1.5">
                                                <label className="text-[10px] font-black text-slate-400 uppercase">Unit Price</label>
                                                <input
                                                    type="number"
                                                    required
                                                    step="0.01"
                                                    value={item.unitPrice}
                                                    onChange={(e) => updateItem(index, 'unitPrice', parseFloat(e.target.value))}
                                                    className="w-full px-4 py-3 bg-white border border-slate-100 rounded-xl focus:outline-none focus:ring-4 focus:ring-slate-100 transition-all text-sm font-bold"
                                                />
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => removeItem(index)}
                                                className="mb-1 p-3 text-slate-300 hover:text-red-500 transition-colors"
                                            >
                                                <X className="w-5 h-5" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="pt-8 border-t border-slate-50 flex items-center justify-between">
                                <div className="text-left">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Estimated Total</p>
                                    <p className="text-3xl font-black text-slate-900">${formData.items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0).toLocaleString()}</p>
                                </div>
                                <div className="flex gap-4">
                                    <button
                                        type="button"
                                        onClick={() => { setIsAdding(false); setEditingSO(null); }}
                                        className="px-8 py-3 bg-slate-50 text-slate-500 rounded-2xl font-black text-sm hover:bg-slate-100 transition-all"
                                    >
                                        Discard
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={createSO.isPending || updateSO.isPending}
                                        className="px-10 py-3 bg-slate-900 text-white rounded-2xl font-black text-sm hover:shadow-2xl hover:shadow-slate-900/20 active:scale-95 transition-all disabled:opacity-50"
                                    >
                                        {createSO.isPending || updateSO.isPending ? "Saving..." : (editingSO ? "Update Order" : "Record Sales Order")}
                                    </button>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
