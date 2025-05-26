// services/salesService.ts
import { supabase } from '@/lib/supabase';
import {
    AdminSale,
    SalesFilterParams,
    SalesSummary,
    SalesResponse,
} from '@/types/sale';

export const fetchSalesSummary = async (
    params: SalesFilterParams = {}
): Promise<SalesSummary> => {
    const { data, error } = await supabase
        .rpc('get_sales_summary', {
            p_date_from: params.date_from || null,
            p_date_to: params.date_to || null,
            p_artist_id: params.artist_id || null,
            p_buyer_id: params.buyer_id || null,
            p_status_filter: params.status || null,
            p_country_filter: params.country || null,
            p_group_by_period: params.group_by_period || null,
        });

    if (error) {
        console.error('Error fetching sales summary:', error);
        throw error;
    }

    return data as SalesSummary;
};

export const fetchSales = async (
    params: SalesFilterParams = {},
    page: number = 1,
    limit: number = 20
): Promise<SalesResponse> => {
    const offset = (page - 1) * limit;

    let query = supabase
        .from('sales')
        .select(`
            *,
            artwork:artwork_id (
                *,
                artist:user_id (
                    id,
                    name,
                    email
                )
            ),
            buyer:buyer_id (
                id,
                name,
                email
            ),
            tax_breakdown
        `, { count: 'exact' })
        .order('sold_at', { ascending: false })
        .range(offset, offset + limit - 1);

    // Apply filters
    if (params.date_from) {
        query = query.gte('sold_at', params.date_from);
    }
    if (params.date_to) {
        query = query.lte('sold_at', params.date_to);
    }
    if (params.artist_id) {
        query = query.eq('artwork.user_id', params.artist_id);
    }
    if (params.buyer_id) {
        query = query.eq('buyer_id', params.buyer_id);
    }
    if (params.status) {
        query = query.eq('status', params.status);
    }
    if (params.country) {
        query = query.eq('shipping_country', params.country);
    }

    const { data, count, error } = await query;

    if (error) {
        console.error('Error fetching sales:', error);
        throw error;
    }

    const totalItems = count || 0;
    const totalPages = Math.ceil(totalItems / limit);

    return {
        data: data as unknown as AdminSale[],
        pagination: {
            current_page: page,
            total_pages: totalPages,
            total_items: totalItems,
            limit: limit
        }
    };
};

export const updateSaleStatus = async (
    saleId: string,
    status: 'pending' | 'completed' | 'disputed' | 'refunded'
): Promise<void> => {
    const { error } = await supabase
        .from('sales')
        .update({ status })
        .eq('id', saleId);

    if (error) {
        console.error('Error updating sale status:', error);
        throw error;
    }
};

export const initiateRefund = async (saleId: string): Promise<void> => {
    // First update the status to refunded
    await updateSaleStatus(saleId, 'refunded');

    // Here you would typically call your payment provider's API to process the refund
    // For example, if using Stripe:
    // const { error } = await supabase.functions.invoke('process-refund', {
    //     body: { saleId }
    // });

    // For now, we'll just simulate a successful refund
    const { error } = await supabase
        .from('sales')
        .update({
            status: 'refunded',
            payout_completed_at: new Date().toISOString()
        })
        .eq('id', saleId);

    if (error) {
        console.error('Error initiating refund:', error);
        throw error;
    }
};

export const fetchSaleDetails = async (saleId: string): Promise<AdminSale> => {
    const { data, error } = await supabase
        .from('sales')
        .select(`
            *,
            artwork:artwork_id (
                *,
                artist:user_id (
                    id,
                    name,
                    email
                )
            ),
            buyer:buyer_id (
                id,
                name,
                email
            ),
            tax_breakdown
        `)
        .eq('id', saleId)
        .single();

    if (error) {
        console.error('Error fetching sale details:', error);
        throw error;
    }

    return data as unknown as AdminSale;
};