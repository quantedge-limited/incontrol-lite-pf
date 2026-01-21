/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { Plus, Trash2, Edit2, X, Upload } from 'lucide-react';
import Image from 'next/image';
// Import Toastify
import { ToastContainer, toast } from 'react-toastify';


interface Product {
  id: string;
  name: string;
  price: number;
  description: string;
  inStock: boolean;
  image: string;
  brand: string;
}

export const ProductsDashboard: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [isAddingProduct, setIsAddingProduct] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [hasMounted, setHasMounted] = useState(false); // Hydration fix
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    description: '',
    brand: '',
    inStock: true,
    image: '',
  });
  const [imagePreview, setImagePreview] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');

  // Hydration fix: ensures client-only code runs after mount
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setHasMounted(true);
    const savedProducts = localStorage.getItem('products');
    if (savedProducts) {
      try {
        setProducts(JSON.parse(savedProducts));
      } catch (error) {
        console.error('Failed to load products:', error);
      }
    }
  }, []);

  // Save products to localStorage whenever they change
  useEffect(() => {
    if (hasMounted) {
      localStorage.setItem('products', JSON.stringify(products));
    }
  }, [products, hasMounted]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const imageData = reader.result as string;
        setFormData((prev) => ({ ...prev, image: imageData }));
        setImagePreview(imageData);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as any;
    const val = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'price' ? parseFloat(value) || 0 : val,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.price || !formData.brand || !formData.image) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (editingId) {
      setProducts((prev) =>
        prev.map((p) =>
          p.id === editingId
            ? {
                ...p,
                name: formData.name,
                price: formData.price as any,
                description: formData.description,
                brand: formData.brand,
                inStock: formData.inStock,
                image: formData.image,
              }
            : p
        )
      );
      toast.success('Product updated');
      setEditingId(null);
    } else {
      const newProduct: Product = {
        id: Date.now().toString(),
        name: formData.name,
        price: formData.price as any,
        description: formData.description,
        brand: formData.brand,
        inStock: formData.inStock,
        image: formData.image,
      };
      setProducts((prev) => [...prev, newProduct]);
      toast.success('Product added');
    }

    setFormData({
      name: '',
      price: '',
      description: '',
      brand: '',
      inStock: true,
      image: '',
    });
    setImagePreview('');
    setIsAddingProduct(false);
  };

  const handleEdit = (product: Product) => {
    setEditingId(product.id);
    setFormData({
      name: product.name,
      price: product.price.toString(),
      description: product.description,
      brand: product.brand,
      inStock: product.inStock,
      image: product.image,
    });
    setImagePreview(product.image);
    setIsAddingProduct(true);
  };

  // UPDATED: handleDelete now uses a React Toast for confirmation
  const handleDelete = (id: string) => {
    toast.warn(
      ({ closeToast }) => (
        <div>
          <p className="mb-2 font-medium">Are you sure you want to delete this?</p>
          <div className="flex gap-2">
            <button
              onClick={() => {
                setProducts((prev) => prev.filter((p) => p.id !== id));
                toast.dismiss();
                toast.info('Product deleted');
              }}
              className="bg-red-600 text-white px-3 py-1 rounded text-xs font-bold"
            >
              Yes, Delete
            </button>
            <button
              onClick={closeToast}
              className="bg-gray-200 text-gray-800 px-3 py-1 rounded text-xs font-bold"
            >
              Cancel
            </button>
          </div>
        </div>
      ),
      {
        position: "top-center",
        autoClose: false,
        closeOnClick: false,
        draggable: false,
      }
    );
  };

  const handleCancel = () => {
    setIsAddingProduct(false);
    setEditingId(null);
    setFormData({
      name: '',
      price: '',
      description: '',
      brand: '',
      inStock: true,
      image: '',
    });
    setImagePreview('');
  };

  // Prevent hydration mismatch by not rendering until mounted
  if (!hasMounted) return null;

  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.brand.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const brands = [...new Set(products.map((p) => p.brand))];

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#f0fdf4' }}>
      <ToastContainer position="bottom-right" autoClose={3000} hideProgressBar={false} />
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-6 sm:py-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 sm:mb-12"
        >
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
          <p className="text-sm sm:text-base text-gray-600">Manage your products and inventory</p>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-8 sm:mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="rounded-lg p-4 sm:p-6 text-white" style={{ backgroundColor: '#15803d' }}
          >
            <h3 className="text-xs sm:text-sm font-medium opacity-90 mb-2">Total Products</h3>
            <p className="text-2xl sm:text-3xl font-bold">{products.length}</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="rounded-lg p-4 sm:p-6 text-white" style={{ backgroundColor: '#15803d' }}
          >
            <h3 className="text-xs sm:text-sm font-medium opacity-90 mb-2">Total Brands</h3>
            <p className="text-2xl sm:text-3xl font-bold">{brands.length}</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="rounded-lg p-4 sm:p-6 text-white" style={{ backgroundColor: '#15803d' }}
          >
            <h3 className="text-xs sm:text-sm font-medium opacity-90 mb-2">In Stock</h3>
            <p className="text-2xl sm:text-3xl font-bold">{products.filter((p) => p.inStock).length}</p>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-8">
          {/* Add/Edit Product Form */}
          {isAddingProduct && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="lg:col-span-1 bg-white rounded-xl p-4 sm:p-6 lg:p-8 shadow-lg max-h-[calc(100vh-200px)] overflow-y-auto"
            >
              <div className="flex justify-between items-center mb-4 sm:mb-6">
                <h2 className="text-lg sm:text-2xl font-bold text-gray-900">
                  {editingId ? 'Edit Product' : 'Add Product'}
                </h2>
                <button
                  onClick={handleCancel}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    Product Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full px-3 sm:px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none text-gray-900"
                    style={{ color: '#333' }}
                    onFocus={(e) => (e.currentTarget.style.borderColor = '#15803d')}
                    onBlur={(e) => (e.currentTarget.style.borderColor = '#d1d5db')}
                    placeholder="Product name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    Brand *
                  </label>
                  <input
                    type="text"
                    name="brand"
                    value={formData.brand}
                    onChange={handleInputChange}
                    className="w-full px-3 sm:px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none text-gray-900"
                    style={{ color: '#333' }}
                    onFocus={(e) => (e.currentTarget.style.borderColor = '#15803d')}
                    onBlur={(e) => (e.currentTarget.style.borderColor = '#d1d5db')}
                    placeholder="Brand name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    Price (KES) *
                  </label>
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                    className="w-full px-3 sm:px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none text-gray-900"
                    style={{ color: '#333' }}
                    onFocus={(e) => (e.currentTarget.style.borderColor = '#15803d')}
                    onBlur={(e) => (e.currentTarget.style.borderColor = '#d1d5db')}
                    placeholder="0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    Description
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full px-3 sm:px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none text-gray-900 resize-none"
                    style={{ color: '#333' }}
                    onFocus={(e) => (e.currentTarget.style.borderColor = '#15803d')}
                    onBlur={(e) => (e.currentTarget.style.borderColor = '#d1d5db')}
                    placeholder="Product description"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    Product Image *
                  </label>
                  <div className="relative">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none"
                    />
                  </div>
                  {imagePreview && (
                    <div className="mt-3 rounded-lg overflow-hidden">
                      <Image
                        src={imagePreview}
                        alt="Preview"
                        width={400}
                        height={160}
                        className="w-full h-40 object-cover"
                      />
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    name="inStock"
                    id="inStock"
                    checked={formData.inStock}
                    onChange={handleInputChange}
                  />
                  <label htmlFor="inStock" className="text-sm font-medium text-gray-900">
                    In Stock
                  </label>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="submit"
                    className="flex-1 py-2 text-white font-bold rounded-lg transition-colors hover:opacity-90"
                    style={{ backgroundColor: '#15803d' }}
                  >
                    {editingId ? 'Update Product' : 'Add Product'}
                  </button>
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="flex-1 py-2 border-2 border-gray-300 text-gray-900 font-bold rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </motion.div>
          )}

          {/* Products List */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className={`bg-white rounded-xl p-4 sm:p-6 lg:p-8 shadow-lg max-h-[calc(100vh-200px)] overflow-y-auto ${isAddingProduct ? 'lg:col-span-2' : 'lg:col-span-3'}`}
          >
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4 sm:mb-6">
              <h2 className="text-lg sm:text-2xl font-bold text-gray-900">Products</h2>
              {!isAddingProduct && (
                <button
                  onClick={() => setIsAddingProduct(true)}
                  className="flex items-center gap-2 px-3 sm:px-4 py-2 text-xs sm:text-sm text-white font-bold rounded-lg transition-colors hover:opacity-90 whitespace-nowrap"
                  style={{ backgroundColor: '#15803d' }}
                >
                  <Plus size={18} />
                  Add
                </button>
              )}
            </div>

            <div className="mb-4 sm:mb-6">
              <input
                type="text"
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 sm:px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none text-sm sm:text-base text-gray-900"
                style={{ color: '#333' }}
                onFocus={(e) => (e.currentTarget.style.borderColor = '#15803d')}
                onBlur={(e) => (e.currentTarget.style.borderColor = '#d1d5db')}
              />
            </div>

            <div className="overflow-x-auto -mx-4 sm:mx-0 px-4 sm:px-0">
              <table className="w-full text-sm sm:text-base">
                <thead>
                  <tr className="border-b-2" style={{ borderColor: '#bbf7d0' }}>
                    <th className="text-left py-2 sm:py-3 px-2 sm:px-4 font-bold text-gray-900">Image</th>
                    <th className="text-left py-2 sm:py-3 px-2 sm:px-4 font-bold text-gray-900">Name</th>
                    <th className="text-left py-2 sm:py-3 px-2 sm:px-4 font-bold text-gray-900 hidden sm:table-cell">Brand</th>
                    <th className="text-left py-2 sm:py-3 px-2 sm:px-4 font-bold text-gray-900">Price</th>
                    <th className="text-left py-2 sm:py-3 px-2 sm:px-4 font-bold text-gray-900 hidden md:table-cell">Stock</th>
                    <th className="text-left py-2 sm:py-3 px-2 sm:px-4 font-bold text-gray-900">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProducts.map((product) => (
                    <motion.tr
                      key={product.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="border-b hover:bg-green-50/50 transition-colors text-xs sm:text-sm"
                    >
                      <td className="py-2 sm:py-3 px-2 sm:px-4">
                        <Image
                          src={product.image}
                          alt={product.name}
                          width={48}
                          height={48}
                          className="w-8 h-8 sm:w-12 sm:h-12 rounded object-cover"
                        />
                      </td>
                      <td className="py-2 sm:py-3 px-2 sm:px-4 text-gray-900 font-medium line-clamp-1">{product.name}</td>
                      <td className="py-2 sm:py-3 px-2 sm:px-4 text-gray-600 hidden sm:table-cell">{product.brand}</td>
                      <td className="py-2 sm:py-3 px-2 sm:px-4 text-gray-900 font-bold">KES {product.price}</td>
                      <td className="py-2 sm:py-3 px-2 sm:px-4 hidden md:table-cell">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-bold text-white inline-block ${
                            product.inStock ? 'bg-green-600' : 'bg-gray-400'
                          }`}
                        >
                          {product.inStock ? 'In Stock' : 'Out'}
                        </span>
                      </td>
                      <td className="py-2 sm:py-3 px-2 sm:px-4">
                        <div className="flex gap-1 sm:gap-2">
                          <button
                            onClick={() => handleEdit(product)}
                            className="p-1 sm:p-2 hover:bg-green-100 rounded transition-colors"
                            title="Edit"
                          >
                            <Edit2 size={14} className="sm:w-4 sm:h-4 text-green-700" />
                          </button>
                          <button
                            onClick={() => handleDelete(product.id)}
                            className="p-1 sm:p-2 hover:bg-red-100 rounded transition-colors"
                            title="Delete"
                          >
                            <Trash2 size={14} className="sm:w-4 sm:h-4 text-red-600" />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>

              {filteredProducts.length === 0 && (
                <div className="text-center py-8 sm:py-12">
                  <p className="text-gray-500 text-sm sm:text-base mb-4">
                    {products.length === 0 ? 'No products yet. Add one to get started!' : 'No products match your search.'}
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};