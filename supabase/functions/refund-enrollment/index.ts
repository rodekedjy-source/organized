import 'jsr:@supabase/functions-js/edge-runtime.d.ts';
import Stripe from 'https://esm.sh/stripe@14.21.0?target=deno';
import { createClient } from 'jsr:@supabase/supabase-js@2';

const stripe      = new Stripe(Deno.env.get('STRIPE_SECRET_KEY')!, { apiVersion: '2024-06-20' });
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const supabase    = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

function errRes(msg: string, status = 400) {
  return new Response(JSON.stringify({ error: msg }), {
    status, headers: { ...cors, 'Content-Type': 'application/json' },
  });
}
function okRes(data: unknown) {
  return new Response(JSON.stringify(data), {
    status: 200, headers: { ...cors, 'Content-Type': 'application/json' },
  });
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors });

  try {
    // ── 1. Validate JWT — get connected user ─────────────────────────────────
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) return errRes('Missing authorization header', 401);

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    if (userError || !user) return errRes('Unauthorized', 401);

    // ── 2. Parse body ────────────────────────────────────────────────────────
    const body = await req.json();
    const { enrollment_id } = body;
    if (!enrollment_id) return errRes('enrollment_id is required');

    // ── 3. Fetch enrollment ──────────────────────────────────────────────────
    const { data: enrollment, error: enrollErr } = await supabase
      .from('enrollments')
      .select('id, workspace_id, client_name, client_email, amount_paid, currency, payment_status, refunded_at, stripe_payment_intent_id, offering_id')
      .eq('id', enrollment_id)
      .maybeSingle();

    if (enrollErr || !enrollment) return errRes('Enrollment not found', 404);

    // ── 3b. Verify workspace belongs to the connected user ───────────────────
    const { data: workspace, error: wsErr } = await supabase
      .from('workspaces')
      .select('id, name, user_id')
      .eq('id', enrollment.workspace_id)
      .maybeSingle();

    if (wsErr || !workspace) return errRes('Workspace not found', 404);
    if (workspace.user_id !== user.id) return errRes('Forbidden', 403);

    // ── 4. Validate refund eligibility ───────────────────────────────────────
    if (enrollment.payment_status !== 'paid') {
      return errRes('Enrollment is not in paid status');
    }
    if (enrollment.refunded_at !== null) {
      return errRes('Enrollment has already been refunded');
    }
    if (!enrollment.stripe_payment_intent_id) {
      return errRes('No Stripe payment intent found for this enrollment');
    }

    // ── 5. Issue Stripe refund ────────────────────────────────────────────────
    await stripe.refunds.create({
      payment_intent: enrollment.stripe_payment_intent_id,
      reason: 'requested_by_customer',
    });

    // ── 6. Update enrollment — mark refunded ─────────────────────────────────
    const now = new Date().toISOString();
    await supabase
      .from('enrollments')
      .update({ refunded_at: now, payment_status: 'refunded' })
      .eq('id', enrollment_id);

    // ── 7. Fetch offering title ───────────────────────────────────────────────
    const { data: offering } = await supabase
      .from('offerings')
      .select('title')
      .eq('id', enrollment.offering_id)
      .maybeSingle();

    // ── 8. Send refund_issued email to client ─────────────────────────────────
    try {
      await fetch(`${SUPABASE_URL}/functions/v1/send-enrollment-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
        },
        body: JSON.stringify({
          type: 'refund_issued',
          client_name:    enrollment.client_name,
          client_email:   enrollment.client_email,
          offering_title: offering?.title || 'Formation',
          workspace_name: workspace.name,
          amount_paid:    enrollment.amount_paid,
        }),
      });
    } catch (emailErr) {
      console.error('Refund email error:', emailErr);
      // Email failure does not roll back the refund
    }

    // ── 9. Return success ─────────────────────────────────────────────────────
    return okRes({ success: true });

  } catch (e) {
    console.error('refund-enrollment error:', e);
    return errRes('Internal server error', 500);
  }
});
