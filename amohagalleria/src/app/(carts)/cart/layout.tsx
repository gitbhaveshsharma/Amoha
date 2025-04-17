// app/cart/layout.tsx
import { CartProvider } from "@/context/cart-context";

export default function CartLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <CartProvider>
            {children}
        </CartProvider>
    );
}