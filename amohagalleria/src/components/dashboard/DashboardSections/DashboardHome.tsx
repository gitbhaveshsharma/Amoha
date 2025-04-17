import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface DashboardHomeProps {
    userName: string;
    userRole: string;
}

export function DashboardHome({ userName, userRole }: DashboardHomeProps) {
    return (
        <>
            {/* Welcome Card */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">Welcome back, {userName}!</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="bg-primary/10 p-6 rounded-lg">
                        <p className="text-primary">
                            You are logged in as {userRole}. Here you can manage your account and access all the features available to you.
                        </p>
                    </div>
                </CardContent>
            </Card>

            {/* Stats Cards */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">Your Stats</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="border rounded-lg p-4">
                            <h3 className="text-sm font-medium text-muted-foreground">Account Status</h3>
                            <p className="text-2xl font-bold mt-2">Active</p>
                            <p className="text-sm text-green-600 mt-1">✓ Verified</p>
                        </div>

                        <div className="border rounded-lg p-4">
                            <h3 className="text-sm font-medium text-muted-foreground">Last Login</h3>
                            <p className="text-2xl font-bold mt-2">Today</p>
                            <p className="text-sm text-muted-foreground mt-1">Just now</p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </>
    )
}
