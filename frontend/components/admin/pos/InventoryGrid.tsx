// components/admin/pos/InventoryGrid.tsx - UPDATED
"use client";

import { motion } from 'framer-motion';
import { ShoppingBag, Package, Tag, Plus, AlertCircle } from 'lucide-react';
import type { Product } from '@/lib/api/inventoryApi';
import { useState } from 'react';

interface InventoryGridProps {
  products: Product[];
  loading: boolean;
  onAddToCart: (item: Product, quantity?: number) => void;
  quickAddEnabled?: boolean;
}

export default function InventoryGrid({ 
  products, 
  loading, 
  onAddToCart,
  quickAddEnabled = true
}: InventoryGridProps) {
  const [quickAddQuantities, setQuickAddQuantities] = useState<Record<number, number>>({});

  if (loading) {
    return (
      <div className="col-span-full py-12 flex flex-col items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
        <p className="mt-4 text-gray-600">Loading products...</p>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="col-span-full py-12 flex flex-col items-center justify-center">
        <Package className="h-16 w-16 text-gray-400" />
        <p className="mt-4 text-gray-600 text-lg">No products available</p>
        <p className="text-gray-500">Add products to inventory or check filters</p>
      </div>
    );
  }

  const handleQuickAdd = (product: Product) => {
    const quantity = quickAddQuantities[product.id] || 1;
    onAddToCart(product, quantity);
    setQuickAddQuantities(prev => ({
      ...prev,
      [product.id]: 1
    }));
  };

  const handleQuantityChange = (productId: number, value: string) => {
    const numValue = parseInt(value) || 1;
    setQuickAddQuantities(prev => ({
      ...prev,
      [productId]: Math.max(1, Math.min(numValue, 999))
    }));
  };

  const getStockStatus = (product: Product) => {
    if (product.stock_qty <= 0) {
      return { status: 'out-of-stock', label: 'Out of Stock' };
    }
    // Use default threshold since Django doesn't have low_stock_threshold field
    const lowStockThreshold = 10;
    if (product.stock_qty <= lowStockThreshold) {
      return { status: 'low-stock', label: 'Low Stock' };
    }
    return { status: 'in-stock', label: 'In Stock' };
  };

  const getStockStatusColor = (status: string) => {
    switch (status) {
      case 'out-of-stock':
        return 'bg-red-100 text-red-800';
      case 'low-stock':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-emerald-100 text-emerald-800';
    }
  };

  return (
    <>
      {products.map((product, index) => {
        const stockStatus = getStockStatus(product);
        const quickAddQty = quickAddQuantities[product.id] || 1;
        const imageUrl = product.image 
          ? product.image.startsWith('http') 
            ? product.image 
            : `${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000'}${product.image}`
          : null;

        return (
          <motion.div
            key={product.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1 group"
          >
            {/* Product Image */}
            <div className="relative aspect-square rounded-t-2xl overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100">
              {imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={imageUrl}
                  alt={product.product_name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/images/product-placeholder.jpg';
                  }}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Package className="h-20 w-20 text-gray-300 group-hover:text-gray-400 transition-colors" />
                </div>
              )}
              
              {/* Stock Badge */}
              <div className={`absolute top-3 right-3 px-3 py-1.5 rounded-full text-xs font-bold ${getStockStatusColor(stockStatus.status)}`}>
                {stockStatus.label}
              </div>

              {/* Price Badge */}
              <div className="absolute bottom-3 left-3">
                <div className="bg-white/95 backdrop-blur-sm px-4 py-2 rounded-xl shadow-lg">
                  <span className="font-bold text-xl text-gray-900">
                    KES {Number(product.selling_price).toLocaleString()}
                  </span>
                  {/* Remove cost_price display since Django doesn't have it in Product model */}
                </div>
              </div>
            </div>

            {/* Product Info */}
            <div className="p-4">
              {/* Brand and Product Name */}
              <div className="mb-3">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-bold text-lg text-gray-900 truncate">
                    {product.brand_name}
                  </h3>
                  {!product.is_active && (
                    <span className="px-2 py-0.5 text-xs bg-gray-200 text-gray-700 rounded">
                      Inactive
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-600 line-clamp-2 min-h-[40px]">
                  {product.product_name}
                </p>
              </div>

              {/* Remove SKU and barcode since Django Product model doesn't have them */}
              {/* Add category if available */}
              {product.category_name && (
                <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
                  <Tag className="h-4 w-4 flex-shrink-0" />
                  <span className="truncate">{product.category_name}</span>
                </div>
              )}

              {/* Stock Info */}
              <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-600">Available:</span>
                  <span className={`font-semibold ${product.stock_qty <= 0 ? 'text-red-600' : product.stock_qty <= 10 ? 'text-yellow-600' : 'text-emerald-600'}`}>
                    {product.stock_qty.toLocaleString()} units
                  </span>
                </div>
                {product.stock_qty <= 10 && product.stock_qty > 0 && (
                  <div className="flex items-center gap-1 mt-1 text-xs text-yellow-600">
                    <AlertCircle className="h-3 w-3" />
                    <span>Low stock (reorder suggested)</span>
                  </div>
                )}
              </div>

              {/* Add to Cart Section */}
              <div className="space-y-3">
                {quickAddEnabled && (
                  <div className="flex items-center gap-2">
                    <div className="flex-1 flex items-center border border-gray-300 rounded-lg bg-white overflow-hidden">
                      <button
                        onClick={() => handleQuantityChange(product.id, String(Math.max(1, quickAddQty - 1)))}
                        className="p-2 hover:bg-gray-100 transition-colors"
                        disabled={product.stock_qty === 0 || !product.is_active}
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 12H4" />
                        </svg>
                      </button>
                      <input
                        type="number"
                        min="1"
                        max={product.stock_qty}
                        value={quickAddQty}
                        onChange={(e) => handleQuantityChange(product.id, e.target.value)}
                        className="w-16 text-center text-sm font-semibold border-x border-gray-300 py-2 bg-white"
                        disabled={product.stock_qty === 0 || !product.is_active}
                      />
                      <button
                        onClick={() => handleQuantityChange(product.id, String(Math.min(product.stock_qty, quickAddQty + 1)))}
                        className="p-2 hover:bg-gray-100 transition-colors"
                        disabled={product.stock_qty === 0 || !product.is_active || quickAddQty >= product.stock_qty}
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                        </svg>
                      </button>
                    </div>
                    
                    <button
                      onClick={() => handleQuickAdd(product)}
                      disabled={product.stock_qty === 0 || !product.is_active}
                      className={`px-4 py-2.5 rounded-lg font-medium flex items-center gap-2 transition-all ${
                        product.stock_qty === 0 || !product.is_active
                          ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                          : 'bg-emerald-600 text-white hover:bg-emerald-700'
                      }`}
                    >
                      <Plus className="h-4 w-4" />
                      Add
                    </button>
                  </div>
                )}

                {/* Standard Add to Cart Button */}
                <button
                  onClick={() => onAddToCart(product, quickAddEnabled ? 1 : undefined)}
                  disabled={product.stock_qty === 0 || !product.is_active}
                  className={`w-full py-3 rounded-xl font-medium flex items-center justify-center gap-2 transition-all ${
                    product.stock_qty === 0 || !product.is_active
                      ? 'bg-gray-100 text-gray-500 cursor-not-allowed'
                      : 'bg-gradient-to-r from-blue-600 to-emerald-600 text-white hover:from-blue-700 hover:to-emerald-700 shadow-md hover:shadow-lg'
                  }`}
                >
                  <ShoppingBag className="h-5 w-5" />
                  {product.stock_qty === 0 
                    ? 'Out of Stock' 
                    : !product.is_active 
                      ? 'Product Inactive'
                      : quickAddEnabled 
                        ? 'Add 1 to Cart' 
                        : 'Add to Cart'}
                </button>
              </div>
            </div>
          </motion.div>
        );
      })}
    </>
  );
}