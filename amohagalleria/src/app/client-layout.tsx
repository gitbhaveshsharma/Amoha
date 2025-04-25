"use client";
import { Geist, Geist_Mono } from "next/font/google";
import { OfferProvider } from "@/context/offer-context";
import { NotificationPrompt } from '@/components/NotificationPrompt';
import { useEffect } from "react";
import "../styles/globals.css";

const geistSans = Geist({
    variable: "--font-geist-sans",
    subsets: ["latin"],
});

const geistMono = Geist_Mono({
    variable: "--font-geist-mono",
    subsets: ["latin"],
});

export default function ClientLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    useEffect(() => {
        if ("serviceWorker" in navigator) {
            navigator.serviceWorker
                .register("/sw.js", { scope: "/" })
                .then((registration) => {
                    console.log("Service Worker registered with scope:", registration.scope);
                })
                .catch((error) => {
                    console.error("Service Worker registration failed:", error);
                });
        }
    }, []);

    return (
        <html lang="en">
            <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
                <NotificationPrompt />
                <OfferProvider>
                    <div className="flex flex-col min-h-screen">
                        <main className="flex-grow">{children}</main>
                    </div>
                </OfferProvider>
            </body>
        </html>
    );
}