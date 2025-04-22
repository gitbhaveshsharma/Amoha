"use client";

import { Notification } from "@/stores/notifications/cart/useNotificationStore";
import { formatDistanceToNow } from "date-fns";
import { Button } from "../ui/Button";

interface NotificationItemProps {
    notification: Notification;
    onMarkAsRead: (id: string) => Promise<void>;
}

export function NotificationItem({
    notification,
    onMarkAsRead
}: NotificationItemProps) {
    const handleClick = () => {
        if (!notification.is_read) {
            onMarkAsRead(notification.id);
        }
        // Add navigation logic here if needed
    };

    return (
        <Button
            variant="ghost"
            className={`w-full justify-start text-left h-auto py-3 px-4 rounded-none ${!notification.is_read ? 'bg-blue-50' : ''}`}
            onClick={handleClick}
        >
            <div className="flex items-start gap-3 w-full">
                <div className="flex-1">
                    <p className="font-medium text-sm">{notification.title}</p>
                    <p className="text-sm text-gray-600">{notification.message}</p>
                    {notification.metadata.artwork_title && (
                        <p className="text-xs text-gray-500 mt-1">
                            {notification.metadata.artwork_title}
                            {notification.metadata.artist_name && ` by ${notification.metadata.artist_name}`}
                        </p>
                    )}
                    <p className="text-xs text-gray-400 mt-1">
                        {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                    </p>
                </div>
                {!notification.is_read && (
                    <span className="h-2 w-2 rounded-full bg-blue-500" />
                )}
            </div>
        </Button>
    );
}