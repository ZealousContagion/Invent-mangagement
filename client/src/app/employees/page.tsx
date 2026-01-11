"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { Plus, Users, Mail, Building, X } from "lucide-react";

interface Employee {
  id: string;
  name: string;
  email: string;
  department: string;
}

export default function EmployeesPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [newEmployee, setNewEmployee] = useState({ name: "", email: "", department: "" });

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      const response = await axios.get("http://localhost:3001/employees");
      setEmployees(response.data);
    } catch (error) {
      console.error("Error fetching employees:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.post("http://localhost:3001/employees", newEmployee);
      setNewEmployee({ name: "", email: "", department: "" });
      setIsAdding(false);
      fetchEmployees();
    } catch (error) {
      console.error("Error adding employee:", error);
      alert("Error adding employee. Email might be duplicate.");
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Employees</h2>
          <p className="text-slate-500 mt-1">Directory of staff for asset assignment.</p>
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
          <span>{isAdding ? "Cancel" : "Add Employee"}</span>
        </button>
      </div>

      {isAdding && (
        <div className="bg-slate-50 p-8 rounded-2xl border border-slate-200 shadow-sm animate-in slide-in-from-top-4 duration-300">
          <div className="mb-6">
            <h3 className="text-xl font-bold text-slate-900">New Employee</h3>
            <p className="text-sm text-slate-500">Add a new staff member to the system.</p>
          </div>
          <form onSubmit={handleAddEmployee} className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">Full Name</label>
              <input
                type="text"
                required
                value={newEmployee.name}
                onChange={(e) => setNewEmployee({ ...newEmployee, name: e.target.value })}
                className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                placeholder="John Doe"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">Email Address</label>
              <input
                type="email"
                required
                value={newEmployee.email}
                onChange={(e) => setNewEmployee({ ...newEmployee, email: e.target.value })}
                className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                placeholder="john@example.com"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">Department</label>
              <input
                type="text"
                required
                value={newEmployee.department}
                onChange={(e) => setNewEmployee({ ...newEmployee, department: e.target.value })}
                className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                placeholder="Engineering"
              />
            </div>
            <div className="md:col-span-3 pt-2 flex justify-end">
              <button 
                type="submit"
                className="px-8 py-3 bg-indigo-600 text-white rounded-xl font-semibold shadow-sm hover:bg-indigo-700 hover:shadow-md transition-all transform active:scale-95"
              >
                Save Employee
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full py-16 text-center text-slate-500 animate-pulse">Loading directory...</div>
        ) : employees.length === 0 ? (
          <div className="col-span-full py-16 text-center text-slate-400">
            <div className="flex flex-col items-center justify-center space-y-2">
              <Users className="w-12 h-12 opacity-20" />
              <p>No employees found.</p>
            </div>
          </div>
        ) : (
          employees.map((employee) => (
            <div key={employee.id} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:border-indigo-200 hover:shadow-md transition-all">
              <div className="flex items-center space-x-4 mb-4">
                <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-lg">
                  {employee.name.charAt(0)}
                </div>
                <div>
                  <h3 className="font-bold text-slate-900">{employee.name}</h3>
                  <p className="text-sm text-slate-500">{employee.department}</p>
                </div>
              </div>
              <div className="space-y-2 pt-4 border-t border-slate-100">
                <div className="flex items-center text-sm text-slate-600">
                  <Mail className="w-4 h-4 mr-2 text-slate-400" />
                  {employee.email}
                </div>
                <div className="flex items-center text-sm text-slate-600">
                  <Building className="w-4 h-4 mr-2 text-slate-400" />
                  {employee.department}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
