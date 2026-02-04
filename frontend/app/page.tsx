// app/page.tsx
"use client";

import { useState } from 'react';
import { Hero } from '@/components/frontpage/Hero/Hero';
import { ProductsList } from '@/components/frontpage/Product/ProductsList';
import { CartSidebar } from '@/components/frontpage/Cart/CartSidebar';
import { Header } from '@/components/frontpage/Header/Header';
import { Footer } from '@/components/frontpage/Footer/Footer';
import { useRouter } from 'next/navigation';
import { useCart } from '@/context/cart/CartContext';

export default function Home() {
  const [isCartOpen, setIsCartOpen] = useState(false);
  const router = useRouter();
  const { addItem } = useCart();

  const handleShopClick = () => {
    router.push('/shop');
  };

  const handleCartClick = () => {
    setIsCartOpen(true);
  };

  const handleAddToCart = async (product: any) => {
    try {
      // Use CartContext to add item with product details
      await addItem(product.id, 1, {
        name: product.name,
        price: product.price,
        image: product.image
      });

      // Open cart sidebar
      setIsCartOpen(true);
    } catch (error) {
      console.error('Failed to add to cart:', error);
    }
  };

  const handleCheckout = () => {
    router.push('/checkout');
  };

  return (
    <>
      <main className="min-h-screen">
        <Header onCartClick={handleCartClick} />
        <Hero onShopClick={handleShopClick} />
        <ProductsList onAddToCart={handleAddToCart} />
        <CartSidebar
          isOpen={isCartOpen}
          onClose={() => setIsCartOpen(false)}
          onCheckout={handleCheckout}
        />
      </main>
      <Footer />
    </>
  );
}