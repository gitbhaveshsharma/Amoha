import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function BidsSection() {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-lg">Your Bids</CardTitle>
            </CardHeader>
            <CardContent>
                <p>Your active bids will appear here</p>
            </CardContent>
        </Card>
    )
}
