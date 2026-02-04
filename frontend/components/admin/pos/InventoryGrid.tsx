// components/admin/pos/InventoryGrid.tsx - UPDATED
"use client";

import { motion } from 'framer-motion';
import { ShoppingBag, Package, Tag } from 'lucide-react';
import type { Product } from '@/lib/api/inventoryApi'; // Changed to Product type

{/*
  
  This component renders a grid of inventory items for the POS system. 
  It displays product images, names, prices, and stock status. It also includes an "Add to Cart" 
  button for each item, which is disabled if the item is out of stock or inactive.

*/}

interface InventoryGridProps {
  products: Product[]; // Changed from inventory: InventoryItem[]
  loading: boolean;
  onAddToCart: (item: Product) => void; // Changed to Product
}

export default function InventoryGrid({ products, loading, onAddToCart }: InventoryGridProps) {
  if (loading) {
    return (
      <div className="col-span-full py-12 flex flex-col items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
        <p className="mt-4 text-gray-600">Loading products...</p>
      </div>
    );
  }

  if (products.length === 0) { // Changed from inventory
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
      {products.map((item, index) => { // Changed from inventory
        // Build image URL from the image property
        const imageUrl = item.image 
          ? item.image.startsWith('http') 
            ? item.image 
            : `${process.env.NEXT_PUBLIC_API_BASE_URL || 'https://incontrol-lite-pb.onrender.com'}${item.image}`
          : undefined;

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
                  alt={item.product_name} // Use product_name instead of brand_name
                  className="w-full h-full object-cover"
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
              <div className={`absolute top-3 right-3 px-2.5 py-1 rounded-full text-xs font-bold ${
                item.stock_qty > 10 ? 'bg-emerald-100 text-emerald-800' : // Changed from quantity_in_stock
                item.stock_qty > 0 ? 'bg-yellow-100 text-yellow-800' :
                'bg-red-100 text-red-800'
              }`}>
                {item.stock_qty > 0 ? `${item.stock_qty} in stock` : 'Out of stock'} {/* Changed from quantity_in_stock */}
              </div>
            </div>

            {/* Product Info */}
            <div className="p-4">
              <div className="flex justify-between items-start mb-2">
                <div>
                  {/* Show both brand and product name */}
                  <h3 className="font-semibold text-gray-900">{item.brand_name}</h3>
                  <p className="text-sm text-gray-600 line-clamp-1">{item.product_name}</p>
                </div>
                <span className="font-bold text-emerald-700 text-lg">
                  KES {Number(item.selling_price).toLocaleString()} {/* Using selling_price */}
                </span>
              </div>

              {/* Description */}
              {item.description && (
                <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                  {item.description}
                </p>
              )}

              {/* Category */}
              {item.category_name && ( // Using category_name from serializer
                <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
                  <Tag className="h-4 w-4" />
                  <span>{item.category_name}</span>
                </div>
                {product.stock_qty <= 10 && product.stock_qty > 0 && (
                  <div className="flex items-center gap-1 mt-1 text-xs text-yellow-600">
                    <AlertCircle className="h-3 w-3" />
                    <span>Low stock (reorder suggested)</span>
                  </div>
                )}
              </div>

              {/* Add to Cart Button */}
              <button
                onClick={() => onAddToCart(item)}
                disabled={item.stock_qty === 0 || !item.is_active} // Changed from quantity_in_stock
                className={`w-full py-3 rounded-xl font-medium flex items-center justify-center gap-2 transition-colors ${
                  item.stock_qty === 0 || !item.is_active // Changed from quantity_in_stock
                    ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                    : 'bg-emerald-600 text-white hover:bg-emerald-700'
                }`}
              >
                <ShoppingBag className="h-5 w-5" />
                {!item.is_active ? 'Inactive' : item.stock_qty === 0 ? 'Out of Stock' : 'Add to Cart'} {/* Changed from quantity_in_stock */}
              </button>
            </div>
          </motion.div>
        );
      })}
    </>
  );
}