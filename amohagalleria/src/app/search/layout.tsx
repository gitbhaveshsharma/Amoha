import React, { ReactNode } from 'react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { Metadata } from 'next';


export const metadata: Metadata = {
    title: 'Search | AMOHA Galleria',
    description: 'Search artworks, artists, and categories on AMOHA Galleria',
    keywords: ['search', 'artworks', 'artists', 'categories', 'AMOHA'],
    openGraph: {
        title: 'Search | AMOHA Galleria',
        description: 'Search artworks, artists, and categories on AMOHA Galleria',
        type: 'website',
    },
};

interface SearchLayoutProps {
    children: ReactNode;
}

const SearchLayout: React.FC<SearchLayoutProps> = ({ children }) => {
    return (
        <div >
            <Navbar />
            <main className="flex-1 mt-24">
                {children}
            </main>
            <Footer />
        </div>
    );
};

export default SearchLayout;