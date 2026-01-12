"use client";

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { Plus, Edit2, Trash2, Mail, Phone, Clock, Loader2 } from 'lucide-react';
import { useState } from 'react';

interface Supplier {
    id: string;
    name: string;
    email?: string;
    phone?: string;
    leadTime: number;
    _count: { products: number };
}

export default function SuppliersPage() {
    const queryClient = useQueryClient();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);

    const { data: suppliers = [], isLoading } = useQuery({
        queryKey: ['suppliers'],
        queryFn: async () => {
            const { data } = await api.get('/suppliers');
            return data;
        },
    });

    const mutation = useMutation({
        mutationFn: async (formData: any) => {
            if (editingSupplier) {
                return api.patch(`/suppliers/${editingSupplier.id}`, formData);
            }
            return api.post('/suppliers', formData);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['suppliers'] });
            setIsModalOpen(false);
            setEditingSupplier(null);
        },
    });

    const deleteMutation = useMutation({
        mutationFn: async (id: string) => api.delete(`/suppliers/${id}`),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['suppliers'] });
        },
    });

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const data = {
            name: formData.get('name'),
            email: formData.get('email') || undefined,
            phone: formData.get('phone') || undefined,
            leadTime: parseInt(formData.get('leadTime') as string) || 7,
        };
        mutation.mutate(data);
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-full">
                <Loader2 className="w-8 h-8 text-slate-400 animate-spin" />
            </div>
        );
    }

    return (
        <div className="space-y-8 max-w-7xl mx-auto">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Suppliers</h2>
                    <p className="text-sm text-slate-500 mt-1">Manage your vendor relationships and lead times.</p>
                </div>
                <button
                    onClick={() => {
                        setEditingSupplier(null);
                        setIsModalOpen(true);
                    }}
                    className="bg-slate-900 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-slate-800 transition-colors"
                >
                    <Plus className="w-4 h-4" />
                    Add Supplier
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {suppliers.map((supplier: Supplier) => (
                    <div key={supplier.id} className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm hover:shadow-md transition-all">
                        <div className="flex items-start justify-between mb-4">
                            <div className="w-12 h-12 bg-slate-50 rounded-lg flex items-center justify-center border border-slate-100">
                                <span className="text-xl font-bold text-slate-400">{supplier.name[0]}</span>
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => {
                                        setEditingSupplier(supplier);
                                        setIsModalOpen(true);
                                    }}
                                    className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-md"
                                >
                                    <Edit2 className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={() => {
                                        if (confirm('Delete this supplier?')) deleteMutation.mutate(supplier.id);
                                    }}
                                    className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        </div>

                        <h3 className="text-lg font-bold text-slate-900 mb-4">{supplier.name}</h3>

                        <div className="space-y-2 text-sm text-slate-500">
                            {supplier.email && (
                                <div className="flex items-center gap-2">
                                    <Mail className="w-4 h-4 text-slate-400" />
                                    {supplier.email}
                                </div>
                            )}
                            {supplier.phone && (
                                <div className="flex items-center gap-2">
                                    <Phone className="w-4 h-4 text-slate-400" />
                                    {supplier.phone}
                                </div>
                            )}
                            <div className="flex items-center gap-2 text-slate-600 font-medium">
                                <Clock className="w-4 h-4 text-slate-400" />
                                {supplier.leadTime} days lead time
                            </div>
                        </div>

                        <div className="mt-6 pt-6 border-t border-slate-50 flex items-center justify-between text-xs text-slate-400">
                            <span>{supplier._count?.products || 0} Products</span>
                            <span className="bg-slate-50 px-2 py-1 rounded text-slate-600">Active Vendor</span>
                        </div>
                    </div>
                ))}
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
                        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-white">
                            <h3 className="text-lg font-bold text-slate-900">
                                {editingSupplier ? 'Edit Supplier' : 'Add New Supplier'}
                            </h3>
                            <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">×</button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-1">Company Name</label>
                                <input
                                    name="name"
                                    required
                                    defaultValue={editingSupplier?.name}
                                    className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-slate-900/5 focus:border-slate-900 outline-none transition-all"
                                    placeholder="e.g. Nexus Electronics"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-1">Email</label>
                                    <input
                                        name="email"
                                        type="email"
                                        defaultValue={editingSupplier?.email}
                                        className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-slate-900/5 focus:border-slate-900 outline-none transition-all"
                                        placeholder="sales@nexus.com"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-1">Phone</label>
                                    <input
                                        name="phone"
                                        defaultValue={editingSupplier?.phone}
                                        className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-slate-900/5 focus:border-slate-900 outline-none transition-all"
                                        placeholder="+1 (555) 000-0000"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-1">Lead Time (Days)</label>
                                <input
                                    name="leadTime"
                                    type="number"
                                    required
                                    defaultValue={editingSupplier?.leadTime || 7}
                                    className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-slate-900/5 focus:border-slate-900 outline-none transition-all"
                                />
                                <p className="text-xs text-slate-400 mt-1">Average time from order to delivery.</p>
                            </div>

                            <div className="flex gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="flex-1 px-4 py-2 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={mutation.isPending}
                                    className="flex-1 px-4 py-2 rounded-lg bg-slate-900 text-white hover:bg-slate-800 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
                                >
                                    {mutation.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
                                    {editingSupplier ? 'Save Changes' : 'Create Supplier'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
