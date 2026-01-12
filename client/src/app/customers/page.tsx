"use client";

import { useState } from "react";
import {
    Plus,
    Search,
    Mail,
    Phone,
    MapPin,
    Trash2,
    Edit2,
    X,
    User,
    ArrowUpRight
} from "lucide-react";
import { useCustomers, useCreateCustomer, useUpdateCustomer, useDeleteCustomer } from "@/hooks/useCustomers";

export default function CustomersPage() {
    const { data: customers = [], isLoading } = useCustomers();
    const createCustomer = useCreateCustomer();
    const updateCustomer = useUpdateCustomer();
    const deleteCustomer = useDeleteCustomer();

    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingCustomer, setEditingCustomer] = useState<any>(null);
    const [searchQuery, setSearchQuery] = useState("");

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
        address: ""
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (editingCustomer) {
            await updateCustomer.mutateAsync({ id: editingCustomer.id, data: formData });
        } else {
            await createCustomer.mutateAsync(formData);
        }
        handleClose();
    };

    const handleEdit = (customer: any) => {
        setEditingCustomer(customer);
        setFormData({
            name: customer.name,
            email: customer.email,
            phone: customer.phone || "",
            address: customer.address || ""
        });
        setIsFormOpen(true);
    };

    const handleDelete = async (id: string) => {
        if (confirm("Delete this customer? This may affect their order history.")) {
            await deleteCustomer.mutateAsync(id);
        }
    };

    const handleClose = () => {
        setIsFormOpen(false);
        setEditingCustomer(null);
        setFormData({ name: "", email: "", phone: "", address: "" });
    };

    const filteredCustomers = customers.filter(c =>
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.email.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="space-y-10 max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h2 className="text-3xl font-black text-slate-900 tracking-tight">Customers</h2>
                    <p className="text-sm text-slate-500 mt-1 font-medium">Manage your client relationships and contact details.</p>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setIsFormOpen(true)}
                        className="flex items-center gap-2 px-6 py-4 bg-slate-900 text-white rounded-2xl font-black text-sm hover:shadow-2xl hover:shadow-slate-900/20 active:scale-95 transition-all"
                    >
                        <Plus className="w-4 h-4" /> Add Customer
                    </button>
                </div>
            </div>

            <div className="bg-white p-3 rounded-[32px] border border-slate-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Search customers by name or email..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-11 pr-4 py-3 bg-slate-50/50 border-none rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-slate-100 transition-all font-medium"
                    />
                </div>
                <div className="px-4 py-2 bg-slate-50 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-400">
                    {filteredCustomers.length} Total Customers
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {isLoading ? (
                    [1, 2, 3].map(i => <div key={i} className="h-48 bg-slate-50 animate-pulse rounded-[32px]" />)
                ) : filteredCustomers.length === 0 ? (
                    <div className="col-span-full py-20 text-center bg-slate-50/50 rounded-[32px] border-2 border-dashed border-slate-100">
                        <p className="text-slate-400 font-bold">No customers found.</p>
                    </div>
                ) : (
                    filteredCustomers.map((customer) => (
                        <div
                            key={customer.id}
                            className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all group relative overflow-hidden"
                        >
                            <div className="flex items-center gap-4 mb-6">
                                <div className="w-12 h-12 bg-slate-900 rounded-2xl flex items-center justify-center text-white font-black text-lg">
                                    {customer.name[0]}
                                </div>
                                <div>
                                    <h4 className="text-lg font-black text-slate-900 leading-tight">{customer.name}</h4>
                                    <p className="text-xs text-slate-400 font-bold">Standard Client</p>
                                </div>
                            </div>

                            <div className="space-y-3 mb-8">
                                <div className="flex items-center gap-3 text-sm text-slate-600 font-medium">
                                    <Mail className="w-4 h-4 text-slate-300" />
                                    {customer.email}
                                </div>
                                {customer.phone && (
                                    <div className="flex items-center gap-3 text-sm text-slate-600 font-medium">
                                        <Phone className="w-4 h-4 text-slate-300" />
                                        {customer.phone}
                                    </div>
                                )}
                                {customer.address && (
                                    <div className="flex items-center gap-3 text-sm text-slate-600 font-medium">
                                        <MapPin className="w-4 h-4 text-slate-300" />
                                        <span className="truncate">{customer.address}</span>
                                    </div>
                                )}
                            </div>

                            <div className="flex justify-between items-center pt-6 border-t border-slate-50">
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => handleEdit(customer)}
                                        className="p-2.5 text-slate-400 hover:text-slate-900 hover:bg-slate-50 rounded-xl transition-all"
                                    >
                                        <Edit2 className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(customer.id)}
                                        className="p-2.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                                <ArrowUpRight className="w-5 h-5 text-slate-100 group-hover:text-slate-200 transition-all" />
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Modal Form */}
            {isFormOpen && (
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white w-full max-w-lg rounded-[40px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="p-8 border-b border-slate-50 flex items-center justify-between">
                            <h3 className="text-2xl font-black text-slate-900 tracking-tight">
                                {editingCustomer ? 'Edit Customer' : 'Add New Customer'}
                            </h3>
                            <button onClick={handleClose} className="p-2 hover:bg-slate-50 rounded-full transition-all">
                                <X className="w-6 h-6 text-slate-400" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-8 space-y-6">
                            <div className="space-y-4">
                                <div className="space-y-1.5">
                                    <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Full Name</label>
                                    <div className="relative">
                                        <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                        <input
                                            required
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            className="w-full pl-11 pr-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:bg-white focus:ring-4 focus:ring-slate-900/5 transition-all text-sm font-bold"
                                            placeholder="John Doe"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Email</label>
                                        <div className="relative">
                                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                            <input
                                                type="email"
                                                required
                                                value={formData.email}
                                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                                className="w-full pl-11 pr-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:bg-white focus:ring-4 focus:ring-slate-900/5 transition-all text-sm font-bold"
                                                placeholder="john@example.com"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Phone</label>
                                        <div className="relative">
                                            <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                            <input
                                                value={formData.phone}
                                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                                className="w-full pl-11 pr-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:bg-white focus:ring-4 focus:ring-slate-900/5 transition-all text-sm font-bold"
                                                placeholder="+1 (555) 000-0000"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Address</label>
                                    <div className="relative">
                                        <MapPin className="absolute left-4 top-5 w-4 h-4 text-slate-400" />
                                        <textarea
                                            value={formData.address}
                                            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                            className="w-full pl-11 pr-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:bg-white focus:ring-4 focus:ring-slate-900/5 transition-all text-sm font-bold min-h-[100px]"
                                            placeholder="123 Business St, Suite 456..."
                                        />
                                    </div>
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={createCustomer.isPending || updateCustomer.isPending}
                                className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black text-sm hover:shadow-2xl hover:shadow-slate-900/20 active:scale-[0.98] transition-all disabled:opacity-50"
                            >
                                {editingCustomer ? 'Update Customer' : 'Save Customer'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
