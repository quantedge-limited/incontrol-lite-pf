'use client';

import { useState } from 'react';
import { Header } from '@/components/frontpage/Header/Header';
import { Hero } from '@/components/frontpage/Hero/Hero';
import { ProductsList } from '@/components/frontpage/Product/ProductsList';
import { CartSidebar } from '@/components/frontpage/Cart/CartSidebar';
import { CheckoutModal } from '@/components/frontpage/Checkout/CheckoutModal';
import { Footer } from '@/components/frontpage/Footer/Footer';

export default function Home() {
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

  const handleCheckout = () => {
    setIsCartOpen(false);
    setIsCheckoutOpen(true);
  };

  return (
    <main className="bg-white">
      <Header onCartClick={() => setIsCartOpen(true)} />
      <Hero onShopClick={() => {
        const productsSection = document.getElementById('products');
        productsSection?.scrollIntoView({ behavior: 'smooth' });
      }} />
      <ProductsList />
      <CartSidebar
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        onCheckout={handleCheckout}
      />
      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
      />
      <Footer />
    </main>
  );
}
