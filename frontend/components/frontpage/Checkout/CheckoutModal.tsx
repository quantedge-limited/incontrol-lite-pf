'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, CreditCard, Smartphone } from 'lucide-react';
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
  paymentMethod: 'mpesa' | 'card';
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
    paymentMethod: 'mpesa',
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
      if (!formData.firstName || !formData.email || !formData.address) {
        alert('Please fill in all required fields');
        return;
      }
      setStep(2);
    } else if (step === 2) {
      if (formData.paymentMethod === 'card' && (!formData.cardNumber || !formData.cardExpiry || !formData.cardCVC)) {
        alert('Please fill in all card details');
        return;
      }

      setIsProcessing(true);
      setTimeout(() => {
        setIsProcessing(false);
        setOrderComplete(true);
        clearCart();
      }, 2000);
    }
  };

  const resetForm = () => {
    setStep(1);
    setOrderComplete(false);
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      address: '',
      paymentMethod: 'mpesa',
      cardNumber: '',
      cardExpiry: '',
      cardCVC: '',
    });
  };

  const handleClose = () => {
    if (!isProcessing && !orderComplete) {
      onClose();
      resetForm();
    }
  };

  if (cartItems.length === 0 && !orderComplete) return null;

  // Reusable Input Style to ensure black text and visible placeholders
  const inputStyle = "w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-green-500 text-black placeholder:text-gray-500 bg-white";

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
              <div className="p-8 text-center">
                <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Check size={40} color="white" />
                </div>
                <h2 className="text-3xl font-bold text-gray-900 mb-2">Order Confirmed!</h2>
                <button
                  onClick={() => { onClose(); resetForm(); }}
                  className="w-full py-3 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 transition-all"
                >
                  Continue Shopping
                </button>
              </div>
            ) : (
              <>
                <div className="flex justify-between items-center p-6 border-b border-gray-200 sticky top-0 bg-white">
                  <h2 className="text-2xl font-bold text-gray-900">
                    {step === 1 ? 'Shipping Information' : 'Payment Details'}
                  </h2>
                  <button onClick={handleClose} className="p-2 hover:bg-gray-100 rounded-lg"><X size={24} /></button>
                </div>

                <div className="p-6">
                  <form onSubmit={handleSubmit} className="space-y-4">
                    {step === 1 ? (
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-900 mb-2">First Name *</label>
                            <input
                              type="text"
                              name="firstName"
                              value={formData.firstName}
                              onChange={handleInputChange}
                              className={inputStyle}
                              placeholder="Enter first name"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-900 mb-2">Last Name</label>
                            <input
                              type="text"
                              name="lastName"
                              value={formData.lastName}
                              onChange={handleInputChange}
                              className={inputStyle}
                              placeholder="Enter last name"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-900 mb-2">Email *</label>
                          <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            className={inputStyle}
                            placeholder="example@mail.com"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-900 mb-2">Phone</label>
                          <input
                            type="tel"
                            name="phone"
                            value={formData.phone}
                            onChange={handleInputChange}
                            className={inputStyle}
                            placeholder="0712 345 678"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-900 mb-2">Address *</label>
                          <input
                            type="text"
                            name="address"
                            value={formData.address}
                            onChange={handleInputChange}
                            className={inputStyle}
                            placeholder="Street address, Apartment, etc."
                          />
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-6">
                        {/* Payment Method Selection */}
                        <div className="grid grid-cols-2 gap-4">
                          <button
                            type="button"
                            onClick={() => setFormData({...formData, paymentMethod: 'mpesa'})}
                            className={`p-4 border-2 rounded-xl flex flex-col items-center gap-2 transition-all ${formData.paymentMethod === 'mpesa' ? 'border-green-600 bg-green-50' : 'border-gray-200'}`}
                          >
                            <Smartphone className={formData.paymentMethod === 'mpesa' ? 'text-green-600' : 'text-gray-400'} />
                            <span className={`font-bold ${formData.paymentMethod === 'mpesa' ? 'text-green-700' : 'text-gray-500'}`}>Lipa na M-Pesa</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => setFormData({...formData, paymentMethod: 'card'})}
                            className={`p-4 border-2 rounded-xl flex flex-col items-center gap-2 transition-all ${formData.paymentMethod === 'card' ? 'border-green-600 bg-green-50' : 'border-gray-200'}`}
                          >
                            <CreditCard className={formData.paymentMethod === 'card' ? 'text-green-600' : 'text-gray-400'} />
                            <span className={`font-bold ${formData.paymentMethod === 'card' ? 'text-green-700' : 'text-gray-500'}`}>Bank Card</span>
                          </button>
                        </div>

                        {formData.paymentMethod === 'card' && (
                          <div className="space-y-4 animate-in fade-in slide-in-from-top-2">
                            <input type="text" name="cardNumber" placeholder="Card Number" className={inputStyle} onChange={handleInputChange} />
                            <div className="grid grid-cols-2 gap-4">
                              <input type="text" name="cardExpiry" placeholder="MM/YY" className={inputStyle} onChange={handleInputChange} />
                              <input type="text" name="cardCVC" placeholder="CVC" className={inputStyle} onChange={handleInputChange} />
                            </div>
                          </div>
                        )}

                        {formData.paymentMethod === 'mpesa' && (
                          <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                            <p className="text-sm text-gray-600">You will receive an M-Pesa prompt on <b>{formData.phone || 'your phone'}</b> after clicking complete.</p>
                          </div>
                        )}
                      </div>
                    )}

                    <div className="flex gap-4 pt-4">
                      {step === 2 && (
                        <button type="button" onClick={() => setStep(1)} className="flex-1 py-3 border-2 border-gray-300 text-gray-700 font-bold rounded-lg">Back</button>
                      )}
                      <button
                        type="submit"
                        disabled={isProcessing}
                        className={`flex-1 py-3 text-white font-bold rounded-lg transition-all flex items-center justify-center gap-2 ${step === 1 ? 'bg-green-600 hover:bg-green-700' : 'bg-green-600 hover:bg-green-800'}`}
                      >
                        {isProcessing ? 'Processing...' : step === 1 ? 'Continue to Payment' : 'Complete Purchase'}
                      </button>
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