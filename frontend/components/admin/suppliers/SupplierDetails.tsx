"use client";

import { useState, useEffect } from 'react';
import { Supplier, Purchase } from './types';
import { supplierApi } from '@/lib/api/supplierApi';
//import { purchaseApi } from '@/lib/api/purchaseApi'; // You'll need to create this
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Building2, 
  Phone, 
  Mail, 
  MapPin, 
  Package, 
  Calendar, 
  DollarSign,
  X,
  Plus,
  ShoppingCart,
  TrendingUp
} from 'lucide-react';

interface SupplierDetailsProps {
  supplier: Supplier;
  onClose: () => void;
  onRefresh?: () => void;
}

export default function SupplierDetails({ supplier, onClose, onRefresh }: SupplierDetailsProps) {
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [loading, setLoading] = useState(true);
  const [addingPurchase, setAddingPurchase] = useState(false);
  
  // Purchase form state
  const [productName, setProductName] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [amount, setAmount] = useState(0);
  const [purchaseDate, setPurchaseDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');

  // Fetch purchases for this supplier
  useEffect(() => {
    const fetchPurchases = async () => {
      try {
        // You'll need to implement purchaseApi.getBySupplierId()
        // const data = await purchaseApi.getBySupplierId(supplier.id);
        // setPurchases(data);
        
        // For now, using localStorage as fallback
        const raw = localStorage.getItem(`purchases_${supplier.id}`);
        if (raw) {
          setPurchases(JSON.parse(raw));
        }
      } catch (error) {
        console.error('Failed to fetch purchases:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPurchases();
  }, [supplier.id]);

  // Calculate totals
  const totals = {
    totalPaid: purchases.reduce((sum, p) => sum + p.amount, 0),
    totalItems: purchases.reduce((sum, p) => sum + p.quantity, 0),
    recentPurchases: purchases.filter(p => {
      const purchaseDate = new Date(p.date);
      const monthAgo = new Date();
      monthAgo.setMonth(monthAgo.getMonth() - 1);
      return purchaseDate > monthAgo;
    }).length,
  };

  const handleAddPurchase = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!productName.trim() || amount <= 0) {
      alert('Please fill in all required fields');
      return;
    }

    const newPurchase: Purchase = {
      id: `purchase_${Date.now()}`,
      supplier_id: supplier.id,
      supplier_name: supplier.name,
      product_name: productName,
      quantity,
      amount,
      date: purchaseDate,
      notes: notes || undefined,
      created_at: new Date().toISOString(),
    };

    try {
      // Save to backend API (implement purchaseApi.create())
      // await purchaseApi.create(newPurchase);
      
      // Save to localStorage as fallback
      const updatedPurchases = [newPurchase, ...purchases];
      setPurchases(updatedPurchases);
      localStorage.setItem(`purchases_${supplier.id}`, JSON.stringify(updatedPurchases));
      
      // Reset form
      setProductName('');
      setQuantity(1);
      setAmount(0);
      setPurchaseDate(new Date().toISOString().split('T')[0]);
      setNotes('');
      setAddingPurchase(false);
      
      // Refresh parent if needed
      if (onRefresh) onRefresh();
      
    } catch (error) {
      console.error('Failed to add purchase:', error);
      alert('Failed to add purchase. Please try again.');
    }
  };

  const handleDeletePurchase = async (purchaseId: string) => {
    if (!confirm('Are you sure you want to delete this purchase?')) return;
    
    try {
      // Delete from backend API
      // await purchaseApi.delete(purchaseId);
      
      // Delete from local state
      const updatedPurchases = purchases.filter(p => p.id !== purchaseId);
      setPurchases(updatedPurchases);
      localStorage.setItem(`purchases_${supplier.id}`, JSON.stringify(updatedPurchases));
      
    } catch (error) {
      console.error('Failed to delete purchase:', error);
      alert('Failed to delete purchase.');
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading supplier details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-center p-4 z-50 overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl my-8"
      >
        {/* Header */}
        <div className="px-8 py-6 border-b border-gray-200 flex items-start justify-between bg-gradient-to-r from-emerald-50 to-white">
          <div className="flex items-center gap-4">
            <div className="h-14 w-14 bg-emerald-100 rounded-xl flex items-center justify-center">
              <Building2 className="h-7 w-7 text-emerald-700" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{supplier.name}</h2>
              <div className="flex flex-wrap gap-3 mt-2">
                {supplier.email && (
                  <span className="inline-flex items-center gap-1.5 text-sm text-gray-600 bg-gray-100 px-3 py-1 rounded-full">
                    <Mail className="h-3.5 w-3.5" />
                    {supplier.email}
                  </span>
                )}
                {supplier.phone_number && (
                  <span className="inline-flex items-center gap-1.5 text-sm text-gray-600 bg-gray-100 px-3 py-1 rounded-full">
                    <Phone className="h-3.5 w-3.5" />
                    {supplier.phone_number}
                  </span>
                )}
                {supplier.address && (
                  <span className="inline-flex items-center gap-1.5 text-sm text-gray-600 bg-gray-100 px-3 py-1 rounded-full">
                    <MapPin className="h-3.5 w-3.5" />
                    {supplier.address.substring(0, 30)}...
                  </span>
                )}
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl p-2 hover:bg-gray-100 rounded-lg"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Stats */}
        <div className="px-8 py-6 border-b border-gray-200">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-xl p-4">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 bg-white rounded-lg flex items-center justify-center">
                  <DollarSign className="h-6 w-6 text-emerald-700" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Spent</p>
                  <p className="text-2xl font-bold text-emerald-900">
                    KES {totals.totalPaid.toLocaleString()}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 bg-white rounded-lg flex items-center justify-center">
                  <Package className="h-6 w-6 text-blue-700" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Items</p>
                  <p className="text-2xl font-bold text-blue-900">
                    {totals.totalItems.toLocaleString()}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 bg-white rounded-lg flex items-center justify-center">
                  <TrendingUp className="h-6 w-6 text-purple-700" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Last 30 Days</p>
                  <p className="text-2xl font-bold text-purple-900">
                    {totals.recentPurchases} purchases
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="px-8 py-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column: Supplier Info */}
            <div className="lg:col-span-2 space-y-6">
              {/* Supplies Info */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <Package className="h-5 w-5 text-emerald-600" />
                    Supplies & Additional Info
                  </h3>
                  {supplier.additional_info && (
                    <span className="text-sm text-gray-500">
                      {Object.keys(supplier.additional_info).length} items
                    </span>
                  )}
                </div>
                {supplier.additional_info ? (
                  <div className="bg-gray-50 rounded-xl p-4">
                    <pre className="text-gray-900 whitespace-pre-wrap font-sans text-sm">
                      {JSON.stringify(supplier.additional_info, null, 2)}
                    </pre>
                  </div>
                ) : (
                  <div className="bg-gray-50 rounded-xl p-6 text-center">
                    <Package className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-500">No additional information provided</p>
                  </div>
                )}
              </div>

              {/* Purchase History */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <ShoppingCart className="h-5 w-5 text-emerald-600" />
                    Purchase History
                  </h3>
                  <button
                    onClick={() => setAddingPurchase(true)}
                    className="px-4 py-2 bg-emerald-600 text-white text-sm font-medium rounded-lg hover:bg-emerald-700 flex items-center gap-2"
                  >
                    <Plus className="h-4 w-4" />
                    Add Purchase
                  </button>
                </div>

                {purchases.length > 0 ? (
                  <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Date
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Product
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Qty
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Amount
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Actions
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {purchases.map((purchase) => (
                            <tr key={purchase.id} className="hover:bg-gray-50">
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {new Date(purchase.date).toLocaleDateString()}
                              </td>
                              <td className="px-6 py-4 text-sm text-gray-900">
                                {purchase.product_name}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {purchase.quantity}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-emerald-900">
                                KES {purchase.amount.toLocaleString()}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm">
                                <button
                                  onClick={() => handleDeletePurchase(purchase.id)}
                                  className="text-red-600 hover:text-red-900 text-xs font-medium"
                                >
                                  Delete
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ) : (
                  <div className="bg-gray-50 rounded-xl p-8 text-center">
                    <ShoppingCart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h4 className="text-lg font-medium text-gray-900 mb-2">No purchases yet</h4>
                    <p className="text-gray-500 mb-4">Add your first purchase to start tracking</p>
                    <button
                      onClick={() => setAddingPurchase(true)}
                      className="px-6 py-3 bg-emerald-600 text-white font-medium rounded-lg hover:bg-emerald-700 inline-flex items-center gap-2"
                    >
                      <Plus className="h-5 w-5" />
                      Add First Purchase
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Right Column: Quick Actions & Add Purchase Form */}
            <div className="space-y-6">
              {/* Add Purchase Form */}
              <AnimatePresence>
                {addingPurchase && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-xl p-6 overflow-hidden"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-semibold text-emerald-900">New Purchase</h4>
                      <button
                        onClick={() => setAddingPurchase(false)}
                        className="text-emerald-700 hover:text-emerald-900"
                      >
                        <X className="h-5 w-5" />
                      </button>
                    </div>
                    <form onSubmit={handleAddPurchase} className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Product Name *
                        </label>
                        <input
                          type="text"
                          value={productName}
                          onChange={(e) => setProductName(e.target.value)}
                          className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                          placeholder="Enter product name"
                          required
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Quantity *
                          </label>
                          <input
                            type="number"
                            min="1"
                            value={quantity}
                            onChange={(e) => setQuantity(Number(e.target.value))}
                            className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Amount (KES) *
                          </label>
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={amount}
                            onChange={(e) => setAmount(Number(e.target.value))}
                            className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                            required
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Date
                        </label>
                        <input
                          type="date"
                          value={purchaseDate}
                          onChange={(e) => setPurchaseDate(e.target.value)}
                          className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Notes (Optional)
                        </label>
                        <textarea
                          value={notes}
                          onChange={(e) => setNotes(e.target.value)}
                          rows={2}
                          className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
                          placeholder="Any additional notes..."
                        />
                      </div>

                      <button
                        type="submit"
                        className="w-full py-3 bg-emerald-600 text-white font-medium rounded-lg hover:bg-emerald-700 transition-colors"
                      >
                        Save Purchase
                      </button>
                    </form>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Supplier Metadata */}
              <div className="bg-gray-50 rounded-xl p-6">
                <h4 className="font-semibold text-gray-900 mb-4">Supplier Information</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Created On</span>
                    <span className="text-gray-900 font-medium">
                      {new Date(supplier.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Last Updated</span>
                    <span className="text-gray-900 font-medium">
                      {new Date(supplier.updated_at).toLocaleDateString()}
                    </span>
                  </div>
                  {supplier.created_by && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Added By</span>
                      <span className="text-gray-900 font-medium">
                        {supplier.created_by.first_name} {supplier.created_by.last_name}
                      </span>
                    </div>
                  )}
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Total Purchases</span>
                    <span className="text-emerald-700 font-semibold">
                      {purchases.length}
                    </span>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6">
                <h4 className="font-semibold text-blue-900 mb-4">Quick Actions</h4>
                <div className="space-y-3">
                  <button
                    onClick={() => {
                      onClose();
                      // Navigate to edit supplier page
                    }}
                    className="w-full py-2.5 bg-white text-blue-700 font-medium rounded-lg hover:bg-blue-50 transition-colors"
                  >
                    Edit Supplier Info
                  </button>
                  <button
                    onClick={() => setAddingPurchase(true)}
                    className="w-full py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                  >
                    <Plus className="h-4 w-4" />
                    New Purchase
                  </button>
                  <button className="w-full py-2.5 bg-white text-gray-700 font-medium rounded-lg hover:bg-gray-100 transition-colors">
                    Export Purchase History
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-8 py-6 border-t border-gray-200 bg-gray-50 rounded-b-2xl">
          <div className="flex justify-end gap-3">
            <button
              onClick={onClose}
              className="px-6 py-3 border-2 border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}