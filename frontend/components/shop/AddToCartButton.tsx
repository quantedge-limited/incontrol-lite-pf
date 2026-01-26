"use client";

import { useState } from 'react';
import { ShoppingCart, Check } from 'lucide-react';
import { useCart } from '@/context/cart/CartContext';

interface AddToCartButtonProps {
  productId: number; // This should be inventoryId based on your context
  productName: string;
  price: number;
  imagePath?: string | null;
  className?: string;
  showLabel?: boolean;
}

export default function AddToCartButton({
  productId,
  productName,
  price,
  imagePath = null,
  className = '',
  showLabel = true,
}: AddToCartButtonProps) {
  const { addItem, loading } = useCart(); // Changed from addToCart to addItem, isLoading to loading
  const [added, setAdded] = useState(false);

  const handleAddToCart = async () => {
    try {
      // Use addItem from context with inventoryId
      await addItem(productId, 1); // Default quantity to 1
      
      setAdded(true);
      
      // Reset added state after 2 seconds
      setTimeout(() => setAdded(false), 2000);
    } catch (error) {
      // Error is already handled in context
      console.error('Failed to add to cart:', error);
    }
  };

  const buttonClasses = `
    flex items-center justify-center gap-2
    ${added 
      ? 'bg-emerald-600 hover:bg-emerald-700' 
      : 'bg-blue-600 hover:bg-blue-700'
    }
    text-white font-medium py-2 px-4 rounded-lg
    transition-all duration-200
    disabled:opacity-50 disabled:cursor-not-allowed
    ${className}
  `;

  return (
    <button
      onClick={handleAddToCart}
      disabled={loading}
      className={buttonClasses}
    >
      {added ? (
        <>
          <Check size={18} />
          {showLabel && <span>Added!</span>}
        </>
      ) : (
        <>
          <ShoppingCart size={18} />
          {showLabel && <span>Add to Cart</span>}
        </>
      )}
    </button>
  );
}