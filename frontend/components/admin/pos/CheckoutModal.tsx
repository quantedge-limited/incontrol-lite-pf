// components/admin/pos/CheckoutModal.tsx
"use client";

import { motion } from 'framer-motion';
import { X, CreditCard, Smartphone, Wallet, User, Phone, Mail, MapPin } from 'lucide-react'; // Added MapPin
import { useState } from 'react';

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

interface CheckoutModalProps {
  onClose: () => void;
  onCheckout: (customerData: {
    name: string;
    phone: string;
    email?: string;
    paymentMethod: string;
    address?: string; // Make address optional
  }) => Promise<void>;
  loading: boolean;
  cart: CartItem[];
  subtotal: number;
  tax: number;
  total: number;
}

export default function CheckoutModal({
  onClose,
  onCheckout,
  loading,
  cart,
  subtotal,
  tax,
  total,
}: CheckoutModalProps) {
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerAddress, setCustomerAddress] = useState(''); // Add this state
  const [paymentMethod, setPaymentMethod] = useState('cash');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const customerData = {
      name: customerName,
      phone: customerPhone,
      email: customerEmail || undefined,
      paymentMethod,
      address: customerAddress || '', // Now using the correct variable
    };
    
    await onCheckout(customerData);
  };

  const paymentMethods = [
    { id: 'cash', name: 'Cash', icon: Wallet },
    { id: 'mpesa', name: 'M-Pesa', icon: Smartphone },
    { id: 'card', name: 'Credit Card', icon: CreditCard },
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
      >
        <div className="flex h-full">
          {/* Left Side - Order Summary */}
          <div className="flex-1 p-8 overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Checkout</h2>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-lg"
                disabled={loading}
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Order Items */}
            <div className="mb-8">
              <h3 className="font-semibold text-gray-700 mb-4">Order Summary</h3>
              <div className="space-y-3">
                {cart.map((item) => (
                  <div key={item.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium">{item.name}</p>
                      <p className="text-sm text-gray-600">
                        {item.quantity} × KES {item.price.toLocaleString()}
                      </p>
                    </div>
                    <p className="font-bold">
                      KES {(item.quantity * item.price).toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Totals */}
            <div className="space-y-2 mb-8">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal</span>
                <span>KES {subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Tax (16% VAT)</span>
                <span>KES {tax.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-xl font-bold text-gray-900 pt-3 border-t">
                <span>Total</span>
                <span>KES {total.toLocaleString()}</span>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-3 gap-3 mb-8">
              <button
                type="button"
                onClick={() => {
                  setCustomerName('Walk-in Customer');
                  setCustomerAddress('In-store pickup');
                }}
                className="px-4 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm"
              >
                Walk-in
              </button>
              <button
                type="button"
                onClick={() => {
                  setCustomerPhone('0712345678');
                  setCustomerName('Regular Customer');
                  setCustomerAddress('123 Main Street, Nairobi');
                }}
                className="px-4 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm"
              >
                Regular
              </button>
              <button
                type="button"
                onClick={() => {
                  setCustomerEmail('corporate@example.com');
                  setCustomerName('Corporate');
                  setCustomerAddress('Corporate Office, Westlands');
                }}
                className="px-4 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm"
              >
                Corporate
              </button>
            </div>
          </div>

          {/* Right Side - Customer & Payment */}
          <div className="flex-1 p-8 bg-gradient-to-b from-emerald-50 to-white">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Customer Info */}
              <div>
                <h3 className="font-semibold text-gray-700 mb-4">Customer Information</h3>
                <div className="space-y-4">
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Customer Name"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      required
                      disabled={loading}
                    />
                  </div>

                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="tel"
                      placeholder="Phone Number"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      required
                      disabled={loading}
                    />
                  </div>

                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="email"
                      placeholder="Email (Optional)"
                      value={customerEmail}
                      onChange={(e) => setCustomerEmail(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      disabled={loading}
                    />
                  </div>

                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Address (Optional)"
                      value={customerAddress}
                      onChange={(e) => setCustomerAddress(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      disabled={loading}
                    />
                  </div>
                </div>
              </div>

              {/* Payment Method */}
              <div>
                <h3 className="font-semibold text-gray-700 mb-4">Payment Method</h3>
                <div className="grid grid-cols-3 gap-3">
                  {paymentMethods.map((method) => {
                    const Icon = method.icon;
                    return (
                      <button
                        key={method.id}
                        type="button"
                        onClick={() => setPaymentMethod(method.id)}
                        className={`flex flex-col items-center justify-center p-4 border-2 rounded-xl transition-all ${
                          paymentMethod === method.id
                            ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                            : 'border-gray-200 hover:border-emerald-300'
                        }`}
                        disabled={loading}
                      >
                        <Icon className="h-6 w-6 mb-2" />
                        <span className="text-sm font-medium">{method.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Complete Order Button */}
              <button
                type="submit"
                disabled={loading || cart.length === 0}
                className="w-full py-4 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                    Processing...
                  </>
                ) : (
                  'Complete Sale'
                )}
              </button>

              {/* Receipt Options */}
              <div className="pt-4 border-t border-gray-200">
                <div className="flex items-center gap-2 mb-2">
                  <input
                    type="checkbox"
                    id="printReceipt"
                    defaultChecked
                    className="h-4 w-4 text-emerald-600"
                    disabled={loading}
                  />
                  <label htmlFor="printReceipt" className="text-sm text-gray-700">
                    Print receipt
                  </label>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="sendReceipt"
                    className="h-4 w-4 text-emerald-600"
                    disabled={loading}
                  />
                  <label htmlFor="sendReceipt" className="text-sm text-gray-700">
                    Send receipt via SMS/Email
                  </label>
                </div>
              </div>
            </form>
          </div>
        </div>
      </motion.div>
    </div>
  );
}