// components/notifications/NotificationBell.tsx
"use client";

import { Bell, BellRing } from "lucide-react";
import { useEffect } from "react";
import { useNotificationStore } from "@/stores/notifications/cart/useNotificationStore";
import { NotificationList } from "./NotificationList";
import { Button } from "../ui/Button";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";

export function NotificationBell() {
    const {
        notifications,
        unreadCount,
        isLoading,
        fetchNotifications,
        subscribeToRealtime,
        markAsRead
    } = useNotificationStore();

    useEffect(() => {
        fetchNotifications();
        const unsubscribe = subscribeToRealtime();
        return unsubscribe; // No need to call as it's already a function
    }, [fetchNotifications, subscribeToRealtime]);

    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                    {unreadCount > 0 ? (
                        <BellRing className="h-5 w-5" />
                    ) : (
                        <Bell className="h-5 w-5" />
                    )}
                    {unreadCount > 0 && (
                        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                            {unreadCount > 9 ? "9+" : unreadCount}
                        </span>
                    )}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-0" align="end">
                <NotificationList
                    notifications={notifications}
                    isLoading={isLoading}
                    onMarkAsRead={markAsRead}
                />
            </PopoverContent>
        </Popover>
    );
}