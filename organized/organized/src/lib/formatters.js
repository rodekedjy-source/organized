/**
 * Formate un montant monétaire.
 * formatCurrency(45, 'CAD', 'fr-CA') → "45,00 $"
 * formatCurrency(45, 'EUR', 'fr-FR') → "45,00 €"
 */
export function formatCurrency(amount, currency = 'CAD', locale = 'fr-CA') {
  if (amount == null || isNaN(amount)) return '—'
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)
}

/**
 * Formate une date en jour court + jour du mois + mois court.
 * formatDate('2026-05-05', 'fr-FR') → "Lun 5 mai"
 * formatDate('2026-05-05', 'en-CA') → "Mon May 5"
 */
export function formatDate(date, locale = 'fr-FR') {
  if (!date) return '—'
  const d = date instanceof Date ? date : new Date(date)
  if (isNaN(d)) return '—'
  return d.toLocaleDateString(locale, { weekday: 'short', day: 'numeric', month: 'short' })
}

/**
 * Formate une durée en minutes en chaîne lisible.
 * formatDuration(90)  → "1h30"
 * formatDuration(60)  → "1h"
 * formatDuration(45)  → "45min"
 * formatDuration(0)   → "0min"
 */
export function formatDuration(minutes) {
  if (minutes == null || isNaN(minutes)) return '—'
  const m = Math.round(minutes)
  if (m < 60) return `${m}min`
  const h = Math.floor(m / 60)
  const rem = m % 60
  return rem === 0 ? `${h}h` : `${h}h${String(rem).padStart(2, '0')}`
}

/**
 * Formate un numéro de téléphone en affichage lisible.
 * Supporte les formats nord-américains (10 chiffres) et internationaux.
 * formatPhone('5141234567')    → "(514) 123-4567"
 * formatPhone('+15141234567')  → "+1 (514) 123-4567"
 * formatPhone('0612345678')    → "06 12 34 56 78"  (FR)
 */
export function formatPhone(phone) {
  if (!phone) return '—'
  const digits = phone.replace(/\D/g, '')

  // International avec indicatif +1 (Amérique du Nord)
  if (phone.startsWith('+1') && digits.length === 11) {
    const area = digits.slice(1, 4)
    const prefix = digits.slice(4, 7)
    const line = digits.slice(7)
    return `+1 (${area}) ${prefix}-${line}`
  }

  // Nord-américain 10 chiffres
  if (digits.length === 10) {
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`
  }

  // Français 10 chiffres (commence par 0)
  if (digits.length === 10 && digits.startsWith('0')) {
    return digits.match(/.{2}/g).join(' ')
  }

  // Fallback : retourne tel quel
  return phone
}
