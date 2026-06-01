import 'jsr:@supabase/functions-js/edge-runtime.d.ts';
import Stripe from 'https://esm.sh/stripe@14.21.0?target=deno';
import { createClient } from 'jsr:@supabase/supabase-js@2';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY')!, { apiVersion: '2024-06-20' });
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

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
    // ── 1. Validate JWT ──────────────────────────────────────────────────────
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) return errRes('Missing authorization header', 401);

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    if (userError || !user) return errRes('Unauthorized', 401);

    // ── 2. Fetch workspace ───────────────────────────────────────────────────
    const { data: workspace, error: wsErr } = await supabase
      .from('workspaces')
      .select('id, user_id, stripe_account_id, stripe_onboarded')
      .eq('user_id', user.id)
      .maybeSingle();

    if (wsErr || !workspace) return errRes('Workspace not found', 404);
    if (!workspace.stripe_account_id) return okRes({ onboarded: false });

    // ── 3. Retrieve Stripe account and check charges_enabled ─────────────────
    const account = await stripe.accounts.retrieve(workspace.stripe_account_id);
    const onboarded = account.charges_enabled === true;

    // ── 4. Update stripe_onboarded if newly completed ────────────────────────
    if (onboarded && !workspace.stripe_onboarded) {
      await supabase
        .from('workspaces')
        .update({ stripe_onboarded: true })
        .eq('id', workspace.id);
    }

    return okRes({ onboarded });

  } catch (err) {
    console.error('verify-connect-account error:', err);
    return errRes('Internal server error', 500);
  }
});
