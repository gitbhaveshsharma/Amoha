import React from 'react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

import { Metadata } from 'next';
export const metadata: Metadata = {
    title: 'Cart | AMOHA Galleria',
    description: 'Your shopping cart - review and manage your selected artworks',
    keywords: ['cart', 'shopping cart', 'art collection', 'AMOHA'],
    openGraph: {
        title: 'Cart | AMOHA Galleria',
        description: 'Your shopping cart - review and manage your selected artworks',
        type: 'website',
    },
};

export default function CartLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="cart-layout bg-gray-50">
            <Navbar />
            <main className="mt-24 flex-1">
                {children}
            </main>
            <Footer />
        </div>
    );
}
