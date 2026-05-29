import 'jsr:@supabase/functions-js/edge-runtime.d.ts';
import Stripe from 'https://esm.sh/stripe@14.21.0?target=deno';
import { createClient } from 'jsr:@supabase/supabase-js@2';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY')!, { apiVersion: '2024-06-20' });
const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors });

  try {
    const body = await req.json();
    const { workspace_id, amount, currency, client_name, client_email, order_type, item_id, item_name, quantity, shipping_address, cart_items } = body;

    if (!workspace_id) {
      return new Response(
        JSON.stringify({ error: 'workspace_id is required' }),
        { status: 400, headers: { ...cors, 'Content-Type': 'application/json' } }
      );
    }
    if (!order_type || !['product', 'enrollment', 'cart', 'booking'].includes(order_type)) {
      return new Response(
        JSON.stringify({ error: 'order_type must be product, enrollment, cart, or booking' }),
        { status: 400, headers: { ...cors, 'Content-Type': 'application/json' } }
      );
    }
    if (!item_id) {
      return new Response(
        JSON.stringify({ error: 'item_id is required' }),
        { status: 400, headers: { ...cors, 'Content-Type': 'application/json' } }
      );
    }

    const { data: ws, error: wsError } = await supabase
      .from('workspaces')
      .select('deposit_value, deposit_required, stripe_account_id, stripe_onboarded')
      .eq('id', workspace_id)
      .maybeSingle();

    if (wsError || !ws) {
      return new Response(
        JSON.stringify({ error: 'Workspace not found' }),
        { status: 404, headers: { ...cors, 'Content-Type': 'application/json' } }
      );
    }

    if (!ws.stripe_onboarded || !ws.stripe_account_id) {
      return new Response(
        JSON.stringify({ error: 'Payment not configured' }),
        { status: 400, headers: { ...cors, 'Content-Type': 'application/json' } }
      );
    }

    if (order_type === 'booking') {
      if (!ws.deposit_required || !ws.deposit_value || ws.deposit_value <= 0) {
        return new Response(
          JSON.stringify({ error: 'No deposit required' }),
          { status: 400, headers: { ...cors, 'Content-Type': 'application/json' } }
        );
      }
    } else {
      if (!amount || amount <= 0) {
        return new Response(
          JSON.stringify({ error: 'amount is required' }),
          { status: 400, headers: { ...cors, 'Content-Type': 'application/json' } }
        );
      }
    }

    // Truncate cart_items to fit Stripe's 500-char metadata limit
    let cart_items_str: string | undefined;
    if (cart_items) {
      try {
        let parsed = JSON.parse(cart_items);
        let str = JSON.stringify(parsed);
        if (str.length > 500) {
          parsed = parsed.slice(0, 5);
          str = JSON.stringify(parsed);
        }
        cart_items_str = str;
      } catch (_) {
        // malformed JSON — skip
      }
    }

    const amountInCents = order_type === 'booking'
      ? Math.round(Number(ws.deposit_value) * 100)
      : Math.round(amount * 100);
    const idempotencyKey =
      `${workspace_id}-${order_type}-${item_id}-` +
      `${(client_email || 'anon').substring(0, 32)}-${Date.now()}`;

    const intentParams: Stripe.PaymentIntentCreateParams = {
      amount: amountInCents,
      currency: currency || 'cad',
      capture_method: 'automatic',
      receipt_email: client_email || null,
      description: `${item_name || order_type} — Organized.`,
      metadata: {
        workspace_id,
        client_name: client_name || '',
        client_email: client_email || '',
        order_type,
        item_id,
        item_name: item_name || '',
        quantity: String(quantity || 1),
        shipping_address: shipping_address || '',
        ...(cart_items_str ? { cart_items: cart_items_str } : {}),
      },
    };

    intentParams.transfer_data = {
      destination: ws.stripe_account_id,
    };
    intentParams.application_fee_amount = Math.round(amountInCents * 0.05);

    const paymentIntent = await stripe.paymentIntents.create(intentParams, {
      idempotencyKey,
    });

    return new Response(
      JSON.stringify({ client_secret: paymentIntent.client_secret, payment_intent_id: paymentIntent.id }),
      { headers: { ...cors, 'Content-Type': 'application/json' } }
    );

  } catch (err) {
    console.error('create-checkout-payment-intent error:', err);
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 500, headers: { ...cors, 'Content-Type': 'application/json' } }
    );
  }
});
