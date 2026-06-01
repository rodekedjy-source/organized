import "jsr:@supabase/functions-js/edge-runtime.d.ts"
import { createClient } from 'jsr:@supabase/supabase-js@2'

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY') || ''
const FROM = 'Organized. <noreply@beorganized.io>'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

type CartItem = { name: string; quantity: number; unit_price: number | string }

function buildItemsTable(opts: {
  cart_items?: CartItem[] | null
  product_name: string
  quantity: number
  unit_price?: number | string | null
  total_amount: string
  currency: string
}): string {
  const itemsHtml = opts.cart_items && Array.isArray(opts.cart_items)
    ? opts.cart_items.map(item =>
        `<tr>
          <td style="padding:8px 0;border-bottom:1px solid #f0ebe3;font-size:14px;color:#555;font-family:Georgia,serif;">${item.name}</td>
          <td style="padding:8px 0;border-bottom:1px solid #f0ebe3;text-align:center;font-size:14px;color:#555;font-family:Georgia,serif;">×${item.quantity}</td>
          <td style="padding:8px 0;border-bottom:1px solid #f0ebe3;text-align:right;font-size:14px;color:#555;font-family:Georgia,serif;">$${Number(item.unit_price).toFixed(2)}</td>
        </tr>`
      ).join('')
    : `<tr>
        <td style="padding:8px 0;font-size:14px;color:#555;font-family:Georgia,serif;">${opts.product_name || 'Product'}</td>
        <td style="padding:8px 0;text-align:center;font-size:14px;color:#555;font-family:Georgia,serif;">×${opts.quantity}</td>
        <td style="padding:8px 0;text-align:right;font-size:14px;color:#555;font-family:Georgia,serif;">$${opts.unit_price || opts.total_amount}</td>
      </tr>`

  return `<table style="width:100%;border-collapse:collapse;margin:16px 0">
    <thead>
      <tr>
        <th style="text-align:left;font-size:12px;color:#8B7355;padding-bottom:8px;font-family:Georgia,serif;">ITEM</th>
        <th style="text-align:center;font-size:12px;color:#8B7355;padding-bottom:8px;font-family:Georgia,serif;">QTY</th>
        <th style="text-align:right;font-size:12px;color:#8B7355;padding-bottom:8px;font-family:Georgia,serif;">PRICE</th>
      </tr>
    </thead>
    <tbody>${itemsHtml}</tbody>
  </table>
  <div style="text-align:right;font-weight:600;font-size:16px;margin-top:8px;font-family:Georgia,serif;color:#1A0900;">
    Total: $${opts.total_amount} ${(opts.currency || 'CAD').toUpperCase()}
  </div>`
}

function buildConfirmedEmail(opts: {
  client_name: string
  product_name: string
  quantity: number
  total_amount: string
  currency: string
  shipping_address: string
  receipt_url: string | null
  workspace_name: string
  cart_items?: CartItem[] | null
  unit_price?: number | string | null
}): { subject: string; html: string } {
  const subject = `Order confirmed — ${opts.product_name}`
  const receiptBlock = opts.receipt_url
    ? `<table cellpadding="0" cellspacing="0" style="margin:20px 0 0;"><tr><td><a href="${opts.receipt_url}" style="font-size:13px;color:#C9A84C;text-decoration:none;font-family:Georgia,serif;">View your Stripe receipt →</a></td></tr></table>`
    : ''
  const shippingRow = opts.shipping_address
    ? `<tr><td style="padding:6px 0;font-size:14px;color:#555;font-family:Georgia,serif;"><strong style="color:#1A0900;">Ships to:</strong> ${opts.shipping_address}</td></tr>`
    : ''
  const itemsBlock = buildItemsTable(opts)
  const html = `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/></head><body style="margin:0;padding:0;background:#F0EDE8;font-family:Georgia,serif;"><table width="100%" cellpadding="0" cellspacing="0" style="padding:32px 16px;"><tr><td align="center"><table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;"><tr><td style="background:#1A0900;padding:24px 32px;border-radius:12px 12px 0 0;"><p style="margin:0;font-family:Georgia,serif;font-size:22px;color:#C9A84C;letter-spacing:0.1em;">Organized.</p></td></tr><tr><td style="background:#FFFFFF;padding:36px 32px;"><p style="margin:0 0 8px;font-size:16px;color:#1A0900;font-family:Georgia,serif;">Hi ${opts.client_name},</p><p style="margin:0 0 24px;font-size:15px;color:#444;line-height:1.75;font-family:Georgia,serif;">Your order has been confirmed and is currently being processed. You&#39;ll receive a shipping confirmation with tracking details once your order is on its way.</p><div style="background:#F8F6F2;border-radius:8px;padding:16px 20px;margin:0 0 20px;">${itemsBlock}<p style="margin:16px 0;padding:12px 16px;background:#f5f0e8;border-radius:8px;font-size:14px;color:#1a1a1a;font-family:Georgia,serif;">Your order has been confirmed and is currently being processed. You&#39;ll receive a shipping confirmation with tracking details once your order is on its way. 🙏</p><table width="100%" cellpadding="0" cellspacing="0">${shippingRow}</table></div>${receiptBlock}</td></tr><tr><td style="background:#F8F6F2;padding:20px 32px;border-radius:0 0 12px 12px;border-top:1px solid #EDE9E3;"><p style="margin:0 0 4px;font-size:14px;color:#555;font-family:Georgia,serif;">— ${opts.workspace_name}</p><p style="margin:0;font-size:12px;color:#BBB;font-family:Georgia,serif;">Powered by Organized.</p></td></tr></table></td></tr></table></body></html>`
  return { subject, html }
}

function buildOwnerConfirmedEmail(opts: {
  product_name: string
  quantity: number
  total_amount: string
  currency: string
  client_name: string
  client_email: string
  shipping_address: string
  cart_items?: CartItem[] | null
  unit_price?: number | string | null
}): { subject: string; html: string } {
  const subject = `New order received — ${opts.product_name}`
  const shippingRow = opts.shipping_address
    ? `<tr><td style="padding:6px 0;font-size:14px;color:#555;font-family:Georgia,serif;"><strong style="color:#1A0900;">Ships to:</strong> ${opts.shipping_address}</td></tr>`
    : ''
  const itemsBlock = buildItemsTable(opts)
  const html = `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/></head><body style="margin:0;padding:0;background:#F0EDE8;font-family:Georgia,serif;"><table width="100%" cellpadding="0" cellspacing="0" style="padding:32px 16px;"><tr><td align="center"><table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;"><tr><td style="background:#1A0900;padding:24px 32px;border-radius:12px 12px 0 0;"><p style="margin:0;font-family:Georgia,serif;font-size:22px;color:#C9A84C;letter-spacing:0.1em;">Organized.</p></td></tr><tr><td style="background:#FFFFFF;padding:36px 32px;"><p style="margin:0 0 8px;font-size:16px;color:#1A0900;font-family:Georgia,serif;">Hi,</p><p style="margin:0 0 24px;font-size:15px;color:#444;line-height:1.75;font-family:Georgia,serif;">You have a new order on your Organized. store.</p><div style="background:#F8F6F2;border-radius:8px;padding:16px 20px;margin:0 0 24px;">${itemsBlock}<table width="100%" cellpadding="0" cellspacing="0"><tr><td style="padding:6px 0;font-size:14px;color:#555;font-family:Georgia,serif;"><strong style="color:#1A0900;">Customer:</strong> ${opts.client_name}</td></tr><tr><td style="padding:6px 0;font-size:14px;color:#555;font-family:Georgia,serif;"><strong style="color:#1A0900;">Email:</strong> ${opts.client_email}</td></tr>${shippingRow}</table></div><p style="margin:0 0 16px;font-size:14px;color:#444;font-family:Georgia,serif;">Log in to your dashboard to manage this order:</p><table cellpadding="0" cellspacing="0"><tr><td style="background:#C9A84C;border-radius:6px;"><a href="https://beorganized.io/dashboard" style="display:inline-block;padding:14px 28px;font-size:15px;font-weight:600;color:#fff;text-decoration:none;font-family:Georgia,serif;letter-spacing:0.03em;">View Order →</a></td></tr></table></td></tr><tr><td style="background:#F8F6F2;padding:20px 32px;border-radius:0 0 12px 12px;border-top:1px solid #EDE9E3;"><p style="margin:0;font-size:14px;color:#555;font-family:Georgia,serif;">— Organized.</p></td></tr></table></td></tr></table></body></html>`
  return { subject, html }
}

function buildShippedEmail(opts: {
  client_name: string
  product_name: string
  carrier: string
  tracking_number: string
  tracking_url: string
  workspace_name: string
}): { subject: string; html: string } {
  const subject = `Your order is on its way — ${opts.product_name}`
  const ctaBtn = `<table cellpadding="0" cellspacing="0" style="margin:0 0 20px;"><tr><td style="background:#C9A84C;border-radius:6px;"><a href="${opts.tracking_url}" style="display:inline-block;padding:14px 28px;font-size:15px;font-weight:600;color:#fff;text-decoration:none;font-family:Georgia,serif;letter-spacing:0.03em;">Track Your Order →</a></td></tr></table>`
  const html = `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/></head><body style="margin:0;padding:0;background:#F0EDE8;font-family:Georgia,serif;"><table width="100%" cellpadding="0" cellspacing="0" style="padding:32px 16px;"><tr><td align="center"><table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;"><tr><td style="background:#1A0900;padding:24px 32px;border-radius:12px 12px 0 0;"><p style="margin:0;font-family:Georgia,serif;font-size:22px;color:#C9A84C;letter-spacing:0.1em;">Organized.</p></td></tr><tr><td style="background:#FFFFFF;padding:36px 32px;"><p style="margin:0 0 8px;font-size:16px;color:#1A0900;font-family:Georgia,serif;">Hi ${opts.client_name},</p><p style="margin:0 0 24px;font-size:15px;color:#444;line-height:1.75;font-family:Georgia,serif;">Great news — your order has shipped!</p><div style="background:#F8F6F2;border-radius:8px;padding:16px 20px;margin:0 0 24px;"><table width="100%" cellpadding="0" cellspacing="0"><tr><td style="padding:6px 0;font-size:14px;color:#555;font-family:Georgia,serif;"><strong style="color:#1A0900;">Product:</strong> ${opts.product_name}</td></tr><tr><td style="padding:6px 0;font-size:14px;color:#555;font-family:Georgia,serif;"><strong style="color:#1A0900;">Carrier:</strong> ${opts.carrier}</td></tr><tr><td style="padding:6px 0;font-size:14px;color:#555;font-family:Georgia,serif;"><strong style="color:#1A0900;">Tracking:</strong> <span style="font-family:monospace;">${opts.tracking_number}</span></td></tr></table></div>${ctaBtn}<p style="margin:0;font-size:13px;color:#888;font-family:Georgia,serif;">Track directly on ${opts.carrier}&#39;s website using: <span style="font-family:monospace;">${opts.tracking_number}</span></p></td></tr><tr><td style="background:#F8F6F2;padding:20px 32px;border-radius:0 0 12px 12px;border-top:1px solid #EDE9E3;"><p style="margin:0 0 4px;font-size:14px;color:#555;font-family:Georgia,serif;">— ${opts.workspace_name}</p><p style="margin:0;font-size:12px;color:#BBB;font-family:Georgia,serif;">Powered by Organized.</p></td></tr></table></td></tr></table></body></html>`
  return { subject, html }
}

function buildDeliveredEmail(opts: {
  client_name: string
  product_name: string
  booking_link: string
  workspace_name: string
}): { subject: string; html: string } {
  const subject = `Your order has arrived — ${opts.product_name}`
  const ctaBtn = `<p style="margin:0 0 20px;font-size:15px;color:#444;line-height:1.75;font-family:Georgia,serif;">We hope you&#39;re loving your purchase. Your feedback helps ${opts.workspace_name} serve you better.</p><table cellpadding="0" cellspacing="0" style="margin:0 0 24px;"><tr><td style="background:#C9A84C;border-radius:6px;"><a href="${opts.booking_link}?review=1" style="display:inline-block;padding:14px 28px;font-size:15px;font-weight:600;color:#fff;text-decoration:none;font-family:Georgia,serif;letter-spacing:0.03em;">How was your order? Leave a review →</a></td></tr></table>`
  const html = `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/></head><body style="margin:0;padding:0;background:#F0EDE8;font-family:Georgia,serif;"><table width="100%" cellpadding="0" cellspacing="0" style="padding:32px 16px;"><tr><td align="center"><table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;"><tr><td style="background:#1A0900;padding:24px 32px;border-radius:12px 12px 0 0;"><p style="margin:0;font-family:Georgia,serif;font-size:22px;color:#C9A84C;letter-spacing:0.1em;">Organized.</p></td></tr><tr><td style="background:#FFFFFF;padding:36px 32px;"><p style="margin:0 0 8px;font-size:16px;color:#1A0900;font-family:Georgia,serif;">Hi ${opts.client_name},</p><p style="margin:0 0 24px;font-size:15px;color:#444;line-height:1.75;font-family:Georgia,serif;">Your order has been delivered. We hope you love it!</p>${ctaBtn}</td></tr><tr><td style="background:#F8F6F2;padding:20px 32px;border-radius:0 0 12px 12px;border-top:1px solid #EDE9E3;"><p style="margin:0 0 4px;font-size:14px;color:#555;font-family:Georgia,serif;">— ${opts.workspace_name}</p><p style="margin:0;font-size:12px;color:#BBB;font-family:Georgia,serif;">Powered by Organized.</p></td></tr></table></td></tr></table></body></html>`
  return { subject, html }
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    const body = await req.json()
    const { type, order_id } = body
    let { client_name, client_email, owner_email, product_name, quantity, total_amount, currency, shipping_address, carrier, tracking_number, tracking_url, receipt_url, workspace_name, booking_link, cart_items, unit_price } = body

    if (order_id) {
      const authHeader = req.headers.get('Authorization') || ''
      const sb = createClient(
        Deno.env.get('SUPABASE_URL') || '',
        Deno.env.get('SUPABASE_ANON_KEY') || '',
        { global: { headers: { Authorization: authHeader } } }
      )
      const { data: ord } = await sb
        .from('orders')
        .select('client_name,client_email,product_name,quantity,unit_price,total_amount,currency,cart_items,workspace_id,shipping_address')
        .eq('id', order_id)
        .single()
      if (ord) {
        client_name = client_name || ord.client_name
        client_email = client_email || ord.client_email
        product_name = product_name || ord.product_name
        quantity = quantity ?? ord.quantity
        unit_price = unit_price ?? ord.unit_price
        total_amount = total_amount || String(ord.total_amount ?? '0.00')
        currency = currency || ord.currency
        cart_items = cart_items ?? ord.cart_items
        shipping_address = shipping_address || ord.shipping_address
        const { data: ws } = await sb
          .from('workspaces')
          .select('email,name')
          .eq('id', ord.workspace_id)
          .single()
        if (ws) {
          owner_email = owner_email || ws.email
          workspace_name = workspace_name || ws.name
        }
      }
    }

    if (!client_email || !type) {
      return new Response(JSON.stringify({ error: 'Missing required fields: client_email, type' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    let subject: string
    let html: string

    if (type === 'confirmed') {
      const result = buildConfirmedEmail({
        client_name: client_name || 'there',
        product_name: product_name || 'your order',
        quantity: quantity || 1,
        total_amount: total_amount || '0.00',
        currency: currency || 'CAD',
        shipping_address: shipping_address || '',
        receipt_url: receipt_url || null,
        workspace_name: workspace_name || '',
        cart_items: cart_items || null,
        unit_price: unit_price || null,
      })
      subject = result.subject
      html = result.html
    } else if (type === 'shipped') {
      const result = buildShippedEmail({
        client_name: client_name || 'there',
        product_name: product_name || 'your order',
        carrier: carrier || 'Carrier',
        tracking_number: tracking_number || '',
        tracking_url: tracking_url || '',
        workspace_name: workspace_name || '',
      })
      subject = result.subject
      html = result.html
    } else if (type === 'delivered') {
      const result = buildDeliveredEmail({
        client_name: client_name || 'there',
        product_name: product_name || 'your order',
        booking_link: booking_link || 'https://beorganized.io',
        workspace_name: workspace_name || '',
      })
      subject = result.subject
      html = result.html
    } else {
      return new Response(JSON.stringify({ error: 'Invalid type. Must be confirmed, shipped, or delivered.' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Send client email
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({ from: FROM, to: [client_email], subject, html }),
    })

    if (!res.ok) {
      const err = await res.text()
      return new Response(JSON.stringify({ error: err }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Send owner notification for confirmed orders
    if (type === 'confirmed' && owner_email) {
      try {
        const ownerResult = buildOwnerConfirmedEmail({
              product_name: product_name || 'your order',
              quantity: quantity || 1,
              total_amount: total_amount || '0.00',
              currency: currency || 'CAD',
              client_name: client_name || '',
              client_email: client_email || '',
              shipping_address: shipping_address || '',
              cart_items: cart_items || null,
              unit_price: unit_price || null,
            })
        await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${RESEND_API_KEY}`,
          },
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
