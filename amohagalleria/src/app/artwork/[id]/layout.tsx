import React from "react";
import Navbar from "@/components/layout/Navbar";

export default function ArtworkLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="artwork-layout">
            <Navbar />
            {/* Main content container with fixed width */}
            <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
                {children}
            </div>

            {/* Add any additional layout components here, such as a sidebar or footer */}
        </div>
    );
}