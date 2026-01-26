"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { salesApi, transformCartToOrderData } from "@/lib/api/salesApi";
import { paymentsApi, pollPaymentStatus } from "@/lib/api/paymentsApi";
import { toast } from "react-hot-toast";

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
    payment_method: "mpesa" as const,
  });

  useEffect(() => {
    // Load cart from localStorage on component mount
    const cartData = salesApi.getCartFromStorage();
    setCart(cartData);
  }, []);

  const processMpesaPayment = async (order: any) => {
    try {
      // 1. Initiate M-Pesa payment
      const paymentResponse = await paymentsApi.initiatePayment({
        order_id: order.id,
        phone_number: formData.customer_phone,
      });

      if (!paymentResponse.success) {
        throw new Error(paymentResponse.message || "Failed to initiate payment");
      }

      toast.success("Payment initiated! Check your phone for M-Pesa prompt.");
      
      // 2. Start polling for payment status
      setIsProcessingPayment(true);
      
      const statusResponse = await pollPaymentStatus(order.id);
      
      if (statusResponse.payment.status === 'completed') {
        toast.success("Payment completed successfully!");
        return { success: true, payment: statusResponse.payment };
      } else {
        toast.error(`Payment ${statusResponse.payment.status}. Please try again.`);
        return { success: false, payment: statusResponse.payment };
      }
      
    } catch (error: any) {
      toast.error(error.message || "Payment processing failed");
      throw error;
    } finally {
      setIsProcessingPayment(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate cart
    if (cart.length === 0) {
      toast.error("Your cart is empty");
      return;
    }
    
    // Validate form
    if (!formData.customer_name.trim() || 
        !formData.customer_email.trim() || 
        !formData.customer_phone.trim() || 
        !formData.delivery_address.trim()) {
      toast.error("Please fill in all required fields");
      return;
    }
    
    // Validate phone number for M-Pesa
    if (formData.payment_method === "mpesa") {
      const phoneRegex = /^(07|01)\d{8}$/;
      if (!phoneRegex.test(formData.customer_phone)) {
        toast.error("Please enter a valid Kenyan phone number (e.g., 0712345678)");
        return;
      }
    }
    
    setLoading(true);

    try {
      // 1. Transform cart data to order format
      const orderData = transformCartToOrderData(cart, {
        name: formData.customer_name,
        phone: formData.customer_phone,
        email: formData.customer_email,
      });

      // 2. Create order in backend
      const order = await salesApi.createOrder(orderData);
      
      // 3. Process payment based on selected method
      if (formData.payment_method === "mpesa") {
        const paymentResult = await processMpesaPayment(order);
        
        if (paymentResult.success) {
          // Clear cart after successful payment
          salesApi.clearCart();
          // Redirect to order confirmation
          router.push(`/order/${order.id}?payment=success`);
        } else {
          // Payment failed but order was created
          // You might want to allow retry or show instructions
          router.push(`/order/${order.id}?payment=pending`);
        }
      } else {
        // Cash on delivery - no payment processing needed
        toast.success("Order created successfully!");
        salesApi.clearCart();
        router.push(`/order/${order.id}?payment=cash`);
      }
    } catch (error: any) {
      toast.error(error.message || "Checkout failed");
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

  // Calculate cart total
  const cartTotal = salesApi.calculateCartTotal(cart);

  return (
    <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">Checkout</h1>
      
      {/* Payment Processing Modal */}
      {isProcessingPayment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-md mx-4">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Processing M-Pesa Payment
              </h3>
              <p className="text-gray-600 mb-4">
                Please check your phone and enter your M-Pesa PIN when prompted.
              </p>
              <p className="text-sm text-gray-500">
                This may take a few moments...
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Order Summary */}
        <div className="lg:col-span-2">
          {/* ... rest of your component remains the same ... */}
          {/* Keep the same structure as before for order summary and form */}
        </div>

        {/* Right Column - Payment & Order Review */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-md p-6 sticky top-8">
            {/* ... rest of your component remains the same ... */}
            {/* Keep the same structure as before for payment options */}
          </div>
        </div>
      </div>
    </div>
  );
}