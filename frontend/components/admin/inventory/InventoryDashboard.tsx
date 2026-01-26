"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, 
  Package, 
  DollarSign, 
  AlertTriangle, 
  TrendingUp,
  Calendar,
  Truck,
  Building2,
  Search,
  Filter,
  Download
} from 'lucide-react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import InventoryForm from './InventoryForm';
import { inventoryApi } from '@/lib/api/inventoryApi';
import type { InventoryItem } from './types';
export default function InventoryDashboard() {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [filteredInventory, setFilteredInventory] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  
  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [filterBrand, setFilterBrand] = useState('');
  const [filterSupplier, setFilterSupplier] = useState('');
  const [filterStock, setFilterStock] = useState<'all' | 'low' | 'expiring'>('all');

  // Load inventory
  useEffect(() => {
    fetchInventory();
  }, []);

  const fetchInventory = async () => {
    try {
      const data = await inventoryApi.list();
      setInventory(data);
      setFilteredInventory(data);
    } catch (error) {
      console.error('Failed to load inventory:', error);
      toast.error('Failed to load inventory');
    } finally {
      setLoading(false);
    }
  };

  // Apply filters
  useEffect(() => {
    let filtered = [...inventory];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(item =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.brand_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.supplier_name?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Brand filter
    if (filterBrand) {
      filtered = filtered.filter(item => item.brand_name === filterBrand);
    }

    // Supplier filter
    if (filterSupplier) {
      filtered = filtered.filter(item => item.supplier_name === filterSupplier);
    }

    // Stock filter
    if (filterStock === 'low') {
      filtered = filtered.filter(item => item.quantity < 10);
    } else if (filterStock === 'expiring') {
      const today = new Date();
      const nextMonth = new Date();
      nextMonth.setMonth(today.getMonth() + 1);
      filtered = filtered.filter(item => {
        if (!item.expiry_date) return false;
        const expiryDate = new Date(item.expiry_date);
        return expiryDate <= nextMonth && expiryDate >= today;
      });
    }

    setFilteredInventory(filtered);
  }, [inventory, searchTerm, filterBrand, filterSupplier, filterStock]);

  // Calculate stats
  const stats = {
    totalItems: inventory.reduce((sum, item) => sum + item.quantity, 0),
    totalValue: inventory.reduce((sum, item) => sum + item.total_value, 0),
    itemsExpiringSoon: inventory.filter(item => {
      if (!item.expiry_date) return false;
      const expiryDate = new Date(item.expiry_date);
      const nextMonth = new Date();
      nextMonth.setMonth(nextMonth.getMonth() + 1);
      return expiryDate <= nextMonth && expiryDate >= new Date();
    }).length,
    lowStockItems: inventory.filter(item => item.quantity < 10).length,
    recentAdditions: inventory.filter(item => {
      const receivedDate = new Date(item.received_at);
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return receivedDate >= weekAgo;
    }).length,
  };

  const handleSaveItem = async () => {
    await fetchInventory();
    setShowForm(false);
    setEditingItem(null);
    toast.success(editingItem ? 'Inventory item updated' : 'Inventory item added');
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this inventory item?')) return;
    
    try {
      await inventoryApi.delete(id);
      await fetchInventory();
      toast.success('Inventory item deleted');
    } catch (error) {
      console.error('Failed to delete inventory item:', error);
      toast.error('Failed to delete inventory item');
    }
  };

  const handleEdit = (item: InventoryItem) => {
    setEditingItem(item);
    setShowForm(true);
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingItem(null);
  };

  const handleView = (item: InventoryItem) => {
    setSelectedItem(item);
  };

  const handleCloseModal = () => {
    setSelectedItem(null);
  };

  // Get unique brands and suppliers for filters
  const brands = Array.from(new Set(
    inventory.map(item => item.brand_name).filter(Boolean)
  ));
  
  const suppliers = Array.from(new Set(
    inventory.map(item => item.supplier_name).filter(Boolean)
  ));

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading inventory...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50/30 to-white">
      <ToastContainer position="bottom-right" autoClose={3000} />
      
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
                Inventory Management
              </h1>
              <p className="text-gray-600">
                Track stock, manage suppliers, and monitor inventory value
              </p>
            </div>
            <button
              onClick={() => {
                setEditingItem(null);
                setShowForm(true);
              }}
              className="px-6 py-3 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white font-medium rounded-lg hover:from-emerald-700 hover:to-emerald-800 transition-all shadow-lg hover:shadow-xl flex items-center gap-2 whitespace-nowrap"
            >
              <Plus className="h-5 w-5" />
              Add Inventory Item
            </button>
          </div>
        </motion.div>

        {/* Stats Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 mb-8"
        >
          <div className="bg-white rounded-xl p-6 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Items</p>
                <p className="text-3xl font-bold text-emerald-700 mt-2">
                  {stats.totalItems.toLocaleString()}
                </p>
              </div>
              <div className="h-12 w-12 bg-emerald-100 rounded-lg flex items-center justify-center">
                <Package className="h-6 w-6 text-emerald-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Value</p>
                <p className="text-3xl font-bold text-emerald-700 mt-2">
                  KES {stats.totalValue.toLocaleString()}
                </p>
              </div>
              <div className="h-12 w-12 bg-emerald-100 rounded-lg flex items-center justify-center">
                <DollarSign className="h-6 w-6 text-emerald-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Low Stock</p>
                <p className="text-3xl font-bold text-amber-600 mt-2">
                  {stats.lowStockItems}
                </p>
              </div>
              <div className="h-12 w-12 bg-amber-100 rounded-lg flex items-center justify-center">
                <AlertTriangle className="h-6 w-6 text-amber-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Expiring Soon</p>
                <p className="text-3xl font-bold text-red-600 mt-2">
                  {stats.itemsExpiringSoon}
                </p>
              </div>
              <div className="h-12 w-12 bg-red-100 rounded-lg flex items-center justify-center">
                <Calendar className="h-6 w-6 text-red-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Last 7 Days</p>
                <p className="text-3xl font-bold text-blue-600 mt-2">
                  {stats.recentAdditions}
                </p>
              </div>
              <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-xl p-6 shadow-lg mb-8"
        >
          <div className="flex flex-col lg:flex-row lg:items-center gap-4">
            <div className="flex-1">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search inventory..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                />
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <select
                value={filterBrand}
                onChange={(e) => setFilterBrand(e.target.value)}
                className="px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              >
                <option value="">All Brands</option>
                {brands.map(brand => (
                  <option key={brand} value={brand}>{brand}</option>
                ))}
              </select>

              <select
                value={filterSupplier}
                onChange={(e) => setFilterSupplier(e.target.value)}
                className="px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              >
                <option value="">All Suppliers</option>
                {suppliers.map(supplier => (
                  <option key={supplier} value={supplier}>{supplier}</option>
                ))}
              </select>

              <select
                value={filterStock}
                onChange={(e) => setFilterStock(e.target.value as any)}
                className="px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              >
                <option value="all">All Stock</option>
                <option value="low">Low Stock (&lt;10)</option>
                <option value="expiring">Expiring Soon</option>
              </select>

              <button
                onClick={() => {
                  setSearchTerm('');
                  setFilterBrand('');
                  setFilterSupplier('');
                  setFilterStock('all');
                }}
                className="px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 flex items-center gap-2"
              >
                <Filter className="h-4 w-4" />
                Clear Filters
              </button>
            </div>
          </div>
        </motion.div>

        {/* Inventory Form */}
        <AnimatePresence>
          {showForm && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-8 overflow-hidden"
            >
              <InventoryForm
                item={editingItem}
                onSave={handleSaveItem}
                onCancel={handleCancel}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Inventory Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-xl shadow-lg overflow-hidden"
        >
          <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-emerald-50 to-white">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-emerald-900">
                  Inventory Items ({filteredInventory.length})
                </h2>
                <p className="text-sm text-gray-600 mt-1">Showing {filteredInventory.length} of {inventory.length} items</p>
              </div>
              <div className="flex gap-3">
                <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 flex items-center gap-2">
                  <Download className="h-4 w-4" />
                  Export
                </button>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Item Details
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Brand/Supplier
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Stock Info
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Dates
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Value
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredInventory.map((item) => {
                  const isLowStock = item.quantity < 10;
                  const isExpiring = item.expiry_date && 
                    new Date(item.expiry_date) <= new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
                  
                  return (
                    <tr key={item.id} className="hover:bg-gray-50 group">
                      <td className="px-6 py-4">
                        <div>
                          <div className="font-medium text-gray-900">{item.name}</div>
                          <div className="text-sm text-gray-500 mt-1 truncate max-w-xs">
                            {item.description || 'No description'}
                          </div>
                        </div>
                      </td>
                      
                      <td className="px-6 py-4">
                        <div className="space-y-2">
                          {item.brand_name && (
                            <div className="flex items-center text-sm">
                              <Building2 className="h-4 w-4 text-gray-400 mr-2" />
                              <span className="text-gray-700">{item.brand_name}</span>
                            </div>
                          )}
                          {item.supplier_name && (
                            <div className="flex items-center text-sm">
                              <Truck className="h-4 w-4 text-gray-400 mr-2" />
                              <span className="text-gray-700">{item.supplier_name}</span>
                            </div>
                          )}
                        </div>
                      </td>
                      
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className={`px-3 py-1 rounded-full text-xs font-bold ${
                            isLowStock 
                              ? 'bg-red-100 text-red-800' 
                              : 'bg-emerald-100 text-emerald-800'
                          }`}>
                            {item.quantity} units
                          </div>
                          {isLowStock && (
                            <AlertTriangle className="h-4 w-4 text-red-500" />
                          )}
                        </div>
                      </td>
                      
                      <td className="px-6 py-4">
                        <div className="space-y-1 text-sm">
                          <div className="text-gray-600">
                            Received: {new Date(item.received_at).toLocaleDateString()}
                          </div>
                          {item.expiry_date && (
                            <div className={`flex items-center ${
                              isExpiring ? 'text-red-600' : 'text-gray-600'
                            }`}>
                              <Calendar className="h-3 w-3 mr-1" />
                              Expires: {new Date(item.expiry_date).toLocaleDateString()}
                            </div>
                          )}
                        </div>
                      </td>
                      
                      <td className="px-6 py-4">
                        <div className="text-sm">
                          <div className="font-semibold text-emerald-900">
                            KES {item.price_per_unit.toLocaleString()}/unit
                          </div>
                          <div className="text-gray-500">
                            Total: KES {item.total_value.toLocaleString()}
                          </div>
                        </div>
                      </td>
                      
                      <td className="px-6 py-4">
                        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => handleView(item)}
                            className="px-3 py-1.5 text-xs font-medium text-emerald-700 bg-emerald-50 rounded-lg hover:bg-emerald-100"
                          >
                            View
                          </button>
                          <button
                            onClick={() => handleEdit(item)}
                            className="px-3 py-1.5 text-xs font-medium text-blue-700 bg-blue-50 rounded-lg hover:bg-blue-100"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(item.id)}
                            className="px-3 py-1.5 text-xs font-medium text-red-700 bg-red-50 rounded-lg hover:bg-red-100"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {filteredInventory.length === 0 && (
              <div className="text-center py-12">
                <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                  <Package className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {searchTerm || filterBrand || filterSupplier || filterStock !== 'all' 
                    ? 'No inventory items match your filters' 
                    : 'No inventory items yet'}
                </h3>
                <p className="text-gray-500 max-w-sm mx-auto mb-6">
                  {searchTerm || filterBrand || filterSupplier || filterStock !== 'all'
                    ? 'Try adjusting your filters' 
                    : 'Add your first inventory item to get started'}
                </p>
                {!showForm && !searchTerm && !filterBrand && !filterSupplier && filterStock === 'all' && (
                  <button
                    onClick={() => setShowForm(true)}
                    className="px-6 py-3 bg-emerald-600 text-white font-medium rounded-lg hover:bg-emerald-700 inline-flex items-center gap-2"
                  >
                    <Plus className="h-5 w-5" />
                    Add First Item
                  </button>
                )}
              </div>
            )}
          </div>
        </motion.div>
      </div>

      {/* Item Details Modal */}
      <AnimatePresence>
        {selectedItem && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="px-8 py-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-gray-900">{selectedItem.name}</h2>
                  <button
                    onClick={handleCloseModal}
                    className="text-gray-400 hover:text-gray-600 text-2xl"
                  >
                    ×
                  </button>
                </div>
              </div>

              <div className="px-8 py-6 space-y-6">
                {/* Item Details */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Item Details</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Description</p>
                      <p className="text-gray-900">{selectedItem.description || 'No description'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Quantity</p>
                      <p className="text-gray-900 font-semibold">{selectedItem.quantity} units</p>
                    </div>
                  </div>
                </div>

                {/* Brand & Supplier */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Supplier Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {selectedItem.brand_name && (
                      <div>
                        <p className="text-sm text-gray-600">Brand</p>
                        <p className="text-gray-900">{selectedItem.brand_name}</p>
                      </div>
                    )}
                    {selectedItem.supplier_name && (
                      <div>
                        <p className="text-sm text-gray-600">Supplier</p>
                        <p className="text-gray-900">{selectedItem.supplier_name}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Dates */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Dates</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Received On</p>
                      <p className="text-gray-900">
                        {new Date(selectedItem.received_at).toLocaleDateString()}
                      </p>
                    </div>
                    {selectedItem.expiry_date && (
                      <div>
                        <p className="text-sm text-gray-600">Expiry Date</p>
                        <p className="text-gray-900">
                          {new Date(selectedItem.expiry_date).toLocaleDateString()}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Value */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Value Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Price per Unit</p>
                      <p className="text-gray-900 font-semibold">
                        KES {selectedItem.price_per_unit.toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Total Value</p>
                      <p className="text-gray-900 font-semibold text-emerald-700">
                        KES {selectedItem.total_value.toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Metadata */}
                <div className="pt-6 border-t border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Metadata</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Created On</p>
                      <p className="text-gray-900">
                        {new Date(selectedItem.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Last Updated</p>
                      <p className="text-gray-900">
                        {new Date(selectedItem.updated_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="px-8 py-6 border-t border-gray-200 bg-gray-50">
                <div className="flex justify-end gap-3">
                  <button
                    onClick={() => {
                      handleEdit(selectedItem);
                      handleCloseModal();
                    }}
                    className="px-6 py-3 bg-emerald-600 text-white font-medium rounded-lg hover:bg-emerald-700"
                  >
                    Edit Item
                  </button>
                  <button
                    onClick={handleCloseModal}
                    className="px-6 py-3 border-2 border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50"
                  >
                    Close
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}