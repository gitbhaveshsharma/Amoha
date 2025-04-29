import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/Button";
import { Textarea } from "@/components/ui/textarea";

interface BidWithdrawalModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (withdrawalReason: string) => Promise<void>;
}

export function BidWithdrawalModal({ isOpen, onClose, onSubmit }: BidWithdrawalModalProps) {
    const [withdrawalReason, setWithdrawalReason] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async () => {
        if (!withdrawalReason.trim()) {
            alert("Please provide a withdrawal reason");
            return;
        }

        setIsSubmitting(true);
        try {
            await onSubmit(withdrawalReason);
            onClose();
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Withdraw Bid</DialogTitle>
                    <DialogDescription>
                        Please provide a reason for withdrawing your bid
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="reason">Reason</Label>
                        <Textarea
                            id="reason"
                            value={withdrawalReason}
                            onChange={(e) => setWithdrawalReason(e.target.value)}
                            placeholder="Enter your reason for withdrawing this bid..."
                        />
                    </div>

                    <div className="flex justify-end space-x-2">
                        <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
                            Cancel
                        </Button>
                        <Button onClick={handleSubmit} disabled={isSubmitting}>
                            {isSubmitting ? "Submitting..." : "Confirm Withdrawal"}
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}