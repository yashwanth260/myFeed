// Supabase Edge Function: create-order
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

    const { restaurant_id, address_id, payment_method, coupon_code, items, address_snapshot } = await req.json();

    if (!restaurant_id || !address_snapshot || !items || items.length === 0) {
      return new Response(
        JSON.stringify({ error: 'Invalid order parameters' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Fetch restaurant for fee settings
    const { data: restaurant, error: resErr } = await supabase
      .from('restaurants')
      .select('*')
      .eq('id', restaurant_id)
      .single();

    if (resErr || !restaurant) {
      return new Response(
        JSON.stringify({ error: 'Restaurant not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Calculate server-side total
    const subtotal_paise = items.reduce((acc: number, item: any) => {
      const custTotal = (item.customizations || []).reduce((cAcc: number, c: any) => cAcc + (c.price_paise || 0), 0);
      return acc + (item.unit_price_paise + custTotal) * item.quantity;
    }, 0);

    let discount_paise = 0;
    if (coupon_code) {
      if (coupon_code.toUpperCase() === 'WELCOME50') {
        discount_paise = Math.min(10000, Math.round(subtotal_paise * 0.5));
      } else if (coupon_code.toUpperCase() === 'CRAVE20') {
        discount_paise = 5000;
      }
    }

    let delivery_fee_paise = restaurant.base_delivery_fee_paise || 4000;
    if (restaurant.free_delivery_threshold_paise && subtotal_paise >= restaurant.free_delivery_threshold_paise) {
      delivery_fee_paise = 0;
    }

    const taxable = Math.max(0, subtotal_paise - discount_paise);
    const tax_paise = Math.round(taxable * 0.05);
    const service_fee_paise = 1500;
    const final_total_paise = taxable + delivery_fee_paise + service_fee_paise + tax_paise;

    const orderNumber = `CC-${Date.now().toString().slice(-6)}-${Math.floor(100 + Math.random() * 900)}`;

    // Insert Order
    const { data: order, error: orderErr } = await supabase
      .from('orders')
      .insert({
        order_number: orderNumber,
        customer_id: user.id,
        restaurant_id,
        address_snapshot,
        order_status: 'pending',
        payment_status: payment_method === 'cod' ? 'pending' : 'pending',
        payment_method,
        subtotal_paise,
        discount_paise,
        delivery_fee_paise,
        service_fee_paise,
        tax_paise,
        final_total_paise,
        coupon_code: coupon_code || null,
        estimated_delivery_time: new Date(Date.now() + (restaurant.estimated_prep_time_minutes + 20) * 60000).toISOString(),
      })
      .select()
      .single();

    if (orderErr || !order) {
      return new Response(
        JSON.stringify({ error: orderErr?.message || 'Failed to create order' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Insert Order Items
    const orderItemsPayload = items.map((item: any) => ({
      order_id: order.id,
      menu_item_id: item.menu_item_id,
      item_name: item.menu_item?.name || item.name || 'Food Item',
      unit_price_paise: item.unit_price_paise,
      quantity: item.quantity,
      customization_snapshot: item.customizations || [],
      line_total_paise: (item.unit_price_paise + (item.customizations || []).reduce((a: number, b: any) => a + (b.price_paise || 0), 0)) * item.quantity,
    }));

    await supabase.from('order_items').insert(orderItemsPayload);

    // Record Order Status History
    await supabase.from('order_status_history').insert({
      order_id: order.id,
      previous_status: null,
      new_status: 'pending',
      actor_id: user.id,
      reason: 'Order placed by customer',
    });

    // Create Payment record
    const { data: payment } = await supabase.from('payments').insert({
      order_id: order.id,
      provider: payment_method,
      amount_paise: final_total_paise,
      currency: 'INR',
      payment_status: 'pending',
      razorpay_order_id: payment_method === 'razorpay' ? `order_rzp_${Date.now()}` : null,
    }).select().single();

    // Clear Customer Cart
    const { data: cart } = await supabase.from('carts').select('id').eq('customer_id', user.id).single();
    if (cart) {
      await supabase.from('cart_items').delete().eq('cart_id', cart.id);
    }

    return new Response(
      JSON.stringify({
        success: true,
        order,
        payment,
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
