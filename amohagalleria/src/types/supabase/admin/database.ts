export type Database = {
    public: {
        Tables: {
            profile: {
                Row: {
                    user_id: string;
                    email: string;
                    name: string | null;
                    role: 'admin' | 'bidder' | 'artist';
                    notification_opt_in: boolean;
                    created_at: string;
                    updated_at: string | null;
                };
                Insert: {
                    user_id: string;
                    email: string;
                    name?: string | null;
                    role: 'admin' | 'bidder' | 'artist';
                    notification_opt_in?: boolean;
                    created_at?: string;
                    updated_at?: string | null;
                };
                Update: {
                    user_id?: string;
                    email?: string;
                    name?: string | null;
                    role?: 'admin' | 'user' | 'editor';
                    notification_opt_in?: boolean;
                    created_at?: string;
                    updated_at?: string | null;
                };
            };
            // Add other tables as needed
        };
        Views: {
            [_ in never]: never;
        };
        Functions: {
            [_ in never]: never;
        };
        Enums: {
            [_ in never]: never;
        };
    };
};