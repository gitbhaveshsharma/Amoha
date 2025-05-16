"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { DashboardHome } from "@/components/dashboard/DashboardSections/DashboardHome";
import { ProfileSection } from "@/components/dashboard/DashboardSections/ProfileSection";
import { WishlistSection } from "@/components/dashboard/DashboardSections/WishlistSection";
import { BidsSection } from "@/components/dashboard/DashboardSections/BidsSection";
import { UploadSection } from "@/components/dashboard/DashboardSections/UploadSection";
import { SupportSection } from "@/components/dashboard/DashboardSections/SupportSection";
import { ArtworkSection } from "@/components/dashboard/DashboardSections/ArtworkSection";
import { ArtistPayoutSection } from "@/components/dashboard/Payout/Artist/ArtistPayoutSection";
import { CartSection } from "@/components/dashboard/DashboardSections/CartSection";
import { SaleSection } from "@/components/dashboard/DashboardSections/SaleSection";
import { SettingsSection } from "@/components/dashboard/DashboardSections/SettingsSection";
import { UserManagementSection } from "@/components/dashboard/DashboardSections/UserManagementSection";
import { supabase } from "@/lib/supabase";
import Sidebar from "@/components/dashboard/Sidebar";
import { useProfileStore } from "@/stores/profile/profileStore";
import { Skeleton } from "@/components/ui/skeleton";
import { DashboardSection } from "@/types/dashboard";

export default function DashboardPage() {
    const [authChecked, setAuthChecked] = useState(false);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [activeSection, setActiveSection] = useState<DashboardSection | undefined>("dashboard"); const router = useRouter();

    const {
        profile,
        loading: profileLoading,
        fetchProfile,
        isAdmin,
        isArtist
    } = useProfileStore();

    useEffect(() => {
        const checkAuth = async () => {
            const { data: { session }, error } = await supabase.auth.getSession();

            if (!session || error) {
                router.push("/auth");
                return;
            }

            setAuthChecked(true);

            if (!profile) {
                await fetchProfile(session.user.id);
            }
        };

        const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
            if (event === 'SIGNED_OUT') {
                router.push('/auth');
            }
        });

        checkAuth();

        return () => {
            subscription?.unsubscribe();
        };
    }, [router, fetchProfile, profile]);

    const handleSignOut = async () => {
        try {
            const { error } = await supabase.auth.signOut();
            if (error) throw error;
            router.push("/");
        } catch (error) {
            console.error("Error signing out:", error);
        }
    };

    const renderSection = () => {
        if (!authChecked || profileLoading || !profile) {
            return (
                <div className="p-6 space-y-6">
                    <Skeleton className="h-10 w-full" />
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[...Array(6)].map((_, i) => (
                            <Skeleton key={i} className="h-40 rounded-lg" />
                        ))}
                    </div>
                </div>
            );
        }

        switch (activeSection) {
            case "dashboard":
                return <DashboardHome userName={profile?.name || ""} userRole={profile?.role || ""} />;
            case "wishlist":
                return <WishlistSection />;
            case "bids":
                return <BidsSection />;
            case "upload":
                return <UploadSection />;
            case "support":
                return <SupportSection />;
            case "profile":
                return <ProfileSection />;
            case "artworks":
                return <ArtworkSection />;
            case "payouts":
                return <ArtistPayoutSection />;
            case "cart":
                return <CartSection />;
            case "sales": // Changed from "sale" to "sales"
                return <SaleSection />;
            case "settings":
                return <SettingsSection />;
            case "user-management":
                return <UserManagementSection />;
            default:
                return <DashboardHome userName={profile?.name || ""} userRole={profile?.role || ""} />;
        }
    };

    const handleWishlistClick = () => {
        setActiveSection("wishlist");
    };

    const getSectionTitle = () => {
        switch (activeSection) {
            case "dashboard":
                return isAdmin() ? "Admin Dashboard" : "My Dashboard";
            case "wishlist":
                return "My Wishlist";
            case "bids":
                return isAdmin() ? "All Bids" : "My Bids";
            case "upload":
                return "Upload Artwork";
            case "support":
                return "Support Center";
            case "profile":
                return "My Profile";
            case "artworks":
                return isAdmin() ? "Artwork Management" : "My Artworks";
            case "payouts":
                return isAdmin() ? "Payouts" : "My Payouts";
            case "cart":
                return "My Cart";
            case "sales": // Changed from "sale" to "sales"
                return isAdmin() ? "Sales Management" : "My Sales";
            case "settings":
                return "Settings";
            case "user-management":
                return "User Management";
            default:
                return "Dashboard";
        }
    };

    const getSectionDescription = () => {
        switch (activeSection) {
            case "dashboard":
                return isAdmin()
                    ? "Admin overview of platform activity"
                    : "Welcome back! Here is your activity overview";
            case "wishlist":
                return "Manage your saved items";
            case "bids":
                return isAdmin()
                    ? "View and manage all bids on the platform"
                    : "Track your active and past bids";
            case "upload":
                return "Upload your artwork and details";
            case "support":
                return "Get help with your account";
            case "profile":
                return "View and edit your profile";
            case "artworks":
                return isAdmin()
                    ? "Manage all artworks on the platform"
                    : "View and manage your artworks";
            case "payouts":
                return isAdmin()
                    ? "View and manage payouts "
                    : "Manage your earnings and payment methods";
            case "cart":
                return "Review and manage items in your cart";
            case "sales": // Changed from "sale" to "sales"
                return isAdmin()
                    ? "View and manage all sales on the platform"
                    : "Track and manage your sales";
            case "settings":
                return "Manage your account settings and preferences";
            case "user-management":
                return "Manage user accounts and permissions";
            default:
                return "";
        }
    };

    return (
        <div className="flex min-h-screen bg-gray-50">
            <Sidebar
                isOpen={sidebarOpen}
                onClose={() => setSidebarOpen(false)}
                activeSection={activeSection || "dashboard"}
                setActiveSection={setActiveSection}
                isLoading={!authChecked || profileLoading}
                isAdmin={isAdmin()}

            />

            <div className={`flex-1 flex flex-col transition-all duration-300 ${sidebarOpen ? 'lg:ml-64' : ''}`}>
                <DashboardHeader
                    title={getSectionTitle()}
                    description={getSectionDescription()}
                    profile={{ name: profile?.name || "", avatar_url: profile?.avatar_url }}
                    onMenuToggle={() => setSidebarOpen(!sidebarOpen)}
                    onProfileClick={() => setActiveSection("profile")}
                    onSignOut={handleSignOut}
                    loading={!authChecked || profileLoading}
                    onCartClick={() => setActiveSection("cart")}
                    onWishlistClick={handleWishlistClick}
                    wishlistCount={5}

                    activeSection={activeSection || "dashboard"}
                    isAdmin={isAdmin()}
                />

                <main className={`flex-1 overflow-auto p-4 md:p-6 ${sidebarOpen ? 'lg:opacity-100 opacity-70' : 'opacity-100'}`}>
                    {renderSection()}
                </main>
            </div>
        </div>
    );
}
