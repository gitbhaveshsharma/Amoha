"use client";
import { ReactNode } from "react";
import { cn } from "@/lib/utils";
import Sidebar from "../dashboard/Sidebar";

interface DashboardLayoutProps {
    children: ReactNode;
    sidebarOpen: boolean;
    setSidebarOpen: (open: boolean) => void;
    className?: string;
}

export function DashboardLayout({
    children,
    sidebarOpen,
    setSidebarOpen,
    className,
}: DashboardLayoutProps) {
    return (
        <div className={cn(
            "min-h-screen bg-gray-50",
            className
        )}>
            <Sidebar
                isOpen={sidebarOpen}
                onClose={() => setSidebarOpen(false)}
                activeSection="dashboard"
                setActiveSection={(section) => console.log(section)}
            />

            <div className={cn(
                "flex-1 transition-all duration-300 ease-in-out",
                sidebarOpen ? "md:ml-64" : "ml-0"
            )}>
                {children}
            </div>
        </div>
    );
}