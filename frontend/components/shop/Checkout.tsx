/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { salesApi, transformCartToSaleData } from "@/lib/api/salesApi";
import { paymentsApi, pollPaymentStatus } from "@/lib/api/paymentsApi";
import { toast } from "react-hot-toast";
import { CreditCard, Smartphone, Wallet, ArrowLeft } from "lucide-react";

type PaymentMethod = "mpesa" | "cash" | "card";

export default function Checkout() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [cart, setCart] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    customer_name: "",
    customer_email: "",
    customer_phone: "",
    delivery_address: "",
    notes: "",
    payment_method: "mpesa" as PaymentMethod,
  });

  useEffect(() => {
    const cartData = salesApi.getCartFromStorage();
    setCart(cartData);
  }, []);

  const processMpesaPayment = async (saleId: number, totalAmount: number) => {
    try {
      const paymentResponse = await paymentsApi.initiatePayment({
        sale_id: saleId,
        phone_number: formData.customer_phone,
        amount: totalAmount,
        description: `Payment for order #${saleId}`,
      });

      if (!paymentResponse.success) {
        throw new Error(paymentResponse.message || "Failed to initiate payment");
      }

      toast.success("Payment initiated! Check your phone for M-Pesa prompt.");
      
      if (paymentResponse.checkout_request_id) {
        setIsProcessingPayment(true);
        
        try {
          const payment = await pollPaymentStatus(paymentResponse.checkout_request_id);
          
          if (payment.status === 'success') {
            toast.success("Payment completed successfully!");
            return { success: true, payment };
          } else {
            toast.error(`Payment ${payment.status}. Please try again.`);
            return { success: false, payment };
          }
        } finally {
          setIsProcessingPayment(false);
        }
      } else {
        return { success: true, payment: null };
      }
      
    } catch (error: any) {
      toast.error(error.message || "Payment processing failed");
      throw error;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (cart.length === 0) {
      toast.error("Your cart is empty");
      return;
    }
    
    if (!formData.customer_name.trim() || 
        !formData.customer_email.trim() || 
        !formData.customer_phone.trim() || 
        !formData.delivery_address.trim()) {
      toast.error("Please fill in all required fields");
      return;
    }
    
    if (formData.payment_method === "mpesa") {
      const phoneRegex = /^(07|01)\d{8}$/;
      if (!phoneRegex.test(formData.customer_phone)) {
        toast.error("Please enter a valid Kenyan phone number (e.g., 0712345678)");
        return;
      }
    }
    
    setLoading(true);

    try {
      const WALK_IN_CLIENT_ID = 1;
      const cartTotal = salesApi.calculateCartTotal(cart);
      
      const saleData = transformCartToSaleData(
        cart, 
        WALK_IN_CLIENT_ID, 
        formData.delivery_address
      );

      const token = localStorage.getItem('access_token');
      const saleResponse = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/create-payment/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(saleData),
      });

      if (!saleResponse.ok) {
        const error = await saleResponse.json();
        throw new Error(error.detail || 'Failed to create sale');
      }

      const sale = await saleResponse.json();
      
      if (formData.payment_method === "mpesa") {
        const paymentResult = await processMpesaPayment(sale.id, cartTotal);
        
        if (paymentResult.success) {
          salesApi.clearCart();
          router.push(`/order/${sale.id}?payment=success`);
        } else {
          router.push(`/order/${sale.id}?payment=pending`);
        }
      } else {
        toast.success("Order created successfully!");
        salesApi.clearCart();
        router.push(`/order/${sale.id}?payment=${formData.payment_method}`);
      }
    } catch (error: any) {
      toast.error(error.message || "Checkout failed");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    if (name === "payment_method") {
      setFormData(prev => ({
        ...prev,
        [name]: value as PaymentMethod
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const cartTotal = salesApi.calculateCartTotal(cart);

  return (
    <div className="min-h-screen bg-gray-50 py-4 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Header - Mobile Optimized */}
        <div className="mb-6">
          <button
            onClick={() => router.push('/cart')}
            className="inline-flex items-center text-sm text-emerald-600 hover:text-emerald-800 mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Cart
          </button>
          <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">Checkout</h1>
          <p className="text-gray-600 mt-1 text-sm sm:text-base">Complete your purchase</p>
        </div>

        {/* Payment Processing Modal - Mobile Responsive */}
        {isProcessingPayment && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-auto">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-emerald-600 border-t-transparent mx-auto mb-4"></div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Processing M-Pesa
                </h3>
                <p className="text-gray-600 text-sm mb-4">
                  Check your phone and enter your M-Pesa PIN.
                </p>
                <div className="bg-emerald-50 p-3 rounded-lg">
                  <p className="text-xs text-emerald-800">
                    Don't close this window.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Form */}
          <div className="lg:col-span-2 space-y-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Personal Info Card */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  1. Personal Information
                </h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      name="customer_name"
                      value={formData.customer_name}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 text-sm sm:text-base"
                      required
                      placeholder="John Doe"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      name="customer_email"
                      value={formData.customer_email}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 text-sm sm:text-base"
                      required
                      placeholder="john@example.com"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      name="customer_phone"
                      value={formData.customer_phone}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 text-sm sm:text-base"
                      required
                      placeholder="0712345678"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Kenyan number for M-Pesa payments
                    </p>
                  </div>
                </div>
              </div>

              {/* Delivery Info Card */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  2. Delivery Information
                </h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Delivery Address *
                    </label>
                    <textarea
                      name="delivery_address"
                      value={formData.delivery_address}
                      onChange={handleChange}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 text-sm sm:text-base"
                      required
                      placeholder="Enter your complete delivery address"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Additional Notes (Optional)
                    </label>
                    <textarea
                      name="notes"
                      value={formData.notes}
                      onChange={handleChange}
                      rows={2}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 text-sm sm:text-base"
                      placeholder="Any special instructions"
                    />
                  </div>
                </div>
              </div>

              {/* Payment Method Card */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  3. Payment Method
                </h2>
                <div className="space-y-3">
                  {/* M-Pesa Option */}
                  <label className={`block cursor-pointer ${formData.payment_method === 'mpesa' ? 'ring-1 ring-emerald-500' : ''}`}>
                    <div className="flex items-start p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
                      <input
                        type="radio"
                        name="payment_method"
                        value="mpesa"
                        checked={formData.payment_method === "mpesa"}
                        onChange={handleChange}
                        className="h-4 w-4 text-emerald-600 mt-1"
                      />
                      <div className="ml-3">
                        <div className="flex items-center">
                          <Smartphone className="h-5 w-5 text-emerald-600 mr-2" />
                          <span className="font-medium text-gray-900">M-Pesa</span>
                          <span className="ml-2 px-2 py-0.5 text-xs bg-emerald-100 text-emerald-800 rounded">Recommended</span>
                        </div>
                        <p className="text-xs text-gray-600 mt-1">
                          Pay instantly with M-Pesa
                        </p>
                      </div>
                    </div>
                  </label>

                  {/* Cash Option */}
                  <label className={`block cursor-pointer ${formData.payment_method === 'cash' ? 'ring-1 ring-emerald-500' : ''}`}>
                    <div className="flex items-start p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
                      <input
                        type="radio"
                        name="payment_method"
                        value="cash"
                        checked={formData.payment_method === "cash"}
                        onChange={handleChange}
                        className="h-4 w-4 text-emerald-600 mt-1"
                      />
                      <div className="ml-3">
                        <div className="flex items-center">
                          <Wallet className="h-5 w-5 text-emerald-600 mr-2" />
                          <span className="font-medium text-gray-900">Cash on Delivery</span>
                        </div>
                        <p className="text-xs text-gray-600 mt-1">
                          Pay when your order arrives
                        </p>
                      </div>
                    </div>
                  </label>

                  {/* Card Option */}
                  <div className="opacity-50">
                    <div className="flex items-start p-3 border border-gray-200 rounded-lg">
                      <input
                        type="radio"
                        name="payment_method"
                        value="card"
                        checked={formData.payment_method === "card"}
                        onChange={handleChange}
                        className="h-4 w-4 text-emerald-600 mt-1"
                        disabled
                      />
                      <div className="ml-3">
                        <div className="flex items-center">
                          <CreditCard className="h-5 w-5 text-emerald-600 mr-2" />
                          <span className="font-medium text-gray-900">Credit/Debit Card</span>
                          <span className="ml-2 px-2 py-0.5 text-xs bg-gray-100 text-gray-600 rounded">Soon</span>
                        </div>
                        <p className="text-xs text-gray-600 mt-1">
                          Coming soon
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Submit Button - Mobile Optimized */}
              <button
                type="submit"
                disabled={loading || cart.length === 0}
                className="w-full bg-emerald-600 text-white py-3 px-4 rounded-lg font-semibold text-base hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Processing...
                  </div>
                ) : (
                  `Complete Order - KES ${cartTotal.toFixed(2)}`
                )}
              </button>
            </form>
          </div>

          {/* Right Column - Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h2>
              
              {/* Cart Items - Scrollable on Mobile */}
              <div className="space-y-3 mb-6 max-h-64 overflow-y-auto pr-2">
                {cart.length === 0 ? (
                  <div className="text-center py-4">
                    <p className="text-gray-500 text-sm">Your cart is empty</p>
                  </div>
                ) : (
                  cart.map((item) => (
                    <div key={item.product_id} className="flex items-start justify-between py-2 border-b border-gray-100 last:border-0">
                      <div className="flex-1 pr-2">
                        <p className="font-medium text-gray-900 text-sm">
                          {item.product_name}
                        </p>
                        <div className="flex items-center text-xs text-gray-600 mt-1">
                          <span className="bg-gray-100 px-1.5 py-0.5 rounded mr-2">
                            {item.quantity} ×
                          </span>
                          <span>KES {item.unit_price.toFixed(2)}</span>
                        </div>
                      </div>
                      <p className="font-semibold text-gray-900 text-sm whitespace-nowrap">
                        KES {(item.quantity * item.unit_price).toFixed(2)}
                      </p>
                    </div>
                  ))
                )}
              </div>
              
              {/* Order Total */}
              <div className="border-t border-gray-200 pt-4 space-y-2">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span>KES {cartTotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Shipping</span>
                  <span className="text-emerald-600 text-sm">At checkout</span>
                </div>
                <div className="border-t border-gray-200 pt-3">
                  <div className="flex justify-between font-bold text-gray-900">
                    <span>Total</span>
                    <span>KES {cartTotal.toFixed(2)}</span>
                  </div>
                </div>
              </div>
              
              {/* Payment Info */}
              <div className="mt-6 p-3 bg-gray-50 rounded-lg">
                <p className="text-xs text-gray-600">
                  <strong>Payment:</strong>{" "}
                  {formData.payment_method === 'mpesa' ? 'M-Pesa' : 
                   formData.payment_method === 'cash' ? 'Cash on Delivery' : 'Card'}
                </p>
                <p className="text-xs text-gray-600 mt-1">
                  Confirmation will be sent via email.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Note - Mobile Optimized */}
        <div className="mt-8 text-center text-xs text-gray-500 px-4">
          <p>By completing your purchase, you agree to our Terms and Privacy Policy.</p>
          <p className="mt-1">
            <a href="/contact" className="text-emerald-600 hover:text-emerald-800">
              Need help? Contact Support
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}