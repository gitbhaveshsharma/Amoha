"use client";
import { cn } from "@/lib/utils";
import {
    LayoutDashboard,
    Gavel,
    LifeBuoy,
    User,
    X,
    UploadCloud,
    ImageIcon,
    Wallet,
    DollarSign, // Import icon for "sale"
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton"; // Make sure you have this component

type DashboardSection = "dashboard" | "bids" | "support" | "profile" | "upload" | "artworks" | "payouts" | "sale";

interface SidebarProps {
    isOpen: boolean;
    onClose: () => void;
    activeSection: DashboardSection;
    setActiveSection: (section: DashboardSection) => void;
    isLoading?: boolean; // Add loading state prop
}

const Sidebar = ({ isOpen, onClose, activeSection, setActiveSection, isLoading = false }: SidebarProps) => {
    const currentYear = 2023; // Replace dynamic `new Date()` with a static value for SSR consistency
    const sections = [
        { label: "Dashboard", value: "dashboard", icon: LayoutDashboard },
        { label: "Bids", value: "bids", icon: Gavel },
        { label: "Upload", value: "upload", icon: UploadCloud },
        { label: "Payouts", value: "payouts", icon: Wallet },
        { label: "Support", value: "support", icon: LifeBuoy },
        { label: "Profile", value: "profile", icon: User },
        { label: "Artworks", value: "artworks", icon: ImageIcon },
        { label: "Sales", value: "sale", icon: DollarSign }, // Added "sale" section
    ];

    return (
        <>
            {/* Overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
                    onClick={onClose}
                />
            )}

            {/* Sidebar */}
            <div
                className={cn(
                    "fixed inset-y-0 left-0 z-50 w-64 bg-gray-50 border-r border-gray-200 transform transition-transform duration-300 ease-in-out",
                    "dark:bg-gray-900 dark:border-gray-800",
                    isOpen ? "translate-x-0" : "-translate-x-full"
                )}
            >
                <div className="flex flex-col h-full p-4">
                    <div className="flex justify-between items-center mb-8">
                        {isLoading ? (
                            <Skeleton className="h-6 w-32" />
                        ) : (
                            <h2 className="text-xl font-bold text-gray-800 dark:text-white">Dashboard</h2>
                        )}
                        <button
                            onClick={onClose}
                            className="p-1 rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-200 dark:hover:bg-gray-800"
                            aria-label="Close sidebar"
                        >
                            <X className="h-5 w-5" />
                        </button>
                    </div>

                    <nav className="flex-1 space-y-1">
                        {isLoading ? (
                            // Skeleton loading state
                            <div className="space-y-2">
                                {[...Array(8)].map((_, i) => (
                                    <Skeleton key={i} className="h-10 w-full rounded-lg" />
                                ))}
                            </div>
                        ) : (
                            // Actual content
                            sections.map((section) => {
                                const Icon = section.icon;
                                return (
                                    <button
                                        key={section.value}
                                        onClick={() => {
                                            setActiveSection(section.value as DashboardSection);
                                            onClose();
                                        }}
                                        className={cn(
                                            "flex items-center w-full p-3 text-left rounded-lg transition-colors duration-200",
                                            "hover:bg-[#a35339]/10 hover:text-[#a35339] dark:hover:bg-[#a35339]/20 dark:hover:text-[#a35339]",
                                            activeSection === section.value
                                                ? "bg-[#a35339]/20 text-[#a35339] font-medium dark:bg-[#a35339]/30 dark:text-[#a35339]"
                                                : "text-gray-600 dark:text-gray-400"
                                        )}
                                    >
                                        <Icon className="h-5 w-5 mr-3" />
                                        {section.label}
                                        {activeSection === section.value && (
                                            <span className="ml-auto h-2 w-2 rounded-full bg-[#a35339]" />
                                        )}
                                    </button>
                                );
                            })
                        )}
                    </nav>

                    <div className="mt-auto pt-4 border-t border-gray-200 dark:border-gray-800">
                        {isLoading ? (
                            <Skeleton className="h-4 w-24" />
                        ) : (
                            <span>© {currentYear} Amoha</span>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
};

export default Sidebar;

