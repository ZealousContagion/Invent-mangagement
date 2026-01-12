"use client";

import { useState } from "react";
import {
    ShoppingCart,
    Plus,
    Search,
    Filter,
    ChevronRight,
    Clock,
    CheckCircle2,
    XCircle,
    FileText,
    AlertCircle,
    Truck,
    ArrowLeft,
    Trash2,
    Edit2,
    Download,
    FileDown
} from "lucide-react";
import { usePurchaseOrders, useCreatePurchaseOrder, useUpdatePurchaseOrder, useDeletePurchaseOrder } from "@/hooks/usePurchaseOrders";
import { useProducts } from "@/hooks/useProducts";
import { format } from "date-fns";
import api from "@/lib/api";
import { useQuery } from "@tanstack/react-query";
import { exportToCSV } from "@/lib/utils";
import { generatePurchaseOrderPDF } from "@/lib/pdfUtils";

// Local hook for suppliers since I didn't make a shared one yet
const useSuppliersLocal = () => {
    return useQuery({
        queryKey: ['suppliers'],
        queryFn: async () => {
            const { data } = await api.get('/suppliers');
            return data;
        },
    });
};

export default function PurchaseOrdersPage() {
    const [isAdding, setIsAdding] = useState(false);
    const [selectedPO, setSelectedPO] = useState<any>(null);
    const [searchQuery, setSearchQuery] = useState("");

    const [editingPO, setEditingPO] = useState<any>(null);
    const { data: pos = [], isLoading } = usePurchaseOrders();
    const { data: suppliers = [] } = useSuppliersLocal();
    const { data: products = [] } = useProducts();
    const createPO = useCreatePurchaseOrder();
    const updatePO = useUpdatePurchaseOrder();
    const deletePO = useDeletePurchaseOrder();

    const [formData, setFormData] = useState({
        supplierId: "",
        expectedDate: "",
        items: [{ productId: "", quantity: 1, unitPrice: 0 }]
    });

    const handleAddItem = () => {
        setFormData({
            ...formData,
            items: [...formData.items, { productId: "", quantity: 1, unitPrice: 0 }]
        });
    };

    const handleRemoveItem = (index: number) => {
        setFormData({
            ...formData,
            items: formData.items.filter((_, i) => i !== index)
        });
    };

    const handleItemChange = (index: number, field: string, value: any) => {
        const newItems = [...formData.items];
        (newItems[index] as any)[field] = value;

        // Auto-fill price if product is selected
        if (field === 'productId') {
            const product = products.find(p => p.id === value);
            if (product) {
                newItems[index].unitPrice = product.price;
            }
        }

        setFormData({ ...formData, items: newItems });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editingPO) {
                await updatePO.mutateAsync({ id: editingPO.id, data: formData });
            } else {
                await createPO.mutateAsync(formData);
            }
            setIsAdding(false);
            setEditingPO(null);
            setFormData({
                supplierId: "",
                expectedDate: "",
                items: [{ productId: "", quantity: 1, unitPrice: 0 }]
            });
        } catch (error) {
            console.error("Failed to save PO:", error);
        }
    };

    const handleDelete = async (id: string) => {
        if (confirm("Are you sure you want to delete this purchase order?")) {
            try {
                await deletePO.mutateAsync(id);
                if (selectedPO?.id === id) setSelectedPO(null);
            } catch (error) {
                console.error("Failed to delete PO:", error);
            }
        }
    };

    const handleEdit = (po: any) => {
        setEditingPO(po);
        setFormData({
            supplierId: po.supplierId,
            expectedDate: po.expectedDate ? format(new Date(po.expectedDate), 'yyyy-MM-dd') : "",
            items: po.items.map((i: any) => ({
                productId: i.productId,
                quantity: i.quantity,
                unitPrice: i.unitPrice
            }))
        });
        setIsAdding(true);
    };

    const handleUpdateStatus = async (id: string, status: string) => {
        try {
            await updatePO.mutateAsync({ id, data: { status } });
            if (selectedPO?.id === id) {
                setSelectedPO(null);
            }
        } catch (error) {
            console.error("Failed to update status:", error);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'DRAFT': return 'bg-slate-100 text-slate-600';
            case 'SENT': return 'bg-blue-50 text-blue-600 border-blue-100';
            case 'RECEIVED': return 'bg-emerald-50 text-emerald-600 border-emerald-100';
            case 'CANCELLED': return 'bg-red-50 text-red-600 border-red-100';
            default: return 'bg-slate-100 text-slate-600';
        }
    };

    const handleExportCSV = () => {
        const exportData = pos.map(po => ({
            OrderNumber: po.orderNumber,
            Supplier: po.supplier.name,
            Date: format(new Date(po.createdAt), 'yyyy-MM-dd'),
            Status: po.status,
            Total: po.totalAmount
        }));
        exportToCSV(exportData, `purchase_orders_${format(new Date(), 'yyyyMMdd')}`);
    };

    const handleGeneratePDF = (po: any) => {
        generatePurchaseOrderPDF({
            orderNumber: po.orderNumber,
            date: po.createdAt,
            expectedDate: po.expectedDate,
            supplier: {
                name: po.supplier.name,
                email: po.supplier.email,
                phone: po.supplier.phone,
                address: po.supplier.address
            },
            items: po.items.map((i: any) => ({
                name: i.product.name,
                sku: i.product.sku,
                quantity: i.quantity,
                unitPrice: i.unitPrice,
                total: i.quantity * i.unitPrice
            })),
            totalAmount: po.totalAmount
        });
    };

    const filteredPOs = pos.filter(po =>
        po.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        po.supplier.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (selectedPO) {
        return (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <button
                    onClick={() => setSelectedPO(null)}
                    className="flex items-center gap-2 text-sm font-bold text-slate-400 hover:text-slate-900 transition-colors"
                >
                    <ArrowLeft className="w-4 h-4" /> Back to Orders
                </button>

                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <h2 className="text-3xl font-black text-slate-900 tracking-tight">{selectedPO.orderNumber}</h2>
                            <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${getStatusColor(selectedPO.status)}`}>
                                {selectedPO.status}
                            </span>
                        </div>
                        <p className="text-sm text-slate-500 font-medium flex items-center gap-2">
                            <Truck className="w-4 h-4" /> Ordered from <span className="text-slate-900 font-bold">{selectedPO.supplier.name}</span> on {format(new Date(selectedPO.createdAt), 'PPP')}
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => handleGeneratePDF(selectedPO)}
                            className="p-2.5 bg-white border border-slate-100 text-slate-400 hover:text-slate-900 rounded-xl transition-all flex items-center gap-2 pr-4 shadow-sm"
                            title="Generate PO PDF"
                        >
                            <FileDown className="w-5 h-5" />
                            <span className="text-xs font-bold uppercase tracking-widest">Generate PO</span>
                        </button>
                        {selectedPO.status === 'DRAFT' && (
                            <>
                                <button
                                    onClick={() => handleEdit(selectedPO)}
                                    className="p-2.5 bg-white border border-slate-100 text-slate-400 hover:text-slate-900 rounded-xl transition-all"
                                    title="Edit Order"
                                >
                                    <Edit2 className="w-5 h-5" />
                                </button>
                                <button
                                    onClick={() => handleUpdateStatus(selectedPO.id, 'SENT')}
                                    className="px-6 py-2.5 bg-slate-900 text-white rounded-xl font-bold text-sm hover:shadow-lg hover:shadow-slate-900/20 active:scale-95 transition-all"
                                >
                                    Mark as Sent
                                </button>
                            </>
                        )}
                        {selectedPO.status === 'SENT' && (
                            <button
                                onClick={() => handleUpdateStatus(selectedPO.id, 'RECEIVED')}
                                className="px-6 py-2.5 bg-emerald-600 text-white rounded-xl font-bold text-sm hover:shadow-lg hover:shadow-emerald-600/20 active:scale-95 transition-all flex items-center gap-2"
                            >
                                <CheckCircle2 className="w-4 h-4" /> Mark as Received
                            </button>
                        )}
                        {['DRAFT', 'SENT'].includes(selectedPO.status) && (
                            <>
                                <button
                                    onClick={() => handleUpdateStatus(selectedPO.id, 'CANCELLED')}
                                    className="px-6 py-2.5 bg-white text-orange-600 border border-orange-100 rounded-xl font-bold text-sm hover:bg-orange-50 active:scale-95 transition-all"
                                >
                                    Cancel Order
                                </button>
                                {selectedPO.status === 'DRAFT' && (
                                    <button
                                        onClick={() => handleDelete(selectedPO.id)}
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

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
                            <div className="p-6 border-b border-slate-50 font-bold text-slate-900">Order Items</div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead>
                                        <tr className="bg-slate-50/50">
                                            <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Product</th>
                                            <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center">Quantity</th>
                                            <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">Unit Price</th>
                                            <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">Total</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-50">
                                        {selectedPO.items.map((item: any) => (
                                            <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                                                <td className="px-6 py-4">
                                                    <div className="font-bold text-slate-900 text-sm">{item.product.name}</div>
                                                    <div className="text-[10px] font-medium text-slate-400 font-mono uppercase tracking-wider">{item.product.sku}</div>
                                                </td>
                                                <td className="px-6 py-4 text-center font-bold text-slate-900 text-sm">{item.quantity}</td>
                                                <td className="px-6 py-4 text-right font-medium text-slate-500 text-sm">${item.unitPrice.toFixed(2)}</td>
                                                <td className="px-6 py-4 text-right font-black text-slate-900 text-sm">${(item.quantity * item.unitPrice).toFixed(2)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                    <tfoot className="bg-slate-50/50">
                                        <tr>
                                            <td colSpan={3} className="px-6 py-4 text-right text-sm font-bold text-slate-500 uppercase tracking-wider">Grand Total</td>
                                            <td className="px-6 py-4 text-right text-lg font-black text-slate-900">${selectedPO.totalAmount.toFixed(2)}</td>
                                        </tr>
                                    </tfoot>
                                </table>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
                            <h3 className="font-bold text-slate-900">Details</h3>
                            <div className="space-y-3">
                                <div className="flex justify-between text-sm">
                                    <span className="text-slate-400 font-medium">Expected Arrival</span>
                                    <span className="text-slate-900 font-bold">{selectedPO.expectedDate ? format(new Date(selectedPO.expectedDate), 'PP') : 'N/A'}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-slate-400 font-medium">Received Date</span>
                                    <span className="text-slate-900 font-bold">{selectedPO.receivedDate ? format(new Date(selectedPO.receivedDate), 'PP') : 'Pending'}</span>
                                </div>
                                <div className="pt-3 border-t border-slate-50 flex justify-between items-center text-sm">
                                    <div className="flex items-center gap-2">
                                        <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center font-black text-slate-400 text-[10px]">
                                            {selectedPO.supplier.name.substring(0, 2).toUpperCase()}
                                        </div>
                                        <span className="font-bold text-slate-900">{selectedPO.supplier.name}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {selectedPO.status === 'RECEIVED' && (
                            <div className="bg-emerald-50 p-6 rounded-3xl border border-emerald-100 flex gap-4">
                                <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0" />
                                <div>
                                    <h4 className="font-bold text-emerald-900 text-sm">Stock Updated</h4>
                                    <p className="text-xs text-emerald-700 mt-1 leading-relaxed">The items in this order have been automatically added to your inventory levels.</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-10 max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h2 className="text-3xl font-black text-slate-900 tracking-tight">Purchase Orders</h2>
                    <p className="text-sm text-slate-500 mt-1 font-medium">Manage procurement and supplier deliveries.</p>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={handleExportCSV}
                        className="p-2.5 bg-white border border-slate-200 text-slate-400 hover:text-slate-900 rounded-xl transition-all"
                        title="Export CSV"
                    >
                        <Download className="w-5 h-5" />
                    </button>
                    <div className="relative group">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-slate-900 transition-colors" />
                        <input
                            type="text"
                            placeholder="Search orders..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-slate-900/5 focus:border-slate-900 transition-all text-sm w-full md:w-64"
                        />
                    </div>
                    <button
                        onClick={() => setIsAdding(true)}
                        className="flex items-center gap-2 px-6 py-2.5 bg-slate-900 text-white rounded-xl font-bold text-sm hover:shadow-xl hover:shadow-slate-900/20 active:scale-95 transition-all shrink-0"
                    >
                        <Plus className="w-4 h-4" /> New Order
                    </button>
                </div>
            </div>

            {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3].map(i => <div key={i} className="h-48 bg-slate-50 animate-pulse rounded-3xl" />)}
                </div>
            ) : filteredPOs.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 bg-white rounded-[40px] border border-slate-100 shadow-sm">
                    <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-6">
                        <ShoppingCart className="w-10 h-10 text-slate-200" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900">No purchase orders found</h3>
                    <p className="text-slate-500 text-sm mt-2 max-w-xs text-center leading-relaxed">Start by creating a new order to restock your inventory items.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    {filteredPOs.map((po) => (
                        <div
                            key={po.id}
                            onClick={() => setSelectedPO(po)}
                            className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl hover:border-slate-200 transition-all cursor-pointer group flex flex-col"
                        >
                            <div className="flex justify-between items-start mb-6">
                                <div className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border ${getStatusColor(po.status)}`}>
                                    {po.status}
                                </div>
                                <div className="text-[10px] font-bold text-slate-400 flex items-center gap-1">
                                    <Clock className="w-3 h-3" /> {format(new Date(po.createdAt), 'MMM d, yyyy')}
                                </div>
                            </div>

                            <div className="mb-6">
                                <h4 className="text-lg font-black text-slate-900 group-hover:text-slate-600 transition-colors uppercase tracking-tight">{po.orderNumber}</h4>
                                <p className="text-xs text-slate-500 font-bold mt-1 flex items-center gap-1.5 grayscale group-hover:grayscale-0 transition-all">
                                    <div className="w-4 h-4 rounded-full bg-slate-100 flex items-center justify-center text-[8px] font-black text-slate-400">V</div>
                                    {po.supplier.name}
                                </p>
                            </div>

                            <div className="mt-auto pt-6 border-t border-slate-50 flex items-end justify-between">
                                <div>
                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Order value</p>
                                    <p className="text-xl font-black text-slate-900">${po.totalAmount.toLocaleString()}</p>
                                </div>
                                <div className="flex items-center gap-2 text-xs font-bold text-slate-400 group-hover:text-slate-900 transition-colors">
                                    View Details <ChevronRight className="w-4 h-4" />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Add PO Modal */}
            {isAdding && (
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
                    <div className="bg-white w-full max-w-3xl rounded-[40px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="p-8 border-b border-slate-50 flex items-center justify-between bg-slate-50/50">
                            <div>
                                <h3 className="text-2xl font-black text-slate-900 tracking-tight">
                                    {editingPO ? `Edit Order ${editingPO.orderNumber}` : 'Create Purchase Order'}
                                </h3>
                                <p className="text-sm text-slate-500 font-medium">{editingPO ? 'Update order details and items.' : 'New procurement request for supplier.'}</p>
                            </div>
                            <button onClick={() => { setIsAdding(false); setEditingPO(null); }} className="w-10 h-10 flex items-center justify-center rounded-full bg-white border border-slate-100 hover:bg-slate-50 transition-colors">
                                <ArrowLeft className="w-5 h-5 text-slate-400" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-8 space-y-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Supplier</label>
                                    <select
                                        required
                                        value={formData.supplierId}
                                        onChange={(e) => setFormData({ ...formData, supplierId: e.target.value })}
                                        className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:bg-white focus:border-slate-900 transition-all text-sm appearance-none font-bold"
                                    >
                                        <option value="">Select a vendor...</option>
                                        {suppliers.map((s: any) => <option key={s.id} value={s.id}>{s.name}</option>)}
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Expected Arrival</label>
                                    <input
                                        type="date"
                                        value={formData.expectedDate}
                                        onChange={(e) => setFormData({ ...formData, expectedDate: e.target.value })}
                                        className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:bg-white focus:border-slate-900 transition-all text-sm font-bold"
                                    />
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Line Items</label>
                                    <button
                                        type="button"
                                        onClick={handleAddItem}
                                        className="text-[11px] font-black text-blue-600 hover:text-blue-700 transition-colors flex items-center gap-1.5"
                                    >
                                        <Plus className="w-3 h-3" /> Add Item
                                    </button>
                                </div>

                                <div className="space-y-3">
                                    {formData.items.map((item, index) => (
                                        <div key={index} className="flex flex-col md:flex-row gap-4 p-5 bg-slate-50 rounded-3xl group relative">
                                            <div className="flex-1 space-y-1.5">
                                                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Product</label>
                                                <select
                                                    required
                                                    value={item.productId}
                                                    onChange={(e) => handleItemChange(index, "productId", e.target.value)}
                                                    className="w-full px-4 py-2 bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-slate-900 transition-all text-sm font-bold appearance-none"
                                                >
                                                    <option value="">Choose item...</option>
                                                    {products.map(p => <option key={p.id} value={p.id}>{p.name} ({p.sku})</option>)}
                                                </select>
                                            </div>
                                            <div className="w-full md:w-32 space-y-1.5">
                                                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Quantity</label>
                                                <input
                                                    type="number"
                                                    required
                                                    min="1"
                                                    value={item.quantity}
                                                    onChange={(e) => handleItemChange(index, "quantity", parseInt(e.target.value))}
                                                    className="w-full px-4 py-2 bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-slate-900 transition-all text-sm font-bold"
                                                />
                                            </div>
                                            <div className="w-full md:w-32 space-y-1.5">
                                                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Unit Price</label>
                                                <input
                                                    type="number"
                                                    required
                                                    step="0.01"
                                                    value={item.unitPrice}
                                                    onChange={(e) => handleItemChange(index, "unitPrice", parseFloat(e.target.value))}
                                                    className="w-full px-4 py-2 bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-slate-900 transition-all text-sm font-bold"
                                                />
                                            </div>
                                            {formData.items.length > 1 && (
                                                <button
                                                    type="button"
                                                    onClick={() => handleRemoveItem(index)}
                                                    className="absolute -top-2 -right-2 w-6 h-6 bg-white border border-slate-100 rounded-full flex items-center justify-center text-red-500 shadow-sm opacity-0 group-hover:opacity-100 transition-all scale-75 group-hover:scale-100"
                                                >
                                                    <XCircle className="w-4 h-4" />
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="pt-8 border-t border-slate-50 flex items-center justify-between">
                                <div>
                                    <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-1">Estimated Total</p>
                                    <p className="text-2xl font-black text-slate-900">
                                        ${formData.items.reduce((sum, i) => sum + (i.quantity * i.unitPrice), 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                    </p>
                                </div>
                                <div className="flex gap-4">
                                    <button
                                        type="button"
                                        onClick={() => setIsAdding(false)}
                                        className="px-8 py-3 bg-white border border-slate-200 text-slate-600 rounded-2xl font-bold text-sm hover:bg-slate-50 active:scale-95 transition-all"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={createPO.isPending || updatePO.isPending}
                                        className="px-10 py-3 bg-slate-900 text-white rounded-2xl font-black text-sm hover:shadow-2xl hover:shadow-slate-900/20 active:scale-95 transition-all disabled:opacity-50"
                                    >
                                        {createPO.isPending || updatePO.isPending ? "Saving..." : (editingPO ? "Update Order" : "Save Draft Order")}
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
