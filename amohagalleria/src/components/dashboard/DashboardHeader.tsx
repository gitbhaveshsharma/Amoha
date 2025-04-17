"use client";
import { Button } from "@/components/ui/Button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { LogOut, User, Menu, ChevronDown, Home } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import Link from "next/link";

interface DashboardHeaderProps {
    title: string;
    description: string;
    profile: {
        name: string;
        avatar_url?: string;
    };
    onMenuToggle: () => void;
    onProfileClick: () => void;
    onSignOut: () => void;
}

export function DashboardHeader({
    title,
    description,
    profile,
    onMenuToggle,
    onProfileClick,
    onSignOut,
}: DashboardHeaderProps) {
    return (
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
            <div className="flex items-center gap-4">
                <Button
                    variant="ghost"
                    onClick={onMenuToggle}
                    className="p-2 rounded-lg"
                    aria-label="Toggle sidebar"
                >
                    <Menu className="h-6 w-6" />
                </Button>
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">{title}</h1>
                    <p className="text-sm text-gray-500">{description}</p>
                </div>
            </div>

            <div className="flex items-center gap-4">
                {/* New Home Link/Button */}
                <Link href="/" passHref>
                    <Button
                        variant="ghost"
                        className="p-2 rounded-lg"
                        aria-label="Go to home"
                    >
                        <Home className="h-6 w-6" /> Home
                    </Button>
                </Link>

                {/* Existing Profile Dropdown */}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline" className="flex items-center gap-2 px-3 py-2 rounded-full">
                            <Avatar className="h-8 w-8">
                                <AvatarImage src={profile?.avatar_url ?? ""} />
                                <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-500 text-white">
                                    {profile?.name?.charAt(0).toUpperCase() ?? ""}
                                </AvatarFallback>
                            </Avatar>
                            <span className="hidden md:inline font-medium">{profile?.name ?? "Guest"}</span>
                            <ChevronDown className="h-4 w-4 opacity-50" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56 rounded-lg shadow-lg border border-gray-200">
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
            </div>
        </div>
    );
}