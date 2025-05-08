"use client";

import { Button } from "@/components/ui/Button";
import { CheckCircle2, Clock } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface UploadSuccessProps {
    onClose: () => void;
    artworkTitle: string;
}

export const UploadSuccess = ({ onClose, artworkTitle }: UploadSuccessProps) => {
    const router = useRouter();
    const [timer, setTimer] = useState(5);

    useEffect(() => {
        if (timer > 0) {
            const countdown = setTimeout(() => setTimer(timer - 1), 1000);
            return () => clearTimeout(countdown);
        } else {
            onClose();
        }
    }, [timer, onClose]);

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60] flex items-center justify-center">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-xl">
                <div className="flex flex-col items-center text-center space-y-4">
                    <CheckCircle2 className="h-12 w-12 text-green-500" />
                    <h3 className="text-xl font-bold">Upload Successful!</h3>
                    <p className="text-muted-foreground">
                        Your artwork <span className="font-semibold">&quot;{artworkTitle}&quot;</span> has been
                        successfully uploaded and is pending review.
                    </p>
                    <div className="flex gap-4 w-full mt-4">
                        <Button
                            variant="outline"
                            className="flex-1"
                            onClick={onClose}
                        >
                            <Clock className="h-4 w-4 mr-2" />
                            Close ({timer}s)
                        </Button>
                        <Button
                            className="flex-1"
                            onClick={() => {
                                onClose();
                                router.push("/dashboard");
                            }}
                        >
                            View Artwork
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};
