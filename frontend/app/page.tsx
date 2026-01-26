// app/page.tsx - FIXED
"use client";

import { useState } from 'react';
import { Hero } from '@/components/frontpage/Hero/Hero';
import { ProductsList } from '@/components/frontpage/Product/ProductsList';
import { CartSidebar } from '@/components/frontpage/Cart/CartSidebar';
import { Footer } from '@/components/frontpage/Footer/Footer';
import { useRouter } from 'next/navigation';

export default function Home() {
  const [isCartOpen, setIsCartOpen] = useState(false);
  const router = useRouter();

  const handleShopClick = () => {
    router.push('/shop');
  };

  const handleAddToCart = (product: any) => {
    console.log('Product added to cart:', product);
    // You can implement actual cart logic here
    // For example: addToCart(product.id, 1);
    // setIsCartOpen(true); // Open cart sidebar
  };

  const handleCheckout = () => {
    router.push('/checkout'); // Redirect to checkout page
  };

  return (
    <>
      <main className="min-h-screen">
        <Hero onShopClick={handleShopClick} />
        <ProductsList onAddToCart={handleAddToCart} />
        <CartSidebar 
          isOpen={isCartOpen}
          onClose={() => setIsCartOpen(false)}
          onCheckout={handleCheckout} // Add this prop
        />
      </main>
      <Footer />
    </>
  );
}