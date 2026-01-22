'use client';

import React from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';


interface HeroProps {
  onShopClick: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onShopClick }) => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.3,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8 },
    },
  };

  return (
    <section className="relative w-full h-screen overflow-hidden" style={{ background: 'linear-gradient(135deg, #ffffff 0%, #f0fbfd 50%, #e6f7fb 100%)' }}>
      {/* Animated Background Elements */}
      <motion.div
        animate={{ y: [0, -20, 0] }}
        transition={{ duration: 4, repeat: Infinity }}
        className="absolute top-20 right-10 w-72 h-72 rounded-full opacity-20 blur-3xl" style={{ background: 'linear-gradient(135deg, #5fb3cc 0%, #0091AD 100%)' }}
      />
      <motion.div
        animate={{ y: [0, 20, 0] }}
        transition={{ duration: 5, repeat: Infinity }}
        className="absolute bottom-20 left-10 w-96 h-96 rounded-full opacity-15 blur-3xl" style={{ background: 'linear-gradient(135deg, #5fb3cc 0%, #0091AD 100%)' }}
      />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="w-full grid md:grid-cols-2 gap-8 items-center"
        >
          {/* Left Content */}
          <motion.div variants={itemVariants} className="z-10">
            <motion.h1
              className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight"
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              Premium Products For <span className="bg-clip-text text-transparent" style={{ backgroundImage: 'linear-gradient(90deg, #0091AD 0%, #00b8d4 100%)', WebkitBackgroundClip: 'text' }}>Your Family</span>
            </motion.h1>

            <motion.p
              variants={itemVariants}
              className="text-lg text-gray-600 mb-8 leading-relaxed"
            >
              Experience Mams Enterprise&apos;s carefully curated selection of household and personal care products. Premium quality at affordable prices, right here in DCI Juja, Kenya.
            </motion.p>

            <motion.div
              variants={itemVariants}
              className="flex flex-col sm:flex-row gap-4"
            >
              <motion.button
                whileHover={{ scale: 1.05, boxShadow: '0 10px 25px rgba(69, 123, 157, 0.3)' }}
                whileTap={{ scale: 0.95 }}
                onClick={onShopClick}
                className="px-8 py-4 text-white font-bold rounded-lg shadow-lg transition-all" style={{ backgroundColor: '#0091AD' }} onMouseEnter={(e) => e.currentTarget.style.opacity = '0.9'} onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
              >
                Shop Now
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-4 font-bold rounded-lg transition-colors" style={{ borderWidth: '2px', borderColor: '#0091AD', color: '#0091AD' }} onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#e6f7fb'; }} onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
              >
                Learn More
              </motion.button>
            </motion.div>

            {/* Stats */}
            <motion.div
              variants={itemVariants}
              className="grid grid-cols-3 gap-4 mt-12"
            >
              {[
                { label: 'Products', value: '52' },
                { label: 'Categories', value: '10' },
                { label: 'Since', value: '2020' },
              ].map((stat, index) => (
                <div key={index}>
                  <p className="text-2xl font-bold" style={{ color: '#0091AD' }}>{stat.value}</p>
                  <p className="text-sm text-gray-600">{stat.label}</p>
                </div>
              ))}
            </motion.div>
          </motion.div>

          {/* Right Side - Illustration */}
          <motion.div
  variants={itemVariants}
  className="hidden md:block relative h-full"
>
  <motion.div
    animate={{ y: [0, -30, 0] }}
    transition={{ duration: 4, repeat: Infinity }}
    className="relative"
  >
    {/* The Image replacing the gradient div */}
    <Image 
      src="/hero1.png" 
      alt="Description" 
      className="w-full h-80 object-cover rounded-3xl shadow-2xl"
    />
    
    {/* Optional: Keeps the slight dark overlay from your original code */}
    <div className="absolute inset-0 bg-linear-to-t from-gray-900/20 to-transparent rounded-3xl pointer-events-none" />
  </motion.div>
</motion.div>
        </motion.div>
      </div>

      {/* Scroll Indicator */}
      <motion.div
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
      >
        <p className="text-gray-600 text-sm mb-2">Scroll to explore</p>
        <svg
          className="w-6 h-6 mx-auto text-gray-400"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path d="M19 14l-7 7m0 0l-7-7m7 7V3"></path>
        </svg>
      </motion.div>
    </section>
  );
};
