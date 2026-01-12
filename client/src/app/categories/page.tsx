"use client";

import { useState } from "react";
import { Plus, Trash2, Edit2, FolderOpen, X } from "lucide-react";
import { useCategories, useCreateCategory, useUpdateCategory, useDeleteCategory } from "@/hooks/useCategories";

export default function CategoriesPage() {
  const { data: categories = [], isLoading: loading } = useCategories();
  const createCategory = useCreateCategory();
  const updateCategory = useUpdateCategory();
  const deleteCategory = useDeleteCategory();

  const [isAdding, setIsAdding] = useState(false);
  const [editingCategory, setEditingCategory] = useState<any>(null);
  const [formData, setFormData] = useState({ name: "", description: "" });

  const handleDeleteCategory = async (id: string) => {
    if (!confirm("Are you sure? This will fail if products are still in this category.")) return;
    try {
      await deleteCategory.mutateAsync(id);
    } catch (error: any) {
      alert(error.response?.data?.message || "Error deleting category.");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingCategory) {
        await updateCategory.mutateAsync({ id: editingCategory.id, data: formData });
      } else {
        await createCategory.mutateAsync(formData);
      }
      setFormData({ name: "", description: "" });
      setIsAdding(false);
      setEditingCategory(null);
    } catch (error) {
      console.error("Error saving category:", error);
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Categories</h2>
          <p className="text-slate-500 mt-1">Organize your products into logical groups.</p>
        </div>
        <button
          onClick={() => setIsAdding(!isAdding)}
          className={`
            flex items-center space-x-2 px-5 py-2.5 rounded-xl font-medium transition-all shadow-sm
            ${isAdding
              ? "bg-slate-100 text-slate-700 hover:bg-slate-200"
              : "bg-indigo-600 text-white hover:bg-indigo-700 hover:shadow-md hover:-translate-y-0.5"
            }
          `}
        >
          {isAdding ? <X className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
          <span>{isAdding ? "Cancel" : "Add Category"}</span>
        </button>
      </div>

      {(isAdding || editingCategory) && (
        <div className="bg-slate-50 p-8 rounded-2xl border border-slate-200 shadow-sm animate-in slide-in-from-top-4 duration-300">
          <div className="mb-6">
            <h3 className="text-xl font-bold text-slate-900">{editingCategory ? 'Edit Category' : 'New Category'}</h3>
            <p className="text-sm text-slate-500">{editingCategory ? 'Update category details.' : 'Define a new category to group your products.'}</p>
          </div>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">Name</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                placeholder="e.g. Electronics"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">Description</label>
              <input
                type="text"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                placeholder="Brief description..."
              />
            </div>
            <div className="md:col-span-2 pt-2 flex gap-3">
              <button
                type="submit"
                disabled={createCategory.isPending || updateCategory.isPending}
                className="px-8 py-3 bg-indigo-600 text-white rounded-xl font-semibold shadow-sm hover:bg-indigo-700 hover:shadow-md transition-all transform active:scale-95 disabled:opacity-50"
              >
                {editingCategory ? (updateCategory.isPending ? "Updating..." : "Update Category") : (createCategory.isPending ? "Creating..." : "Create Category")}
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsAdding(false);
                  setEditingCategory(null);
                  setFormData({ name: "", description: "" });
                }}
                className="px-8 py-3 bg-white text-slate-600 border border-slate-200 rounded-xl font-semibold hover:bg-slate-50 transition-all"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full py-16 text-center text-slate-500 animate-pulse">Loading categories...</div>
        ) : categories.length === 0 ? (
          <div className="col-span-full py-16 text-center text-slate-400">
            <div className="flex flex-col items-center justify-center space-y-2">
              <FolderOpen className="w-12 h-12 opacity-20" />
              <p>No categories found.</p>
            </div>
          </div>
        ) : (
          categories.map((category: any) => (
            <div key={category.id} className="group bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:border-indigo-200 hover:shadow-md transition-all">
              <div className="flex justify-between items-start mb-4">
                <div className="bg-indigo-50 p-3 rounded-xl group-hover:bg-indigo-100 transition-colors">
                  <FolderOpen className="w-6 h-6 text-indigo-600" />
                </div>
                <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => {
                      setEditingCategory(category);
                      setFormData({ name: category.name, description: category.description || "" });
                      setIsAdding(false);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteCategory(category.id)}
                    className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <h3 className="font-bold text-slate-900 text-lg mb-1">{category.name}</h3>
              <p className="text-slate-500 text-sm mb-6 h-10 line-clamp-2">{category.description || "No description provided."}</p>
              <div className="flex justify-between items-center pt-4 border-t border-slate-100">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Products</span>
                <span className="bg-slate-100 text-slate-700 px-2.5 py-1 rounded-lg text-sm font-bold group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                  {category._count?.products || 0}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}