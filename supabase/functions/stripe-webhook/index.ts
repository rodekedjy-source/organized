import 'jsr:@supabase/functions-js/edge-runtime.d.ts';
import Stripe from 'https://esm.sh/stripe@14.21.0?target=deno';
import { createClient } from 'jsr:@supabase/supabase-js@2';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY')!, { apiVersion: '2024-06-20' });
const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET')!;
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

Deno.serve(async (req: Request) => {
  const signature = req.headers.get('stripe-signature');
  if (!signature) return new Response('No signature', { status: 400 });

  let event: Stripe.Event;
  try {
    const body = await req.text();
    event = await stripe.webhooks.constructEventAsync(body, signature, webhookSecret);
  } catch (err) {
    console.error('Webhook signature failed:', err);
    return new Response('Invalid signature', { status: 400 });
  }

  try {
    switch (event.type) {

      // ── APPOINTMENT PAYMENT EVENTS ─────────────────────────────────────────────

      case 'payment_intent.amount_capturable_updated': {
        const pi = event.data.object as Stripe.PaymentIntent;
        const { appointment_id } = pi.metadata || {};
        if (appointment_id) {
          await supabase.from('appointments').update({ payment_status: 'authorized' }).eq('id', appointment_id);
          await supabase.from('payments').update({ status: 'authorized' }).eq('stripe_payment_intent_id', pi.id);
        }
        break;
      }

      case 'payment_intent.succeeded': {
        const pi = event.data.object as Stripe.PaymentIntent;
        const { appointment_id, order_type, workspace_id, client_name, client_email, item_id, item_name, quantity } = pi.metadata || {};
        const isFullPayment = pi.amount_received >= pi.amount;
        const newStatus = isFullPayment ? 'captured' : 'deposit_captured';

        // ── Existing appointment handling ───────────────────────────────────
        if (appointment_id) {
          await supabase.from('appointments').update({ payment_status: newStatus }).eq('id', appointment_id);
        }
        await supabase.from('payments').update({ status: newStatus, amount: pi.amount_received / 100 }).eq('stripe_payment_intent_id', pi.id);

        // ── PRODUCT ORDER ───────────────────────────────────────────────────────
        if (order_type === 'product') {
          // Get receipt URL from Stripe
          let receipt_url: string | null = null;
          try {
            const piExpanded = await stripe.paymentIntents.retrieve(pi.id, { expand: ['latest_charge'] });
            receipt_url = (piExpanded.latest_charge as Stripe.Charge)?.receipt_url || null;
          } catch (receiptErr) {
            console.error('Receipt URL error:', receiptErr);
          }

          // Insert order
          try {
            await supabase.from('orders').insert({
              workspace_id,
              product_id: item_id,
              client_name,
              client_email,
              quantity: parseInt(quantity) || 1,
              unit_price: pi.amount / 100 / (parseInt(quantity) || 1),
              total_amount: pi.amount / 100,
              currency: pi.currency,
              status: 'pending',
              payment_status: 'paid',
              stripe_payment_intent_id: pi.id,
              product_name: item_name || null,
              tracking_token: crypto.randomUUID(),
              receipt_url,
            });
          } catch (orderErr) {
            console.error('Order insert error:', orderErr);
          }

          // Decrement stock
          try {
            await supabase.rpc('decrement_product_stock', {
              p_product_id: item_id,
              p_quantity: parseInt(quantity) || 1,
            });
          } catch (stockErr) {
            console.error('Stock decrement error:', stockErr);
          }

          // Send order confirmation email (client + owner)
          try {
            const { data: wsWithUser } = await supabase
              .from('workspaces')
              .select('name, slug, user_id')
              .eq('id', workspace_id)
              .single();

            const { data: wsOwner } = await supabase
              .from('users')
              .select('email')
              .eq('id', wsWithUser?.user_id)
              .single();

            const ws = wsWithUser;

            await fetch(`${SUPABASE_URL}/functions/v1/send-order-email`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
              },
              body: JSON.stringify({
                type: 'confirmed',
                client_name,
                client_email,
                owner_email: wsOwner?.email || null,
                product_name: item_name,
                quantity: parseInt(quantity) || 1,
                total_amount: (pi.amount / 100).toFixed(2),
                currency: pi.currency.toUpperCase(),
                shipping_address: pi.metadata.shipping_address || '',
                receipt_url,
                workspace_name: ws?.name || '',
                booking_link: `https://beorganized.io/${ws?.slug || ''}`,
              }),
            });
          } catch (emailErr) {
            console.error('Order email error:', emailErr);
          }
        }

        // ── CART ORDER ─────────────────────────────────────────────────────────
        if (order_type === 'cart') {
          const { workspace_id, client_name, client_email, item_name, quantity, shipping_address } = pi.metadata;

          const cartItemsParsed = pi.metadata.cart_items
            ? JSON.parse(pi.metadata.cart_items)
            : null;

          const { error: orderError } = await supabase
            .from('orders')
            .insert({
              workspace_id,
              client_name,
              client_email,
              quantity: parseInt(quantity) || 1,
              unit_price: pi.amount / 100,
              total_amount: pi.amount / 100,
              currency: pi.currency,
              status: 'pending',
              payment_status: 'paid',
              stripe_payment_intent_id: pi.id,
              product_name: cartItemsParsed
                ? cartItemsParsed.map((i: { name: string }) => i.name).join(', ')
                : 'Cart order',
              cart_items: cartItemsParsed,
              tracking_token: crypto.randomUUID(),
              receipt_url: null,
            });

          if (!orderError) {
            try {
              const { data: wsWithUser } = await supabase
                .from('workspaces')
                .select('name, slug, user_id')
                .eq('id', workspace_id)
                .single();

              const { data: wsOwner } = await supabase
                .from('users')
                .select('email')
                .eq('id', wsWithUser?.user_id)
                .single();

              await fetch(`${SUPABASE_URL}/functions/v1/send-order-email`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
                },
                body: JSON.stringify({
                  type: 'confirmed',
                  client_name,
                  client_email,
                  product_name: item_name || 'Cart order',
                  quantity: parseInt(quantity) || 1,
                  total_amount: (pi.amount / 100).toFixed(2),
                  currency: pi.currency.toUpperCase(),
                  shipping_address: shipping_address || '',
                  receipt_url: null,
                  owner_email: wsOwner?.email || null,
                  workspace_name: wsWithUser?.name || '',
                  booking_link: `https://beorganized.io/${wsWithUser?.slug || ''}`,
                  cart_items: cartItemsParsed,
                }),
              });
            } catch (emailErr) {
              console.error('Cart order email error:', emailErr);
            }
          } else {
            console.error('Cart order insert error:', orderError);
          }
        }

        // ── ENROLLMENT (PAID) ─────────────────────────────────────────────
        if (order_type === 'enrollment') {
          try {
            const { data: existing } = await supabase
              .from('enrollments')
              .select('id')
              .eq('offering_id', item_id)
              .eq('client_email', client_email)
              .maybeSingle();

            if (!existing) {
              await supabase.from('enrollments').insert({
                workspace_id,
                offering_id: item_id,
                client_name,
                client_email,
                amount_paid: pi.amount / 100,
                currency: pi.currency,
                payment_status: 'paid',
                status: 'confirmed',
                stripe_payment_intent_id: pi.id,
              });

              const { data: offeringData } = await supabase
                .from('offerings')
                .select('spots_taken')
                .eq('id', item_id)
                .single();
              if (offeringData) {
                await supabase
                  .from('offerings')
                  .update({ spots_taken: (offeringData.spots_taken || 0) + 1 })
                  .eq('id', item_id);
              }

              const { data: wsData } = await supabase
                .from('workspaces')
                .select('name, slug')
                .eq('id', workspace_id)
                .single();

              await fetch(`${SUPABASE_URL}/functions/v1/send-enrollment-email`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
                },
                body: JSON.stringify({
                  client_name,
                  client_email,
                  offering_title: item_name,
                  offering_type: 'online',
                  workspace_name: wsData?.name || '',
                  booking_link: wsData?.slug ? `https://beorganized.io/${wsData.slug}` : '',
                }),
              }).catch(emailErr => console.error('Enrollment email error:', emailErr));
            }
          } catch (enrollErr) {
            console.error('Enrollment error:', enrollErr);
          }
        }

        break;
      }

      case 'payment_intent.canceled': {
        const pi = event.data.object as Stripe.PaymentIntent;
        const { appointment_id } = pi.metadata || {};
        if (appointment_id) {
          await supabase.from('appointments').update({ payment_status: 'cancelled' }).eq('id', appointment_id);
        }
        await supabase.from('payments').update({ status: 'cancelled' }).eq('stripe_payment_intent_id', pi.id);
        break;
      }

      case 'charge.dispute.created': {
        const dispute = event.data.object as Stripe.Dispute;
        await supabase.from('payments')
          .update({ status: 'refunded', description: 'DISPUTE: ' + dispute.reason })
          .eq('stripe_charge_id', dispute.charge as string);
        break;
      }

      // ── STRIPE CONNECT ────────────────────────────────────────────────────

      case 'account.updated': {
        const account = event.data.object as Stripe.Account;
        if (account.details_submitted) {
          await supabase.from('workspaces').update({ stripe_onboarded: true }).eq('stripe_account_id', account.id);
        }
        break;
      }

      // ── SAAS SUBSCRIPTION EVENTS ────────────────────────────────────────────

      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const sub = event.data.object as Stripe.Subscription;
        const customerId = sub.customer as string;
        const priceId = sub.items.data[0]?.price?.id;

        const ESSENTIAL_PRICE_ID = Deno.env.get('STRIPE_ESSENTIAL_PRICE_ID');
        const PRO_PRICE_ID = Deno.env.get('STRIPE_PRO_PRICE_ID');
        const plan = priceId === PRO_PRICE_ID ? 'pro' : 'essential';

        const statusMap: Record<string, string> = {
          active: 'active',
          trialing: 'trialing',
          past_due: 'past_due',
          canceled: 'cancelled',
          incomplete: 'incomplete',
          incomplete_expired: 'cancelled',
          unpaid: 'past_due',
          paused: 'cancelled',
        };
        const status = statusMap[sub.status] || sub.status;

        const periodEnd = sub.current_period_end
          ? new Date(sub.current_period_end * 1000).toISOString()
          : null;

        const { data: workspace } = await supabase
          .from('workspaces')
          .select('id, banned_permanently')
          .eq('stripe_customer_id', customerId)
          .single();

        if (workspace) {
          await supabase.from('subscriptions')
            .update({
              plan,
              status,
              stripe_subscription_id: sub.id,
              stripe_customer_id: customerId,
              current_period_end: periodEnd,
              cancelled_at: sub.canceled_at ? new Date(sub.canceled_at * 1000).toISOString() : null,
            })
            .eq('workspace_id', workspace.id);

          if (status === 'active' && !workspace.banned_permanently) {
            await supabase.from('workspaces')
              .update({ beta_suspended: false, is_published: true })
              .eq('id', workspace.id);
          }
        }
        break;
      }

      case 'customer.subscription.deleted': {
        const sub = event.data.object as Stripe.Subscription;
        const customerId = sub.customer as string;

        const { data: workspace } = await supabase
          .from('workspaces')
          .select('id')
          .eq('stripe_customer_id', customerId)
          .single();

        if (workspace) {
          await supabase.from('subscriptions')
            .update({
              plan: 'essential',
              status: 'cancelled',
              cancelled_at: new Date().toISOString(),
              current_period_end: sub.current_period_end
                ? new Date(sub.current_period_end * 1000).toISOString()
                : null,
            })
            .eq('workspace_id', workspace.id);
        }
        break;
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice;
        if (invoice.subscription) {
          const sub = await stripe.subscriptions.retrieve(invoice.subscription as string);
          const customerId = sub.customer as string;

          const { data: workspace } = await supabase
            .from('workspaces')
            .select('id, banned_permanently')
            .eq('stripe_customer_id', customerId)
            .single();

          if (workspace) {
            await supabase.from('subscriptions')
              .update({
                status: 'active',
                current_period_end: new Date(sub.current_period_end * 1000).toISOString(),
              })
              .eq('workspace_id', workspace.id);

            if (!workspace.banned_permanently) {
              await supabase.from('workspaces')
                .update({ beta_suspended: false, is_published: true })
                .eq('id', workspace.id);
            }
          }
        }
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        if (invoice.subscription) {
          const sub = await stripe.subscriptions.retrieve(invoice.subscription as string);
          const customerId = sub.customer as string;

          const { data: workspace } = await supabase
            .from('workspaces')
            .select('id')
            .eq('stripe_customer_id', customerId)
            .single();

          if (workspace) {
            await supabase.from('subscriptions')
              .update({ status: 'past_due' })
              .eq('workspace_id', workspace.id);
          }
        }
        break;
      }

      default:
        console.log('Unhandled event type:', event.type);
    }

    return new Response(JSON.stringify({ received: true }), { headers: { 'Content-Type': 'application/json' } });

  } catch (err) {
    console.error('Webhook processing error:', err);
    return new Response('Processing error', { status: 500 });
  }
});
