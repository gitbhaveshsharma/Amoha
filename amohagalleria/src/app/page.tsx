import React from 'react';
import Navbar from '@/components/layout/Navbar';
import HeroImage from '@/components/sections/HeroSection';


export default function Home() {
  return (
    <div>
      <Navbar />
      <main>
        <HeroImage />
      </main>
    </div>
  );
}
