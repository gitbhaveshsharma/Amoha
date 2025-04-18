import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { OfferProvider } from "@/context/offer-context";
// import { CartProvider } from "@/context/cart-context";
// import { WishlistProvider } from "@/context/WishlistContext";
import "../styles/globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Create Next App",
  description: "Generated by create next app",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {/* <CartProvider> */}
        <OfferProvider>
          {/* <WishlistProvider> */}
          <div className="flex flex-col min-h-screen">
            <main className="flex-grow">{children}</main>
          </div>
          {/* </WishlistProvider> */}
        </OfferProvider>
        {/* </CartProvider> */}
      </body>
    </html>
  );
}
