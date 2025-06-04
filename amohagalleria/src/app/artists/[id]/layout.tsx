
import React from 'react'
import { Metadata } from 'next'

export const metadata: Metadata = {
    title: {
        template: '%s | Amoha Galleria Artists',
        default: 'Artists | Amoha Galleria'
    },
    description: 'Discover talented artists in the Amoha Galleria community. Browse artist profiles, view their artworks, and connect with creative professionals.',
    keywords: ['artists', 'art community', 'creative professionals', 'artist profiles', 'amoha galleria'],
    openGraph: {
        title: 'Artists | Amoha Galleria',
        description: 'Discover talented artists in the Amoha Galleria community',
        type: 'website',
        siteName: 'Amoha Galleria'
    }
}

interface ArtistLayoutProps {
    children: React.ReactNode
}


export default function ArtistLayout({ children }: ArtistLayoutProps) {
    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header Section */}

            {/* Main Content */}
            <main className="flex-1 mt-24">
                {children}
            </main>
        </div>
    )
}
