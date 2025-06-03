"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
    Heart,
    LogIn,
    Menu,
    X,
    User,
    ShoppingCart,
    ChevronDown,
    LogOut,
    Package,
    Settings,
    HelpCircle,
    Upload,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/badge";
import { ArtworkSearchInput } from "@/components/search/SearchInput";
import { useRouter, usePathname } from "next/navigation";
import DonationHeader from "./DonationHeader";
import { NotificationBell } from "@/components/notifications/NotificationBell";
import { useUploadStore } from "@/stores/upload/uploadStore";
import { useCartStore } from "@/stores/cart";
import { UploadModal } from "@/components/UploadModal";
import { useSession } from "@/hooks/useSession";
import Image from "next/image";
import { cn } from "@/lib/utils";

const Skeleton = ({ className }: { className?: string }) => (
    <div className={`animate-pulse bg-gray-200 rounded ${className}`}></div>
);

const Navbar: React.FC = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [isVisible, setIsVisible] = useState(true);
    const [lastScrollY, setLastScrollY] = useState(0);
    const [isAtTop, setIsAtTop] = useState(true);

    const router = useRouter();
    const pathname = usePathname();
    const { openUploadModal } = useUploadStore();
    const { session } = useSession();
    const { cart, fetchCart, isLoading: cartLoading } = useCartStore();

    useEffect(() => {
        const handleScroll = () => {
            const currentScrollY = window.scrollY;
            const atTop = currentScrollY <= 10;
            setIsAtTop(atTop);

            if (atTop) {
                setIsVisible(true);
            } else {
                if (currentScrollY > lastScrollY && currentScrollY > 100) {
                    setIsVisible(false);
                    setIsMenuOpen(false);
                    setIsProfileMenuOpen(false);
                } else if (currentScrollY < lastScrollY) {
                    setIsVisible(true);
                }
            }

            setLastScrollY(currentScrollY);
        };

        let ticking = false;
        const throttledHandleScroll = () => {
            if (!ticking) {
                requestAnimationFrame(() => {
                    handleScroll();
                    ticking = false;
                });
                ticking = true;
            }
        };

        window.addEventListener('scroll', throttledHandleScroll, { passive: true });
        return () => window.removeEventListener('scroll', throttledHandleScroll);
    }, [lastScrollY]);

    useEffect(() => {
        const timer = setTimeout(() => {
            setIsLoading(false);
        }, 1000);
        return () => clearTimeout(timer);
    }, []);

    useEffect(() => {
        fetchCart();
    }, [fetchCart]);

    useEffect(() => {
        setIsMenuOpen(false);
        setIsProfileMenuOpen(false);
    }, [pathname]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            const target = event.target as Element;
            if (!target.closest('.profile-menu') && !target.closest('.profile-button')) {
                setIsProfileMenuOpen(false);
            }
        };

        if (isProfileMenuOpen) {
            document.addEventListener('click', handleClickOutside);
            return () => document.removeEventListener('click', handleClickOutside);
        }
    }, [isProfileMenuOpen]);

    const handleUploadClick = (e: React.MouseEvent) => {
        e.preventDefault();
        if (!session) {
            sessionStorage.setItem('uploadIntent', 'true');
            sessionStorage.setItem('originalPath', pathname);
            router.push(`/login?redirect=${encodeURIComponent(pathname)}`);
        } else {
            openUploadModal();
            setIsProfileMenuOpen(false); // Close profile menu when upload is clicked
        }
    };

    const toggleMenu = () => setIsMenuOpen((prev) => !prev);
    const toggleProfileMenu = () => setIsProfileMenuOpen((prev) => !prev);

    const isAuthRoute = pathname.startsWith("/login") || pathname.startsWith("/forgot-password");
    const isActive = (path: string) => pathname === path;

    const navItems = [
        { href: "/", label: "Home" },
        { href: "/artworks", label: "Browse" },
        { href: "/artists", label: "Artists" },
    ];

    const CartButton = () => {
        if (cartLoading) {
            return (
                <div className="relative flex items-center px-3 py-2">
                    <Skeleton className="h-5 w-5 mr-2" />
                    <Skeleton className="h-4 w-8 hidden sm:block" />
                </div>
            );
        }

        return (
            <Link
                href="/cart"
                className={cn(
                    "relative flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200",
                    isActive('/cart')
                        ? 'bg-primary/10 text-primary border border-primary/20'
                        : 'text-gray-700 hover:text-primary hover:bg-gray-50'
                )}
            >
                <ShoppingCart size={20} className="mr-2" />
                <span className="hidden sm:inline">Cart</span>
                {cart.length > 0 && (
                    <Badge
                        variant="destructive"
                        className="absolute -top-1 -right-1 h-5 w-5 text-xs rounded-full flex items-center justify-center"
                    >
                        {cart.length > 99 ? '99+' : cart.length}
                    </Badge>
                )}
            </Link>
        );
    };

    const FavoritesButton = () => (
        <Link
            href="/favorites"
            className={cn(
                "flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200",
                isActive('/favorites')
                    ? 'bg-red-50 text-red-600 border border-red-200'
                    : 'text-gray-700 hover:text-red-600 hover:bg-gray-50'
            )}
        >
            <Heart size={20} className="mr-2" />
            <span className="hidden sm:inline">Favorites</span>
        </Link>
    );

    const ProfileMenu = () => {
        if (isLoading) {
            return (
                <div className="flex items-center px-3 py-2">
                    <Skeleton className="h-7 w-7 rounded-full mr-2" />
                    <Skeleton className="h-4 w-16 hidden md:block mr-1" />
                    <Skeleton className="h-4 w-4" />
                </div>
            );
        }

        return (
            <div className="relative profile-menu">
                <button
                    onClick={toggleProfileMenu}
                    className="profile-button flex items-center px-3 py-2 text-sm font-medium text-gray-700 rounded-lg hover:bg-gray-50 hover:text-primary transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                >
                    {session?.user.user_metadata.avatar_url ? (
                        <Image
                            src={session.user.user_metadata.avatar_url}
                            alt="Profile"
                            className="h-7 w-7 rounded-full mr-2 object-cover border-2 border-gray-200"
                            width={28}
                            height={28}
                        />
                    ) : (
                        <div className="h-7 w-7 rounded-full mr-2 flex items-center justify-center bg-primary">
                            <User size={16} className="text-primary-foreground" />
                        </div>
                    )}
                    <span className="hidden md:inline mr-1">
                        {session?.user.user_metadata.name || 'Profile'}
                    </span>
                    <ChevronDown size={16} className={`transform transition-transform duration-200 ${isProfileMenuOpen ? 'rotate-180' : ''}`} />
                </button>

                {isProfileMenuOpen && (
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                        <div className="px-4 py-2 border-b border-gray-100">
                            <p className="text-sm font-medium text-gray-900">
                                {session?.user.user_metadata.name || 'User'}
                            </p>
                            <p className="text-xs text-gray-500">{session?.user.email}</p>
                        </div>

                        <button
                            onClick={handleUploadClick}
                            className="flex items-center w-full px-4 py-2 text-sm text-primary hover:text-primary/80 hover:bg-primary/5 transition-colors font-medium"
                        >
                            <Upload size={16} className="mr-3" />
                            Upload Artwork
                        </button>

                        <div className="border-t border-gray-100 my-2"></div>

                        <Link
                            href="/dashboard"
                            className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                            <User size={16} className="mr-3" />
                            Dashboard
                        </Link>

                        <Link
                            href="/dashboard/orders"
                            className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                            <Package size={16} className="mr-3" />
                            My Orders
                        </Link>

                        <Link
                            href="/dashboard/settings"
                            className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                            <Settings size={16} className="mr-3" />
                            Settings
                        </Link>

                        <div className="border-t border-gray-100 mt-2 pt-2">
                            <button
                                onClick={() => {
                                    // Add logout functionality here
                                    console.log('Logout clicked');
                                }}
                                className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 transition-colors"
                            >
                                <LogOut size={16} className="mr-3" />
                                Sign Out
                            </button>
                        </div>
                    </div>
                )}
            </div>
        );
    };

    const UploadButton = ({ mobile = false }: { mobile?: boolean }) => {
        if (isLoading) {
            return (
                <div className="flex items-center px-4 py-2">
                    <Skeleton className="h-4 w-4 mr-2" />
                    <Skeleton className="h-4 w-12" />
                </div>
            );
        }

        return mobile ? (
            <button
                onClick={handleUploadClick}
                className="w-full flex items-center px-4 py-3 text-sm font-medium rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
            >
                <Upload size={18} className="mr-3" />
                Upload Artwork
            </button>
        ) : (
            <Button onClick={handleUploadClick}>
                <Upload size={16} className="mr-2" />
                Upload
            </Button>
        );
    };

    const renderAuthButton = () => {
        if (isLoading) {
            return <Skeleton className="h-10 w-20" />;
        }

        if (session) {
            return <ProfileMenu />;
        } else if (!isAuthRoute) {
            return (
                <Link href="/login" passHref>
                    <Button>
                        <LogIn size={16} className="mr-2" />
                        Sign In
                    </Button>
                </Link>
            );
        }
        return null;
    };

    const MobileMenu = () => (
        <>
            {isMenuOpen && (
                <div
                    className="fixed inset-0 h-screen bg-black bg-opacity-50 z-40 md:hidden backdrop-blur-sm"
                    onClick={() => setIsMenuOpen(false)}
                />
            )}

            <div
                className={cn(
                    "fixed top-0 left-0 h-screen w-80 bg-white shadow-xl transform transition-transform duration-300 ease-in-out z-50",
                    "md:hidden overflow-y-auto flex flex-col",
                    isMenuOpen ? "translate-x-0" : "-translate-x-full"
                )}
            >
                <div className="p-4 border-b border-gray-200 sticky top-0 bg-white z-10">
                    <div className="flex items-center justify-between mb-4">
                        <Image
                            src="/logo/amohagalleria-logo.webp"
                            alt="AMOHA Logo"
                            className="h-8 w-auto"
                            width={100}
                            height={32}
                        />
                        <button
                            onClick={() => setIsMenuOpen(false)}
                            className="p-2 text-gray-500 hover:text-gray-700 rounded-lg"
                        >
                            <X size={20} />
                        </button>
                    </div>

                    <ArtworkSearchInput
                        placeholder="Search artworks..."
                        className="w-full"
                    />
                </div>

                <div className="flex-1 p-4 overflow-y-auto">
                    <div className="mb-6">
                        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 px-2">
                            Navigation
                        </h3>
                        <div className="space-y-1">
                            {navItems.map((item) => (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className={cn(
                                        "flex items-center px-3 py-3 text-sm font-medium rounded-lg transition-all duration-200",
                                        isActive(item.href)
                                            ? 'bg-primary/10 text-primary'
                                            : 'text-gray-700 hover:bg-gray-50'
                                    )}
                                >
                                    {item.label}
                                </Link>
                            ))}
                        </div>
                    </div>

                    {/* Always show these sections regardless of authentication status */}
                    <div className="mb-6">
                        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 px-2">
                            Your Actions
                        </h3>
                        <div className="space-y-1">
                            <Link
                                href="/favorites"
                                className="flex items-center px-3 py-3 text-sm font-medium rounded-lg text-gray-700 hover:bg-gray-50"
                            >
                                <Heart size={18} className="mr-3" />
                                Favorites
                            </Link>
                            <Link
                                href="/cart"
                                className="flex items-center px-3 py-3 text-sm font-medium rounded-lg text-gray-700 hover:bg-gray-50"
                            >
                                <ShoppingCart size={18} className="mr-3" />
                                Cart
                                {!cartLoading && cart.length > 0 && (
                                    <span className="ml-auto bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                                        {cart.length > 99 ? '99+' : cart.length}
                                    </span>
                                )}
                            </Link>
                            <NotificationBell />
                        </div>
                    </div>

                    <div className="mb-6">
                        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 px-2">
                            Help & Settings
                        </h3>
                        <div className="space-y-1">
                            <Link
                                href="/help"
                                className="flex items-center px-3 py-3 text-sm font-medium rounded-lg text-gray-700 hover:bg-gray-50"
                            >
                                <HelpCircle size={18} className="mr-3" />
                                Help Center
                            </Link>
                            <Link
                                href="/settings"
                                className="flex items-center px-3 py-3 text-sm font-medium rounded-lg text-gray-700 hover:bg-gray-50"
                            >
                                <Settings size={18} className="mr-3" />
                                Settings
                            </Link>
                        </div>
                    </div>
                </div>

                <div className="p-4 border-t border-gray-200 sticky bottom-0 bg-white">
                    {session ? (
                        <div className="space-y-3">
                            <UploadButton mobile />
                            <button
                                onClick={() => {
                                    // Add logout functionality here
                                    console.log('Logout clicked');
                                }}
                                className="w-full flex items-center justify-center px-4 py-3 text-sm font-medium rounded-lg text-red-600 hover:bg-red-50 transition-colors"
                            >
                                <LogOut size={18} className="mr-3" />
                                Sign Out
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            <UploadButton mobile />
                            <Link href="/login" passHref>
                                <Button className="w-full">
                                    <LogIn size={16} className="mr-2" />
                                    Sign In
                                </Button>
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </>
    );

    return (
        <nav
            className={cn(
                "bg-white shadow-lg border-b border-gray-200 fixed top-0 left-0 right-0 z-40",
                "transition-transform duration-300 ease-in-out",
                isVisible ? 'translate-y-0' : '-translate-y-full',
                !isAtTop && 'backdrop-blur-sm bg-white/95'
            )}
        >
            <DonationHeader />
            <UploadModal />

            <div className="md:hidden flex items-center justify-between px-4 py-3">
                <Link href="/" className="flex-shrink-0">
                    <Image
                        src="/logo/amohagalleria-logo.webp"
                        alt="AMOHA Logo"
                        className="h-10 w-auto"
                        width={120}
                        height={40}
                    />
                </Link>

                <div className="flex items-center space-x-2">
                    <CartButton />
                    <button
                        className="p-2 text-gray-700 hover:bg-gray-50 hover:text-primary rounded-lg transition-colors duration-200"
                        onClick={toggleMenu}
                    >
                        {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                </div>
            </div>

            <MobileMenu />

            <div className="hidden md:flex items-center justify-between px-6 py-4">
                <Link href="/" className="flex-shrink-0">
                    <Image
                        src="/logo/amohagalleria-logo.webp"
                        alt="AMOHA Logo"
                        className="h-12 w-auto"
                        width={140}
                        height={48}
                    />
                </Link>

                <div className="flex items-center space-x-1 mx-8">
                    {navItems.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200",
                                isActive(item.href)
                                    ? 'bg-primary/10 text-primary border border-primary/20'
                                    : 'text-gray-700 hover:bg-gray-50 hover:text-primary'
                            )}
                        >
                            {item.label}
                        </Link>
                    ))}
                </div>

                <div className="flex-1 max-w-md mx-8">
                    <ArtworkSearchInput
                        placeholder="Search artworks, artists, categories..."
                        className="w-full"
                    />
                </div>

                <div className="flex items-center space-x-3">
                    <FavoritesButton />
                    <CartButton />
                    {session && <NotificationBell />}
                    {!session && !isAuthRoute && <UploadButton />}
                    {renderAuthButton()}
                </div>
            </div>
        </nav>
    );
};

export default Navbar;