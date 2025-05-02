"use client";
import { Button } from "@/components/ui/Button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { LogOut, User, Menu, ChevronDown, Home, ShoppingCart, Heart } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { NotificationBell } from "../notifications/NotificationBell";

interface DashboardHeaderProps {
    title: string;
    description: string;
    profile: {
        name: string;
        avatar_url?: string;
    };
    onMenuToggle: () => void;
    onProfileClick: () => void;
    onCartClick?: () => void;
    onSignOut: () => void;
    loading?: boolean;
    cartCount?: number;
    wishlistCount?: number;
    notificationsLoading?: boolean;
}

export function DashboardHeader({
    title,
    description,
    profile,
    onMenuToggle,
    onProfileClick,
    onCartClick,
    onSignOut,
    loading = false,
    cartCount = 0,
    wishlistCount = 0,
    notificationsLoading = false,
}: DashboardHeaderProps) {
    return (
        <div className="sticky top-0 z-10 bg-white border-b border-gray-200 p-4 shadow-sm">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                {/* Left Section */}
                <div className="flex items-center gap-4">
                    {loading ? (
                        <Skeleton className="h-10 w-10 rounded-lg" />
                    ) : (
                        <Button
                            variant="ghost"
                            onClick={onMenuToggle}
                            className="p-2 rounded-lg"
                            aria-label="Toggle sidebar"
                        >
                            <Menu className="h-6 w-6" />
                        </Button>
                    )}

                    <div>
                        {loading ? (
                            <div className="space-y-2">
                                <Skeleton className="h-6 w-48" />
                                <Skeleton className="h-4 w-64" />
                            </div>
                        ) : (
                            <>
                                <h1 className="text-2xl font-bold text-gray-800">{title}</h1>
                                <p className="text-sm text-gray-500">{description}</p>
                            </>
                        )}
                    </div>
                </div>

                {/* Right Section */}
                <div className="flex items-center gap-4">
                    {/* Home Button */}
                    {loading ? (
                        <Skeleton className="h-10 w-10 rounded-lg" />
                    ) : (
                        <Link href="/" passHref>
                            <Button
                                variant="ghost"
                                className="p-2 rounded-lg"
                                aria-label="Go to home"
                            >
                                <Home className="h-6 w-6" />
                                <span className="hidden md:inline ml-2">Home</span>
                            </Button>
                        </Link>
                    )}

                    {/* Wishlist Button */}
                    {loading ? (
                        <Skeleton className="h-10 w-10 rounded-full" />
                    ) : (
                        <Button variant="outline" className="relative p-2 rounded-full">
                            <Heart className="h-5 w-5" />
                            {wishlistCount > 0 && (
                                <Badge className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0">
                                    {wishlistCount}
                                </Badge>
                            )}
                            <span className="hidden md:inline">Wishlist</span>
                        </Button>
                    )}

                    {/* Cart Button */}
                    {loading ? (
                        <Skeleton className="h-10 w-10 rounded-full" />
                    ) : (
                        <Button
                            variant="outline"
                            className="relative p-2 rounded-full"
                            onClick={onCartClick}
                        >
                            <ShoppingCart className="h-5 w-5" />
                            {cartCount > 0 && (
                                <Badge className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0">
                                    {cartCount}
                                </Badge>
                            )}
                            <span className="hidden md:inline">Cart</span>
                        </Button>
                    )}

                    {/* Notification Button */}
                    {loading || notificationsLoading ? (
                        <Skeleton className="h-10 w-10 rounded-full" />
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
                                <Button variant="outline" className="flex items-center rounded-full" style={{ paddingInline: "inherit" }}>
                                    <Avatar>
                                        <AvatarImage src={profile?.avatar_url ?? ""} />
                                        <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-500 text-white">
                                            {profile?.name?.charAt(0).toUpperCase() ?? ""}
                                        </AvatarFallback>
                                    </Avatar>
                                    <span className="hidden md:inline font-medium">{profile?.name ?? "Guest"}</span>
                                    <ChevronDown className="h-4 w-4 opacity-50 mr-1" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent
                                align="end"
                                className="w-56 rounded-lg shadow-lg border border-gray-200"
                            >
                                <DropdownMenuItem
                                    onClick={onProfileClick}
                                    className="cursor-pointer hover:bg-gray-50 rounded-md"
                                >
                                    <User className="mr-2 h-4 w-4" />
                                    <span>Profile</span>
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                    onClick={onSignOut}
                                    className="cursor-pointer text-red-600 hover:bg-red-50 rounded-md"
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