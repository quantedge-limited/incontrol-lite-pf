"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Calendar,
  DollarSign,
  Package,
  Building2,
  Truck,
  Upload,
  Camera,
  Plus,
} from "lucide-react";
import { brandApi, Brand } from "@/lib/api/brandApi";
import { supplierApi, Supplier } from "@/lib/api/supplierApi";
import { inventoryApi, InventoryFormData } from "@/lib/api/inventoryApi";
import { uploadProductImage } from "@/lib/fileUpload";

interface InventoryFormProps {
  item?: any;
  onSave: () => void;
  onCancel: () => void;
}

export default function InventoryForm({
  item,
  onSave,
  onCancel,
}: InventoryFormProps) {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(false);
  const [showAddBrand, setShowAddBrand] = useState(false);
  const [newBrandName, setNewBrandName] = useState("");
  const [newBrandDescription, setNewBrandDescription] = useState("");
  const [error, setError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState<InventoryFormData>({
    name: item?.name || "",
    description: item?.description || "",
    quantity: item?.quantity || 1,
    price_per_unit: item?.price_per_unit || 0,
    received_at: item?.received_at || new Date().toISOString().split("T")[0],
    expiry_date: item?.expiry_date || null,
    supplier: item?.supplier?.id || item?.supplier_id || "",
    brand: item?.brand?.id || item?.brand_id || "",
    image_path: item?.image_path || "",
    is_active: item?.is_active ?? true,
    sku: item?.sku || "",
    category: item?.category || "",
  });

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>(
    item?.image_path ? `/images/products/${item.image_path}` : ""
  );
  const [isNewImage, setIsNewImage] = useState(false);

  // Load brands & suppliers
  useEffect(() => {
    const loadData = async () => {
      try {
        const [brandsData, suppliersData] = await Promise.all([
          brandApi.list(),
          supplierApi.list(),
        ]);
        setBrands(brandsData);
        setSuppliers(suppliersData);
      } catch (err) {
        console.error(err);
        setError("Failed to load brands or suppliers");
      }
    };
    loadData();
  }, []);

  // Handle image selection
  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Please select an image file");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("Image must be smaller than 5MB");
      return;
    }

    setImageFile(file);
    setIsNewImage(true);

    const reader = new FileReader();
    reader.onload = () => setImagePreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview("");
    setFormData({ ...formData, image_path: "" });
    setIsNewImage(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleAddBrand = async () => {
    if (!newBrandName.trim()) return setError("Brand name is required");
    try {
      const newBrand = await brandApi.create(newBrandName, newBrandDescription);
      setBrands((prev) => [...prev, newBrand]);
      setFormData((prev) => ({ ...prev, brand: newBrand.id }));
      setNewBrandName("");
      setNewBrandDescription("");
      setShowAddBrand(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create brand");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      let imagePath = formData.image_path;

      if (isNewImage && imageFile) {
        imagePath = await uploadProductImage(
          imageFile,
          item?.id || `temp-${Date.now()}`,
          formData.name
        );
      }

      const apiData = {
        ...formData,
        image_path: imagePath || null,
        expiry_date: formData.expiry_date || null,
      };

      if (item?.id) await inventoryApi.update(item.id, apiData);
      else await inventoryApi.create(apiData);

      onSave();
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const calculateTotal = () =>
    (formData.quantity * formData.price_per_unit).toFixed(2);

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 mb-6 border border-emerald-100">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-emerald-900">
          {item ? "Edit Inventory Item" : "Add Inventory Item"}
        </h2>
        <button onClick={onCancel} className="p-2 hover:bg-gray-100 rounded-lg">
          <X className="h-5 w-5 text-gray-500" />
        </button>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Image Upload */}
        <div className="flex flex-col items-center">
          <div className="relative mb-4">
            {imagePreview ? (
              <div className="relative group">
                <img
                  src={imagePreview}
                  alt="Product preview"
                  className="h-48 w-48 rounded-lg object-cover border-2 border-gray-200"
                />
                <button
                  type="button"
                  onClick={removeImage}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-8 h-8 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <div className="h-48 w-48 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center bg-gray-50">
                <Camera className="h-12 w-12 text-gray-400" />
              </div>
            )}
          </div>

          <input
            type="file"
            ref={fileInputRef}
            accept="image/*"
            onChange={handleImageSelect}
            className="hidden"
            id="product-image"
          />
          <label
            htmlFor="product-image"
            className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 cursor-pointer flex items-center gap-2"
          >
            <Upload className="h-4 w-4" />
            {imagePreview ? "Change Image" : "Upload Product Image"}
          </label>
          <p className="text-sm text-gray-500 mt-2">
            Upload one image (max 5MB). JPG, PNG, or WebP.
          </p>
        </div>

        {/* Basic Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Name */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Product Name *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              placeholder="Enter product name"
              required
            />
          </div>

          {/* SKU */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              SKU (Optional)
            </label>
            <input
              type="text"
              value={formData.sku}
              onChange={(e) =>
                setFormData({ ...formData, sku: e.target.value })
              }
              className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              placeholder="e.g., PROD-001"
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Category (Optional)
            </label>
            <input
              type="text"
              value={formData.category}
              onChange={(e) =>
                setFormData({ ...formData, category: e.target.value })
              }
              className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              placeholder="e.g., Electronics, Clothing"
            />
          </div>

          {/* Brand & Supplier simplified */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Brand *
            </label>
            <div className="flex gap-2">
              <select
                value={formData.brand}
                onChange={(e) =>
                  setFormData({ ...formData, brand: e.target.value })
                }
                className="flex-1 border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                required
              >
                <option value="">Select a brand</option>
                {brands.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={() => setShowAddBrand(true)}
                className="px-4 py-3 bg-emerald-100 text-emerald-700 rounded-lg hover:bg-emerald-200 flex items-center gap-2"
              >
                <Plus className="h-4 w-4" /> New
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Supplier *
            </label>
            <select
              value={formData.supplier}
              onChange={(e) =>
                setFormData({ ...formData, supplier: e.target.value })
              }
              className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              required
            >
              <option value="">Select a supplier</option>
              {suppliers.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
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
              min={1}
              value={formData.quantity}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  quantity: parseInt(e.target.value) || 1,
                })
              }
              className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              required
            />
          </div>

          {/* Price */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Price per Unit (KES) *
            </label>
            <input
              type="number"
              step={0.01}
              min={0}
              value={formData.price_per_unit}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  price_per_unit: parseFloat(e.target.value) || 0,
                })
              }
              className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              required
            />
          </div>
        </div>

        {/* Total */}
        <div className="md:col-span-2">
          <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
            <div className="flex justify-between items-center">
              <span className="font-medium text-emerald-800">Total Value</span>
              <span className="text-2xl font-bold text-emerald-900">
                KES {calculateTotal()}
              </span>
            </div>
            <p className="text-sm text-emerald-600 mt-1">
              Quantity × Price per Unit
            </p>
          </div>
        </div>

        {/* Dates */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Received Date *
            </label>
            <input
              type="date"
              value={formData.received_at}
              onChange={(e) =>
                setFormData({ ...formData, received_at: e.target.value })
              }
              className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Expiry Date (Optional)
            </label>
            <input
              type="date"
              value={formData.expiry_date || ""}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  expiry_date: e.target.value || null,
                })
              }
              className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              min={new Date().toISOString().split("T")[0]}
            />
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Description
          </label>
          <textarea
            value={formData.description}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
            rows={3}
            className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
            placeholder="Add additional details"
          />
        </div>

        {/* Active */}
        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            checked={formData.is_active}
            onChange={(e) =>
              setFormData({ ...formData, is_active: e.target.checked })
            }
            className="h-4 w-4 text-emerald-600 focus:ring-emerald-500"
          />
          <label className="text-sm font-medium text-gray-700">
            Make this product visible to customers
          </label>
        </div>

        {/* Buttons */}
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
            className="px-6 py-3 bg-emerald-600 text-white font-medium rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={loading}
          >
            {loading ? "Saving..." : item ? "Update Product" : "Add Product"}
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
                  onClick={() => setShowAddBrand(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                >
                  <X className="h-5 w-5 text-gray-500" />
                </button>
              </div>
              <div className="space-y-4">
                <input
                  type="text"
                  placeholder="Brand Name"
                  value={newBrandName}
                  onChange={(e) => setNewBrandName(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  autoFocus
                />
                <textarea
                  placeholder="Brand Description (Optional)"
                  value={newBrandDescription}
                  onChange={(e) => setNewBrandDescription(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
                  rows={3}
                />
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
