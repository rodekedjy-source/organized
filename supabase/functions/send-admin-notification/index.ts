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
    const { type, user_name, user_email, workspace_name, workspace_slug, created_at, access_until } = await req.json();

    if (type === 'subscription_cancelled') {
      const subject = `Your Organized. subscription has been cancelled`;
      const html = `<!DOCTYPE html><html><body style="margin:0;padding:0;background:#F0EDE8;font-family:Georgia,serif;">
    <table width="100%" cellpadding="0" cellspacing="0" style="padding:32px 16px;">
    <tr><td align="center"><table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;">
    <tr><td style="background:#1A0900;padding:24px 32px;border-radius:12px 12px 0 0;">
    <p style="margin:0;font-size:22px;color:#C9A84C;font-family:Georgia,serif;">Organized.</p></td></tr>
    <tr><td style="background:#fff;padding:36px 32px;">
    <p style="margin:0 0 16px;font-size:16px;color:#1A0900;">Hi ${user_name || 'there'},</p>
    <p style="margin:0 0 16px;font-size:15px;color:#444;line-height:1.75;">
      Your Organized. subscription has been successfully cancelled.
    </p>
    <div style="background:#F8F6F2;border-radius:8px;padding:20px 24px;margin:16px 0;">
      <p style="margin:0 0 8px;font-size:13px;color:#888;text-transform:uppercase;letter-spacing:0.5px;">What happens next</p>
      <p style="margin:0;font-size:14px;color:#333;line-height:1.6;">
        Your account remains fully active until <strong>${access_until}</strong>.<br/>
        After that date, your account will be locked.
      </p>
    </div>
    <p style="margin:16px 0 0;font-size:14px;color:#444;line-height:1.75;">
      Changed your mind? You can reactivate your subscription at any time before your access ends.
    </p>
    <div style="margin:24px 0;text-align:center;">
      <a href="https://beorganized.io/dashboard"
         style="display:inline-block;padding:12px 28px;background:#1A0900;color:#C9A84C;
                text-decoration:none;border-radius:8px;font-size:14px;font-family:Georgia,serif;">
        Manage my account →
      </a>
    </div>
    </td></tr>
    <tr><td style="background:#F8F6F2;padding:20px 32px;border-radius:0 0 12px 12px;">
    <p style="margin:0;font-size:12px;color:#BBB;">Powered by Organized.</p>
    </td></tr></table></td></tr></table></body></html>`;

      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${RESEND_API_KEY}` },
        body: JSON.stringify({ from: FROM, to: [user_email], subject, html }),
      });
      if (!res.ok) { const err = await res.text(); console.error('Cancel email error:', err); }
      return new Response(JSON.stringify({ success: true }),
        { headers: { ...cors, 'Content-Type': 'application/json' } });
    }

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
