import "jsr:@supabase/functions-js/edge-runtime.d.ts"

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY') || ''
const FROM = 'Organized. <noreply@beorganized.io>'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

function fmtDate(d: string | null): string {
  if (!d) return ''
  try {
    return new Date(d).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })
  } catch { return d }
}

function buildClientEmail(opts: {
  client_name: string
  offering_title: string
  offering_type: string
  workshop_date: string | null
  workshop_location: string | null
  amount_paid: number | null
  currency: string
  workspace_name: string
  booking_link: string
}): { subject: string; html: string } {
  const isWorkshop = opts.offering_type === 'workshop'
  const subject = `Your enrollment is confirmed — ${opts.offering_title}`
  const dateRow = isWorkshop && opts.workshop_date
    ? `<tr><td style="padding:6px 0;font-size:14px;color:#555;font-family:Georgia,serif;"><strong style="color:#1A0900;">Date:</strong> ${fmtDate(opts.workshop_date)}</td></tr>`
    : ''
  const locationRow = isWorkshop
    ? `<tr><td style="padding:6px 0;font-size:14px;color:#555;font-family:Georgia,serif;"><strong style="color:#1A0900;">Location:</strong> ${opts.workshop_location || 'Details will be sent 24 hours before the event'}</td></tr>`
    : ''
  const amountRow = opts.amount_paid && opts.amount_paid > 0
    ? `<tr><td style="padding:6px 0;font-size:14px;color:#555;font-family:Georgia,serif;"><strong style="color:#1A0900;">Amount paid:</strong> $${Number(opts.amount_paid).toFixed(2)} ${(opts.currency || 'CAD').toUpperCase()}</td></tr>`
    : `<tr><td style="padding:6px 0;font-size:14px;color:#555;font-family:Georgia,serif;"><strong style="color:#1A0900;">Amount:</strong> Free</td></tr>`
  const accessMsg = isWorkshop
    ? 'Your spot is reserved. Location details will be sent 24 hours before the event.'
    : 'You now have access to the course. Log in to get started.'
  const ctaBtn = !isWorkshop
    ? `<table cellpadding="0" cellspacing="0" style="margin:20px 0 0;"><tr><td style="background:#C9A84C;border-radius:6px;"><a href="${opts.booking_link}" style="display:inline-block;padding:14px 28px;font-size:15px;font-weight:600;color:#fff;text-decoration:none;font-family:Georgia,serif;letter-spacing:0.03em;">Access Course →</a></td></tr></table>`
    : ''

  const html = `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/></head><body style="margin:0;padding:0;background:#F0EDE8;font-family:Georgia,serif;"><table width="100%" cellpadding="0" cellspacing="0" style="padding:32px 16px;"><tr><td align="center"><table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;"><tr><td style="background:#1A0900;padding:24px 32px;border-radius:12px 12px 0 0;"><p style="margin:0;font-family:Georgia,serif;font-size:22px;color:#C9A84C;letter-spacing:0.1em;">Organized.</p></td></tr><tr><td style="background:#FFFFFF;padding:36px 32px;"><p style="margin:0 0 8px;font-size:16px;color:#1A0900;font-family:Georgia,serif;">Hi ${opts.client_name},</p><p style="margin:0 0 24px;font-size:15px;color:#444;line-height:1.75;font-family:Georgia,serif;">Your enrollment is confirmed! ${accessMsg}</p><div style="background:#F8F6F2;border-radius:8px;padding:16px 20px;margin:0 0 24px;"><p style="margin:0 0 12px;font-size:13px;font-weight:700;color:#8B7355;text-transform:uppercase;letter-spacing:0.08em;font-family:Georgia,serif;">${isWorkshop ? 'Workshop' : 'Online Course'}</p><p style="margin:0 0 16px;font-size:17px;font-weight:600;color:#1A0900;font-family:Georgia,serif;">${opts.offering_title}</p><table width="100%" cellpadding="0" cellspacing="0">${dateRow}${locationRow}${amountRow}</table></div>${ctaBtn}<p style="margin:${ctaBtn ? '24' : '0'}px 0 0;font-size:13px;color:#888;font-family:Georgia,serif;">Questions? Reply to this email or contact ${opts.workspace_name} directly.</p></td></tr><tr><td style="background:#F8F6F2;padding:20px 32px;border-radius:0 0 12px 12px;border-top:1px solid #EDE9E3;"><p style="margin:0 0 4px;font-size:14px;color:#555;font-family:Georgia,serif;">— ${opts.workspace_name}</p><p style="margin:0;font-size:12px;color:#BBB;font-family:Georgia,serif;">Powered by Organized.</p></td></tr></table></td></tr></table></body></html>`
  return { subject, html }
}

function buildOwnerEmail(opts: {
  client_name: string
  client_email: string
  offering_title: string
  offering_type: string
  workshop_date: string | null
  amount_paid: number | null
  currency: string
}): { subject: string; html: string } {
  const isWorkshop = opts.offering_type === 'workshop'
  const subject = `New enrollment — ${opts.offering_title}`
  const dateRow = isWorkshop && opts.workshop_date
    ? `<tr><td style="padding:6px 0;font-size:14px;color:#555;font-family:Georgia,serif;"><strong style="color:#1A0900;">Date:</strong> ${fmtDate(opts.workshop_date)}</td></tr>`
    : ''
  const amountRow = opts.amount_paid && opts.amount_paid > 0
    ? `<tr><td style="padding:6px 0;font-size:14px;color:#555;font-family:Georgia,serif;"><strong style="color:#1A0900;">Amount:</strong> $${Number(opts.amount_paid).toFixed(2)} ${(opts.currency || 'CAD').toUpperCase()}</td></tr>`
    : ''

  const html = `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/></head><body style="margin:0;padding:0;background:#F0EDE8;font-family:Georgia,serif;"><table width="100%" cellpadding="0" cellspacing="0" style="padding:32px 16px;"><tr><td align="center"><table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;"><tr><td style="background:#1A0900;padding:24px 32px;border-radius:12px 12px 0 0;"><p style="margin:0;font-family:Georgia,serif;font-size:22px;color:#C9A84C;letter-spacing:0.1em;">Organized.</p></td></tr><tr><td style="background:#FFFFFF;padding:36px 32px;"><p style="margin:0 0 8px;font-size:16px;color:#1A0900;font-family:Georgia,serif;">New enrollment received</p><p style="margin:0 0 24px;font-size:15px;color:#444;line-height:1.75;font-family:Georgia,serif;">Someone just enrolled in one of your formations.</p><div style="background:#F8F6F2;border-radius:8px;padding:16px 20px;margin:0 0 24px;"><p style="margin:0 0 12px;font-size:13px;font-weight:700;color:#8B7355;text-transform:uppercase;letter-spacing:0.08em;font-family:Georgia,serif;">${isWorkshop ? 'Workshop' : 'Online Course'}</p><p style="margin:0 0 16px;font-size:17px;font-weight:600;color:#1A0900;font-family:Georgia,serif;">${opts.offering_title}</p><table width="100%" cellpadding="0" cellspacing="0"><tr><td style="padding:6px 0;font-size:14px;color:#555;font-family:Georgia,serif;"><strong style="color:#1A0900;">Student:</strong> ${opts.client_name}</td></tr><tr><td style="padding:6px 0;font-size:14px;color:#555;font-family:Georgia,serif;"><strong style="color:#1A0900;">Email:</strong> ${opts.client_email}</td></tr>${dateRow}${amountRow}</table></div><table cellpadding="0" cellspacing="0"><tr><td style="background:#C9A84C;border-radius:6px;"><a href="https://beorganized.io/dashboard" style="display:inline-block;padding:14px 28px;font-size:15px;font-weight:600;color:#fff;text-decoration:none;font-family:Georgia,serif;letter-spacing:0.03em;">View in Dashboard →</a></td></tr></table></td></tr><tr><td style="background:#F8F6F2;padding:20px 32px;border-radius:0 0 12px 12px;border-top:1px solid #EDE9E3;"><p style="margin:0;font-size:14px;color:#555;font-family:Georgia,serif;">— Organized.</p></td></tr></table></td></tr></table></body></html>`
  return { subject, html }
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    const body = await req.json()
    const {
      client_name,
      client_email,
      offering_title,
      offering_type = 'online',
      workshop_date = null,
      workshop_location = null,
      amount_paid = null,
      currency = 'CAD',
      workspace_name,
      owner_email = null,
      booking_link = 'https://beorganized.io',
    } = body

    if (!client_email || !offering_title) {
      return new Response(JSON.stringify({ error: 'Missing required fields: client_email, offering_title' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const clientResult = buildClientEmail({
      client_name: client_name || 'there',
      offering_title,
      offering_type,
      workshop_date,
      workshop_location,
      amount_paid,
      currency,
      workspace_name: workspace_name || '',
      booking_link,
    })

    // Send client email
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${RESEND_API_KEY}` },
      body: JSON.stringify({ from: FROM, to: [client_email], subject: clientResult.subject, html: clientResult.html }),
    })

    if (!res.ok) {
      const err = await res.text()
      return new Response(JSON.stringify({ error: err }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Send owner notification
    if (owner_email) {
      try {
        const ownerResult = buildOwnerEmail({
          client_name: client_name || '',
          client_email,
          offering_title,
          offering_type,
          workshop_date,
          amount_paid,
          currency,
        })
        await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${RESEND_API_KEY}` },
          body: JSON.stringify({ from: FROM, to: [owner_email], subject: ownerResult.subject, html: ownerResult.html }),
        })
      } catch (ownerErr) {
        console.error('Owner notification error:', ownerErr)
      }
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
