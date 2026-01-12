"use client";

import { useState } from "react";
import {
    Plus,
    Search,
    Calendar,
    Tag,
    DollarSign,
    Trash2,
    Edit2,
    X,
    Filter,
    ArrowUpRight
} from "lucide-react";
import { useExpenses, useCreateExpense, useUpdateExpense, useDeleteExpense } from "@/hooks/useExpenses";
import { format } from "date-fns";

export default function ExpensesPage() {
    const { data: expenses = [], isLoading } = useExpenses();
    const createExpense = useCreateExpense();
    const updateExpense = useUpdateExpense();
    const deleteExpense = useDeleteExpense();

    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingExpense, setEditingExpense] = useState<any>(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("all");

    const [formData, setFormData] = useState({
        description: "",
        amount: "",
        category: "",
        date: format(new Date(), 'yyyy-MM-dd')
    });

    const categories = ["Office", "Travel", "Marketing", "Utilities", "Maintenance", "Software", "Miscellaneous"];

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const data = {
            ...formData,
            amount: parseFloat(formData.amount)
        };

        if (editingExpense) {
            await updateExpense.mutateAsync({ id: editingExpense.id, data });
        } else {
            await createExpense.mutateAsync(data);
        }

        handleClose();
    };

    const handleEdit = (expense: any) => {
        setEditingExpense(expense);
        setFormData({
            description: expense.description,
            amount: expense.amount.toString(),
            category: expense.category,
            date: format(new Date(expense.date), 'yyyy-MM-dd')
        });
        setIsFormOpen(true);
    };

    const handleDelete = async (id: string) => {
        if (confirm("Delete this expense?")) {
            await deleteExpense.mutateAsync(id);
        }
    };

    const handleClose = () => {
        setIsFormOpen(false);
        setEditingExpense(null);
        setFormData({
            description: "",
            amount: "",
            category: "",
            date: format(new Date(), 'yyyy-MM-dd')
        });
    };

    const filteredExpenses = expenses.filter(ex =>
        (ex.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
            ex.category.toLowerCase().includes(searchQuery.toLowerCase())) &&
        (selectedCategory === "all" || ex.category === selectedCategory)
    );

    const totalExpenses = filteredExpenses.reduce((sum, ex) => sum + ex.amount, 0);

    return (
        <div className="space-y-10 max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h2 className="text-3xl font-black text-slate-900 tracking-tight">Expenses</h2>
                    <p className="text-sm text-slate-500 mt-1 font-medium">Track and manage your company spending.</p>
                </div>

                <div className="flex items-center gap-3">
                    <div className="bg-slate-900 px-6 py-2.5 rounded-2xl text-white">
                        <p className="text-[10px] font-black uppercase tracking-widest opacity-50 mb-0.5">Total Filtered</p>
                        <p className="text-lg font-black">${totalExpenses.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
                    </div>
                    <button
                        onClick={() => setIsFormOpen(true)}
                        className="flex items-center gap-2 px-6 py-4 bg-white border border-slate-100 rounded-2xl font-black text-sm hover:shadow-xl hover:border-slate-200 active:scale-95 transition-all text-slate-900"
                    >
                        <Plus className="w-4 h-4" /> New Expense
                    </button>
                </div>
            </div>

            <div className="bg-white p-3 rounded-[32px] border border-slate-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Search expenses..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-11 pr-4 py-3 bg-slate-50/50 border-none rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-slate-100 transition-all font-medium"
                    />
                </div>
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 px-4 py-2 bg-slate-50/50 rounded-xl border border-slate-50">
                        <Filter className="w-3.5 h-3.5 text-slate-400" />
                        <select
                            value={selectedCategory}
                            onChange={(e) => setSelectedCategory(e.target.value)}
                            className="bg-transparent text-xs font-bold text-slate-600 focus:outline-none appearance-none pr-4"
                        >
                            <option value="all">All Categories</option>
                            {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                        </select>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                {isLoading ? (
                    [1, 2, 3].map(i => <div key={i} className="h-48 bg-slate-50 animate-pulse rounded-[32px]" />)
                ) : filteredExpenses.length === 0 ? (
                    <div className="col-span-full py-20 text-center bg-slate-50/50 rounded-[32px] border-2 border-dashed border-slate-100">
                        <p className="text-slate-400 font-bold">No expenses found matching your criteria.</p>
                    </div>
                ) : (
                    filteredExpenses.map((expense) => (
                        <div
                            key={expense.id}
                            className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all group relative overflow-hidden"
                        >
                            <div className="flex justify-between items-start mb-6">
                                <span className="px-3 py-1 bg-slate-100 rounded-full text-[9px] font-black uppercase tracking-widest text-slate-500">
                                    {expense.category}
                                </span>
                                <div className="text-[10px] font-bold text-slate-400 flex items-center gap-1.5">
                                    <Calendar className="w-3.5 h-3.5" />
                                    {format(new Date(expense.date), 'MMM d, yyyy')}
                                </div>
                            </div>

                            <div className="mb-8">
                                <h4 className="text-lg font-black text-slate-900 leading-tight mb-2 group-hover:text-slate-600 transition-colors">{expense.description}</h4>
                                <div className="flex items-baseline gap-1">
                                    <span className="text-3xl font-black text-slate-900 tracking-tight">${expense.amount.toLocaleString()}</span>
                                </div>
                            </div>

                            <div className="flex justify-between items-center pt-6 border-t border-slate-50">
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => handleEdit(expense)}
                                        className="p-2.5 text-slate-400 hover:text-slate-900 hover:bg-slate-50 rounded-xl transition-all"
                                    >
                                        <Edit2 className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(expense.id)}
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
                                {editingExpense ? 'Edit Expense' : 'New Expense'}
                            </h3>
                            <button onClick={handleClose} className="p-2 hover:bg-slate-50 rounded-full transition-all">
                                <X className="w-6 h-6 text-slate-400" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-8 space-y-6">
                            <div className="space-y-4">
                                <div className="space-y-1.5">
                                    <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Description</label>
                                    <input
                                        required
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:bg-white focus:ring-4 focus:ring-slate-900/5 transition-all text-sm font-bold"
                                        placeholder="What was this for?"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Amount</label>
                                        <div className="relative">
                                            <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                            <input
                                                type="number"
                                                required
                                                step="0.01"
                                                value={formData.amount}
                                                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                                                className="w-full pl-11 pr-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:bg-white focus:ring-4 focus:ring-slate-900/5 transition-all text-sm font-bold"
                                                placeholder="0.00"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Category</label>
                                        <select
                                            required
                                            value={formData.category}
                                            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                            className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:bg-white focus:ring-4 focus:ring-slate-900/5 transition-all text-sm font-bold appearance-none"
                                        >
                                            <option value="">Select...</option>
                                            {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                                        </select>
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Date</label>
                                    <input
                                        type="date"
                                        required
                                        value={formData.date}
                                        onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                        className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:bg-white focus:ring-4 focus:ring-slate-100 transition-all text-sm font-bold"
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={createExpense.isPending || updateExpense.isPending}
                                className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black text-sm hover:shadow-2xl hover:shadow-slate-900/20 active:scale-[0.98] transition-all disabled:opacity-50"
                            >
                                {editingExpense ? 'Update Expense' : 'Save Expense'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
