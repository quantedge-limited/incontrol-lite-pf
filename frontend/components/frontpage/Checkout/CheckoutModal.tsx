/* eslint-disable @typescript-eslint/no-explicit-any */
// components/frontpage/Checkout/CheckoutModal.tsx
'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, CreditCard, Smartphone, Loader2 } from 'lucide-react';
import { useCart } from '@/context/cart/CartContext';
import { orderApiService } from '@/services/orderApi';
import { paymentApiService, PaymentRequestData } from '@/services/paymentApi';

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
  const { cart, items, clearCart } = useCart();
  const [step, setStep] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);
  const [orderComplete, setOrderComplete] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'initiated' | 'pending' | 'success' | 'failed'>('idle');
  const [paymentData, setPaymentData] = useState<any>(null);
  const [orderData, setOrderData] = useState<any>(null);
  const [errorMessage, setErrorMessage] = useState<string>('');
  
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setIsMounted(true);
    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
    };
  }, []);

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

  if (!isMounted) {
    return null;
  }

  const safeCartItems = items || [];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrorMessage(''); // Clear error on input change
  };

  const startPaymentPolling = (paymentId: string) => {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
    }

    pollingIntervalRef.current = setInterval(async () => {
      try {
        const payment = await paymentApiService.checkPaymentStatus(paymentId);
        
        if (payment.status === 'success') {
          setPaymentStatus('success');
          setOrderComplete(true);
          clearCart();
          if (pollingIntervalRef.current) {
            clearInterval(pollingIntervalRef.current);
          }
        } else if (payment.status === 'failed') {
          setPaymentStatus('failed');
          setErrorMessage('Payment failed. Please try again.');
          if (pollingIntervalRef.current) {
            clearInterval(pollingIntervalRef.current);
          }
        }
        // If still pending, continue polling
      } catch (error) {
        console.error('Payment polling error:', error);
      }
    }, 3000); // Poll every 3 seconds

    // Stop polling after 2 minutes
    setTimeout(() => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
      if (paymentStatus === 'pending') {
        setErrorMessage('Payment timeout. Please check your phone or try again.');
        setPaymentStatus('idle');
      }
    }, 120000);
  };

  const handleMpesaPayment = async (orderId: string) => {
    try {
      setPaymentStatus('initiated');
      
      // Format phone number for M-Pesa (strip +254 if present, add 254)
      let phone = formData.phone.trim();
      phone = phone.replace(/\s+/g, '');
      
      if (phone.startsWith('+')) {
        phone = phone.substring(1);
      }
      
      if (phone.startsWith('0')) {
        phone = '254' + phone.substring(1);
      }
      
      if (!phone.startsWith('254')) {
        phone = '254' + phone;
      }

      const paymentRequest: PaymentRequestData = {
        order: orderId,
        customer_name: `${formData.firstName} ${formData.lastName}`.trim(),
        customer_phone: phone,
        delivery_address: formData.address,
      };

      const response = await paymentApiService.initiatePayment(paymentRequest);
      
      setPaymentData(response);
      setPaymentStatus('pending');
      
      // Start polling for payment status
      startPaymentPolling(response.payment.id);
      
    } catch (error: any) {
      console.error('M-Pesa payment failed:', error);
      setErrorMessage(error.message || 'Failed to initiate M-Pesa payment. Please try again.');
      setPaymentStatus('failed');
    }
  };

  // Update the handleSubmit function in CheckoutModal.tsx
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (step === 1) {
      if (!formData.firstName || !formData.email || !formData.address || !formData.phone) {
        setErrorMessage('Please fill in all required fields');
        return;
      }
      setStep(2);
    } else if (step === 2) {
      setIsProcessing(true);
      setPaymentStatus('idle');

      try {
        // Mock order creation (replace with real API later)
        const mockOrderResponse = {
          order_id: `ORD-${Date.now()}`,
          total_amount: cart.total_price,
          message: 'Order created successfully',
          customer: {
            name: formData.firstName + ' ' + formData.lastName,
            phone: formData.phone,
            email: formData.email
          }
        };
        
        setOrderData(mockOrderResponse);

        // Handle payment based on method
        if (formData.paymentMethod === 'mpesa') {
          // Mock M-Pesa payment
          setPaymentStatus('pending');
          
          // Simulate payment processing
          setTimeout(() => {
            setPaymentStatus('success');
            setOrderComplete(true);
            clearCart();
          }, 3000);
        } else {
          // For card payments
          setOrderComplete(true);
          clearCart();
        }

      } catch (error: any) {
        console.error('Checkout failed:', error);
        setErrorMessage(error.message || 'Failed to process order. Please try again.');
        setPaymentStatus('failed');
      } finally {
        setIsProcessing(false);
      }
    }
  };



  const resetForm = () => {
    setStep(1);
    setOrderComplete(false);
    setPaymentStatus('idle');
    setPaymentData(null);
    setOrderData(null);
    setErrorMessage('');
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

  if (!safeCartItems || (safeCartItems.length === 0 && !orderComplete && paymentStatus !== 'pending')) return null;

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
                <h2 className="text-3xl font-bold text-gray-900 mb-2">
                  {paymentStatus === 'success' ? 'Payment Successful!' : 'Order Confirmed!'}
                </h2>
                <p className="text-gray-600 mb-4">
                  {paymentStatus === 'success' 
                    ? 'Thank you for your purchase! Your payment has been confirmed.'
                    : 'Thank you for your order. We will contact you for payment details.'}
                </p>
                {orderData && (
                  <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600">
                      Order #{orderData.order_id?.slice(0, 8)} • Total: KES {cart.total_price.toFixed(0)}
                    </p>
                  </div>
                )}
                <button
                  onClick={() => { onClose(); resetForm(); }}
                  className="w-full py-3 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 transition-all"
                >
                  Continue Shopping
                </button>
              </div>
            ) : paymentStatus === 'pending' ? (
              <div className="p-8 text-center">
                <div className="animate-spin rounded-full h-20 w-20 border-b-2 border-green-500 mx-auto mb-6"></div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Awaiting Payment Confirmation</h2>
                <p className="text-gray-600 mb-2">
                  Please check your phone to complete the M-Pesa payment.
                </p>
                <p className="text-sm text-gray-500 mb-6">
                  Order #{orderData?.order_id?.slice(0, 8)} • KES {cart.total_price.toFixed(0)}
                </p>
                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg mb-6">
                  <p className="text-sm text-yellow-700">
                    Waiting for payment confirmation. This may take a moment...
                  </p>
                </div>
                <button
                  onClick={() => {
                    setPaymentStatus('idle');
                    setErrorMessage('');
                  }}
                  className="w-full py-3 border-2 border-gray-300 text-gray-700 font-bold rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel Payment
                </button>
              </div>
            ) : (
              <>
                <div className="flex justify-between items-center p-6 border-b border-gray-200 sticky top-0 bg-white">
                  <h2 className="text-2xl font-bold text-gray-900">
                    {step === 1 ? 'Shipping Information' : 'Payment Details'}
                  </h2>
                  <button onClick={handleClose} className="p-2 hover:bg-gray-100 rounded-lg">
                    <X size={24} />
                  </button>
                </div>

                <div className="p-6">
                  {errorMessage && (
                    <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                      <p className="text-sm text-red-600">{errorMessage}</p>
                    </div>
                  )}

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
                              required
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
                            required
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-900 mb-2">Phone *</label>
                          <input
                            type="tel"
                            name="phone"
                            value={formData.phone}
                            onChange={handleInputChange}
                            className={inputStyle}
                            placeholder="0712 345 678"
                            pattern="[0-9]{10,12}"
                            title="Enter a valid phone number (e.g., 0712345678)"
                            required
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
                            required
                          />
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-6">
                        {/* Order Summary */}
                        <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                          <h3 className="font-bold text-gray-900 mb-2">Order Summary</h3>
                          <div className="space-y-1 text-sm">
                            <div className="flex justify-between">
                              <span>Items:</span>
                              <span>{safeCartItems.length}</span>
                            </div>
                            <div className="flex justify-between font-bold">
                              <span>Total:</span>
                              <span>KES {cart.total_price.toFixed(0)}</span>
                            </div>
                          </div>
                        </div>

                        {/* Payment Method Selection */}
                        <div>
                          <h3 className="text-sm font-medium text-gray-900 mb-3">Select Payment Method</h3>
                          <div className="grid grid-cols-2 gap-4">
                            <button
                              type="button"
                              onClick={() => setFormData({...formData, paymentMethod: 'mpesa'})}
                              className={`p-4 border-2 rounded-xl flex flex-col items-center gap-2 transition-all ${
                                formData.paymentMethod === 'mpesa' ? 'border-green-600 bg-green-50' : 'border-gray-200'
                              }`}
                            >
                              <Smartphone className={formData.paymentMethod === 'mpesa' ? 'text-green-600' : 'text-gray-400'} />
                              <span className={`font-bold ${formData.paymentMethod === 'mpesa' ? 'text-green-700' : 'text-gray-500'}`}>
                                Lipa na M-Pesa
                              </span>
                            </button>
                            <button
                              type="button"
                              onClick={() => setFormData({...formData, paymentMethod: 'card'})}
                              className={`p-4 border-2 rounded-xl flex flex-col items-center gap-2 transition-all ${
                                formData.paymentMethod === 'card' ? 'border-green-600 bg-green-50' : 'border-gray-200'
                              }`}
                            >
                              <CreditCard className={formData.paymentMethod === 'card' ? 'text-green-600' : 'text-gray-400'} />
                              <span className={`font-bold ${formData.paymentMethod === 'card' ? 'text-green-700' : 'text-gray-500'}`}>
                                Bank Card
                              </span>
                            </button>
                          </div>
                        </div>

                        {formData.paymentMethod === 'card' && (
                          <div className="space-y-4 animate-in fade-in slide-in-from-top-2">
                            <input 
                              type="text" 
                              name="cardNumber" 
                              placeholder="Card Number" 
                              className={inputStyle} 
                              onChange={handleInputChange}
                              required={formData.paymentMethod === 'card'}
                            />
                            <div className="grid grid-cols-2 gap-4">
                              <input 
                                type="text" 
                                name="cardExpiry" 
                                placeholder="MM/YY" 
                                className={inputStyle} 
                                onChange={handleInputChange}
                                required={formData.paymentMethod === 'card'}
                              />
                              <input 
                                type="text" 
                                name="cardCVC" 
                                placeholder="CVC" 
                                className={inputStyle} 
                                onChange={handleInputChange}
                                required={formData.paymentMethod === 'card'}
                              />
                            </div>
                          </div>
                        )}

                        {formData.paymentMethod === 'mpesa' && (
                          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                            <p className="text-sm text-blue-700">
                              <strong>M-Pesa Instructions:</strong><br />
                              1. Ensure your phone is nearby and has mobile data<br />
                              2. You will receive a prompt on <strong>{formData.phone || 'your phone'}</strong><br />
                              3. Enter your M-Pesa PIN when prompted<br />
                              4. Wait for confirmation
                            </p>
                          </div>
                        )}
                      </div>
                    )}

                    <div className="flex gap-4 pt-4">
                      {step === 2 && (
                        <button 
                          type="button" 
                          onClick={() => setStep(1)} 
                          className="flex-1 py-3 border-2 border-gray-300 text-gray-700 font-bold rounded-lg hover:bg-gray-50"
                        >
                          Back
                        </button>
                      )}
                      <button
                        type="submit"
                        disabled={isProcessing}
                        className={`flex-1 py-3 text-white font-bold rounded-lg transition-all flex items-center justify-center gap-2 ${
                          isProcessing 
                            ? 'bg-gray-400 cursor-not-allowed' 
                            : step === 1 
                              ? 'bg-green-600 hover:bg-green-700' 
                              : 'bg-green-600 hover:bg-green-800'
                        }`}
                      >
                        {isProcessing ? (
                          <>
                            <Loader2 className="animate-spin" size={20} />
                            Processing...
                          </>
                        ) : step === 1 ? (
                          'Continue to Payment'
                        ) : (
                          'Complete Purchase'
                        )}
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