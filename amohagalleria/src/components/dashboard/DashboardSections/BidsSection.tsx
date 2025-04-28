import { useState, useEffect, useMemo } from "react";
import { useBidStore } from "@/stores/bid/bidStore";
import { useSession } from "@/hooks/useSession";
import { toast } from "react-toastify";
import { Bid } from "@/types";
import { BidFilters } from "../bid/BidFilters";
import { BidCard } from "../bid/BidCard";
import { BidWithdrawalModal } from "../bid/BidWithdrawalModal";
import { EditBidDialog } from "../bid/EditBidDialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/Button";

export function BidsSection() {
    const { session } = useSession();
    const {
        bids,
        error: bidsError,
        artworks,
        fetchBids,
        fetchArtworksForBids,
        updateBid,
        cancelBid,
        clearArtworks
    } = useBidStore();

    const [withdrawingBidId, setWithdrawingBidId] = useState<string | null>(null);
    const [isWithdrawalModalOpen, setIsWithdrawalModalOpen] = useState(false);
    const [isInitialLoad, setIsInitialLoad] = useState(true);
    const [isFetchingArtworks, setIsFetchingArtworks] = useState(false);

    // State for editing bids
    const [editingBid, setEditingBid] = useState<Bid | null>(null);
    const [editForm, setEditForm] = useState<{
        amount: number;
        message: string;
        is_auto_bid: boolean;
        max_auto_bid?: number;
    }>({
        amount: 0,
        message: "",
        is_auto_bid: false,
        max_auto_bid: 0,
    });

    // State for filters
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState<string>("all");
    const [sortOption, setSortOption] = useState<string>("newest");

    // Fetch all data when component mounts or user changes
    useEffect(() => {
        const fetchAllData = async () => {
            if (!session?.user?.id) return;

            try {
                setIsInitialLoad(true);
                await fetchBids(session.user.id);

                if (bids.length > 0) {
                    setIsFetchingArtworks(true);
                    await fetchArtworksForBids();
                }
            } catch (error) {
                console.error("Error fetching data:", error);
                toast.error("Failed to load bids data");
            } finally {
                setIsInitialLoad(false);
                setIsFetchingArtworks(false);
            }
        };

        fetchAllData();
        return () => clearArtworks();
    }, [session?.user?.id, fetchBids, fetchArtworksForBids, clearArtworks]);

    // Filter and sort bids
    const filteredBids = useMemo(() => {
        return bids
            .filter((bid) => {
                const matchesStatus = statusFilter === "all" || bid.status === statusFilter;
                const matchesSearch =
                    searchTerm === "" ||
                    bid.artwork_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    bid.message?.toLowerCase().includes(searchTerm.toLowerCase());
                return matchesStatus && matchesSearch;
            })
            .sort((a, b) => {
                if (sortOption === "newest") return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
                if (sortOption === "oldest") return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
                if (sortOption === "highest") return b.amount - a.amount;
                if (sortOption === "lowest") return a.amount - b.amount;
                return 0;
            });
    }, [bids, searchTerm, statusFilter, sortOption]);

    // Helper function to get artwork for a bid
    const getArtworkForBid = (bid: Bid) => {
        return artworks.find(artwork => artwork.id === bid.artwork_id);
    };

    const handleEditClick = async (bid: Bid) => {
        setEditingBid(bid);
        setEditForm({
            amount: bid.amount,
            message: bid.message || "",
            is_auto_bid: bid.is_auto_bid,
            max_auto_bid: bid.max_auto_bid || bid.amount,
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingBid) return;
        try {
            await updateBid(editingBid.id, {
                amount: editForm.amount,
                message: editForm.message || null,
                is_auto_bid: editForm.is_auto_bid,
                max_auto_bid: editForm.is_auto_bid ? editForm.max_auto_bid : null,
            });
            toast.success("Bid updated successfully!");
            setEditingBid(null);
        } catch {
            toast.error("Failed to update bid");
        }
    };

    const handleStartWithdrawal = (bidId: string) => {
        setWithdrawingBidId(bidId);
        setIsWithdrawalModalOpen(true);
    };

    const handleConfirmWithdrawal = async (withdrawalReason: string) => {
        if (!withdrawingBidId) return;

        try {
            await cancelBid(withdrawingBidId, withdrawalReason);
            toast.success("Bid withdrawn successfully!");
            setWithdrawingBidId(null);
            setIsWithdrawalModalOpen(false);
        } catch (error) {
            console.error('Withdrawal error:', error);
            const errorMessage = error instanceof Error ? error.message : "Failed to withdraw bid";
            toast.error(errorMessage);
        }
    };

    // Show loading state until all data is loaded
    if (isInitialLoad || (bids.length > 0 && isFetchingArtworks)) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">Your Bids</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    {[...Array(3)].map((_, i) => (
                        <div key={i} className="space-y-3">
                            <Skeleton className="h-6 w-1/2" />
                            <Skeleton className="h-4 w-3/4" />
                            <Skeleton className="h-4 w-1/3" />
                            <div className="flex space-x-2">
                                <Skeleton className="h-8 w-20" />
                                <Skeleton className="h-8 w-20" />
                            </div>
                        </div>
                    ))}
                </CardContent>
            </Card>
        );
    }

    if (bidsError) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">Your Bids</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-red-500">{bidsError}</p>
                    <Button
                        variant="outline"
                        className="mt-4"
                        onClick={() => {
                            if (session?.user?.id) {
                                fetchBids(session.user.id);
                            }
                        }}
                    >
                        Retry
                    </Button>
                </CardContent>
            </Card>
        );
    }

    if (bids.length === 0) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">Your Bids</CardTitle>
                </CardHeader>
                <CardContent>
                    <p>Your active bids will appear here</p>
                </CardContent>
            </Card>
        );
    }

    // Check if all bids have corresponding artwork data
    const allArtworksLoaded = filteredBids.every(bid => getArtworkForBid(bid));
    if (!allArtworksLoaded) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">Your Bids</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    {filteredBids.map((bid) => (
                        <div key={bid.id} className="space-y-3">
                            <Skeleton className="h-6 w-1/2" />
                            <Skeleton className="h-4 w-3/4" />
                            <Skeleton className="h-4 w-1/3" />
                            <div className="flex space-x-2">
                                <Skeleton className="h-8 w-20" />
                                <Skeleton className="h-8 w-20" />
                            </div>
                        </div>
                    ))}
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="space-y-6">
            {/* Filters Section */}
            <BidFilters
                searchTerm={searchTerm}
                statusFilter={statusFilter}
                sortOption={sortOption}
                onSearchChange={setSearchTerm}
                onStatusChange={setStatusFilter}
                onSortChange={setSortOption}
            />

            {/* Bids List */}
            <Card>
                <CardHeader>
                    <div className="flex justify-between items-center">
                        <CardTitle className="text-lg">Your Bids</CardTitle>
                        <p className="text-sm text-muted-foreground">
                            {filteredBids.length} {filteredBids.length === 1 ? "bid" : "bids"}
                        </p>
                    </div>
                </CardHeader>
                <CardContent className="max-h-[400px] overflow-y-auto space-y-4">
                    {filteredBids.length === 0 ? (
                        <div className="text-center py-8">
                            <p>No bids match your filters</p>
                            <Button
                                variant="ghost"
                                className="mt-2"
                                onClick={() => {
                                    setSearchTerm("");
                                    setStatusFilter("all");
                                }}
                            >
                                Clear filters
                            </Button>
                        </div>
                    ) : (
                        filteredBids.map((bid) => (
                            <BidCard
                                key={bid.id}
                                bid={bid}
                                artwork={getArtworkForBid(bid)}
                                onEdit={() => handleEditClick(bid)}
                                onCancel={() => handleStartWithdrawal(bid.id)}
                            />
                        ))
                    )}
                </CardContent>
            </Card>

            {/* Edit Bid Dialog */}
            {editingBid && (
                <EditBidDialog
                    isOpen={!!editingBid}
                    onClose={() => setEditingBid(null)}
                    onSubmit={handleSubmit}
                    editForm={editForm}
                    setEditForm={setEditForm}
                />
            )}

            {/* Withdrawal Modal */}
            <BidWithdrawalModal
                isOpen={isWithdrawalModalOpen}
                onClose={() => {
                    setIsWithdrawalModalOpen(false);
                    setWithdrawingBidId(null);
                }}
                onSubmit={handleConfirmWithdrawal}
            />
        </div>
    );
}