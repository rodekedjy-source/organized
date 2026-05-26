import { supabase } from '../lib/supabase'

export async function getOrders(workspaceId) {
  const { data } = await supabase
    .from('orders')
    .select('id,status,total_amount,product_name,customer_name,created_at,tracking_number,delivered_at,client_name,client_email,carrier,shipped_at')
    .eq('workspace_id', workspaceId)
    .order('created_at', { ascending: false })
  return data || []
}

export async function fetchOrders(workspaceId) {
  const { data, error } = await supabase
    .from('orders')
    .select('id,client_name,client_email,product_id,product_name,quantity,unit_price,total_amount,currency,status,payment_status,shipping_address,carrier,tracking_number,shipped_at,delivered_at,tracking_token,created_at,cart_items')
    .eq('workspace_id', workspaceId)
    .is('deleted_at', null)
    .order('created_at', { ascending: false })
  return { data, error }
}

export async function fetchOrderByToken(token) {
  const { data, error } = await supabase
    .from('orders')
    .select('id,client_name,product_name,quantity,total_amount,currency,status,carrier,tracking_number,shipped_at,delivered_at,shipping_address,created_at,tracking_token')
    .eq('tracking_token', token)
    .is('deleted_at', null)
    .maybeSingle()
  return { data, error }
}

export async function updateOrderStatus(orderId, status) {
  const { error } = await supabase
    .from('orders')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', orderId)
  return { error }
}

export async function updateOrderTracking(orderId, { carrier, tracking_number }) {
  const { data, error } = await supabase
    .from('orders')
    .update({
      carrier,
      tracking_number,
      status: 'shipped',
      shipped_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('id', orderId)
    .select().single()
  return { data, error }
}

export async function markOrderDelivered(orderId) {
  const { error } = await supabase
    .from('orders')
    .update({
      status: 'delivered',
      delivered_at: new Date().toISOString(),
    })
    .eq('id', orderId)
  return { error }
}

export async function notifyOrderProcessing(order, workspaceName, ownerEmail) {
  const { data, error } = await supabase.functions.invoke('send-order-email', {
    body: {
      type: 'processing',
      client_name: order.client_name,
      client_email: order.client_email,
      owner_email: ownerEmail || '',
      product_name: order.product_name,
      quantity: order.quantity,
      unit_price: order.unit_price,
      total_amount: String(order.total_amount || '0.00'),
      currency: order.currency || 'CAD',
      workspace_name: workspaceName,
      cart_items: order.cart_items || null,
    },
  })
  return { data, error }
}

export async function notifyOrderShipped(order, workspaceName, bookingLink) {
  const trackingUrl = `https://beorganized.io/track/${order.tracking_token}`
  const { data, error } = await supabase.functions.invoke('send-order-email', {
    body: {
      type: 'shipped',
      client_name: order.client_name,
      client_email: order.client_email,
      product_name: order.product_name,
      carrier: order.carrier,
      tracking_number: order.tracking_number,
      tracking_url: trackingUrl,
      workspace_name: workspaceName,
      booking_link: bookingLink,
    },
  })
  return { data, error }
}

export async function notifyOrderDelivered(order, workspaceName, bookingLink) {
  const { data, error } = await supabase.functions.invoke('send-order-email', {
    body: {
      type: 'delivered',
      client_name: order.client_name,
      client_email: order.client_email,
      product_name: order.product_name,
      workspace_name: workspaceName,
      booking_link: bookingLink,
    },
  })
  return { data, error }
}
