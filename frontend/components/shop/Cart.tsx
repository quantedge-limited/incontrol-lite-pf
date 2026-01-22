"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ShoppingCart, Trash2, Plus, Minus, X } from 'lucide-react';
import { salesApi } from '@/lib/api/salesApi';
import { toast } from 'react-toastify';

export default function Cart() {
  const [cart, setCart] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    fetchCart();
  }, []);

  const fetchCart = async () => {
    try {
      const cartData = await salesApi.getCart();
      setCart(cartData);
    } catch (error) {
      console.error('Failed to fetch cart:', error);
    }
  };

  const updateQuantity = async (itemId: string, newQuantity: number) => {
    if (newQuantity < 1) {
      await removeItem(itemId);
      return;
    }

    try {
      setLoading(true);
      await salesApi.updateCartItem(itemId, newQuantity);
      await fetchCart();
      toast.success('Cart updated');
    } catch (error) {
      toast.error('Failed to update cart');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const removeItem = async (itemId: string) => {
    try {
      setLoading(true);
      await salesApi.removeCartItem(itemId);
      await fetchCart();
      toast.success('Item removed from cart');
    } catch (error) {
      toast.error('Failed to remove item');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const clearCart = async () => {
    if (!confirm('Are you sure you want to clear your cart?')) return;

    try {
      setLoading(true);
      await salesApi.clearCart();
      setCart(null);
      toast.success('Cart cleared');
    } catch (error) {
      toast.error('Failed to clear cart');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const itemCount = cart?.items?.length || 0;
  const totalPrice = cart?.total_price || 0;

  return (
    <>
      {/* Cart Icon */}
      <button
        onClick={() => setIsOpen(true)}
        className="relative p-2 text-gray-700 hover:text-emerald-600 transition-colors"
      >
        <ShoppingCart size={24} />
        {itemCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-emerald-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
            {itemCount}
          </span>
        )}
      </button>

      {/* Cart Sidebar */}
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black bg-opacity-50"
            onClick={() => setIsOpen(false)}
          />

          {/* Cart Panel */}
          <div className="absolute inset-y-0 right-0 max-w-full flex">
            <div className="w-screen max-w-md">
              <div className="h-full flex flex-col bg-white shadow-xl">
                <div className="flex-1 py-6 overflow-y-auto px-4 sm:px-6">
                  {/* Header */}
                  <div className="flex items-start justify-between">
                    <h2 className="text-lg font-medium text-gray-900">
                      Shopping Cart
                    </h2>
                    <button
                      onClick={() => setIsOpen(false)}
                      className="ml-3 h-7 w-7 rounded-full flex items-center justify-center hover:bg-gray-100"
                    >
                      <X size={20} />
                    </button>
                  </div>

                  {/* Cart Items */}
                  <div className="mt-8">
                    {itemCount === 0 ? (
                      <div className="text-center py-12">
                        <ShoppingCart className="mx-auto h-12 w-12 text-gray-400" />
                        <h3 className="mt-4 text-sm font-medium text-gray-900">
                          Your cart is empty
                        </h3>
                        <p className="mt-1 text-sm text-gray-500">
                          Start shopping to add items
                        </p>
                      </div>
                    ) : (
                      <>
                        <ul className="divide-y divide-gray-200">
                          {cart.items.map((item: any) => (
                            <li key={item.id} className="py-6 flex">
                              {/* Item Details */}
                              <div className="flex-1">
                                <div className="flex justify-between">
                                  <h4 className="text-sm font-medium text-gray-900">
                                    {item.inventory_name}
                                  </h4>
                                  <p className="ml-4 font-bold text-emerald-600">
                                    KES {(item.quantity * item.price_per_unit).toFixed(2)}
                                  </p>
                                </div>
                                <p className="mt-1 text-sm text-gray-500">
                                  KES {item.price_per_unit.toFixed(2)} each
                                </p>
                                {/* Quantity Controls */}
                                <div className="mt-3 flex items-center space-x-3">
                                  <button
                                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                    disabled={loading}
                                    className="p-1 rounded-full border border-gray-300 hover:bg-gray-50"
                                  >
                                    <Minus size={16} />
                                  </button>
                                  <span className="text-sm font-medium">
                                    {item.quantity}
                                  </span>
                                  <button
                                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                    disabled={loading}
                                    className="p-1 rounded-full border border-gray-300 hover:bg-gray-50"
                                  >
                                    <Plus size={16} />
                                  </button>
                                  <button
                                    onClick={() => removeItem(item.id)}
                                    disabled={loading}
                                    className="ml-4 p-1 text-red-600 hover:text-red-800"
                                  >
                                    <Trash2 size={16} />
                                  </button>
                                </div>
                              </div>
                            </li>
                          ))}
                        </ul>

                        {/* Cart Total */}
                        <div className="border-t border-gray-200 py-6">
                          <div className="flex justify-between text-base font-medium text-gray-900">
                            <p>Total</p>
                            <p>KES {totalPrice.toFixed(2)}</p>
                          </div>
                          <p className="mt-0.5 text-sm text-gray-500">
                            Shipping and taxes calculated at checkout
                          </p>
                          <div className="mt-6">
                            <Link
                              href="/checkout"
                              onClick={() => setIsOpen(false)}
                              className="w-full bg-emerald-600 border border-transparent rounded-md py-3 px-8 flex items-center justify-center text-base font-medium text-white hover:bg-emerald-700"
                            >
                              Checkout
                            </Link>
                          </div>
                          <div className="mt-3">
                            <button
                              onClick={clearCart}
                              disabled={loading}
                              className="w-full text-sm text-red-600 hover:text-red-800"
                            >
                              Clear cart
                            </button>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}