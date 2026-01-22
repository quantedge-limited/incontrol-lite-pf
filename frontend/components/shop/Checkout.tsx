"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { cartApi, CheckoutDto } from "@/lib/api/sales";
import { toast } from "react-hot-toast";

export default function Checkout() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<CheckoutDto>({
    buyer_name: "",
    buyer_email: "",
    buyer_phone: "",
    buyer_address: "",
    sale_type: "online",
    notes: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await cartApi.checkout(formData);
      if (response.data) {
        toast.success("Order created successfully!");
        // Redirect to payment or order confirmation
        router.push(`/order/${response.data.id}`);
      } else {
        toast.error(`Checkout failed: ${response.error}`);
      }
    } catch (error) {
      toast.error("Checkout failed");
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

          <div className="pt-6 border-t border-gray-200">
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-emerald-600 text-white py-3 px-4 rounded-md hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Processing..." : "Place Order"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}