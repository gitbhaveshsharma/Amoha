//dashboard layout for the dashboard app
"use client";
import { ReactNode } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";


interface DashboardLayoutProps {
    children: ReactNode;
    title: string;
    description: string;
    profile: {
        name: string;
        avatar_url?: string;
    };
    sidebarOpen: boolean;
    setSidebarOpen: (open: boolean) => void;
    onMenuToggle: () => void;
    onProfileClick: () => void;
    onSignOut: () => void;
}

export default function DashboardPageLayout({
    children,
    sidebarOpen,
    setSidebarOpen,
}: DashboardLayoutProps) {
    return (
        <DashboardLayout sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen}>

            {children}
        </DashboardLayout>
    );
}
