"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import SupplierForm from './SupplierForm';
import { Supplier } from './types';
import { supplierApi } from '@/lib/api/supplierApi';
import { authApi } from '@/lib/api/authApi';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Building2,
  Phone,
  Mail,
  TrendingUp,
  MapPin
} from 'lucide-react';

export default function SupplierDashboard() {
  const router = useRouter();

  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [filteredSuppliers, setFilteredSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // 🔐 AUTH: Safe fetch wrapper
  const fetchSuppliers = async () => {
    try {
      if (!authApi.isAuthenticated()) {
        authApi.logout();
        router.push('/login');
        return;
      }

      const data = await supplierApi.list();
      setSuppliers(data);
      setFilteredSuppliers(data);
    } catch (error: any) {
      console.error('Failed to fetch suppliers:', error);

      // 🔐 AUTH: Handle expired / invalid token
      if (
        error.message?.toLowerCase().includes('not authenticated') ||
        error.message?.includes('401') ||
        error.message?.includes('403')
      ) {
        authApi.logout();
        router.push('/login');
        return;
      }

      alert('Failed to load suppliers. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // AUTH: Run once on mount
  useEffect(() => {
    fetchSuppliers();
  }, []);

  // Search filter
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredSuppliers(suppliers);
      return;
    }

    const q = searchQuery.toLowerCase();
    setFilteredSuppliers(
      suppliers.filter(s =>
        s.name.toLowerCase().includes(q) ||
        (s.email && s.email.toLowerCase().includes(q)) ||
        (s.phone_number && s.phone_number.toLowerCase().includes(q)) ||
        (s.address && s.address.toLowerCase().includes(q))
      )
    );
  }, [searchQuery, suppliers]);

  // AUTH-safe delete
  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this supplier?')) return;

    try {
      await supplierApi.delete(id);
      fetchSuppliers();
    } catch (error: any) {
      console.error('Delete failed:', error);

      if (error.message?.includes('Not authenticated')) {
        authApi.logout();
        router.push('/login');
        return;
      }

      alert('Failed to delete supplier.');
    }
  };

  const handleEdit = (supplier: Supplier) => {
    setEditingSupplier(supplier);
    setShowForm(true);
  };

  const handleFormSuccess = () => {
    fetchSuppliers();
    setShowForm(false);
    setEditingSupplier(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50/30 to-white">
      <div className="max-w-7xl mx-auto px-4 py-8">

        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-emerald-900">
            Supplier Management
          </h1>
          <button
            onClick={() => {
              setEditingSupplier(null);
              setShowForm(true);
            }}
            className="px-6 py-3 bg-emerald-600 text-white rounded-lg"
          >
            Add Supplier
          </button>
        </div>

        {/* Form */}
        <AnimatePresence>
          {showForm && (
            <SupplierForm
              editSupplier={editingSupplier}
              onSave={handleFormSuccess}
              onCancel={() => setShowForm(false)}
            />
          )}
        </AnimatePresence>

        {/* List */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
          {filteredSuppliers.map(supplier => (
            <div
              key={supplier.id}
              className="bg-white p-4 rounded-lg shadow"
            >
              <h3 className="font-semibold">{supplier.name}</h3>

              {supplier.phone_number && (
                <p className="text-sm flex items-center">
                  <Phone className="h-4 w-4 mr-1" />
                  {supplier.phone_number}
                </p>
              )}

              <div className="flex justify-end gap-2 mt-4">
                <button
                  onClick={() => handleEdit(supplier)}
                  className="text-blue-600"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(supplier.id)}
                  className="text-red-600"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}
