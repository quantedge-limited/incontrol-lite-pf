// components/frontpage/Header/Header.tsx
'use client';

import React, { useState } from 'react';
import { Menu, X, ShoppingCart } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import Link from 'next/link';


interface HeaderProps {
  onCartClick: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onCartClick }) => {
  const { items } = useCart();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  // Calculate total items from cart
  const totalItems = items.reduce((total, item) => total + item.quantity, 0);

  return (
    <header className="sticky top-0 z-30 w-full bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <h1 className="text-2xl font-bold" style={{ color: '#0091AD' }}>
              Mams Entreprise
            </h1>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <a href="#" className="text-gray-700 hover:text-[#0091AD] font-medium">Home</a>
            <a href="#products" className="text-gray-700 hover:text-[#0091AD] font-medium">Products</a>
            <a href="#" className="text-gray-700 hover:text-[#0091AD] font-medium">About</a>
            <a href="#" className="text-gray-700 hover:text-[#0091AD] font-medium">Contact</a>
          </nav>

          {/* Cart Button */}
          <div className="flex items-center space-x-4">
            <button
              onClick={onCartClick}
              className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors"
              aria-label="Shopping cart"
            >
              <ShoppingCart size={24} className="text-gray-700" />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                  {totalItems > 9 ? '9+' : totalItems}
                </span>
              )}
            </button>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 hover:bg-gray-100 rounded-lg"
              aria-label="Toggle menu"
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-gray-200 py-4">
            <div className="flex flex-col space-y-3">
              <a href="#" className="text-gray-700 hover:text-[#0091AD] font-medium px-4 py-2">Home</a>
              <a href="#products" className="text-gray-700 hover:text-[#0091AD] font-medium px-4 py-2">Products</a>
              <a href="#" className="text-gray-700 hover:text-[#0091AD] font-medium px-4 py-2">About</a>
              <a href="#" className="text-gray-700 hover:text-[#0091AD] font-medium px-4 py-2">Contact</a>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};