// Supabase Edge Function: assign-delivery-partner
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

    const authHeader = req.headers.get('Authorization') || '';
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized user' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { order_id, delivery_partner_id } = await req.json();

    if (!order_id || !delivery_partner_id) {
      return new Response(
        JSON.stringify({ error: 'order_id and delivery_partner_id are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if assignment already exists
    const { data: existing } = await supabase
      .from('delivery_assignments')
      .select('*')
      .eq('order_id', order_id)
      .single();

    if (existing && existing.assignment_status === 'accepted') {
      return new Response(
        JSON.stringify({ error: 'Order is already assigned and accepted by another partner' }),
        { status: 409, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    let assignment;
    if (existing) {
      const { data: updated, error } = await supabase
        .from('delivery_assignments')
        .update({
          delivery_partner_id,
          assignment_status: 'offered',
          offered_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', existing.id)
        .select()
        .single();
      assignment = updated;
    } else {
      const { data: inserted, error } = await supabase
        .from('delivery_assignments')
        .insert({
          order_id,
          delivery_partner_id,
          assignment_status: 'offered',
        })
        .select()
        .single();
      assignment = inserted;
    }

    // Notify delivery partner
    await supabase.from('notifications').insert({
      user_id: delivery_partner_id,
      title: 'New Delivery Offered!',
      message: 'You have a new delivery assignment offer.',
      type: 'delivery_assigned',
      data: { order_id, assignment_id: assignment.id },
    });

    return new Response(
      JSON.stringify({ success: true, assignment }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (err: any) {
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
