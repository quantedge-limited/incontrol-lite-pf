// components/admin/pos/InventoryGrid.tsx - FIXED
"use client";

import { motion } from 'framer-motion';
import { ShoppingBag, Package, Tag } from 'lucide-react';
import type { InventoryItem } from '@/lib/api/inventoryApi';

interface InventoryGridProps {
  inventory: InventoryItem[];
  loading: boolean;
  onAddToCart: (item: InventoryItem) => void;
}

export default function InventoryGrid({ inventory, loading, onAddToCart }: InventoryGridProps) {
  if (loading) {
    return (
      <div className="col-span-full py-12 flex flex-col items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
        <p className="mt-4 text-gray-600">Loading inventory...</p>
      </div>
    );
  }

  if (inventory.length === 0) {
    return (
      <div className="col-span-full py-12 flex flex-col items-center justify-center">
        <Package className="h-16 w-16 text-gray-400" />
        <p className="mt-4 text-gray-600 text-lg">No products found</p>
        <p className="text-gray-500">Try adjusting your search or filters</p>
      </div>
    );
  }

  return (
    <>
      {inventory.map((item, index) => {
        // Build image URL from the image property
        const imageUrl = item.image 
          ? item.image.startsWith('http') 
            ? item.image 
            : `${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000'}${item.image}`
          : undefined;

        return (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow"
          >
            {/* Product Image */}
            <div className="relative aspect-square rounded-t-2xl overflow-hidden bg-gray-100">
              {imageUrl ? (
                <img
                  src={imageUrl}
                  alt={item.brand_name} // Use brand_name instead of name
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/images/placeholder.jpg';
                  }}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Package className="h-16 w-16 text-gray-400" />
                </div>
              )}
              
              {/* Stock Badge */}
              <div className={`absolute top-3 right-3 px-2.5 py-1 rounded-full text-xs font-bold ${
                item.quantity_in_stock > 10 ? 'bg-emerald-100 text-emerald-800' :
                item.quantity_in_stock > 0 ? 'bg-yellow-100 text-yellow-800' :
                'bg-red-100 text-red-800'
              }`}>
                {item.quantity_in_stock > 0 ? `${item.quantity_in_stock} in stock` : 'Out of stock'}
              </div>
            </div>

            {/* Product Info */}
            <div className="p-4">
              <div className="flex justify-between items-start mb-2">
                {/* Use brand_name instead of name */}
                <h3 className="font-semibold text-gray-900 line-clamp-2">{item.brand_name}</h3>
                {/* Use selling_price instead of price_per_unit */}
                <span className="font-bold text-emerald-700 text-lg">
                  KES {item.selling_price.toLocaleString()}
                </span>
              </div>

              {/* Brand Name - Already shown as title */}
              {item.description && (
                <p className="text-sm text-gray-600 mb-1 line-clamp-2">
                  {item.description}
                </p>
              )}

              {/* Category */}
              {item.category_details?.name && (
                <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
                  <Tag className="h-4 w-4" />
                  <span>{item.category_details.name}</span>
                </div>
              )}

              {/* Add to Cart Button */}
              <button
                onClick={() => onAddToCart(item)}
                disabled={item.quantity_in_stock === 0 || !item.is_active}
                className={`w-full py-3 rounded-xl font-medium flex items-center justify-center gap-2 transition-colors ${
                  item.quantity_in_stock === 0 || !item.is_active
                    ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                    : 'bg-emerald-600 text-white hover:bg-emerald-700'
                }`}
              >
                <ShoppingBag className="h-5 w-5" />
                {!item.is_active ? 'Inactive' : item.quantity_in_stock === 0 ? 'Out of Stock' : 'Add to Cart'}
              </button>
            </div>
          </motion.div>
        );
      })}
    </>
  );
}