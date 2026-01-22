"use client";

import { useState } from 'react';
import { ShoppingCart, Check } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { toast } from 'react-toastify';

interface AddToCartButtonProps {
  productId: number;
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
  const { addToCart, isLoading } = useCart();
  const [added, setAdded] = useState(false);

  const handleAddToCart = async () => {
    try {
      await addToCart({
        id: productId.toString(),
        name: productName,
        price,
        image_path: imagePath,
        productId,
      });
      
      setAdded(true);
      
      // Reset added state after 2 seconds
      setTimeout(() => setAdded(false), 2000);
    } catch (error) {
      // Error is already handled in context
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
      disabled={isLoading}
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