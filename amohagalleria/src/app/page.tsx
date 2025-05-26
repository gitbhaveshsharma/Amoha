import React from 'react';
import Navbar from '@/components/layout/Navbar';
// import HeroImage from '@/components/sections/HeroSection';
import HomePage from '@/components/home/pages';


export default function Home() {
  return (
    <div>
      <Navbar />
      <main>
        {/* <HeroImage /> */}
        <HomePage />
      </main>
    </div>
  );
}
