// app/cart/page.tsx
"use client";

import { useCart } from "@/context/cart-context";
import { Button } from "@/components/ui/Button";
import Image from "next/image";
import { Trash2, ArrowLeft } from "lucide-react";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { toast } from "react-toastify";

export default function CartPage() {
    const {
        cart,
        removeFromCart,
        updateQuantity,
        clearCart,
        cartCount,
        isLoading
    } = useCart();

    const totalPrice = cart.reduce(
        (sum, item) => sum + (item.artwork.artist_price * item.quantity),
        0
    );

    const handleCheckout = () => {
        toast.success("Proceeding to checkout");
        // Add your checkout logic here
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (cartCount === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-96 gap-4">
                <h2 className="text-2xl font-semibold">Your cart is empty</h2>
                <p className="text-muted-foreground">
                    Browse our collection to find amazing artworks
                </p>
                <Button asChild>
                    <Link href="/">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Continue Shopping
                    </Link>
                </Button>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex flex-col md:flex-row justify-between gap-8">
                {/* Cart Items */}
                <div className="flex-1">
                    <div className="flex justify-between items-center mb-6">
                        <h1 className="text-2xl font-bold">Your Cart ({cartCount})</h1>
                        <Button
                            variant="ghost"
                            onClick={clearCart}
                            className="text-destructive"
                        >
                            Clear Cart
                        </Button>
                    </div>

                    <div className="space-y-6">
                        {cart.map((item) => (
                            <div key={item.id} className="flex gap-4 border-b pb-6">
                                <div className="relative w-24 h-24 flex-shrink-0">
                                    <Image
                                        src={item.artwork.image_url}
                                        alt={item.artwork.title}
                                        fill
                                        className="object-cover rounded"
                                    />
                                </div>
                                <div className="flex-1">
                                    <h3 className="font-medium">{item.artwork.title}</h3>
                                    <p className="text-muted-foreground text-sm">
                                        ${item.artwork.artist_price.toFixed(2)}
                                    </p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Input
                                        type="number"
                                        min="1"
                                        value={item.quantity}
                                        onChange={(e) => {
                                            const newQuantity = parseInt(e.target.value);
                                            if (!isNaN(newQuantity)) {
                                                updateQuantity(item.artwork.id, newQuantity);
                                            }
                                        }}
                                        className="w-20"
                                    />
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => removeFromCart(item.artwork.id)}
                                        aria-label="Remove item"
                                    >
                                        <Trash2 className="h-5 w-5 text-destructive" />
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Order Summary */}
                <div className="md:w-80 lg:w-96 space-y-6">
                    <div className="bg-card border rounded-lg p-6">
                        <h2 className="text-lg font-semibold mb-4">Order Summary</h2>

                        <div className="space-y-3">
                            <div className="flex justify-between">
                                <span>Subtotal</span>
                                <span>${totalPrice.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Shipping</span>
                                <span className="text-muted-foreground">Calculated at checkout</span>
                            </div>
                            <div className="border-t pt-3 flex justify-between font-medium">
                                <span>Total</span>
                                <span>${totalPrice.toFixed(2)}</span>
                            </div>
                        </div>

                        <Button
                            className="w-full mt-6"
                            size="lg"
                            onClick={handleCheckout}
                        >
                            Proceed to Checkout
                        </Button>

                        <div className="mt-4 text-sm text-muted-foreground">
                            <p>or</p>
                            <Link href="/" className="text-primary underline">
                                Continue Shopping
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}