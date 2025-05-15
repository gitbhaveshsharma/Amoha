"use client";
import { Button } from "@/components/ui/Button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { LogOut, User, Menu, ChevronDown, Home, ShoppingCart, Heart, Settings, Shield } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { NotificationBell } from "../notifications/NotificationBell";
import { cn } from "@/lib/utils";

type DashboardSection =
    | "dashboard"
    | "wishlist"
    | "bids"
    | "support"
    | "profile"
    | "upload"
    | "artworks"
    | "payouts"
    | "cart"
    | "sale";

interface DashboardHeaderProps {
    title: string;
    description: string;
    profile: {
        name: string;
        avatar_url?: string;
        role?: string;
    };

    onMenuToggle: () => void;
    onProfileClick: () => void;
    onCartClick?: () => void;
    onWishlistClick?: () => void;
    onSignOut: () => void;
    loading?: boolean;
    cartCount?: number;
    wishlistCount?: number;
    notificationsLoading?: boolean;
    activeSection: DashboardSection;
    isAdmin?: boolean;
    isArtist?: boolean;
}

export function DashboardHeader({
    title,
    description,
    profile,
    onMenuToggle,
    onProfileClick,
    onCartClick,
    onWishlistClick,
    onSignOut,
    loading = false,
    cartCount = 0,
    // wishlistCount = 0,
    notificationsLoading = false,
    activeSection,
    isAdmin = false,
    isArtist = false,
}: DashboardHeaderProps) {
    return (
        <div className="sticky top-0 z-50 bg-white border-b border-gray-200 p-4 shadow-sm dark:bg-gray-900 dark:border-gray-800">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                {/* Left Section */}
                <div className="flex items-center gap-4">
                    {loading ? (
                        <Skeleton className="h-10 w-10 rounded-lg" />
                    ) : (
                        <Button
                            variant="ghost"
                            onClick={onMenuToggle}
                            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
                            aria-label="Toggle sidebar"
                        >
                            <Menu className="h-6 w-6" />
                        </Button>
                    )}

                    <div>
                        {loading ? (
                            <div className="space-y-2">
                                <Skeleton className="h-6 w-48 dark:bg-gray-800" />
                                <Skeleton className="h-4 w-64 dark:bg-gray-800" />
                            </div>
                        ) : (
                            <>
                                <h1 className="text-2xl font-bold text-gray-800 dark:text-white">{title}</h1>
                                <p className="text-sm text-gray-500 dark:text-gray-400">{description}</p>
                            </>
                        )}
                    </div>
                </div>

                {/* Right Section */}
                <div className="flex items-center gap-2 sm:gap-4">
                    {/* Home Button */}
                    {loading ? (
                        <Skeleton className="h-10 w-10 rounded-lg dark:bg-gray-800" />
                    ) : (
                        <Link href="/" passHref>
                            <Button
                                variant="outline"
                                className="relative p-2 rounded-lg hover:bg-[#a35339]/10 hover:text-[#a35339] text-gray-600 dark:hover:bg-[#a35339]/20"
                                aria-label="Go to home"
                            >
                                <Home className="h-6 w-6" />
                                <span className="hidden md:inline ml-2">Home</span>
                            </Button>
                        </Link>
                    )}

                    {/* Wishlist Button - Hidden for admin */}
                    {!isAdmin && (loading ? (
                        <Skeleton className="h-10 w-10 rounded-full dark:bg-gray-800" />
                    ) : (
                        <Button
                            variant="outline"
                            className={cn(
                                "relative p-2 rounded-lg hover:bg-[#a35339]/10 hover:text-[#a35339] dark:hover:bg-[#a35339]/20",
                                activeSection === 'wishlist'
                                    ? "bg-[#a35339]/20 text-[#a35339] dark:bg-[#a35339]/30"
                                    : "text-gray-600 dark:text-gray-400"
                            )}
                            onClick={onWishlistClick}
                        >
                            <Heart className="h-5 w-5" />
                            {/* {wishlistCount > 0 && (
                                <Badge className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0">
                                    {wishlistCount}
                                </Badge>
                            )} */}
                            <span className="hidden md:inline ml-2">Wishlist</span>
                        </Button>
                    ))}

                    {/* Cart Button - Hidden for admin */}
                    {!isAdmin && (loading ? (
                        <Skeleton className="h-10 w-10 rounded-full dark:bg-gray-800" />
                    ) : (
                        <Button
                            variant="outline"
                            className={cn(
                                "relative p-2 rounded-lg hover:bg-[#a35339]/10 hover:text-[#a35339] dark:hover:bg-[#a35339]/20",
                                activeSection === 'cart'
                                    ? "bg-[#a35339]/20 text-[#a35339] dark:bg-[#a35339]/30"
                                    : "text-gray-600 dark:text-gray-400"
                            )}
                            onClick={onCartClick}
                        >
                            <ShoppingCart className="h-5 w-5" />
                            {cartCount > 0 && (
                                <Badge className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0">
                                    {cartCount}
                                </Badge>
                            )}
                            <span className="hidden md:inline ml-2">Cart</span>
                        </Button>
                    ))}

                    {/* Notification Button */}
                    {loading || notificationsLoading ? (
                        <Skeleton className="h-10 w-10 rounded-full dark:bg-gray-800" />
                    ) : (
                        <NotificationBell />
                    )}

                    {/* Profile Dropdown */}
                    {loading ? (
                        <div className="flex items-center gap-2">
                            <Skeleton className="h-10 w-10 rounded-full" />
                            <Skeleton className="h-4 w-24 hidden md:block" />
                        </div>
                    ) : (
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button
                                    variant="outline"
                                    className={cn(
                                        "flex items-center rounded-full hover:bg-[#a35339]/10 hover:text-[#a35339] text-gray-600 dark:hover:bg-[#a35339]/20",
                                        isAdmin ? "border-blue-500" : isArtist ? "border-purple-500" : ""
                                    )}
                                    style={{ paddingInline: "inherit" }}
                                >
                                    <Avatar>
                                        <AvatarImage src={profile?.avatar_url ?? ""} />
                                        <AvatarFallback className={cn(
                                            "text-white",
                                            isAdmin ? "bg-gradient-to-r from-blue-500 to-blue-700" :
                                                isArtist ? "bg-gradient-to-r from-purple-500 to-pink-500" :
                                                    "bg-gradient-to-r from-gray-500 to-gray-700"
                                        )}>
                                            {profile?.name?.charAt(0).toUpperCase() ?? ""}
                                        </AvatarFallback>
                                    </Avatar>
                                    <span className="hidden md:inline font-medium">{profile?.name ?? "Guest"}</span>
                                    <ChevronDown className="h-4 w-4 opacity-50 mr-1" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent
                                align="end"
                                className="w-56 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700"
                            >
                                <DropdownMenuItem
                                    onClick={onProfileClick}
                                    className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 rounded-md"
                                >
                                    <User className="mr-2 h-4 w-4" />
                                    <span>Profile</span>
                                </DropdownMenuItem>

                                {isAdmin && (
                                    <DropdownMenuItem
                                        onClick={() => window.location.href = '/admin'}
                                        className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 rounded-md"
                                    >
                                        <Shield className="mr-2 h-4 w-4 text-blue-500" />
                                        <span>Admin Panel</span>
                                    </DropdownMenuItem>
                                )}

                                {isArtist && (
                                    <DropdownMenuItem
                                        onClick={() => window.location.href = '/artist'}
                                        className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 rounded-md"
                                    >
                                        <Settings className="mr-2 h-4 w-4 text-purple-500" />
                                        <span>Artist Settings</span>
                                    </DropdownMenuItem>
                                )}

                                <DropdownMenuItem
                                    onClick={onSignOut}
                                    className="cursor-pointer text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md"
                                >
                                    <LogOut className="mr-2 h-4 w-4" />
                                    <span>Sign Out</span>
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    )}
                </div>
            </div>
        </div>
    );
}