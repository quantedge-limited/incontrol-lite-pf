"use client";

import { useState, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';
import { toast } from 'react-toastify';

interface RecordSaleFormProps {
  onSave: (saleData: any) => void;
  inventoryItems: any[];
  loading: boolean;
}

interface SaleItem {
  inventoryId: string;
  quantity: number;
  price: number;
  name: string;
}

export default function RecordSaleForm({ 
  onSave, 
  inventoryItems, 
  loading 
}: RecordSaleFormProps) {
  const [date, setDate] = useState(new Date().toISOString().slice(0, 16));
  const [buyerName, setBuyerName] = useState("");
  const [buyerPhone, setBuyerPhone] = useState("");
  const [notes, setNotes] = useState("");
  const [items, setItems] = useState<SaleItem[]>([]);
  const [selectedItem, setSelectedItem] = useState("");
  const [itemQuantity, setItemQuantity] = useState(1);
  const [totalAmount, setTotalAmount] = useState(0);

  // Calculate total amount whenever items change
  useEffect(() => {
    const calculatedTotal = items.reduce((sum, item) => sum + (item.quantity * item.price), 0);
    setTotalAmount(calculatedTotal);
  }, [items]);

  const handleAddItem = () => {
    if (!selectedItem) {
      toast.error('Please select an item');
      return;
    }

    const inventory = inventoryItems.find(item => item.id === selectedItem);
    if (!inventory) return;

    const existingItemIndex = items.findIndex(item => item.inventoryId === selectedItem);
    
    if (existingItemIndex >= 0) {
      // Update existing item quantity
      const updatedItems = [...items];
      updatedItems[existingItemIndex].quantity += itemQuantity;
      setItems(updatedItems);
    } else {
      // Add new item
      setItems(prev => [...prev, {
        inventoryId: selectedItem,
        quantity: itemQuantity,
        price: inventory.price_per_unit,
        name: inventory.name,
      }]);
    }

    setSelectedItem("");
    setItemQuantity(1);
  };

  const handleRemoveItem = (index: number) => {
    setItems(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (items.length === 0) {
      toast.error('Please add at least one item to the sale');
      return;
    }

    const saleData = {
      created_at: new Date(date).toISOString(),
      buyer_name: buyerName,
      buyer_phone: buyerPhone,
      sale_type: 'walkin' as const,
      total_amount: totalAmount,
      notes,
      items: items.map(item => ({
        inventory: item.inventoryId,
        quantity: item.quantity,
        price_per_unit: item.price,
      })),
    };

    await onSave(saleData);
    
    // Reset form
    setBuyerName("");
    setBuyerPhone("");
    setNotes("");
    setItems([]);
    setTotalAmount(0);
    setDate(new Date().toISOString().slice(0, 16));
  };

  const inputStyles = "w-full border border-gray-200 bg-gray-50 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all appearance-none";
  const labelStyles = "text-[11px] font-bold text-gray-400 uppercase tracking-wider ml-1 mb-1 block";

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className={labelStyles}>Date & Time</label>
        <input
          type="datetime-local"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className={inputStyles}
          disabled={loading}
        />
      </div>

      <div>
        <label className={labelStyles}>Customer Name</label>
        <input
          placeholder="Enter customer name"
          value={buyerName}
          onChange={(e) => setBuyerName(e.target.value)}
          className={inputStyles}
          disabled={loading}
        />
      </div>

      <div>
        <label className={labelStyles}>Customer Phone</label>
        <input
          placeholder="07..."
          value={buyerPhone}
          onChange={(e) => setBuyerPhone(e.target.value)}
          className={inputStyles}
          disabled={loading}
        />
      </div>

      <div>
        <label className={labelStyles}>Add Items to Sale</label>
        <div className="flex gap-2">
          <div className="flex-1">
            <div className="relative">
              <select
                value={selectedItem}
                onChange={(e) => setSelectedItem(e.target.value)}
                className={`${inputStyles} cursor-pointer`}
                disabled={loading}
              >
                <option value="">Select Item...</option>
                {inventoryItems.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name} - KES {item.price_per_unit}
                  </option>
                ))}
              </select>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                <ChevronDown size={16} />
              </div>
            </div>
          </div>
          <div className="w-24">
            <input
              type="number"
              min="1"
              value={itemQuantity}
              onChange={(e) => setItemQuantity(Number(e.target.value))}
              className={inputStyles}
              disabled={loading}
            />
          </div>
          <button
            type="button"
            onClick={handleAddItem}
            disabled={loading || !selectedItem}
            className="px-4 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:bg-gray-300"
          >
            Add
          </button>
        </div>
      </div>

      {/* Items List */}
      {items.length > 0 && (
        <div className="border rounded-xl p-4">
          <h4 className="text-sm font-semibold mb-2">Items in Sale</h4>
          <div className="space-y-2">
            {items.map((item, index) => (
              <div key={index} className="flex justify-between items-center bg-gray-50 p-2 rounded">
                <div>
                  <p className="font-medium">{item.name}</p>
                  <p className="text-sm text-gray-600">
                    {item.quantity} x KES {item.price}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <p className="font-bold">KES {item.quantity * item.price}</p>
                  <button
                    type="button"
                    onClick={() => handleRemoveItem(index)}
                    className="text-red-600 hover:text-red-800"
                    disabled={loading}
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div>
        <label className={labelStyles}>Notes (Optional)</label>
        <textarea
          placeholder="Additional notes..."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className={inputStyles}
          rows={2}
          disabled={loading}
        />
      </div>

      <div className="pt-4 border-t border-gray-100">
        <div className="flex justify-between items-center mb-4">
          <label className={labelStyles}>Total Amount</label>
          <p className="text-2xl font-bold text-emerald-700">
            KES {totalAmount.toFixed(2)}
          </p>
        </div>
      </div>

      <button
        type="submit"
        disabled={loading || items.length === 0}
        className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition-all mt-4 flex items-center justify-center gap-2 disabled:bg-gray-300 disabled:cursor-not-allowed"
      >
        {loading ? 'Processing...' : 'Record Sale'}
      </button>
    </form>
  );
}