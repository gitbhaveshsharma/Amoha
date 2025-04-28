// components/bids/BidCard.tsx
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/Button";
import { Edit, X } from "lucide-react";
import Image from "next/image";
import { ImageIcon } from "lucide-react";
import { Bid, Artwork } from "@/types";
import { Skeleton } from "@/components/ui/skeleton";

const statusColors = {
    pending: "bg-yellow-100 text-yellow-800 hover:bg-yellow-200",
    accepted: "bg-green-100 text-green-800 hover:bg-green-200",
    rejected: "bg-red-100 text-red-800 hover:bg-red-200",
    cancelled: "bg-gray-100 text-gray-800 hover:bg-gray-200",
};

export function BidCard({
    bid,
    artwork,
    onEdit,
    onCancel,
    isLoading = false,
}: {
    bid: Bid;
    artwork?: Artwork;
    onEdit: () => void;
    onCancel: () => void;
    isLoading?: boolean;
}) {
    if (isLoading) {
        return <BidCardSkeleton />;
    }

    return (
        <Card className="hover:shadow-lg transition-shadow overflow-hidden rounded-xl shadow-sm">
            <div className="flex flex-col sm:flex-row">
                {/* Image Section */}
                <div className="w-full sm:w-64 h-64 bg-gray-100 relative flex-shrink-0 ml-2 my-2 rounded-lg overflow-hidden shadow-md">
                    {artwork?.image_url ? (
                        <Image
                            src={artwork.image_url}
                            alt={artwork.title}
                            fill
                            className="object-cover"
                            sizes="(max-width: 640px) 100vw, 384px"
                            priority
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400 rounded-l-lg bg-gradient-to-br from-gray-50 to-gray-100">
                            <ImageIcon className="h-16 w-16 text-gray-300" />
                        </div>
                    )}
                </div>

                {/* Details Section */}
                <div className="flex-1 flex flex-col">
                    {/* Header with title and actions */}
                    <div className="flex justify-between items-start p-4 pb-2 border-b">
                        <div className="space-y-1 max-w-[80%]">
                            <CardTitle className="text-xl font-semibold line-clamp-1">
                                {artwork?.title || "Artwork Not Found"}
                            </CardTitle>
                            <div className="flex items-center gap-2 flex-wrap">
                                <Badge
                                    className={`${statusColors[bid.status]} cursor-default rounded-full`}
                                    variant="outline"
                                >
                                    {bid.status.charAt(0).toUpperCase() + bid.status.slice(1)}
                                </Badge>
                                <span className="text-sm text-muted-foreground">
                                    Placed on {new Date(bid.created_at).toLocaleDateString()}
                                </span>
                            </div>
                        </div>
                        <div className="flex space-x-1">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={onEdit}
                                className="h-8 w-8 p-0 rounded-full hover:bg-gray-100"
                                aria-label="Edit bid"
                            >
                                <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={onCancel}
                                className="h-8 w-8 p-0 rounded-full text-red-600 hover:text-red-700 hover:bg-red-50"
                                aria-label="Cancel bid"
                            >
                                <X className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>

                    {/* Main content */}
                    <CardContent className="p-4 space-y-4">
                        {/* Price information */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-1 p-3 bg-gray-50 rounded-lg border border-gray-100">
                                <p className="text-sm font-medium text-gray-500">Your Bid</p>
                                <p className="text-2xl font-bold">
                                    ${bid.amount.toLocaleString()}
                                    {bid.is_auto_bid && (
                                        <span className="text-sm font-normal text-muted-foreground block mt-1">
                                            Auto-bid up to ${bid.max_auto_bid?.toLocaleString()}
                                        </span>
                                    )}
                                </p>
                            </div>
                            {artwork?.artist_price && (
                                <div className="space-y-1 p-3 bg-gray-50 rounded-lg border border-gray-100">
                                    <p className="text-sm font-medium text-gray-500">Artist Price</p>
                                    <p className="text-2xl">${artwork.artist_price.toLocaleString()}</p>
                                </div>
                            )}
                        </div>

                        {/* Artwork details */}
                        {artwork && (
                            <div className="space-y-3">
                                {artwork.description && (
                                    <div className="space-y-1">
                                        <p className="text-sm font-medium text-gray-700">Description</p>
                                        <p className="text-sm text-gray-600 line-clamp-3">
                                            {artwork.description}
                                        </p>
                                    </div>
                                )}

                                <div className="space-y-1">
                                    <p className="text-sm font-medium text-gray-700">Details</p>
                                    <div className="flex flex-wrap gap-2">
                                        {artwork.medium && (
                                            <Badge variant="secondary" className="text-xs font-normal rounded-full">
                                                {artwork.medium}
                                            </Badge>
                                        )}
                                        {artwork.art_category && (
                                            <Badge variant="secondary" className="text-xs font-normal rounded-full">
                                                {artwork.art_category}
                                            </Badge>
                                        )}
                                        {artwork.dimensions && (
                                            <Badge variant="secondary" className="text-xs font-normal rounded-full">
                                                {artwork.dimensions}
                                            </Badge>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Bid message */}
                        {bid.message && (
                            <div className="space-y-1 p-3 bg-blue-50 rounded-lg border border-blue-100">
                                <p className="text-sm font-medium text-blue-700">Your Note</p>
                                <p className="text-sm text-blue-600">{bid.message}</p>
                            </div>
                        )}
                    </CardContent>
                </div>
            </div>
        </Card>
    );
}

function BidCardSkeleton() {
    return (
        <Card className="overflow-hidden rounded-xl shadow-sm border-gray-100">
            <div className="flex flex-col sm:flex-row">
                {/* Image Skeleton */}
                <div className="w-full sm:w-64 h-64 relative flex-shrink-0 ml-2 my-2 rounded-l-lg overflow-hidden">
                    <Skeleton className="w-full h-full bg-gray-200" />
                </div>

                {/* Content Skeleton */}
                <div className="flex-1 flex flex-col p-4 space-y-4">
                    <div className="flex justify-between items-start">
                        <div className="space-y-2">
                            <Skeleton className="h-6 w-48 bg-gray-200 rounded" />
                            <div className="flex gap-2">
                                <Skeleton className="h-5 w-20 bg-gray-200 rounded-full" />
                                <Skeleton className="h-5 w-24 bg-gray-200 rounded" />
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <Skeleton className="h-8 w-8 bg-gray-200 rounded-full" />
                            <Skeleton className="h-8 w-8 bg-gray-200 rounded-full" />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2 p-3 bg-gray-50 rounded-lg">
                            <Skeleton className="h-4 w-24 bg-gray-200 rounded" />
                            <Skeleton className="h-8 w-32 bg-gray-200 rounded" />
                        </div>
                        <div className="space-y-2 p-3 bg-gray-50 rounded-lg">
                            <Skeleton className="h-4 w-24 bg-gray-200 rounded" />
                            <Skeleton className="h-8 w-32 bg-gray-200 rounded" />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Skeleton className="h-4 w-24 bg-gray-200 rounded" />
                        <Skeleton className="h-12 w-full bg-gray-200 rounded" />
                    </div>

                    <div className="space-y-2">
                        <Skeleton className="h-4 w-24 bg-gray-200 rounded" />
                        <div className="flex gap-2">
                            <Skeleton className="h-5 w-16 bg-gray-200 rounded-full" />
                            <Skeleton className="h-5 w-16 bg-gray-200 rounded-full" />
                            <Skeleton className="h-5 w-16 bg-gray-200 rounded-full" />
                        </div>
                    </div>
                </div>
            </div>
        </Card>
    );
}