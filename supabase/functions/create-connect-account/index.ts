import 'jsr:@supabase/functions-js/edge-runtime.d.ts';
import Stripe from 'https://esm.sh/stripe@14.21.0?target=deno';
import { createClient } from 'jsr:@supabase/supabase-js@2';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY')!, { apiVersion: '2024-06-20' });
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
function checkRateLimit(ip: string, maxReqs = 10, windowMs = 60000): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + windowMs });
    return true;
  }
  if (entry.count >= maxReqs) return false;
  entry.count++;
  return true;
}

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

  const ip = req.headers.get('x-forwarded-for') ?? 'unknown';
  if (!checkRateLimit(ip, 5)) {
    return new Response(JSON.stringify({ error: 'Too many requests' }), {
      status: 429, headers: { ...cors, 'Content-Type': 'application/json' },
    });
  }

  try {
    // ── 1. Validate JWT ──────────────────────────────────────────────────────
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) return errRes('Missing authorization header', 401);

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    if (userError || !user) return errRes('Unauthorized', 401);
    console.log('[1] user ok:', user.id);

    // ── 2. Fetch workspace ───────────────────────────────────────────────────
    const { data: workspace, error: wsErr } = await supabase
      .from('workspaces')
      .select('id, user_id, stripe_account_id')
      .eq('user_id', user.id)
      .maybeSingle();

    if (wsErr || !workspace) {
      console.error('[2] workspace fetch error:', wsErr?.message, wsErr);
      return errRes('Workspace not found', 404);
    }
    console.log('[2] workspace ok:', workspace.id, 'stripe_account_id:', workspace.stripe_account_id);

    let accountId: string = workspace.stripe_account_id;

    // ── 3. Create Stripe account if none exists ──────────────────────────────
    if (!accountId) {
      console.log('[3] creating Stripe express account...');
      let account;
      try {
        account = await stripe.accounts.create({ type: 'express' });
      } catch (stripeErr: any) {
        console.error('[3] stripe.accounts.create error:', stripeErr?.message, stripeErr?.stack, JSON.stringify(stripeErr));
        return errRes(`Stripe error: ${stripeErr?.message ?? 'unknown'}`, 500);
      }
      accountId = account.id;
      console.log('[3] Stripe account created:', accountId);

      const { error: updateErr } = await supabase
        .from('workspaces')
        .update({ stripe_account_id: accountId })
        .eq('id', workspace.id);

      if (updateErr) {
        console.error('[3] supabase update error:', updateErr?.message, updateErr);
        return errRes('Failed to save Stripe account ID');
      }
      console.log('[3] workspace updated with stripe_account_id');
    }

    // ── 4. Create account link (onboarding or re-onboarding) ─────────────────
    console.log('[4] creating account link for:', accountId);
    let accountLink;
    try {
      accountLink = await stripe.accountLinks.create({
        account: accountId,
        refresh_url: 'https://beorganized.io/dashboard',
        return_url:  'https://beorganized.io/dashboard?stripe=success',
        type: 'account_onboarding',
      });
    } catch (stripeErr: any) {
      console.error('[4] stripe.accountLinks.create error:', stripeErr?.message, stripeErr?.stack, JSON.stringify(stripeErr));
      return errRes(`Stripe error: ${stripeErr?.message ?? 'unknown'}`, 500);
    }
    console.log('[4] account link created:', accountLink.url);

    return okRes({ url: accountLink.url });

  } catch (err: any) {
    console.error('create-connect-account error:', err?.message, err?.stack, JSON.stringify(err));
    return new Response(JSON.stringify({ error: err?.message ?? 'Internal server error' }), {
      status: 500, headers: { ...cors, 'Content-Type': 'application/json' },
    });
  }
});
