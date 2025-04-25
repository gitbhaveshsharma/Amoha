"use client";

import { Loader2 } from "lucide-react";
import { NotificationItem } from "./NotificationItem";
import { Notification } from "@/stores/notifications/cart/useNotificationStore";

interface NotificationListProps {
    notifications: Notification[];
    isLoading: boolean;
    onMarkAsRead: (id: string) => Promise<void>;
}

export function NotificationList({
    notifications,
    isLoading,
    onMarkAsRead
}: NotificationListProps) {
    if (isLoading) {
        return (
            <div className="p-4 flex justify-center">
                <Loader2 className="h-5 w-5 animate-spin" />
            </div>
        );
    }

    if (notifications.length === 0) {
        return <div className="p-4 text-sm text-center">No notifications yet</div>;
    }

    return (
        <div className="divide-y">
            {notifications.map((notification) => (
                <NotificationItem
                    key={notification.id}
                    notification={notification}
                    onMarkAsRead={onMarkAsRead}
                />
            ))}
        </div>
    );
}