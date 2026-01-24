// app/page.tsx
"use client";

import { useState } from 'react';
import { Hero } from '@/components/frontpage/Hero/Hero';
import { ProductsList } from '@/components/frontpage/Product/ProductsList';
import { CartSidebar } from '@/components/frontpage/Cart/CartSidebar';
import { Footer } from '@/components/frontpage/Footer/Footer';

export default function Home() {
  const [isCartOpen, setIsCartOpen] = useState(false);

  return (
    <>
      {/* REMOVED: <Header onCartClick={() => setIsCartOpen(true)} /> */}
      <main className="min-h-screen">
        <Hero />
        <ProductsList 
          onAddToCart={(product) => {
            // Handle add to cart logic
            console.log('Added to cart:', product);
          }}
        />
        <CartSidebar 
          isOpen={isCartOpen}
          onClose={() => setIsCartOpen(false)}
          cart={[]} // Pass actual cart from context if needed
        />
      </main>
      <Footer />
    </>
  );
}