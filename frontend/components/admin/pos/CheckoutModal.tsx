// components/admin/pos/CheckoutModal.tsx
"use client";

import { motion } from 'framer-motion';
import { X, CreditCard, Smartphone, Wallet, User, Phone, Mail, MapPin } from 'lucide-react';
import { useState, useEffect } from 'react';
import { POSCartItem, CustomerData } from '@/types/pos';
import { salesApi } from '@/lib/api/salesApi';
import { clientsApi } from '@/lib/api/clientsApi'; // You'll need this

interface CheckoutModalProps {
  onClose: () => void;
  onCheckout: (customerData: CustomerData) => Promise<void>;
  loading: boolean;
  cart: POSCartItem[];
  subtotal: number;
  tax: number;
  total: number;
  servedBy: string; // Added: Cashier/Staff name
  onClientSelect?: (clientId: number) => void; // Optional: For client search
}

export default function CheckoutModal({
  onClose,
  onCheckout,
  loading,
  cart,
  subtotal,
  tax,
  total,
  servedBy,
  onClientSelect,
}: CheckoutModalProps) {
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card' | 'mobile_money'>('cash');
  const [existingClientId, setExistingClientId] = useState<number | undefined>();
  const [clients, setClients] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  // Fetch clients for search (optional)
  useEffect(() => {
    if (searchTerm.length > 2) {
      searchClients();
    }
  }, [searchTerm]);

  const searchClients = async () => {
    setIsSearching(true);
    try {
      // You'll need to implement clientsApi or adjust this
      // const data = await clientsApi.searchClients(searchTerm);
      // setClients(data);
    } catch (error) {
      console.error('Error searching clients:', error);
    } finally {
      setIsSearching(false);
    }
  };

  const handleClientSelect = (client: any) => {
    setExistingClientId(client.id);
    setCustomerName(client.full_name || client.name);
    setCustomerPhone(client.phone || '');
    setCustomerEmail(client.email || '');
    setCustomerAddress(client.address || '');
    onClientSelect?.(client.id);
    setSearchTerm('');
    setClients([]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const customerData: CustomerData = {
      client_id: existingClientId,
      name: customerName,
      phone: customerPhone,
      email: customerEmail || undefined,
      address: customerAddress || undefined,
      payment_method: paymentMethod,
    };
    
    await onCheckout(customerData);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const paymentMethods = [
    { id: 'cash' as const, name: 'Cash', icon: Wallet },
    { id: 'card' as const, name: 'Credit Card', icon: CreditCard },
    { id: 'mobile_money' as const, name: 'Mobile Money', icon: Smartphone },
  ];

  const calculateItemTotal = (item: POSCartItem) => {
    return item.price * item.quantity;
  };

  const handleQuickCustomer = (type: 'walkin' | 'regular' | 'corporate') => {
    switch (type) {
      case 'walkin':
        setCustomerName('Walk-in Customer');
        setCustomerAddress('In-store pickup');
        setExistingClientId(undefined);
        break;
      case 'regular':
        setCustomerName('Regular Customer');
        setCustomerPhone('0712345678');
        setCustomerAddress('123 Main Street, Nairobi');
        break;
      case 'corporate':
        setCustomerName('Corporate Client');
        setCustomerEmail('corporate@example.com');
        setCustomerAddress('Corporate Office, Westlands');
        break;
    }
  };

  return (
    <div className="fixed inset-0 bg-white/10 backdrop-blur-md flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
      >
        <div className="flex h-full flex-col lg:flex-row">
          {/* Left Side - Order Summary */}
          <div className="flex-1 p-6 lg:p-8 overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">POS Checkout</h2>
                <p className="text-sm text-gray-600">Served by: {servedBy}</p>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-lg"
                disabled={loading}
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Order Items */}
            <div className="mb-6">
              <h3 className="font-semibold text-gray-700 mb-4">Order Summary</h3>
              <div className="space-y-3 max-h-60 overflow-y-auto">
                {cart.map((item) => (
                  <div key={item.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <p className="font-medium">{item.name}</p>
                      <p className="text-sm text-gray-600">
                        {item.quantity} × {formatCurrency(item.price)}
                      </p>
                    </div>
                    <p className="font-bold ml-4">
                      {formatCurrency(calculateItemTotal(item))}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Totals */}
            <div className="space-y-2 mb-6 p-4 bg-gray-50 rounded-lg">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal</span>
                <span>{formatCurrency(subtotal)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Tax (16% VAT)</span>
                <span>{formatCurrency(tax)}</span>
              </div>
              <div className="flex justify-between text-xl font-bold text-gray-900 pt-3 border-t border-gray-300">
                <span>Total Amount</span>
                <span>{formatCurrency(total)}</span>
              </div>
            </div>

            {/* Client Search (Optional) */}
            {onClientSelect && (
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Search Existing Client
                </label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search by name or phone..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    disabled={loading}
                  />
                  {isSearching && (
                    <div className="absolute right-3 top-2">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-emerald-600"></div>
                    </div>
                  )}
                </div>
                {clients.length > 0 && (
                  <div className="mt-2 space-y-1 max-h-32 overflow-y-auto">
                    {clients.map((client) => (
                      <button
                        key={client.id}
                        onClick={() => handleClientSelect(client)}
                        className="w-full text-left px-3 py-2 hover:bg-gray-100 rounded text-sm"
                      >
                        {client.full_name} - {client.phone}
                      </button>
                    ))}
                  </div>
                )}
                {existingClientId && (
                  <div className="mt-2 text-sm text-emerald-600">
                    ✓ Using existing client profile
                  </div>
                )}
              </div>
            )}

            {/* Quick Customer Buttons */}
            <div className="grid grid-cols-3 gap-3 mb-6">
              <button
                type="button"
                onClick={() => handleQuickCustomer('walkin')}
                className="px-4 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm"
                disabled={loading}
              >
                Walk-in
              </button>
              <button
                type="button"
                onClick={() => handleQuickCustomer('regular')}
                className="px-4 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm"
                disabled={loading}
              >
                Regular
              </button>
              <button
                type="button"
                onClick={() => handleQuickCustomer('corporate')}
                className="px-4 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm"
                disabled={loading}
              >
                Corporate
              </button>
            </div>
          </div>

          {/* Right Side - Customer & Payment */}
          <div className="flex-1 p-6 lg:p-8 bg-gradient-to-b from-emerald-50 to-white">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Customer Info */}
              <div>
                <h3 className="font-semibold text-gray-700 mb-4">Customer Information</h3>
                <div className="space-y-4">
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Customer Name *"
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
                    Print receipt automatically
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
                    Send digital receipt (if email provided)
                  </label>
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
                    Processing Sale...
                  </>
                ) : (
                  `Complete ${paymentMethod === 'cash' ? 'Cash' : 'Card'} Sale`
                )}
              </button>

              {/* Additional Info */}
              <div className="text-center text-sm text-gray-500">
                <p>This sale will immediately deduct stock from inventory.</p>
                <p>Receipt will be generated upon completion.</p>
              </div>
            </form>
          </div>
        </div>
      </motion.div>
    </div>
  );
}