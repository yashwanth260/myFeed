// Supabase Edge Function: calculate-pricing
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { items, baseDeliveryFeePaise, freeDeliveryThresholdPaise, couponCode } = await req.json();

    if (!Array.isArray(items) || items.length === 0) {
      return new Response(
        JSON.stringify({ error: 'Items array cannot be empty' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 1. Calculate subtotal
    const subtotal_paise = items.reduce((acc: number, item: any) => {
      const custTotal = (item.customizations || []).reduce((cAcc: number, c: any) => cAcc + (c.price_paise || 0), 0);
      return acc + (item.unit_price_paise + custTotal) * item.quantity;
    }, 0);

    // 2. Discount logic
    let discount_paise = 0;
    let couponApplied = null;
    if (couponCode) {
      if (couponCode.toUpperCase() === 'WELCOME50') {
        discount_paise = Math.min(10000, Math.round(subtotal_paise * 0.5));
        couponApplied = { code: 'WELCOME50', discount_paise };
      } else if (couponCode.toUpperCase() === 'CRAVE20') {
        discount_paise = 5000;
        couponApplied = { code: 'CRAVE20', discount_paise };
      } else if (couponCode.toUpperCase() === 'FREEDEL') {
        discount_paise = baseDeliveryFeePaise || 4000;
        couponApplied = { code: 'FREEDEL', discount_paise };
      }
    }

    // 3. Delivery Fee
    let delivery_fee_paise = baseDeliveryFeePaise || 4000;
    if (freeDeliveryThresholdPaise && subtotal_paise >= freeDeliveryThresholdPaise) {
      delivery_fee_paise = 0;
    }

    // 4. Tax (5% GST) & Service Fee (₹15)
    const taxable = Math.max(0, subtotal_paise - discount_paise);
    const tax_paise = Math.round(taxable * 0.05);
    const service_fee_paise = 1500; // ₹15

    const final_total_paise = taxable + delivery_fee_paise + service_fee_paise + tax_paise;

    return new Response(
      JSON.stringify({
        subtotal_paise,
        discount_paise,
        delivery_fee_paise,
        service_fee_paise,
        tax_paise,
        final_total_paise,
        coupon_applied: couponApplied,
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (err: any) {
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
