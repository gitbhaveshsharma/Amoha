import { useState, useEffect } from "react";
import { NotificationService } from "@/lib/notificationService";
import { useUser } from "@supabase/auth-helpers-react";
import { Button } from "@/components/ui/Button";
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { getDeviceId } from "@/lib/deviceFingerprint";

export const NotificationPrompt = () => {
    const [visible, setVisible] = useState(false);
    const [loading, setLoading] = useState(false);
    const user = useUser();

    const form = useForm({
        defaultValues: {
            email: "",
        },
    });

    useEffect(() => {
        const checkPrompt = async () => {
            try {
                const shouldShow = await NotificationService.trackDeviceAndCheckPrompt(user?.id);
                setVisible(shouldShow);
            } catch (error) {
                console.error("Error checking notification prompt:", error);
            }
        };

        const timer = setTimeout(checkPrompt, 3000);
        return () => clearTimeout(timer);
    }, [user]);

    const handleAllowNotifications = async () => {
        try {
            setLoading(true);

            const deviceId = await getDeviceId();
            if (!deviceId) {
                toast.error("Could not identify device");
                return;
            }

            // Set all preferences to true by default
            const preferences = {
                is_push_enabled: true,
                is_email_enabled: true,
                marketing: true,
                order_updates: true,
            };

            const { success, error } = await NotificationService.savePreferences(
                deviceId,
                form.getValues("email") || "",
                preferences,
                user?.id
            );

            if (!success) {
                toast.error(error || "Failed to save preferences");
                return;
            }

            // Initialize push notifications
            const { success: pushSuccess, error: pushError } =
                await NotificationService.initializePushNotifications();

            if (!pushSuccess) {
                toast.warn(pushError || "Push notifications not supported");
            }

            toast.success("Notifications enabled!");
            setVisible(false);
        } catch (error) {
            console.error("Error enabling notifications:", error);
            toast.error("Failed to enable notifications");
        } finally {
            setLoading(false);
        }
    };

    const handleDismiss = () => {
        setVisible(false);
    };

    if (!visible) return null;

    return (
        <Dialog open={visible} onOpenChange={setVisible}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Stay Updated</DialogTitle>
                </DialogHeader>

                <div className="space-y-4">
                    <p className="mb-4">Get important updates and offers</p>

                    {!user && (
                        <div className="mb-4">
                            <label className="block text-sm font-medium mb-2">Email Address</label>
                            <Input
                                placeholder="your@email.com"
                                {...form.register("email", {
                                    required: "Email is required",
                                    pattern: {
                                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                        message: "Invalid email address",
                                    },
                                })}
                            />
                            {form.formState.errors.email && (
                                <p className="text-sm text-red-500">{form.formState.errors.email.message}</p>
                            )}
                        </div>
                    )}

                    <DialogFooter className="mt-6">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={handleDismiss}
                        >
                            Maybe Later
                        </Button>
                        <Button
                            type="button"
                            onClick={handleAllowNotifications}
                            disabled={loading}
                        >
                            {loading ? "Enabling..." : "Allow Notifications"}
                        </Button>
                    </DialogFooter>
                </div>
            </DialogContent>
        </Dialog>
    );
};