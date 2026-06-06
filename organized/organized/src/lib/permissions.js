const PLAN_FEATURES = {
  free: {
    services: { enabled: true, limit: 5 },
    appointments: { enabled: true, limit: null },
    clients: { enabled: true, limit: null },
    booking: { enabled: true, limit: null },
    availability: { enabled: true, limit: null },
    products: { enabled: false, limit: 0 },
    portfolio: { enabled: false, limit: 0 },
    reviews: { enabled: false, limit: 0 },
    formations: { enabled: false, limit: 0 },
    ai_photo: { enabled: false, limit: 0 },
    analytics: { enabled: false, limit: 0 },
    custom_branding: { enabled: false, limit: 0 },
    payments_deposit: { enabled: false, limit: 0 },
  },
  pro: {
    services: { enabled: true, limit: null },
    appointments: { enabled: true, limit: null },
    clients: { enabled: true, limit: null },
    booking: { enabled: true, limit: null },
    availability: { enabled: true, limit: null },
    products: { enabled: true, limit: null },
    portfolio: { enabled: true, limit: null },
    reviews: { enabled: true, limit: null },
    formations: { enabled: true, limit: null },
    ai_photo: { enabled: true, limit: null },
    analytics: { enabled: true, limit: null },
    custom_branding: { enabled: true, limit: null },
    payments_deposit: { enabled: true, limit: null },
  }
}

export function getFeature(plan, feature) {
  const key = plan === 'pro' ? 'pro' : 'free'
  return PLAN_FEATURES[key]?.[feature] ?? { enabled: false, limit: 0 }
}

export function canAccess(plan, feature) {
  return getFeature(plan, feature).enabled
}

export function getLimit(plan, feature) {
  return getFeature(plan, feature).limit
}
