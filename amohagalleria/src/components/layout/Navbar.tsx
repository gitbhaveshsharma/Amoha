"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Home, Upload, Heart, LogIn, Search, Menu, X, User } from "lucide-react";
import { Button } from "../ui/Button";
import SearchInput from "../ui/SearchInput";
import { useRouter, usePathname } from "next/navigation";
import DonationHeader from "./DonationHeader";
import { supabase } from "@/lib/supabase";

const Navbar: React.FC = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [userAvatar, setUserAvatar] = useState("");
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        const checkAuth = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            setIsLoggedIn(!!session);

            if (session?.user) {
                const { data } = await supabase
                    .from("profile")
                    .select("avatar_url")
                    .eq("user_id", session.user.id)
                    .single();

                if (data?.avatar_url) {
                    setUserAvatar(data.avatar_url);
                }
            }
        };

        checkAuth();

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setIsLoggedIn(!!session);
        });

        return () => subscription.unsubscribe();
    }, []);
    const handleProtectedAction = (e: React.MouseEvent, path: string) => {
        if (!isLoggedIn) {
            e.preventDefault();
            router.push(`/login?redirect=${encodeURIComponent(path)}`);
        }
    };

    const toggleMenu = () => setIsMenuOpen((prev) => !prev);

    // Check if current route is in auth group
    const isAuthRoute = pathname.startsWith("/login") ||
        pathname.startsWith("/forgot-password");

    const renderAuthButton = () => {
        if (isLoggedIn) {
            return (
                <div className="relative group">
                    <Link href="/dashboard" passHref>
                        <Button variant="default" title="Profile">
                            {userAvatar ? (
                                <img
                                    src={userAvatar}
                                    alt="Profile"
                                    className="h-6 w-6 rounded-full mr-2 object-cover"
                                />
                            ) : (
                                <User size={16} className="mr-2" />
                            )}
                            Profile
                        </Button>
                    </Link>

                </div>
            );
        } else if (!isAuthRoute) { // Only show login button if not on auth page
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

            <div className="flex items-center justify-between px-4 py-2">
                <Link href="/" passHref>
                    <img
                        src="/logo/amohagalleria-logo.webp"
                        alt="AMOHA Logo"
                        className="h-12 w-auto cursor-pointer md:hidden"
                    />
                </Link>

                <button
                    className="md:hidden flex items-center text-gray-700 hover:text-[#894129] focus:outline-none"
                    onClick={toggleMenu}
                >
                    {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
            </div>

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

                    {/* Always show Upload and Favorites, but handle click differently */}
                    <Link
                        href="/upload"
                        passHref
                        onClick={(e) => handleProtectedAction(e, "/upload")}
                    >
                        <Button variant="default" title="Upload">
                            <Upload size={16} className="mr-2" />
                            Upload
                        </Button>
                    </Link>

                    <Link
                        href="/favorites"
                        passHref
                        onClick={(e) => handleProtectedAction(e, "/favorites")}
                    >
                        <Button variant="secondary" title="Favorites">
                            <Heart size={16} className="mr-2" />
                            Favorites
                        </Button>
                    </Link>
                </div>
            </div>

            <div className="hidden md:flex items-center justify-between px-4 py-3">
                <Link href="/" passHref>
                    <img
                        src="/logo/amohagalleria-logo.webp"
                        alt="AMOHA Logo"
                        className="h-12 w-auto cursor-pointer"
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

                    {/* Always show Upload and Favorites, but handle click differently */}
                    <Link
                        href="/upload"
                        passHref
                        onClick={(e) => handleProtectedAction(e, "/upload")}
                    >
                        <Button variant="default" title="Upload">
                            <Upload size={16} className="mr-2" />
                            Upload
                        </Button>
                    </Link>

                    <Link
                        href="/favorites"
                        passHref
                        onClick={(e) => handleProtectedAction(e, "/favorites")}
                    >
                        <Button variant="secondary" title="Favorites">
                            <Heart size={16} className="mr-2" />
                            Favorites
                        </Button>
                    </Link>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;