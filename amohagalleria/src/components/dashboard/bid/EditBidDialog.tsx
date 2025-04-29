// components/bids/EditBidDialog.tsx
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/Button";

export function EditBidDialog({
    isOpen,
    onClose,
    onSubmit,
    editForm,
    setEditForm,
}: {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (e: React.FormEvent) => void;
    editForm: { amount: number; message: string; is_auto_bid: boolean; max_auto_bid?: number };
    setEditForm: (form: { amount: number; message: string; is_auto_bid: boolean; max_auto_bid?: number }) => void;
}) {
    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Edit Your Bid</DialogTitle>
                </DialogHeader>
                <form onSubmit={onSubmit} className="space-y-4">
                    <div>
                        <Label htmlFor="amount">Bid Amount</Label>
                        <Input
                            id="amount"
                            type="number"
                            value={editForm.amount}
                            onChange={(e) => setEditForm({ ...editForm, amount: Number(e.target.value) })}
                            min={editForm.amount}
                            step="any"
                            required
                        />
                    </div>
                    <div>
                        <Label htmlFor="message">Message (Optional)</Label>
                        <Textarea
                            id="message"
                            value={editForm.message}
                            onChange={(e) => setEditForm({ ...editForm, message: e.target.value })}
                            className="min-h-[100px]"
                        />
                    </div>
                    <div className="flex items-center space-x-2">
                        <Switch
                            id="auto-bid"
                            checked={editForm.is_auto_bid}
                            onCheckedChange={(checked) => setEditForm({ ...editForm, is_auto_bid: checked })}
                        />
                        <Label htmlFor="auto-bid">Enable Auto Bid</Label>
                    </div>
                    {editForm.is_auto_bid && (
                        <div>
                            <Label htmlFor="max-auto-bid">Maximum Auto Bid</Label>
                            <Input
                                id="max-auto-bid"
                                type="number"
                                value={editForm.max_auto_bid}
                                onChange={(e) => setEditForm({ ...editForm, max_auto_bid: Number(e.target.value) })}
                                min={editForm.amount}
                                step="any"
                                required={editForm.is_auto_bid}
                            />
                        </div>
                    )}
                    <div className="flex justify-end space-x-2 pt-4">
                        <Button variant="outline" type="button" onClick={onClose}>
                            Cancel
                        </Button>
                        <Button type="submit">Save Changes</Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}