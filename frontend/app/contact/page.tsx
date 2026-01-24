"use client";

import {Contact} from '@/components/frontpage/Contact/Contact';
import { Header } from '@/components/frontpage/Header/Header';
import {Footer} from '@/components/frontpage/Footer/Footer';

export default function Page() {
  return (
    <>
      <Header onCartClick={() => {}} />
      <Contact />
      <Footer />
    </>
  );
}
