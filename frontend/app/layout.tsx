// app/layout.tsx
"use client";

import { Inter } from 'next/font/google';
import './globals.css';
import { CartProvider } from '@/context/cart/CartContext';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Header } from '@/components/frontpage/Header/Header';

const inter = Inter({ subsets: ['latin'] });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <CartProvider>
          <ToastContainer position="top-right" autoClose={3000} />
          <Header />
          <main>{children}</main>
        </CartProvider>
      </body>
    </html>
  );
}