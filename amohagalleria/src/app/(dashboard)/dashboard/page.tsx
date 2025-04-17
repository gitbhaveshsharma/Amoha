"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { DashboardLoader } from "@/components/dashboard/DashboardLoader";
import { DashboardHome } from "@/components/dashboard/DashboardSections/DashboardHome";
import { ProfileCard as ProfileSection } from "@/components/dashboard/DashboardSections/ProfileSection";
import { WishlistSection } from "@/components/dashboard/DashboardSections/WishlistSection"; // Ensure this file exists or update the path
import { BidsSection } from "@/components/dashboard/DashboardSections/BidsSection";
import { UploadSection } from "@/components/dashboard/DashboardSections/UploadSection"; // Ensure this file exists at the specified path
import { SupportSection } from "@/components/dashboard/DashboardSections/SupportSection";
import { ArtworkSection } from "@/components/dashboard/DashboardSections/ArtworkSection";
import { supabase } from "@/lib/supabase";
import Sidebar from "@/components/dashboard/Sidebar";

type DashboardSection =
    | "dashboard"
    | "wishlist"
    | "bids"
    | "support"
    | "profile"
    | "upload"
    | "artworks";

interface ProfileData {
    id: string;
    name: string;
    email: string;
    role: string;
    created_at: string;
    avatar_url?: string;
    user_id: string;
    bio?: string;
    address?: string;
}

export default function DashboardPage() {
    const [profile, setProfile] = useState<ProfileData | null>(null);
    const [loading, setLoading] = useState(true);
    const [authChecked, setAuthChecked] = useState(false);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [activeSection, setActiveSection] = useState<DashboardSection>("dashboard");
    const router = useRouter();

    useEffect(() => {
        const checkAuth = async () => {
            const { data: { session }, error } = await supabase.auth.getSession();

            if (!session || error) {
                router.push("/auth");
                return;
            }

            setAuthChecked(true);
            await fetchProfile(session.user.id);
        };

        const fetchProfile = async (userId: string) => {
            try {
                const { data: profileData, error } = await supabase
                    .from("profile")
                    .select("*")
                    .eq("user_id", userId)
                    .single();

                if (error) throw error;

                setProfile({
                    id: profileData.id,
                    name: profileData.name,
                    email: profileData.email,
                    role: profileData.role,
                    created_at: profileData.created_at,
                    avatar_url: profileData.avatar_url,
                    user_id: profileData.user_id,
                    bio: profileData.bio || "",
                    address: profileData.address || "",
                });
            } catch (error) {
                console.error("Error fetching profile:", error);
                router.push("/auth");
            } finally {
                setLoading(false);
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
    }, [router]);

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
        switch (activeSection) {
            case "dashboard":
                return <DashboardHome userName={profile?.name || ""} userRole={profile?.role || ""} />;
            case "wishlist":
                return <WishlistSection />;
            case "bids":
                return <BidsSection />;
            case "upload":
                return (
                    <UploadSection

                    />
                );
            case "support":
                return <SupportSection />;
            case "profile":
                return profile ? (
                    <ProfileSection
                        profile={profile}
                        onUpdate={(updatedProfile) => setProfile(updatedProfile)}
                    />
                ) : null;
            case "artworks":
                return <ArtworkSection />;
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
            default: return "";
        }
    };

    if (!authChecked || loading || !profile) {
        return <DashboardLoader />;
    }

    // In your main dashboard component
    return (
        <div className="flex min-h-screen bg-gray-50">
            <Sidebar
                isOpen={sidebarOpen}
                onClose={() => setSidebarOpen(false)}
                activeSection={activeSection}
                setActiveSection={setActiveSection}
            />

            <div className={`flex-1 flex flex-col transition-all duration-300 ${sidebarOpen ? 'lg:ml-64' : ''}`}>
                <DashboardHeader
                    title={getSectionTitle()}
                    description={getSectionDescription()}
                    profile={{ name: profile.name, avatar_url: profile.avatar_url }}
                    onMenuToggle={() => setSidebarOpen(!sidebarOpen)}
                    onProfileClick={() => setActiveSection("profile")}
                    onSignOut={handleSignOut}

                />

                <main
                    className={`flex-1 overflow-auto transition-opacity ${sidebarOpen ? 'lg:opacity-100 opacity-70' : 'opacity-100'}`}
                // style={{ maxHeight: 'calc(100vh - 64px)' }}
                >
                    {renderSection()}
                </main>
            </div>
        </div>
    );
}