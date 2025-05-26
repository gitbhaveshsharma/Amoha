"use client";
import React, { useState } from "react";
import Link from "next/link";
import { Home, Upload, Heart, LogIn, Search, Menu, X, User } from "lucide-react";
import { Button } from "@/components/ui/Button";
import SearchInput from "@/components/ui/SearchInput";
import { useRouter, usePathname } from "next/navigation";
import DonationHeader from "./DonationHeader";
import { NotificationBell } from "@/components/notifications/NotificationBell";
import { useUploadStore } from "@/stores/upload/uploadStore";
import { UploadModal } from "@/components/UploadModal";
import { useSession } from "@/hooks/useSession";
import Image from "next/image";

const Navbar: React.FC = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const router = useRouter();
    const pathname = usePathname();
    const { openUploadModal } = useUploadStore();
    const { session } = useSession();

    const handleUploadClick = (e: React.MouseEvent) => {
        e.preventDefault();
        if (!session) {
            // Store upload intent and current path before redirecting to login
            sessionStorage.setItem('uploadIntent', 'true');
            sessionStorage.setItem('originalPath', pathname);
            router.push(`/login?redirect=${encodeURIComponent(pathname)}`);
        } else {
            openUploadModal();
        }
    };

    const toggleMenu = () => setIsMenuOpen((prev) => !prev);

    const isAuthRoute = pathname.startsWith("/login") ||
        pathname.startsWith("/forgot-password");

    const renderAuthButton = () => {
        if (session) {
            return (
                <div className="relative group">
                    <Link href="/dashboard" passHref>
                        <Button variant="default" title="Profile">
                            {session.user.user_metadata.avatar_url ? (
                                <Image
                                    src={session.user.user_metadata.avatar_url}
                                    alt="Profile"
                                    className="h-6 w-6 rounded-full mr-2 object-cover"
                                    width={24}
                                    height={24}
                                />
                            ) : (
                                <User size={16} className="mr-2" />
                            )}
                            Profile
                        </Button>
                    </Link>
                </div>
            );
        } else if (!isAuthRoute) {
            return (
                <Link href="/login" passHref>
                    <Button variant="default" title="Login">
                        <LogIn size={16} className="mr-2" /> Login
                    </Button>
                </Link>
            );
        }
        return null;
    };

    return (
        <nav className="relative bg-white shadow-md">
            <DonationHeader />
            <UploadModal />

            <div className="flex items-center justify-between px-4 py-2">
                <Link href="/" passHref>
                    <Image
                        src="/logo/amohagalleria-logo.webp"
                        alt="AMOHA Logo"
                        className="h-12 w-auto cursor-pointer md:hidden"
                        width={120}
                        height={48}
                    />
                </Link>

                <button
                    className="md:hidden flex items-center text-gray-700 hover:text-[#894129] focus:outline-none"
                    onClick={toggleMenu}
                >
                    {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
            </div>

            {/* Mobile Menu */}
            <div
                className={`fixed top-0 left-0 h-full w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out z-50 ${isMenuOpen ? "translate-x-0" : "-translate-x-full"
                    } md:hidden`}
            >
                <div className="flex flex-col p-4 space-y-4">
                    <SearchInput
                        placeholderTexts={["By art", "By category", "By artist"]}
                        inputClassName="text-gray-700 border-gray-300"
                        icon={<Search className="text-gray-500" size={20} />}
                        iconPosition="left"
                    />

                    <Link
                        href="/"
                        className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 hover:text-[#894129] rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                    >
                        <Home size={20} className="mr-1" />
                        <span>Home</span>
                    </Link>

                    {renderAuthButton()}

                    <Button
                        onClick={handleUploadClick}
                        variant="default"
                        title="Upload"
                        className="flex items-center w-full"
                    >
                        <Upload size={16} className="mr-2" />
                        Upload
                    </Button>

                    <NotificationBell />

                    <Link
                        href="/favorites"
                        passHref
                        className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 hover:text-[#894129] rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                    >
                        <Heart size={20} className="mr-1" />
                        <span>Favorites</span>
                    </Link>
                </div>
            </div>

            {/* Desktop Menu */}
            <div className="hidden md:flex items-center justify-between px-4 py-3">
                <Link href="/" passHref>
                    <Image
                        src="/logo/amohagalleria-logo.webp"
                        alt="AMOHA Logo"
                        className="h-12 w-auto cursor-pointer"
                        width={120}
                        height={48}
                    />
                </Link>

                <div className="flex items-center w-full max-w-md mx-auto">
                    <SearchInput
                        placeholderTexts={["By art", "By category", "By artist"]}
                        inputClassName="text-gray-700 border-gray-300"
                        icon={<Search className="text-gray-500" size={20} />}
                        iconPosition="left"
                    />
                </div>

                <div className="flex items-center space-x-4">
                    <Link
                        href="/"
                        className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 hover:text-[#894129] rounded-md cursor-pointer"
                    >
                        <Home size={20} className="mr-1" />
                        <span>Home</span>
                    </Link>

                    {renderAuthButton()}

                    <Button
                        onClick={handleUploadClick}
                        variant="default"
                        title="Upload"
                        className="flex items-center"
                    >
                        <Upload size={16} className="mr-2" />
                        Upload
                    </Button>

                    <NotificationBell />

                    <Link
                        href="/favorites"
                        passHref
                        className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 hover:text-[#894129] rounded-md cursor-pointer"
                    >
                        <Heart size={20} className="mr-1" />
                        <span>Favorites</span>
                    </Link>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;