// components/dashboard/CartSection.tsx
"use client";
import { useState, useEffect, useMemo } from "react";
import { useCartStore } from "@/stores/cart";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";
import { Pagination } from "../cart/CartPagination";
import { CartItemCard } from "../cart/CartItemCard";
import { CartFilters } from "../cart/CartFilters";
import { Card, CardContent, CardTitle } from "@/components/ui/card";

const ITEMS_PER_PAGE = 8;

export function CartSection() {
    const {
        cart,
        artworks,
        isLoading,
        isAdding,
        fetchCart,
        toggleCartItem,
    } = useCartStore();
    const [currentPage, setCurrentPage] = useState(1);
    const [searchQuery, setSearchQuery] = useState("");
    const [sortOption, setSortOption] = useState("a-z");

    useEffect(() => {
        fetchCart();
    }, [fetchCart]);

    // Filter and sort artworks
    const filteredArtworks = useMemo(() => {
        let result = [...artworks];

        // Search filter
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            result = result.filter(
                (artwork) =>
                    artwork.title.toLowerCase().includes(query) ||
                    artwork.artist_price.toString().includes(query)
            );
        }

        // Sorting
        switch (sortOption) {
            case "a-z":
                result.sort((a, b) => a.title.localeCompare(b.title));
                break;
            case "z-a":
                result.sort((a, b) => b.title.localeCompare(a.title));
                break;
            case "price-high":
                result.sort((a, b) => b.artist_price - a.artist_price);
                break;
            case "price-low":
                result.sort((a, b) => a.artist_price - b.artist_price);
                break;
            default:
                break;
        }

        return result;
    }, [artworks, searchQuery, sortOption]);

    const totalPages = Math.ceil(filteredArtworks.length / ITEMS_PER_PAGE);
    const paginatedArtworks = filteredArtworks.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    );

    // Reset to first page when filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery, sortOption]);

    const clearFilters = () => {
        setSearchQuery("");
        setSortOption("a-z");
    };

    if (isLoading) {
        return <CartSkeleton />;
    }

    if (artworks.length === 0) {
        return <EmptyCart />;
    }

    return (
        <div className="space-y-6">
            <CartFilters
                searchQuery={searchQuery}
                sortOption={sortOption}
                onSearchChange={setSearchQuery}
                onSortChange={setSortOption}
            />
            <Card>
                <CardContent >
                    <div className="flex justify-between items-center mb-4">
                        <CardTitle className="text-lg font-semibold">
                            Your Cart
                        </CardTitle>
                        <div className="text-gray-500">
                            {filteredArtworks.length} {filteredArtworks.length === 1 ? "item" : "items"}
                        </div>
                    </div>

                    {filteredArtworks.length === 0 ? (
                        <div className="text-center py-8">
                            <p>No artworks match your filters</p>
                            <Button
                                variant="ghost"
                                className="mt-2"
                                onClick={clearFilters}
                            >
                                Clear filters
                            </Button>
                        </div>
                    ) : (
                        <>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                                {paginatedArtworks.map((artwork) => (
                                    <CartItemCard
                                        key={artwork.id}
                                        artwork={artwork}
                                        onRemove={() => toggleCartItem(artwork.id)}
                                        isRemoving={isAdding && cart.includes(artwork.id)}
                                    />
                                ))}
                            </div>

                            {totalPages > 1 && (
                                <Pagination
                                    currentPage={currentPage}
                                    totalPages={totalPages}
                                    onPageChange={setCurrentPage}
                                />
                            )}
                        </>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}

function EmptyCart() {
    return (
        <div className="flex flex-col items-center justify-center h-[60vh] text-center">
            <div className="max-w-md space-y-4">
                <h2 className="text-2xl font-bold">Your cart is empty</h2>
                <p className="text-gray-500">
                    Looks like you have not added any artworks to your cart yet.
                </p>
                <Link href="/">
                    <Button className="mt-4">Browse Artworks</Button>
                </Link>
            </div>
        </div>
    );
}

function CartSkeleton() {
    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <Skeleton className="h-8 w-48" />
                <Skeleton className="h-6 w-20" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {[...Array(4)].map((_, i) => (
                    <div key={i} className="space-y-3">
                        <Skeleton className="aspect-square w-full rounded-lg" />
                        <Skeleton className="h-5 w-3/4" />
                        <Skeleton className="h-4 w-1/2" />
                        <Skeleton className="h-5 w-1/3" />
                    </div>
                ))}
            </div>
        </div>
    );
}