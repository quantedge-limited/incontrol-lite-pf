"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { salesApi } from '@/lib/api/salesApi';
import { toast } from 'react-toastify';

export default function CheckoutPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [cart, setCart] = useState<any>(null);
  const [formData, setFormData] = useState({
    buyer_name: '',
    buyer_email: '',
    buyer_phone: '',
    buyer_address: '',
    notes: '',
  });

  useEffect(() => {
    fetchCart();
  }, []);

  const fetchCart = async () => {
    try {
      const cartData = await salesApi.getCart();
      setCart(cartData);
    } catch (error) {
      console.error('Failed to fetch cart:', error);
      toast.error('Failed to load cart');
      router.push('/');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (cart?.items?.length === 0) {
      toast.error('Your cart is empty');
      return;
    }

    try {
      setLoading(true);
      
      const checkoutData = {
        ...formData,
        sale_type: 'online' as const,
      };

      const sale = await salesApi.checkout(checkoutData);
      
      toast.success('Order created successfully!');
      
      // Redirect to order confirmation or payment page
      router.push(`/order/${sale.id}`);
    } catch (error: any) {
      toast.error(error.message || 'Checkout failed');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  if (!cart) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading cart...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Checkout</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Order Summary */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Order Summary</h2>
              
              {cart.items.length === 0 ? (
                <p className="text-gray-500">Your cart is empty</p>
              ) : (
                <div className="space-y-4">
                  {cart.items.map((item: any) => (
                    <div key={item.id} className="flex justify-between items-center py-3 border-b">
                      <div>
                        <p className="font-medium">{item.inventory_name}</p>
                        <p className="text-sm text-gray-600">
                          {item.quantity} x KES {item.price_per_unit.toFixed(2)}
                        </p>
                      </div>
                      <p className="font-bold">
                        KES {(item.quantity * item.price_per_unit).toFixed(2)}
                      </p>
                    </div>
                  ))}
                  
                  <div className="pt-4 border-t">
                    <div className="flex justify-between text-lg font-bold">
                      <span>Total</span>
                      <span className="text-emerald-700">
                        KES {cart.total_price.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Customer Information Form */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Customer Information</h2>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    name="buyer_name"
                    value={formData.buyer_name}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500"
                    placeholder="John Doe"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email *
                    </label>
                    <input
                      type="email"
                      name="buyer_email"
                      value={formData.buyer_email}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500"
                      placeholder="john@example.com"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone *
                    </label>
                    <input
                      type="tel"
                      name="buyer_phone"
                      value={formData.buyer_phone}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500"
                      placeholder="0712345678"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Delivery Address *
                  </label>
                  <textarea
                    name="buyer_address"
                    value={formData.buyer_address}
                    onChange={handleChange}
                    required
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500"
                    placeholder="Enter your complete delivery address"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Order Notes (Optional)
                  </label>
                  <textarea
                    name="notes"
                    value={formData.notes}
                    onChange={handleChange}
                    rows={2}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500"
                    placeholder="Special instructions or notes"
                  />
                </div>

                <div className="pt-6 border-t border-gray-200">
                  <button
                    type="submit"
                    disabled={loading || cart.items.length === 0}
                    className="w-full bg-emerald-600 text-white py-3 px-4 rounded-md hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? 'Processing...' : 'Place Order'}
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Order Total Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Order Total</h3>
              
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span>KES {cart.total_price.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Shipping</span>
                  <span>To be calculated</span>
                </div>
                <div className="border-t border-gray-200 pt-3">
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total</span>
                    <span className="text-emerald-700">
                      KES {cart.total_price.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-6 text-sm text-gray-500">
                <p className="mb-2">By placing your order, you agree to our:</p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Terms of Service</li>
                  <li>Privacy Policy</li>
                  <li>Return Policy</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}