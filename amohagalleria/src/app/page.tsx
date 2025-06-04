import React from 'react';
import Navbar from '@/components/layout/Navbar';
// import HeroImage from '@/components/sections/HeroSection';
import HomePage from '@/components/home/pages';


export default function Home() {
  return (
    <div>
      <Navbar />
      <main className="mt-24">
        {/* <HeroImage /> */}
        <HomePage />
      </main>
    </div>
  );
}
