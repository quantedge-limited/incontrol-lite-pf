'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check } from 'lucide-react';
import { useCart } from '@/context/CartContext';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface FormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  cardNumber: string;
  cardExpiry: string;
  cardCVC: string;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({ isOpen, onClose }) => {
  const { cartItems, totalPrice, clearCart } = useCart();
  const [step, setStep] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);
  const [orderComplete, setOrderComplete] = useState(false);

  const [formData, setFormData] = useState<FormData>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    cardNumber: '',
    cardExpiry: '',
    cardCVC: '',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (step === 1) {
      // Validate step 1
      if (!formData.firstName || !formData.email || !formData.address) {
        alert('Please fill in all required fields');
        return;
      }
      setStep(2);
    } else if (step === 2) {
      // Validate step 2
      if (!formData.cardNumber || !formData.cardExpiry || !formData.cardCVC) {
        alert('Please fill in all payment details');
        return;
      }

      // Process payment
      setIsProcessing(true);
      setTimeout(() => {
        setIsProcessing(false);
        setOrderComplete(true);
        clearCart();
      }, 2000);
    }
  };

  const handleClose = () => {
    if (!isProcessing && !orderComplete) {
      onClose();
      setStep(1);
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        address: '',
        city: '',
        state: '',
        zipCode: '',
        cardNumber: '',
        cardExpiry: '',
        cardCVC: '',
      });
    }
  };

  const handleOrderComplete = () => {
    onClose();
    setStep(1);
    setOrderComplete(false);
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      address: '',
      city: '',
      state: '',
      zipCode: '',
      cardNumber: '',
      cardExpiry: '',
      cardCVC: '',
    });
  };

  if (cartItems.length === 0 && !orderComplete) {
    return null;
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 50 }}
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-2xl shadow-2xl z-50 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
          >
            {orderComplete ? (
              // Order Complete Screen
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="p-8 text-center"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', damping: 10 }}
                  className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6"
                >
                  <Check size={40} color="white" />
                </motion.div>

                <h2 className="text-3xl font-bold text-gray-900 mb-2">Order Confirmed!</h2>
                <p className="text-gray-600 mb-6">
                  Thank you for your purchase. Your order has been successfully placed.
                </p>

                <div className="bg-gray-50 rounded-lg p-6 mb-6 text-left">
                  <h3 className="font-bold text-gray-900 mb-4">Order Details</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Order ID:</span>
                      <span className="font-bold text-gray-900">#SH{Math.random().toString(36).substr(2, 9).toUpperCase()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Total Items:</span>
                      <span className="font-bold text-gray-900">{cartItems.length}</span>
                    </div>
                    <div className="flex justify-between border-t border-gray-200 pt-2 mt-2">
                      <span className="text-gray-600">Total Amount:</span>
                      <span className="font-bold text-gray-900">KES {totalPrice.toFixed(0)}</span>
                    </div>
                  </div>
                </div>

                <p className="text-gray-600 text-sm mb-6">
                  A confirmation email has been sent to <strong>{formData.email}</strong>
                </p>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleOrderComplete}
                  className="w-full py-3 bg-gradient-to-r from-blue-600 to-blue-500 text-white font-bold rounded-lg hover:from-blue-700 hover:to-blue-600 transition-all"
                >
                  Continue Shopping
                </motion.button>
              </motion.div>
            ) : (
              <>
                {/* Header */}
                <div className="flex justify-between items-center p-6 border-b border-gray-200 sticky top-0 bg-white">
                  <h2 className="text-2xl font-bold text-gray-900">
                    {step === 1 ? 'Shipping Information' : 'Payment Details'}
                  </h2>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleClose}
                    disabled={isProcessing}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
                  >
                    <X size={24} />
                  </motion.button>
                </div>

                {/* Progress Indicator */}
                <div className="flex gap-2 p-6 border-b border-gray-200">
                  {[1, 2].map((s) => (
                    <motion.div
                      key={s}
                      className={`h-2 flex-1 rounded-full transition-colors ${
                        s === step
                          ? 'bg-gray-400'
                          : s < step
                            ? 'bg-green-500'
                            : 'bg-gray-200'
                      }`}
                    />
                  ))}
                </div>

                {/* Form */}
                <div className="p-6 space-y-4 max-h-[calc(90vh-300px)] overflow-y-auto">
                <form onSubmit={handleSubmit}>
                  {step === 1 ? (
                    <>
                      {/* Personal Information */}
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-900 mb-2">
                            First Name *
                          </label>
                          <input
                            type="text"
                            name="firstName"
                            value={formData.firstName}
                            onChange={handleInputChange}
                            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-0" style={{ '--focus-ring-color': '#0091AD', color: '#333', caretColor: '#0091AD' } as React.CSSProperties}
                            onFocus={(e) => e.currentTarget.style.borderColor = '#0091AD'} onBlur={(e) => e.currentTarget.style.borderColor = '#d1d5db'}
                            placeholder="John"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-900 mb-2">
                            Last Name
                          </label>
                          <input
                            type="text"
                            name="lastName"
                            value={formData.lastName}
                            onChange={handleInputChange}
                            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none" onFocus={(e) => e.currentTarget.style.borderColor = '#0091AD'} onBlur={(e) => e.currentTarget.style.borderColor = '#d1d5db'}
                            placeholder="Doe"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-900 mb-2">
                          Email *
                        </label>
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none" onFocus={(e) => e.currentTarget.style.borderColor = '#0091AD'} onBlur={(e) => e.currentTarget.style.borderColor = '#d1d5db'}
                          placeholder="john@example.com"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-900 mb-2">
                          Phone
                        </label>
                        <input
                          type="tel"
                          name="phone"
                          value={formData.phone}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none" onFocus={(e) => e.currentTarget.style.borderColor = '#0091AD'} onBlur={(e) => e.currentTarget.style.borderColor = '#d1d5db'}
                          placeholder="+1 (555) 000-0000"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-900 mb-2">
                          Address *
                        </label>
                        <input
                          type="text"
                          name="address"
                          value={formData.address}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none" onFocus={(e) => e.currentTarget.style.borderColor = '#0091AD'} onBlur={(e) => e.currentTarget.style.borderColor = '#d1d5db'}
                          placeholder="123 Main St"
                        />
                      </div>

                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-900 mb-2">
                            City
                          </label>
                          <input
                            type="text"
                            name="city"
                            value={formData.city}
                            onChange={handleInputChange}
                            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none" onFocus={(e) => e.currentTarget.style.borderColor = '#0091AD'} onBlur={(e) => e.currentTarget.style.borderColor = '#d1d5db'}
                            placeholder="New York"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-900 mb-2">
                            State
                          </label>
                          <input
                            type="text"
                            name="state"
                            value={formData.state}
                            onChange={handleInputChange}
                            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none" onFocus={(e) => e.currentTarget.style.borderColor = '#0091AD'} onBlur={(e) => e.currentTarget.style.borderColor = '#d1d5db'}
                            placeholder="NY"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-900 mb-2">
                            Zip Code
                          </label>
                          <input
                            type="text"
                            name="zipCode"
                            value={formData.zipCode}
                            onChange={handleInputChange}
                            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none" onFocus={(e) => e.currentTarget.style.borderColor = '#0091AD'} onBlur={(e) => e.currentTarget.style.borderColor = '#d1d5db'}
                            placeholder="10001"
                          />
                        </div>
                      </div>
                    </>
                  ) : (
                    <>
                      {/* Payment Information */}
                      <div>
                        <label className="block text-sm font-medium text-gray-900 mb-2">
                          Card Number *
                        </label>
                        <input
                          type="text"
                          name="cardNumber"
                          value={formData.cardNumber}
                          onChange={handleInputChange}
                          maxLength={19}
                          placeholder="1234 5678 9012 3456"
                          className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none"
                          onFocus={(e) => e.currentTarget.style.borderColor = '#0091AD'}
                          onBlur={(e) => e.currentTarget.style.borderColor = '#d1d5db'}
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-900 mb-2">
                            Expiry Date *
                          </label>
                          <input
                            type="text"
                            name="cardExpiry"
                            value={formData.cardExpiry}
                            onChange={handleInputChange}
                            maxLength={5}
                            placeholder="MM/YY"
                            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none"
                            onFocus={(e) => e.currentTarget.style.borderColor = '#0091AD'}
                            onBlur={(e) => e.currentTarget.style.borderColor = '#d1d5db'}
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-900 mb-2">
                            CVC *
                          </label>
                          <input
                            type="text"
                            name="cardCVC"
                            value={formData.cardCVC}
                            onChange={handleInputChange}
                            maxLength={3}
                            placeholder="123"
                            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none"
                            onFocus={(e) => e.currentTarget.style.borderColor = '#0091AD'}
                            onBlur={(e) => e.currentTarget.style.borderColor = '#d1d5db'}
                          />
                        </div>
                      </div>

                      {/* Order Summary */}
                      <div className="bg-gray-50 rounded-lg p-4 mt-6">
                        <h3 className="font-bold text-gray-900 mb-3">Order Summary</h3>
                        <div className="space-y-2 text-sm">
                          {cartItems.map((item) => (
                            <div key={item.id} className="flex justify-between text-gray-600">
                              <span>
                                {item.name} x {item.quantity}
                              </span>
                              <span>KES {(item.price * item.quantity).toFixed(0)}</span>
                            </div>
                          ))}
                          <div className="border-t border-gray-300 pt-2 flex justify-between font-bold text-gray-900">
                            <span>Total</span>
                            <span>KES {totalPrice.toFixed(0)}</span>
                          </div>
                        </div>
                      </div>
                    </>
                  )}

                  {/* Buttons */}
                  <div className="flex gap-4 mt-8">
                    {step === 2 && (
                      <motion.button
                        type="button"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setStep(1)}
                        disabled={isProcessing}
                        className="flex-1 py-3 border-2 border-blue-600 text-blue-600 font-bold rounded-lg hover:bg-blue-50 transition-colors disabled:opacity-50"
                      >
                        Back
                      </motion.button>
                    )}
                    <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    type="submit"
                    disabled={isProcessing}
                    className="flex-1 py-3 bg-gradient-to-r from-blue-600 to-blue-500 text-white font-bold rounded-lg hover:from-blue-700 hover:to-blue-600 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {isProcessing ? (
                        <>
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity }}
                            className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                          />
                          Processing...
                        </>
                      ) : step === 1 ? (
                        'Continue to Payment'
                      ) : (
                        'Complete Purchase'
                      )}
                    </motion.button>
                  </div>
                </form>
                </div>
              </>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
