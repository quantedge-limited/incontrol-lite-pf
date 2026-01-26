"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { checkoutApi } from "@/lib/api/sales";
import { toast } from "react-hot-toast";

export default function Checkout() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    buyer_name: "",
    buyer_email: "",
    buyer_phone: "",
    buyer_address: "",
    notes: "",
    payment_method: "mpesa" as const, // Add payment_method
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    if (!formData.buyer_name.trim() || 
        !formData.buyer_email.trim() || 
        !formData.buyer_phone.trim() || 
        !formData.buyer_address.trim()) {
      toast.error("Please fill in all required fields");
      return;
    }
    
    setLoading(true);

    try {
      const response = await checkoutApi.checkout(formData);
      if (response.success) {
        toast.success("Order created successfully!");
        // Redirect to order confirmation
        router.push(`/order/${response.order_id}`);
      } else {
        toast.error(`Checkout failed: ${response.message}`);
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

  return (
    <div className="max-w-2xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
      <div className="bg-white rounded-lg shadow-md p-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Checkout</h1>
        
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

          <div className="bg-blue-50 p-4 rounded-md">
            <div className="flex items-center gap-3">
              <input
                type="radio"
                id="mpesa"
                name="payment_method"
                value="mpesa"
                checked={formData.payment_method === "mpesa"}
                onChange={() => setFormData(prev => ({ ...prev, payment_method: "mpesa" }))}
                className="h-4 w-4 text-emerald-600"
              />
              <label htmlFor="mpesa" className="text-sm font-medium text-gray-700">
                Pay with M-Pesa
              </label>
            </div>
            <p className="text-sm text-gray-600 ml-7 mt-1">
              You will receive an M-Pesa prompt to complete payment
            </p>
          </div>

          <div className="pt-6 border-t border-gray-200">
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-emerald-600 text-white py-3 px-4 rounded-md hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Processing..." : "Place Order & Pay"}
            </button>
            <p className="text-sm text-gray-500 text-center mt-3">
              By placing your order, you agree to our Terms of Service
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}