import React from "react";
import Navbar from "@/components/layout/Navbar";
import { EngagementProvider } from '@/context/EngagementContext';
import Footer from "@/components/layout/Footer";


export default function ArtworkLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="artwork-layout mt-24">
            <Navbar />
            {/* Main content container with fixed width */}
            <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
                <EngagementProvider>
                    {children}
                </EngagementProvider>
            </div>

            {/* Add any additional layout components here, such as a sidebar or footer */}
            <Footer />

        </div>
    );
}