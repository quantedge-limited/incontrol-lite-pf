"use client";

import {Contact} from '@/components/frontpage/Contact/Contact';
import {Header} from '@/components/frontpage/Header/Header';
import {Footer} from '@/components/frontpage/Footer/Footer';

export default function Page() {
  return (
    <div className="max-w-7xl mx-auto">
      <Header onCartClick={() => {}} />
      <Contact />
      <Footer />
    </div>
  );
}
