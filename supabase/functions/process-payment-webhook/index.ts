// Supabase Edge Function: process-payment-webhook
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const body = await req.json();
    const event = body.event;

    if (event === 'payment.captured' || event === 'order.paid') {
      const paymentEntity = body.payload?.payment?.entity || body.payload?.order?.entity;
      const razorpayOrderId = paymentEntity?.order_id || paymentEntity?.id;
      const razorpayPaymentId = paymentEntity?.id;

      if (razorpayOrderId) {
        // Find payment record
        const { data: payment } = await supabase
          .from('payments')
          .select('*, order:orders(*)')
          .or(`razorpay_order_id.eq.${razorpayOrderId},provider_reference.eq.${razorpayOrderId}`)
          .single();

        if (payment) {
          // Idempotent update
          await supabase
            .from('payments')
            .update({
              payment_status: 'completed',
              razorpay_payment_id: razorpayPaymentId,
              verification_metadata: body,
              updated_at: new Date().toISOString(),
            })
            .eq('id', payment.id);

          await supabase
            .from('orders')
            .update({
              payment_status: 'completed',
              order_status: 'confirmed',
              updated_at: new Date().toISOString(),
            })
            .eq('id', payment.order_id);

          // Notify restaurant
          const order = payment.order;
          if (order) {
            await supabase.from('notifications').insert({
              user_id: order.customer_id,
              title: 'Payment Successful!',
              message: `Payment received for order ${order.order_number}`,
              type: 'payment_status',
              data: { order_id: order.id },
            });
          }
        }
      }
    }

    return new Response(
      JSON.stringify({ status: 'ok' }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (err: any) {
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
