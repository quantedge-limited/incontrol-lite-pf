// components/admin/pos/CartSidebar.tsx
"use client";

import { X, Trash2, Plus, Minus, ShoppingCart } from 'lucide-react';
import { POSCartItem } from '@/types/pos';
import { toast } from "react-toastify";

interface CartSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  cart: POSCartItem[];
  onUpdateQuantity: (id: string, quantity: number) => void;
  onRemoveItem: (id: string) => void;
  onClearCart: () => void;
  subtotal: number;
  tax: number;
  total: number;
}

export default function CartSidebar({
  isOpen,
  onClose,
  cart,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  subtotal,
  tax,
  total,
}: CartSidebarProps) {
  if (!isOpen) return null;

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div
      className="fixed inset-0 z-50 overflow-hidden"
      onClick={handleBackdropClick}
    >
      {/* Backdrop - Completely Transparent */}
      <div className="absolute inset-0 bg-transparent" />

      {/* Sidebar - Responsive (w-full on mobile, max-w-md on desktop) */}
      <div className="absolute inset-y-0 right-0 w-full max-w-md flex">
        <div className="w-full">
          <div className="h-full flex flex-col bg-white shadow-xl">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b">
              <div className="flex items-center gap-3">
                <ShoppingCart className="h-6 w-6 text-emerald-600" />
                <h2 className="text-lg font-bold text-gray-900">
                  Cart ({cart.reduce((sum, item) => sum + item.quantity, 0)} items)
                </h2>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Cart Items */}
            <div className="flex-1 overflow-y-auto p-4">
              {cart.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-gray-400">
                  <ShoppingCart className="h-16 w-16 mb-4 opacity-20" />
                  <p className="text-lg font-medium">Your cart is empty</p>
                  <p className="text-sm mt-1">Add items to get started</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {cart.map((item) => {
                    const itemStock = item.stock || 0;
                    const isMaxQuantity = item.quantity >= itemStock;
                    
                    return (
                      <div
                        key={item.id}
                        className="flex gap-4 p-3 sm:p-4 bg-gray-50 rounded-lg border border-gray-100"
                      >
                        {/* Item Image */}
                        <div className="flex-shrink-0">
                          {item.image_url ? (
                            <img
                              src={item.image_url}
                              alt={item.name}
                              className="h-14 w-14 sm:h-16 sm:w-16 object-cover rounded shadow-sm"
                            />
                          ) : (
                            <div className="h-14 w-14 sm:h-16 sm:w-16 bg-gray-200 rounded flex items-center justify-center">
                              <ShoppingCart className="h-6 w-6 sm:h-8 sm:w-8 text-gray-400" />
                            </div>
                          )}
                        </div>

                        {/* Item Details */}
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-start">
                            <h3 className="font-medium text-gray-900 truncate pr-2">
                              {item.name}
                            </h3>
                            <p className="font-bold text-emerald-600 whitespace-nowrap">
                              {formatCurrency(item.price * item.quantity)}
                            </p>
                          </div>
                          <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
                            {formatCurrency(item.price)} each
                          </p>
                          
                          {/* Quantity Controls */}
                          <div className="flex items-center gap-3 mt-3">
                            <div className="flex items-center border border-gray-300 rounded-lg bg-white overflow-hidden">
                              <button
                                onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
                                className="p-1.5 hover:bg-gray-100 transition-colors"
                              >
                                <Minus className="h-3.5 w-3.5" />
                              </button>
                              <span className="w-8 text-center text-sm font-semibold">
                                {item.quantity}
                              </span>
                              <button
                                onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                                className="p-1.5 hover:bg-gray-100 transition-colors disabled:opacity-30"
                                disabled={isMaxQuantity}
                              >
                                <Plus className="h-3.5 w-3.5" />
                              </button>
                            </div>
                            
                            <button
                              onClick={() => onRemoveItem(item.id)}
                              className="ml-auto p-1.5 text-gray-400 hover:text-red-600 transition-colors"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Footer */}
            {cart.length > 0 && (
              <div className="border-t bg-white p-4 sm:p-6 shadow-[0_-4px_10px_rgba(0,0,0,0.03)]">
                {/* Summary */}
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Subtotal</span>
                    <span className="font-medium text-gray-900">{formatCurrency(subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Tax (16%)</span>
                    <span className="font-medium text-gray-900">{formatCurrency(tax)}</span>
                  </div>
                  <div className="flex justify-between text-lg font-bold pt-2 border-t border-gray-100 mt-2">
                    <span>Total</span>
                    <span className="text-emerald-600">{formatCurrency(total)}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="space-y-3">
                  <button
                    className="w-full py-3.5 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-100"
                  >
                    Checkout
                  </button>
                  <button
                    onClick={() => {
                      onClearCart();
                      toast.success('Cart cleared');
                    }}
                    className="w-full py-2 text-sm text-red-500 font-medium hover:text-red-700 transition-colors"
                  >
                    Clear Cart
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}