import React from 'react';
import Navbar from '@/components/layout/Navbar';
// import HeroImage from '@/components/sections/HeroSection';
import HomePage from '@/components/home/pages';
import { RecentViewedArtworks } from '@/components/RecentViewsArtwork';


export default function Home() {
  return (
    <div>
      <Navbar />
      <main>
        {/* <HeroImage /> */}
        <RecentViewedArtworks />
        <HomePage />
      </main>
    </div>
  );
}
