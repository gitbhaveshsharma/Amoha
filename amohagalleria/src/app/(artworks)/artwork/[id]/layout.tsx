import React from "react";

export default function ArtworkLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="artwork-layout">

            {children}
        </div>
    );
}