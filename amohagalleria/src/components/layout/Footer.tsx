"use client";
import React from "react";
import Link from "next/link";
import {
    Facebook,
    Instagram,
    Twitter,
    Youtube,
    Mail,
    Phone,
    MapPin,
    Heart,
    Palette
} from "lucide-react";

const Footer: React.FC = () => {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="bg-gradient-to-r from-[#894129] to-[#a35339] text-white mt-16">
            <div className="container mx-auto px-4 py-12">
                {/* Main Footer Content */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {/* Brand & Description */}
                    <div className="lg:col-span-2">
                        <div className="flex items-center space-x-2 mb-4">
                            <Palette className="h-8 w-8 text-white" />
                            <h2 className="text-2xl font-bold">AMOHA Art Gallery</h2>
                        </div>
                        <p className="text-gray-200 mb-6 max-w-md">
                            Discover and collect extraordinary artworks from talented artists around the world.
                            Experience the beauty of art in a modern, curated digital gallery.
                        </p>

                        {/* Social Media Links */}
                        <div className="flex space-x-4">
                            <Link
                                href="#"
                                className="bg-white/10 hover:bg-white/20 p-2 rounded-full transition-colors duration-200"
                                aria-label="Facebook"
                            >
                                <Facebook className="h-5 w-5" />
                            </Link>
                            <Link
                                href="#"
                                className="bg-white/10 hover:bg-white/20 p-2 rounded-full transition-colors duration-200"
                                aria-label="Instagram"
                            >
                                <Instagram className="h-5 w-5" />
                            </Link>
                            <Link
                                href="#"
                                className="bg-white/10 hover:bg-white/20 p-2 rounded-full transition-colors duration-200"
                                aria-label="Twitter"
                            >
                                <Twitter className="h-5 w-5" />
                            </Link>
                            <Link
                                href="#"
                                className="bg-white/10 hover:bg-white/20 p-2 rounded-full transition-colors duration-200"
                                aria-label="YouTube"
                            >
                                <Youtube className="h-5 w-5" />
                            </Link>
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h3 className="text-lg font-semibold mb-4">Explore</h3>
                        <ul className="space-y-3">
                            <li>
                                <Link href="/" className="text-gray-200 hover:text-white transition-colors duration-200">
                                    Home
                                </Link>
                            </li>
                            <li>
                                <Link href="/artworks" className="text-gray-200 hover:text-white transition-colors duration-200">
                                    Browse Artworks
                                </Link>
                            </li>
                            <li>
                                <Link href="/artists" className="text-gray-200 hover:text-white transition-colors duration-200">
                                    Featured Artists
                                </Link>
                            </li>
                            <li>
                                <Link href="/categories" className="text-gray-200 hover:text-white transition-colors duration-200">
                                    Categories
                                </Link>
                            </li>
                            <li>
                                <Link href="/exhibitions" className="text-gray-200 hover:text-white transition-colors duration-200">
                                    Exhibitions
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Contact Info */}
                    <div>
                        <h3 className="text-lg font-semibold mb-4">Contact Us</h3>
                        <div className="space-y-3">
                            <div className="flex items-center space-x-3">
                                <Mail className="h-4 w-4 text-gray-300" />
                                <span className="text-gray-200">info@amohagallery.com</span>
                            </div>
                            <div className="flex items-center space-x-3">
                                <Phone className="h-4 w-4 text-gray-300" />
                                <span className="text-gray-200">+1 (555) 123-4567</span>
                            </div>
                            <div className="flex items-start space-x-3">
                                <MapPin className="h-4 w-4 text-gray-300 mt-1" />
                                <span className="text-gray-200">
                                    123 Art District<br />
                                    Creative City, NY 10001
                                </span>
                            </div>
                        </div>

                        {/* Newsletter Signup */}
                        <div className="mt-6">
                            <h4 className="text-sm font-semibold mb-2">Stay Updated</h4>
                            <div className="flex">
                                <input
                                    type="email"
                                    placeholder="Your email"
                                    className="flex-1 px-3 py-2 text-sm bg-white/10 border border-white/20 rounded-l-md placeholder-gray-300 text-white focus:outline-none focus:ring-2 focus:ring-white/30"
                                />
                                <button className="px-4 py-2 bg-white/20 hover:bg-white/30 border border-white/20 border-l-0 rounded-r-md transition-colors duration-200">
                                    <Mail className="h-4 w-4" />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="border-t border-white/20 mt-12 pt-8">
                    <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
                        <div className="flex items-center space-x-4 text-sm text-gray-200">
                            <span>&copy; {currentYear} AMOHA Art Gallery. All rights reserved.</span>
                        </div>

                        <div className="flex items-center space-x-6 text-sm">
                            <Link href="/privacy" className="text-gray-200 hover:text-white transition-colors duration-200">
                                Privacy Policy
                            </Link>
                            <Link href="/terms" className="text-gray-200 hover:text-white transition-colors duration-200">
                                Terms of Service
                            </Link>
                            <Link href="/support" className="text-gray-200 hover:text-white transition-colors duration-200">
                                Support
                            </Link>
                        </div>

                        <div className="flex items-center space-x-1 text-sm text-gray-200">
                            <span>Made with</span>
                            <Heart className="h-4 w-4 text-red-400 fill-current" />
                            <span>for art lovers</span>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;