import { supabase } from "@/lib/supabase";
import { PayoutRequest, ExportFormat } from "@/types";


export const PayoutHistoryService = {
    async fetchPayoutHistory(userId: string): Promise<PayoutRequest[]> {
        const { data, error } = await supabase
            .from('payout_requests')
            .select('*')
            .eq('artist_id', userId)
            .order('created_at', { ascending: false });

        if (error) throw new Error(error.message);
        return data || [];
    },

    async exportPayouts(userId: string, payoutIds: string[], format: ExportFormat): Promise<void> {
        // In a real app, this would call your backend API to generate the export
        // For demo purposes, we'll simulate this with a client-side export

        const { data, error } = await supabase
            .from('payout_requests')
            .select('*')
            .eq('artist_id', userId)
            .in('id', payoutIds);

        if (error) throw new Error(error.message);

        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 1000));

        return this.generateExportFile(data || [], format);
    },

    async generateExportFile(payouts: PayoutRequest[], format: ExportFormat): Promise<void> {
        if (format === 'excel') {
            return this.generateExcel(payouts);
        } else if (format === 'csv') {
            return this.generateCSV(payouts);
        } else {
            return this.generateJSON(payouts);
        }
    },

    async generateExcel(payouts: PayoutRequest[]): Promise<void> {
        const XLSX = await import('xlsx');
        const aoaData = [
            ['Payout ID', 'Amount', 'Currency', 'Status', 'Request Date', 'Processed Date'],
            ...payouts.map(p => [
                p.id,
                p.amount,
                p.currency,
                p.status,
                new Date(p.created_at).toLocaleDateString(),
                p.processed_at ? new Date(p.processed_at).toLocaleDateString() : 'N/A'
            ])
        ];
        const worksheet = XLSX.utils.aoa_to_sheet(aoaData);

        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Payouts');
        XLSX.writeFile(workbook, `payouts_${new Date().toISOString().slice(0, 10)}.xlsx`);
    },

    async generateCSV(payouts: PayoutRequest[]): Promise<void> {
        const headers = ['Payout ID,Amount,Currency,Status,Request Date,Processed Date'];
        const rows = payouts.map(p =>
            `${p.id},${p.amount},${p.currency},${p.status},"${new Date(p.created_at).toLocaleDateString()}","${p.processed_at ? new Date(p.processed_at).toLocaleDateString() : 'N/A'
            }"`
        );

        const csvContent = [...headers, ...rows].join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);

        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', `payouts_${new Date().toISOString().slice(0, 10)}.csv`);
        link.click();
    },

    async generateJSON(payouts: PayoutRequest[]): Promise<void> {
        const data = JSON.stringify(payouts, null, 2);
        const blob = new Blob([data], { type: 'application/json' });
        const url = URL.createObjectURL(blob);

        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', `payouts_${new Date().toISOString().slice(0, 10)}.json`);
        link.click();
    }
};