// app/favorites/layout.tsx
import { Metadata } from 'next';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

export const metadata: Metadata = {
    title: 'My Favorites | AMOHA Galleria',
    description: 'Your favorite artworks collection - discover and manage your wishlist',
    keywords: ['favorites', 'wishlist', 'art collection', 'saved artworks', 'AMOHA'],
    openGraph: {
        title: 'My Favorites | AMOHA Galleria',
        description: 'Your favorite artworks collection - discover and manage your wishlist',
        type: 'website',
    },
};

interface FavoritesLayoutProps {
    children: React.ReactNode;
}

export default function FavoritesLayout({ children }: FavoritesLayoutProps) {
    return (
        <div className="min-h-screen bg-gray-50">
            {/* Page Container */}
            <div className="">
                {/* Header Section */}
                <Navbar />

                {/* Main Content */}
                <main className="flex-1 mt-24">
                    {children}
                </main>

                {/* Footer Section */}
                <div className="bg-white border-t mt-12">
                    <div className="px-4 py-6 sm:px-6 lg:px-8">
                        <div className="text-center">
                            <p className="text-sm text-gray-500">
                                Explore more artworks and discover new favorites
                            </p>
                            <div className="mt-4 flex justify-center space-x-4">
                                <a
                                    href="/artworks"
                                    className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                                >
                                    Browse Artworks
                                </a>
                                <a
                                    href="/artists"
                                    className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                                >
                                    Discover Artists
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            {/* Footer */}
            <Footer />
        </div>
    );
}
