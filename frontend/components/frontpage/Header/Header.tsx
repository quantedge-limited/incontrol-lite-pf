'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ShoppingCart, Menu, X } from 'lucide-react';
import { useCart } from '@/context/CartContext';

interface HeaderProps {
  onCartClick: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onCartClick }) => {
  const { totalItems } = useCart();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
      className="sticky top-0 z-50 bg-white shadow-sm" style={{ borderBottom: '1px solid #d9f0f7' }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="flex items-center gap-2 cursor-pointer"
          >
            <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #0091AD 0%, #006b84 100%)' }}>
              <span className="text-white font-bold text-lg">ME</span>
            </div>
            <div>
              <h1 className="text-xl font-bold bg-clip-text text-transparent" style={{ backgroundImage: 'linear-gradient(90deg, #0091AD 0%, #00b8d4 100%)', WebkitBackgroundClip: 'text', color: 'transparent' }}>Mams Entreprise</h1>
              <p className="text-xs font-medium" style={{ color: '#0091AD' }}>DCI Juja - Premium Products</p>
            </div>
          </motion.div>

          {/* Navigation - Desktop */}
          <nav className="hidden md:flex gap-8 items-center">
            <motion.a
              whileHover={{ color: '#457B9D' }}
              href="/"
              className="text-gray-600 font-medium transition-colors"
            >
              Products
            </motion.a>
            <motion.a
              whileHover={{ color: '#457B9D' }}
              href="/about"
              className="text-gray-600 font-medium transition-colors"
            >
              About
            </motion.a>
            <motion.a
              whileHover={{ color: '#457B9D' }}
              href="/contact"
              className="text-gray-600 font-medium transition-colors"
            >
              Contact
            </motion.a>
          </nav>

          {/* Cart Icon */}
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={onCartClick}
            className="relative p-2 rounded-lg transition-colors" onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f0f7ff'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
          >
            <ShoppingCart size={24} color="#457B9D" />
            {totalItems > 0 && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center"
              >
                {totalItems}
              </motion.span>
            )}
          </motion.button>

          {/* Mobile Menu Button */}
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 rounded-lg transition-colors" onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f0f7ff'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
          >
            {isMenuOpen ? <X size={24} color="#457B9D" /> : <Menu size={24} color="#457B9D" />}
          </motion.button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <motion.nav
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="md:hidden pb-4 flex flex-col gap-4"
          >
            <a href="/" className="font-medium transition-colors" style={{ color: '#0091AD' }} onClick={() => setIsMenuOpen(false)}>
              Products
            </a>
            <a href="/about" className="font-medium transition-colors" style={{ color: '#0091AD' }} onClick={() => setIsMenuOpen(false)}>
              About
            </a>
            <a href="/contact" className="font-medium transition-colors" style={{ color: '#0091AD' }} onClick={() => setIsMenuOpen(false)}>
              Contact
            </a>
          </motion.nav>
        )}
      </div>
    </motion.header>
  );
};
