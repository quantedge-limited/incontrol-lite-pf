"use client";

import { useState, useEffect } from 'react';
import { Brand, Supplier, ProductFormData } from './types';
import { brandApi, Brand as ApiBrand } from '@/lib/api/brandApi';
import { supplierApi, Supplier as ApiSupplier } from '@/lib/api/supplierApi';
import { productApi } from '@/lib/api/productApi';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Upload, Image as ImageIcon, Plus, Building2 } from 'lucide-react';
import Image from 'next/image';

interface ProductFormProps {
  product?: any;
  onSave: () => void;
  onCancel: () => void;
}

export default function ProductForm({ product, onSave, onCancel }: ProductFormProps) {
  const [brands, setBrands] = useState<ApiBrand[]>([]);
  const [suppliers, setSuppliers] = useState<ApiSupplier[]>([]);
  const [loading, setLoading] = useState(false);
  const [showAddBrand, setShowAddBrand] = useState(false);
  const [newBrandName, setNewBrandName] = useState('');
  const [newBrandDescription, setNewBrandDescription] = useState('');
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState<ProductFormData>({
    name: product?.name || '',
    brand_id: product?.brand_id || '',
    supplier_id: product?.supplier_id || '',
    quantity: product?.quantity || 0,
    price: product?.price || 0,
    description: product?.description || '',
    images: product?.images || [],
  });
  
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);

  // Load brands and suppliers
  useEffect(() => {
    const loadData = async () => {
      try {
        const [brandsData, suppliersData] = await Promise.all([
          brandApi.list(),
          supplierApi.list()
        ]);
        setBrands(brandsData);
        setSuppliers(suppliersData);
      } catch (error) {
        console.error('Failed to load data:', error);
        setError('Failed to load brands and suppliers');
      }
    };
    loadData();
  }, []);

  // Handle image upload
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const newFiles = [...imageFiles, ...files];
    setImageFiles(newFiles);
    
    // Create previews
    files.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const newPreview = reader.result as string;
        setImagePreviews(prev => [...prev, newPreview]);
        setFormData(prev => ({
          ...prev,
          images: [...prev.images, newPreview]
        }));
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index: number) => {
    setImageFiles(prev => prev.filter((_, i) => i !== index));
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  // Add new brand
  const handleAddBrand = async () => {
    if (!newBrandName.trim()) {
      setError('Brand name is required');
      return;
    }

    try {
      const newBrand = await brandApi.create(newBrandName, newBrandDescription);
      setBrands(prev => [...prev, newBrand]);
      setFormData(prev => ({ ...prev, brand_id: newBrand.id }));
      setNewBrandName('');
      setNewBrandDescription('');
      setShowAddBrand(false);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to create brand');
    }
  };


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      let imagePath = formData.image_path;

      // If new image selected, upload it
      if (imageFile) {
        // Upload image and get path
        imagePath = await uploadProductImage(
          imageFile,
          product?.id || `new-${Date.now()}`,
          formData.name
        );
      }

      // Save product with image path to backend
      const productData = {
        ...formData,
        image_path: imagePath || null,
      };

      if (product?.id) {
        await productApi.update(product.id, productData);
      } else {
        await productApi.create(productData);
      }

      onSave();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 mb-6 border border-emerald-100">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-emerald-900">
          {product ? 'Edit Product' : 'Add New Product'}
        </h2>
        <button
          onClick={onCancel}
          className="p-2 hover:bg-gray-100 rounded-lg"
        >
          <X className="h-5 w-5 text-gray-500" />
        </button>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Product Name */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Product Name *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              placeholder="Enter product name"
              required
            />
          </div>

          {/* Brand Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Brand *
            </label>
            <div className="flex gap-2">
              <select
                value={formData.brand_id}
                onChange={(e) => setFormData({...formData, brand_id: e.target.value})}
                className="flex-1 border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                required
              >
                <option value="">Select a brand</option>
                {brands.map(brand => (
                  <option key={brand.id} value={brand.id}>
                    {brand.name}
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={() => setShowAddBrand(true)}
                className="px-4 py-3 bg-emerald-100 text-emerald-700 rounded-lg hover:bg-emerald-200 flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                New
              </button>
            </div>
          </div>

          {/* Supplier Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Supplier
            </label>
            <select
              value={formData.supplier_id}
              onChange={(e) => setFormData({...formData, supplier_id: e.target.value})}
              className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            >
              <option value="">Select a supplier</option>
              {suppliers.map(supplier => (
                <option key={supplier.id} value={supplier.id}>
                  {supplier.name}
                </option>
              ))}
            </select>
          </div>

          {/* Quantity */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Quantity *
            </label>
            <input
              type="number"
              min="0"
              value={formData.quantity}
              onChange={(e) => setFormData({...formData, quantity: parseInt(e.target.value) || 0})}
              className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              required
            />
          </div>

          {/* Price */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Price (KES) *
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={formData.price}
              onChange={(e) => setFormData({...formData, price: parseFloat(e.target.value) || 0})}
              className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              required
            />
          </div>
        </div>

        {/* Image Upload */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Product Images
          </label>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-emerald-400 transition-colors">
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleImageUpload}
              className="hidden"
              id="image-upload"
            />
            <label htmlFor="image-upload" className="cursor-pointer">
              <Upload className="h-12 w-12 text-gray-400 mx-auto mb-3" />
              <div className="text-gray-600">
                <span className="font-medium text-emerald-700">Click to upload</span> or drag and drop
              </div>
              <p className="text-sm text-gray-500 mt-1">PNG, JPG, GIF up to 5MB each</p>
            </label>
          </div>

          {/* Image Previews */}
          {imagePreviews.length > 0 && (
            <div className="mt-4">
              <div className="flex items-center gap-2 mb-3">
                <ImageIcon className="h-5 w-5 text-emerald-600" />
                <span className="font-medium text-gray-700">Uploaded Images ({imagePreviews.length})</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {imagePreviews.map((preview, index) => (
                  <div key={index} className="relative group">
                    <div className="aspect-square rounded-lg overflow-hidden border border-gray-200">
                      <img
                        src={preview}
                        alt={`Preview ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Description
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({...formData, description: e.target.value})}
            rows={4}
            className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 resize-none"
            placeholder="Describe the product..."
          />
        </div>

        {/* Submit Buttons */}
        <div className="flex justify-end gap-3 pt-4">
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-3 border-2 border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-6 py-3 bg-emerald-600 text-white font-medium rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            disabled={loading}
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                Saving...
              </>
            ) : product ? 'Update Product' : 'Add Product'}
          </button>
        </div>
      </form>

      {/* Add Brand Modal */}
      <AnimatePresence>
        {showAddBrand && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-xl shadow-xl p-6 max-w-md w-full mx-4"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-900">Add New Brand</h3>
                <button
                  onClick={() => {
                    setShowAddBrand(false);
                    setNewBrandName('');
                    setNewBrandDescription('');
                  }}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                >
                  <X className="h-5 w-5 text-gray-500" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Brand Name *
                  </label>
                  <input
                    type="text"
                    value={newBrandName}
                    onChange={(e) => setNewBrandName(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    placeholder="Enter brand name"
                    autoFocus
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description (Optional)
                  </label>
                  <textarea
                    value={newBrandDescription}
                    onChange={(e) => setNewBrandDescription(e.target.value)}
                    rows={3}
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
                    placeholder="Enter brand description"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowAddBrand(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleAddBrand}
                  className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
                >
                  Add Brand
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}