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
import { CartSection } from "@/components/dashboard/DashboardSections/CartSection"; // Import CartSection
import { supabase } from "@/lib/supabase";
import Sidebar from "@/components/dashboard/Sidebar";
import { useProfileStore } from "@/stores/profile/profileStore";
import { Skeleton } from "@/components/ui/skeleton";

type DashboardSection =
    | "dashboard"
    | "wishlist"
    | "bids"
    | "support"
    | "profile"
    | "upload"
    | "artworks"
    | "payouts"
    | "cart"; // Added "cart" section

export default function DashboardPage() {
    const [authChecked, setAuthChecked] = useState(false);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [activeSection, setActiveSection] = useState<DashboardSection>("dashboard");
    const router = useRouter();

    const {
        profile,
        loading: profileLoading,
        fetchProfile,
    } = useProfileStore();

    useEffect(() => {
        const checkAuth = async () => {
            const { data: { session }, error } = await supabase.auth.getSession();

            if (!session || error) {
                router.push("/auth");
                return;
            }

            setAuthChecked(true);

            // Fetch profile only if not already loaded
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
            default:
                return <DashboardHome userName={profile?.name || ""} userRole={profile?.role || ""} />;
        }
    };

    const getSectionTitle = () => {
        switch (activeSection) {
            case "dashboard": return "Dashboard Overview";
            case "wishlist": return "My Wishlist";
            case "bids": return "My Bids";
            case "upload": return "Upload Artwork";
            case "support": return "Support Center";
            case "profile": return "My Profile";
            case "artworks": return "My Artworks";
            case "payouts": return "Artist Payouts";
            case "cart": return "My Cart"; // Added title for "cart"
            default: return "Dashboard";
        }
    };

    const getSectionDescription = () => {
        switch (activeSection) {
            case "dashboard": return "Welcome back! Here is your activity overview";
            case "wishlist": return "Manage your saved items";
            case "bids": return "Track your active and past bids";
            case "upload": return "Upload your artwork and details";
            case "support": return "Get help with your account";
            case "profile": return "View and edit your profile";
            case "artworks": return "View and manage your artworks";
            case "payouts": return "Manage your earnings and payment methods";
            case "cart": return "Review and manage items in your cart"; // Added description for "cart"
            default: return "";
        }
    };

    return (
        <div className="flex min-h-screen bg-gray-50">
            <Sidebar
                isOpen={sidebarOpen}
                onClose={() => setSidebarOpen(false)}
                activeSection={activeSection}
                setActiveSection={setActiveSection}
                isLoading={!authChecked || profileLoading}
            />

            <div className={`flex-1 flex flex-col transition-all duration-300 ${sidebarOpen ? 'lg:ml-64' : ''}`}>
                {/* Header with no padding container */}
                <DashboardHeader
                    title={getSectionTitle()}
                    description={getSectionDescription()}
                    profile={{ name: profile?.name || "", avatar_url: profile?.avatar_url }}
                    onMenuToggle={() => setSidebarOpen(!sidebarOpen)}
                    onProfileClick={() => setActiveSection("profile")}
                    onSignOut={handleSignOut}
                    loading={!authChecked || profileLoading}
                    onCartClick={() => setActiveSection("cart")} // Added cart button handler
                />

                {/* Main content - padding can be handled by individual sections */}
                <main className={`flex-1 overflow-auto p-4 md:p-6 ${sidebarOpen ? 'lg:opacity-100 opacity-70' : 'opacity-100'}`}>
                    {renderSection()}
                </main>
            </div>
        </div>
    );
}