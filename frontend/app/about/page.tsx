"use client";

import {About} from '@/components/frontpage/About/About';
import {Header} from '@/components/frontpage/Header/Header';
import {Footer} from '@/components/frontpage/Footer/Footer';

export default function Page() {
  return (
    <div className="max-w-7xl mx-auto">
      <Header onCartClick={() => {}} />
      <About />
      <Footer />
    </div>
  );
}
