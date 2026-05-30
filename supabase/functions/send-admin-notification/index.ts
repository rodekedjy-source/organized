import 'jsr:@supabase/functions-js/edge-runtime.d.ts';

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY') || '';
const FROM = 'Organized. <noreply@mail.beorganized.io>';
const ADMIN_EMAIL = 'hello@beorganized.io';

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

function fmtDate(d: string | null): string {
  if (!d) return '';
  try {
    return new Date(d).toLocaleDateString('en-US', {
      weekday: 'long', month: 'long', day: 'numeric', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });
  } catch { return d; }
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors });

  try {
    const { type, user_name, user_email, workspace_name, workspace_slug, created_at } = await req.json();

    if (type !== 'new_user') {
      return new Response(JSON.stringify({ error: 'Unknown notification type' }), {
        status: 400, headers: { ...cors, 'Content-Type': 'application/json' },
      });
    }

    const subject = `New user — ${workspace_name}`;
    const pageUrl = `https://beorganized.io/book/${workspace_slug}`;

    const html = `
<!DOCTYPE html>
<html>
<body style="font-family:sans-serif;max-width:520px;margin:0 auto;padding:32px 24px;color:#111;">
  <h2 style="margin-bottom:4px;">New signup on Organized.</h2>
  <hr style="border:none;border-top:1px solid #eee;margin:16px 0;"/>
  <table style="width:100%;border-collapse:collapse;">
    <tr><td style="padding:6px 0;color:#555;width:110px;">Name</td><td style="padding:6px 0;font-weight:600;">${user_name || '—'}</td></tr>
    <tr><td style="padding:6px 0;color:#555;">Email</td><td style="padding:6px 0;"><a href="mailto:${user_email}" style="color:#1A0900;">${user_email || '—'}</a></td></tr>
    <tr><td style="padding:6px 0;color:#555;">Business</td><td style="padding:6px 0;font-weight:600;">${workspace_name || '—'}</td></tr>
    <tr><td style="padding:6px 0;color:#555;">Page</td><td style="padding:6px 0;"><a href="${pageUrl}" style="color:#C9A84C;">${pageUrl}</a></td></tr>
    <tr><td style="padding:6px 0;color:#555;">Date</td><td style="padding:6px 0;">${fmtDate(created_at)}</td></tr>
  </table>
  <hr style="border:none;border-top:1px solid #eee;margin:24px 0 16px;"/>
  <a href="https://beorganized.io/x" style="display:inline-block;background:#1A0900;color:#C9A84C;text-decoration:none;padding:10px 24px;border-radius:6px;font-size:14px;font-weight:600;">
    Open Admin Console →
  </a>
</body>
</html>`;

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: FROM,
        to: [ADMIN_EMAIL],
        subject,
        html,
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      console.error('Resend error:', err);
      return new Response(JSON.stringify({ error: err }), {
        status: 500, headers: { ...cors, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ sent: true }), {
      headers: { ...cors, 'Content-Type': 'application/json' },
    });

  } catch (err: any) {
    console.error('send-admin-notification error:', err?.message);
    return new Response(JSON.stringify({ error: err?.message }), {
      status: 500, headers: { ...cors, 'Content-Type': 'application/json' },
    });
  }
});
