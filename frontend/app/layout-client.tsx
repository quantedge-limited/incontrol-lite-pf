'use client';

import { useState } from 'react';
import { Header } from "@/components/frontpage/Header/Header";
import { Footer } from "@/components/frontpage/Footer/Footer";

export default function LayoutClient({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isCartOpen, setIsCartOpen] = useState(false);

  return (
    <>
      <Header onCartClick={() => setIsCartOpen(true)} />
      {children}
      <Footer />
    </>
  );
}
