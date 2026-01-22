"use client";

import { useState, useEffect } from 'react';
import SupplierForm from './SupplierForm';
// import SuppliersTable from './SuppliersTable'; // Comment out for now
import { Supplier } from './types';
import { supplierApi } from '@/lib/api/supplierApi';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Building2, 
  Phone, 
  Mail, 
  Users, 
  Calendar,
  TrendingUp,
  Package,
  MapPin
} from 'lucide-react';

export default function SupplierDashboard() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [filteredSuppliers, setFilteredSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch suppliers on mount
  const fetchSuppliers = async () => {
    try {
      const data = await supplierApi.list();
      setSuppliers(data);
      setFilteredSuppliers(data);
    } catch (error) {
      console.error('Failed to fetch suppliers:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSuppliers();
  }, []);

  // Filter suppliers based on search
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredSuppliers(suppliers);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = suppliers.filter(supplier => 
      supplier.name.toLowerCase().includes(query) ||
      supplier.email?.toLowerCase().includes(query) ||
      supplier.phone_number?.includes(query) ||
      supplier.address?.toLowerCase().includes(query) ||
      JSON.stringify(supplier.additional_info).toLowerCase().includes(query)
    );
    setFilteredSuppliers(filtered);
  }, [searchQuery, suppliers]);

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this supplier? This action cannot be undone.')) {
      try {
        await supplierApi.delete(id);
        fetchSuppliers();
      } catch (error) {
        console.error('Failed to delete supplier:', error);
        alert('Failed to delete supplier. Please try again.');
      }
    }
  };

  const handleView = (supplier: Supplier) => {
    setSelectedSupplier(supplier);
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

  const handleCancel = () => {
    setShowForm(false);
    setEditingSupplier(null);
  };

  const handleCloseModal = () => {
    setSelectedSupplier(null);
  };

  // Calculate stats
  const stats = {
    total: suppliers.length,
    withEmail: suppliers.filter(s => s.email).length,
    withPhone: suppliers.filter(s => s.phone_number).length,
    recentlyAdded: suppliers.filter(s => {
      const date = new Date(s.created_at);
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 30);
      return date > weekAgo;
    }).length,
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading suppliers...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50/30 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div>
              <h1 className="text-3xl lg:text-4xl font-bold text-emerald-900 mb-2">
                Supplier Management
              </h1>
              <p className="text-gray-600">
                Manage your suppliers, track supplies, and maintain relationships
              </p>
            </div>
            <button
              onClick={() => {
                setEditingSupplier(null);
                setShowForm(true);
              }}
              className="px-6 py-3 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white font-medium rounded-lg hover:from-emerald-700 hover:to-emerald-800 transition-all shadow-lg hover:shadow-xl flex items-center gap-2 whitespace-nowrap"
            >
              <Building2 className="h-5 w-5" />
              Add New Supplier
            </button>
          </div>
        </motion.div>

        {/* Stats Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
        >
          {/* ... stats cards code ... */}
        </motion.div>

        {/* Form Section */}
        <AnimatePresence>
          {showForm && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-8 overflow-hidden"
            >
              <SupplierForm
                onSave={handleFormSuccess}
                editSupplier={editingSupplier}
                onCancel={handleCancel}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Simple Suppliers List (temporary) */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-xl shadow-lg overflow-hidden border border-emerald-50"
        >
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-emerald-900">Suppliers ({filteredSuppliers.length})</h2>
                <p className="text-sm text-gray-600 mt-1">Manage your suppliers and their information</p>
              </div>
              <div className="relative">
                <input 
                  type="text"
                  placeholder="Search suppliers..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)} 
                  className="pl-10 pr-4 py-2.5 w-full sm:w-80 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                />
                <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="p-6">
            {filteredSuppliers.length === 0 ? (
              <div className="text-center py-12">
                <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                  <Building2 className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No suppliers found</h3>
                <p className="text-gray-500 max-w-sm mx-auto">
                  {searchQuery ? 'Try adjusting your search or add a new supplier' : 'Add your first supplier to get started'}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredSuppliers.map((supplier) => (
                  <div key={supplier.id} className="bg-gray-50 rounded-lg p-4 border border-gray-200 hover:border-emerald-300 transition-colors">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                          <Building2 className="h-5 w-5 text-emerald-700" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">{supplier.name}</h3>
                          {supplier.email && (
                            <p className="text-sm text-gray-600">{supplier.email}</p>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <button
                          onClick={() => handleEdit(supplier)}
                          className="p-1.5 text-blue-600 hover:bg-blue-50 rounded"
                          title="Edit"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(supplier.id)}
                          className="p-1.5 text-red-600 hover:bg-red-50 rounded"
                          title="Delete"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                    
                    <div className="space-y-2 text-sm">
                      {supplier.phone_number && (
                        <div className="flex items-center text-gray-700">
                          <Phone className="h-4 w-4 mr-2 text-gray-400" />
                          {supplier.phone_number}
                        </div>
                      )}
                      {supplier.address && (
                        <div className="flex items-center text-gray-700">
                          <MapPin className="h-4 w-4 mr-2 text-gray-400" />
                          <span className="truncate">{supplier.address}</span>
                        </div>
                      )}
                    </div>
                    
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span>Added: {new Date(supplier.created_at).toLocaleDateString()}</span>
                        <button
                          onClick={() => handleView(supplier)}
                          className="text-emerald-600 hover:text-emerald-800"
                        >
                          View Details
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </motion.div>

        {/* Supplier Details Modal */}
        <AnimatePresence>
          {selectedSupplier && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden"
              >
                {/* Modal content... */}
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}