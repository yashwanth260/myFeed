// Supabase Edge Function: update-order-status
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const ALLOWED_TRANSITIONS: Record<string, string[]> = {
  pending: ['confirmed', 'rejected', 'cancelled', 'payment_failed'],
  confirmed: ['preparing', 'cancelled'],
  preparing: ['ready_for_pickup'],
  ready_for_pickup: ['picked_up'],
  picked_up: ['out_for_delivery'],
  out_for_delivery: ['delivered'],
  delivered: [],
  rejected: [],
  cancelled: [],
  payment_failed: ['pending'],
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const authHeader = req.headers.get('Authorization') || '';
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized user' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { order_id, new_status, reason } = await req.json();

    if (!order_id || !new_status) {
      return new Response(
        JSON.stringify({ error: 'order_id and new_status are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Fetch existing order
    const { data: order, error: orderErr } = await supabase
      .from('orders')
      .select('*')
      .eq('id', order_id)
      .single();

    if (orderErr || !order) {
      return new Response(
        JSON.stringify({ error: 'Order not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const currentStatus = order.order_status;
    const allowed = ALLOWED_TRANSITIONS[currentStatus] || [];

    if (!allowed.includes(new_status)) {
      return new Response(
        JSON.stringify({
          error: `Invalid status transition from '${currentStatus}' to '${new_status}'`,
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Update order status
    const updatePayload: any = {
      order_status: new_status,
      updated_at: new.toISOString(),
    };
    if (new_status === 'rejected') updatePayload.rejection_reason = reason;
    if (new_status === 'cancelled') updatePayload.cancellation_reason = reason;

    const { data: updatedOrder, error: updateErr } = await supabase
      .from('orders')
      .update(updatePayload)
      .eq('id', order_id)
      .select()
      .single();

    if (updateErr) {
      return new Response(
        JSON.stringify({ error: updateErr.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Record status history
    await supabase.from('order_status_history').insert({
      order_id,
      previous_status: currentStatus,
      new_status,
      actor_id: user.id,
      reason: reason || null,
    });

    // Notify Customer
    await supabase.from('notifications').insert({
      user_id: order.customer_id,
      title: `Order Update: ${updatedOrder.order_number}`,
      message: `Status updated to ${new_status.replace(/_/g, ' ')}`,
      type: 'order_update',
      data: { order_id, status: new_status },
    });

    return new Response(
      JSON.stringify({ success: true, order: updatedOrder }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (err: any) {
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
