import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function SupportSection() {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-lg">Support Center</CardTitle>
            </CardHeader>
            <CardContent>
                <p>Contact support or browse help articles</p>
            </CardContent>
        </Card>
    )
}
