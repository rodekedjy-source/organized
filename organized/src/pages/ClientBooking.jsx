import { useRef, useState, useEffect, useLayoutEffect, useCallback } from 'react'
import { useParams } from 'react-router-dom'
import { useClientData }  from '../hooks/useClientData'
import { useHeroCanvas }  from '../hooks/useHeroCanvas'
import { useBookingFlow } from '../hooks/useBookingFlow'

// ─────────────────────────────────────────────────────────────────────────────
// FAQ GENERATOR — builds FAQ items from workspace structured settings
// ─────────────────────────────────────────────────────────────────────────────
function buildFAQ(workspace, services) {
  if (!workspace) return []
  const faq = workspace.faq_settings || {}
  const items = []

  // Deposit
  const depositSvcs = services.filter(s => Number(s.deposit_amount) > 0)
  if (depositSvcs.length > 0) {
    const amt = depositSvcs[0].deposit_amount
    items.push({
      q: 'Is a deposit required to book?',
      a: `Yes, a deposit of $${amt} is required for certain services. It is collected at the studio on arrival and applied to your total. Deposits are non-refundable for cancellations under 48 hours.`,
    })
  }

  // Cancellation
  const cancelHours = faq.cancellation_hours || 48
  items.push({
    q: 'Can I cancel or reschedule?',
    a: `You can cancel or reschedule up to ${cancelHours} hours before your appointment at no charge. Use the link in your confirmation email. Late cancellations may incur a fee.`,
  })

  // Domicile
  if (workspace.offers_domicile) {
    items.push({
      q: 'Do you offer home visits?',
      a: `Yes. Home visits are available within ${workspace.domicile_radius_km || 25} km for an additional travel fee of $${workspace.domicile_fee || 45}. Space requirements apply — you will need adequate lighting, a chair at a table, and access to a sink.`,
    })
  }

  // Hair types
  const hairTypes = faq.hair_types
  if (hairTypes && hairTypes.length > 0) {
    items.push({
      q: 'Do you work with all hair types?',
      a: `Yes — ${hairTypes.join(', ')} textures are all welcome. Every session begins with a consultation to understand your hair history and goals before any work begins.`,
    })
  } else {
    items.push({
      q: 'Do you work with all hair types?',
      a: 'Yes, all hair types and textures are welcome. Every session begins with a consultation tailored to your specific needs.',
    })
  }

  // Preparation
  if (faq.prep_notes) {
    items.push({ q: 'How should I prepare for my appointment?', a: faq.prep_notes })
  } else {
    items.push({
      q: 'How should I prepare for my appointment?',
      a: 'Come with clean, dry hair unless you have a specific condition. Bring reference photos if you have them. Avoid heavy styling products the day of your appointment.',
    })
  }

  // Location / address
  if (workspace.address_visibility !== 'hidden' && workspace.address_street) {
    items.push({
      q: 'Where is the studio located?',
      a: workspace.address_visibility === 'full'
        ? `${workspace.address_street}, ${workspace.address_city}${workspace.address_province ? ', ' + workspace.address_province : ''}. By appointment only — walk-ins are not accepted.`
        : `We are located in ${workspace.neighborhood || workspace.address_city}. The full address is included in your confirmation email after booking.`,
    })
  }

  return items.slice(0, 5)
}

// ─────────────────────────────────────────────────────────────────────────────
// CALENDAR HELPERS
// ─────────────────────────────────────────────────────────────────────────────
const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December']
const TODAY  = new Date()
const TODAY_DATE = new Date(TODAY.getFullYear(), TODAY.getMonth(), TODAY.getDate())

function formatDateLabel(year, month, day) {
  return `${MONTHS[month]} ${day}, ${year}`
}

// ─────────────────────────────────────────────────────────────────────────────
// STAR RATING
// ─────────────────────────────────────────────────────────────────────────────
function Stars({ rating }) {
  return (
    <span style={{ color: 'var(--gold)', fontSize: 12, letterSpacing: 2 }}>
      {'★'.repeat(Math.round(rating))}{'☆'.repeat(5 - Math.round(rating))}
    </span>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────────────────────────────────────
export default function ClientBooking() {
  const { slug } = useParams()

  const {
    workspace, services, products, offerings, reviews, portfolio,
    loading, notFound, fetchDaySlots, isDateAvailable,
  } = useClientData(slug)

  const {
    open, page, service, addons, visitType, policyChecked, domicileForm,
    calYear, calMonth, selectedDay, selectedTime, slots, slotsLoading,
    form, errors, submitting, appointment, submitError,
    setVisitType, setPolicyChecked, setDomicileForm,
    setSelectedDay, setSelectedTime, setForm, setErrors,
    openBooking, closeBooking, goToPage, toggleAddon,
    loadSlots, prevMonth, nextMonth, submitBooking, downloadICS,
  } = useBookingFlow()

  // ── Theme ──────────────────────────────────────────────────────────────────
  const [theme, setTheme] = useState('dark')
  useEffect(() => {
    if (!workspace) return
    const saved = localStorage.getItem('organized_theme')
    const t = saved || workspace.theme || 'dark'
    setTheme(t)
    document.documentElement.setAttribute('data-theme', t)
  }, [workspace])

  const toggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark'
    setTheme(next)
    document.documentElement.setAttribute('data-theme', next)
    localStorage.setItem('organized_theme', next)
  }

  // ── Canvas ─────────────────────────────────────────────────────────────────
  const canvasRef = useRef(null)
  useHeroCanvas(canvasRef, theme)

  // ── Active tab ────────────────────────────────────────────────────────────
  const [activeTab, setActiveTab] = useState('book')

  // ── Portfolio overlay ─────────────────────────────────────────────────────
  const [portfolioOpen,     setPortfolioOpen]     = useState(false)
  const [portfolioFilter,   setPortfolioFilter]   = useState('all')

  // ── Policy overlay ────────────────────────────────────────────────────────
  const [policyOpen, setPolicyOpen] = useState(false)

  // ── Cart ──────────────────────────────────────────────────────────────────
  const [cartOpen,  setCartOpen]  = useState(false)
  const [cartItems, setCartItems] = useState([])
  const cartCount = cartItems.reduce((s, i) => s + i.qty, 0)
  const cartTotal = cartItems.reduce((s, i) => s + i.price * i.qty, 0)

  const addToCart = useCallback((product) => {
    setCartItems((prev) => {
      const ex = prev.find((i) => i.id === product.id)
      if (ex) return prev.map((i) => i.id === product.id ? { ...i, qty: i.qty + 1 } : i)
      return [...prev, { ...product, qty: 1 }]
    })
  }, [])

  const changeQty = useCallback((id, delta) => {
    setCartItems((prev) =>
      prev.map((i) => i.id === id ? { ...i, qty: i.qty + delta } : i)
          .filter((i) => i.qty > 0)
    )
  }, [])

  // ── FAQ ────────────────────────────────────────────────────────────────────
  const [openFAQ, setOpenFAQ] = useState(null)
  const faqItems = buildFAQ(workspace, services)

  // ── Float contact ─────────────────────────────────────────────────────────
  const [floatOpen, setFloatOpen] = useState(false)

  // ── Shop filter ───────────────────────────────────────────────────────────
  const [shopFilter, setShopFilter] = useState('all')

  // ── Day slot loading ──────────────────────────────────────────────────────
  const handleDayClick = useCallback(async (day) => {
    setSelectedDay(day)
    setSelectedTime(null)
    await loadSlots(day, fetchDaySlots)
  }, [loadSlots, fetchDaySlots, setSelectedDay, setSelectedTime])

  // ── Google Maps URL ───────────────────────────────────────────────────────
  const mapsUrl = workspace
    ? `https://maps.google.com/?q=${encodeURIComponent(
        [workspace.address_street, workspace.address_city, workspace.address_province]
          .filter(Boolean).join(', ')
      )}`
    : '#'

  // ─────────────────────────────────────────────────────────────────────────
  // LOADING / NOT FOUND
  // ─────────────────────────────────────────────────────────────────────────
  if (loading) return (
    <div style={{ minHeight: '100vh', background: '#080706', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ fontFamily: 'Playfair Display, serif', fontSize: 24, color: '#C9A84C' }}>Organized.</div>
    </div>
  )

  if (notFound) return (
    <div style={{ minHeight: '100vh', background: '#080706', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#F0EAE0', textAlign: 'center', padding: 32 }}>
      <div style={{ fontFamily: 'Playfair Display, serif', fontSize: 64, color: '#C9A84C', lineHeight: 1 }}>404</div>
      <div style={{ fontFamily: 'Playfair Display, serif', fontSize: 24, marginTop: 16 }}>Profile not found</div>
      <div style={{ fontSize: 14, color: '#9A8E7E', marginTop: 8 }}>This page does not exist or has not been published yet.</div>
    </div>
  )

  // ─────────────────────────────────────────────────────────────────────────
  // COMPUTED
  // ─────────────────────────────────────────────────────────────────────────
  const isCurMonth = calYear === TODAY.getFullYear() && calMonth === TODAY.getMonth()
  const firstDayOfMonth = new Date(calYear, calMonth, 1).getDay()
  const daysInMonth = new Date(calYear, calMonth + 1, 0).getDate()

  const featuredProduct = workspace?.featured_product_id
    ? products.find((p) => p.id === workspace.featured_product_id) || products[0]
    : products[0]
  const otherProducts = products.filter((p) => p.id !== featuredProduct?.id)

  const avgRating = reviews.length
    ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
    : null

  // ─────────────────────────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────────────────────────
  return (
    <>
      <style>{CSS}</style>

      {/* ── NAV ── */}
      <nav className="cb-nav">
        <div className="cb-nav-logo">
          {workspace.name}
          <span>via Organized.</span>
        </div>
        <div className="cb-nav-right">
          <button className="cb-theme-btn" onClick={toggleTheme} title="Toggle theme">
            {theme === 'dark' ? '☀' : '☾'}
          </button>
          <button className="cb-cart-btn" onClick={() => setCartOpen(true)}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/></svg>
            {cartCount > 0 && <span className="cb-cart-badge">{cartCount}</span>}
          </button>
          <div className="cb-hamburger" onClick={() => {}}>
            <span /><span /><span />
          </div>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section className="cb-hero">
        <div className="cb-hero-bg">
          <canvas ref={canvasRef} className="cb-canvas" />
        </div>
        <div className="cb-hero-content">
          <div className="cb-avail-tag">
            <span className="cb-tag-dot" />
            Accepting New Clients
          </div>
          <h1 className="cb-hero-name">{workspace.name}</h1>
          <div className="cb-hero-eyebrow">
            {workspace.tagline || workspace.location || 'Beauty Professional'}
          </div>
          {workspace.bio && <p className="cb-hero-bio">{workspace.bio}</p>}

          <div className="cb-hero-cta">
            <button className="cb-btn-primary" onClick={() => { setActiveTab('book'); document.querySelector('.cb-tabs')?.scrollIntoView({ behavior: 'smooth' }) }}>
              Book your Service
            </button>
            <button className="cb-btn-ghost" onClick={() => setPortfolioOpen(true)}>
              See our Portfolio
            </button>
          </div>

          <div className="cb-socials">
            {workspace.instagram && (
              <a href={`https://instagram.com/${workspace.instagram.replace('@', '')}`} target="_blank" rel="noreferrer">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
                {workspace.instagram}
              </a>
            )}
            {workspace.tiktok && (
              <a href={`https://tiktok.com/@${workspace.tiktok.replace('@', '')}`} target="_blank" rel="noreferrer">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/></svg>
                TikTok
              </a>
            )}
          </div>
        </div>
      </section>

      {/* ── TAB BAR ── */}
      <div className="cb-tabs">
        {[
          { id: 'book', label: 'Book an Appointment' },
          { id: 'shop', label: 'Shop', hidden: products.length === 0 },
          { id: 'learn', label: 'Learn', hidden: offerings.length === 0 },
        ].filter(t => !t.hidden).map((t) => (
          <button
            key={t.id}
            className={`cb-tab ${activeTab === t.id ? 'active' : ''}`}
            onClick={() => setActiveTab(t.id)}
          >
            {activeTab === t.id && <span className="cb-tab-dot" />}
            {t.label}
          </button>
        ))}
      </div>

      {/* ══════════════════════════════════════════════════════════════════
          BOOK PANEL
      ══════════════════════════════════════════════════════════════════ */}
      {activeTab === 'book' && (
        <div className="cb-panel">

          {/* Services */}
          <section className="cb-section">
            <div className="cb-section-inner">
              <div className="cb-section-head">
                <div className="cb-eyebrow">Menu</div>
                <h2 className="cb-heading">Services &amp; <em>Pricing</em></h2>
                <p className="cb-sub">Pricing may vary by hair length. Consultation included in every service.</p>
              </div>
              <div className="cb-services-grid">
                {services.map((svc) => (
                  <div key={svc.id} className="cb-svc-card" onClick={() => openBooking(svc)}>
                    <div className="cb-svc-cat">{svc.category || 'Service'}</div>
                    <div className="cb-svc-name">{svc.name}</div>
                    <div className="cb-svc-dur">{svc.duration_min} min</div>
                    <div className="cb-svc-footer">
                      <div className="cb-svc-price">
                        {svc.is_free ? 'Free' : `$${Number(svc.price).toFixed(0)}`}
                      </div>
                      <button className="cb-svc-book">Book →</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Reviews */}
          {reviews.length > 0 && (
            <section className="cb-section cb-section-alt">
              <div className="cb-section-inner">
                <div className="cb-section-head">
                  <div className="cb-eyebrow">Testimonials</div>
                  <h2 className="cb-heading">What clients <em>say</em></h2>
                  {avgRating && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 8 }}>
                      <span style={{ fontFamily: 'Playfair Display, serif', fontSize: 32, color: 'var(--gold)' }}>{avgRating}</span>
                      <Stars rating={Number(avgRating)} />
                      <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{reviews.length} reviews</span>
                    </div>
                  )}
                </div>
                <div className="cb-reviews-grid">
                  {reviews.slice(0, 3).map((r, i) => (
                    <div key={i} className="cb-review-card">
                      <div className="cb-review-quote">"</div>
                      <Stars rating={r.rating} />
                      <p className="cb-review-body">{r.body}</p>
                      <div className="cb-review-author">
                        <div className="cb-review-avatar">{r.reviewer_name?.[0] || '?'}</div>
                        <div>
                          <div className="cb-review-name">{r.reviewer_name}</div>
                          <div className="cb-review-svc">{r.service_name || r.service_label || ''}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          )}

          {/* Find Us */}
          {workspace.address_street && workspace.address_visibility !== 'hidden' && (
            <section className="cb-section">
              <div className="cb-section-inner">
                <div className="cb-eyebrow">Find Us</div>
                <h2 className="cb-heading">The <em>Studio</em></h2>
                <div className="cb-location-grid">
                  <div className="cb-location-map">
                    <div className="cb-map-grid" />
                    <div className="cb-map-pin-wrap">
                      <div className="cb-map-pulse" /><div className="cb-map-pulse cb-pulse-2" />
                      <div className="cb-map-pin" />
                    </div>
                  </div>
                  <div className="cb-location-details">
                    <div className="cb-loc-row">
                      <div className="cb-loc-icon">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>
                      </div>
                      <div>
                        <div className="cb-loc-label">Address</div>
                        <div className="cb-loc-val">
                          {workspace.address_visibility === 'full'
                            ? `${workspace.address_street}, ${workspace.address_city}`
                            : `${workspace.neighborhood || workspace.address_city} — full address in confirmation email`}
                        </div>
                      </div>
                    </div>
                    {workspace.working_hours && (
                      <div className="cb-loc-row">
                        <div className="cb-loc-icon">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                        </div>
                        <div>
                          <div className="cb-loc-label">Hours</div>
                          <div className="cb-loc-val" style={{ whiteSpace: 'pre-line' }}>{workspace.working_hours}</div>
                        </div>
                      </div>
                    )}
                    {workspace.address_visibility === 'full' && (
                      <a className="cb-directions-btn" href={mapsUrl} target="_blank" rel="noreferrer">
                        Get Directions →
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* FAQ */}
          {faqItems.length > 0 && (
            <section className="cb-section cb-section-alt">
              <div className="cb-section-inner">
                <div className="cb-eyebrow">Questions</div>
                <h2 className="cb-heading">Before you <em>arrive</em></h2>
                <div className="cb-faq-list" style={{ marginTop: 32 }}>
                  {faqItems.map((item, i) => (
                    <div key={i} className="cb-faq-item">
                      <button className="cb-faq-q" onClick={() => setOpenFAQ(openFAQ === i ? null : i)}>
                        <span>{item.q}</span>
                        <span className={`cb-faq-icon ${openFAQ === i ? 'open' : ''}`}>+</span>
                      </button>
                      {openFAQ === i && <p className="cb-faq-a">{item.a}</p>}
                    </div>
                  ))}
                </div>
              </div>
            </section>
          )}

        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════
          SHOP PANEL
      ══════════════════════════════════════════════════════════════════ */}
      {activeTab === 'shop' && (
        <div className="cb-panel">
          <div className="cb-shop-hero">
            <div>
              <div className="cb-eyebrow">The Edit</div>
              <h2 className="cb-heading">Shop <em>Picks</em></h2>
              <p className="cb-sub">Products personally tested and recommended. Studio pickup or delivery.</p>
            </div>
            <div className="cb-shop-filters">
              {['all', 'hair-care', 'styling', 'treatment'].map((f) => (
                <button key={f} className={`cb-filter-tab ${shopFilter === f ? 'active' : ''}`} onClick={() => setShopFilter(f)}>
                  {f === 'all' ? 'All' : f.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </button>
              ))}
            </div>
          </div>

          {/* Featured product */}
          {featuredProduct && (
            <div className="cb-featured-product">
              <div className="cb-featured-img">
                {featuredProduct.image_url || (featuredProduct.images && featuredProduct.images[0])
                  ? <img src={featuredProduct.image_url || featuredProduct.images[0]} alt={featuredProduct.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  : <div className="cb-product-placeholder">✦</div>}
              </div>
              <div className="cb-featured-info">
                <div className="cb-featured-badge">Recommended Pick</div>
                <div className="cb-featured-name">{featuredProduct.name}</div>
                {workspace.featured_product_note && (
                  <blockquote className="cb-featured-quote">"{workspace.featured_product_note}"</blockquote>
                )}
                <p className="cb-product-desc">{featuredProduct.description}</p>
                <div className="cb-featured-footer">
                  <div className="cb-product-price">${Number(featuredProduct.price).toFixed(0)}</div>
                  <button
                    className="cb-add-bag-btn"
                    disabled={featuredProduct.stock === 0}
                    onClick={() => addToCart(featuredProduct)}
                  >
                    {featuredProduct.stock === 0 ? 'Sold Out' : 'Add to Bag'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* 2-col products grid */}
          <div className="cb-products-grid">
            {otherProducts.map((p) => (
              <div key={p.id} className={`cb-product-card ${p.stock === 0 ? 'sold-out' : ''}`}>
                <div className="cb-product-img">
                  {p.image_url || (p.images && p.images[0])
                    ? <img src={p.image_url || p.images[0]} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    : <div className="cb-product-placeholder">✦</div>}
                  {p.stock === 0 && <div className="cb-badge cb-badge-soldout">Sold Out</div>}
                  {p.stock > 0 && p.stock <= 3 && <div className="cb-badge cb-badge-limited">Only {p.stock} left</div>}
                </div>
                <div className="cb-product-info">
                  <div className="cb-product-name">{p.name}</div>
                  <p className="cb-product-desc">{p.description}</p>
                  <div className="cb-product-footer">
                    <div className="cb-product-price">${Number(p.price).toFixed(0)}</div>
                    <button
                      className="cb-add-bag-btn"
                      disabled={p.stock === 0}
                      onClick={() => addToCart(p)}
                    >
                      {p.stock === 0 ? 'Sold Out' : 'Add to Bag'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════
          LEARN PANEL
      ══════════════════════════════════════════════════════════════════ */}
      {activeTab === 'learn' && (
        <div className="cb-panel">
          <div className="cb-learn-hero">
            <div className="cb-eyebrow">Knowledge</div>
            <h2 className="cb-heading">Formations &amp; <em>Workshops</em></h2>
            <p className="cb-sub">Sharing the techniques behind the craft — in person and online.</p>
          </div>
          <div className="cb-offerings-grid">
            {offerings.map((o) => (
              <div key={o.id} className={`cb-offering-card ${o.format === 'online' ? 'online' : ''}`}>
                <div className="cb-offering-type">
                  <span className={`cb-type-badge ${o.format === 'online' ? 'online' : 'inperson'}`}>
                    {o.format === 'online' ? 'Online Course' : 'In-Person Workshop'}
                  </span>
                </div>
                <div className="cb-offering-title">{o.title}</div>
                <p className="cb-offering-desc">{o.description}</p>
                {o.duration_label && (
                  <div className="cb-offering-meta">
                    <span>{o.duration_label}</span>
                    {o.max_students && <span>{o.max_students} spots</span>}
                  </div>
                )}
                <div className="cb-offering-footer">
                  <div className="cb-offering-price">${Number(o.price).toFixed(0)}</div>
                  <button className="cb-enroll-btn">Reserve a Spot →</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════
          BOOKING OVERLAY
      ══════════════════════════════════════════════════════════════════ */}
      <div className={`cb-overlay ${open ? 'open' : ''}`}>
        {/* Header */}
        <div className="cb-overlay-header">
          <button className="cb-overlay-back" onClick={page === 1 ? closeBooking : () => goToPage(page - 1)}>
            {page === 1 ? '✕' : '← Back'}
          </button>
          <div className="cb-overlay-service-info">
            <div className="cb-overlay-svc-name">{service?.name || ''}</div>
            <div className="cb-overlay-svc-price">
              {service ? (service.is_free ? 'Free' : `$${Number(service.price).toFixed(0)}`) : ''}
              {service?.duration_min ? ` · ${service.duration_min} min` : ''}
            </div>
          </div>
          <button className="cb-overlay-close" onClick={closeBooking}>✕</button>
        </div>

        {/* Step dots */}
        <div className="cb-dots">
          {[1, 2, 3].map((n) => (
            <div key={n} className={`cb-dot ${page === n ? 'active' : page > n ? 'done' : ''}`} />
          ))}
        </div>

        {/* Pages */}
        <div className="cb-overlay-pages">
          <div className="cb-overlay-inner" style={{ transform: `translateX(-${(page - 1) * 100}%)` }}>

            {/* PAGE 1 — Visit Type */}
            <div className="cb-overlay-page">
              <div className="cb-page-content">
                <div className="cb-page-eyebrow">Step 1 of 3</div>
                <h3 className="cb-page-title">Where would you<br />like your service?</h3>

                {/* Add-ons if any */}
                {service?.addons?.length > 0 && (
                  <div className="cb-addons-wrap">
                    <div className="cb-addons-label">Enhance your session</div>
                    <div className="cb-addons-chips">
                      {service.addons.map((addon) => {
                        const name = typeof addon === 'string' ? addon : addon.name
                        const price = typeof addon === 'object' && addon.price ? ` +$${addon.price}` : ''
                        const label = name + price
                        return (
                          <div
                            key={label}
                            className={`cb-addon-chip ${addons.includes(label) ? 'on' : ''}`}
                            onClick={() => toggleAddon(label)}
                          >
                            {label}
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}

                {/* Visit cards */}
                <div className="cb-visit-cards">
                  <div className={`cb-visit-card ${visitType === 'studio' ? 'selected' : ''}`} onClick={() => setVisitType('studio')}>
                    <div className="cb-vc-radio" />
                    <div className="cb-vc-title">Studio Visit</div>
                    <div className="cb-vc-sub">
                      {workspace.address_visibility !== 'hidden' && workspace.neighborhood
                        ? `Visit the studio in ${workspace.neighborhood}.`
                        : 'Come to the studio. Full professional setup included.'}
                    </div>
                    <div className="cb-vc-fee">No additional fee</div>
                  </div>

                  {workspace.offers_domicile && (
                    <div className={`cb-visit-card ${visitType === 'home' ? 'selected' : ''}`} onClick={() => setVisitType('home')}>
                      <div className="cb-vc-radio" />
                      <div className="cb-vc-title">Home Visit</div>
                      <div className="cb-vc-sub">
                        Stylist comes to your address. Within {workspace.domicile_radius_km || 25} km. Travel fee applies.
                      </div>
                      <div className="cb-vc-fee">
                        <span className="cb-vc-fee-amt">+${workspace.domicile_fee || 45}</span> travel fee
                      </div>
                    </div>
                  )}
                </div>

                {/* Home panel */}
                {visitType === 'home' && (
                  <div className="cb-home-panel">
                    <div className="cb-addr-box">
                      <div className="cb-addr-label">Your Address</div>
                      <input
                        className={`cb-input ${errors.street ? 'err' : ''}`}
                        placeholder="Street address, Apt number"
                        value={domicileForm.street}
                        onChange={e => setDomicileForm(f => ({ ...f, street: e.target.value }))}
                        autoComplete="street-address"
                      />
                      {errors.street && <div className="cb-err">Please enter your street address</div>}
                      <div className="cb-row2">
                        <input className="cb-input" placeholder="City" value={domicileForm.city} onChange={e => setDomicileForm(f => ({ ...f, city: e.target.value }))} autoComplete="address-level2" />
                        <input className="cb-input" placeholder="Postal code" value={domicileForm.postal} onChange={e => setDomicileForm(f => ({ ...f, postal: e.target.value }))} autoComplete="postal-code" />
                      </div>
                      <textarea
                        className="cb-input"
                        placeholder="Floor, door code, parking notes… (optional)"
                        value={domicileForm.access}
                        onChange={e => setDomicileForm(f => ({ ...f, access: e.target.value }))}
                        style={{ minHeight: 64, resize: 'none' }}
                      />
                    </div>

                    {/* Policy checkbox */}
                    <div className="cb-policy-check" onClick={() => { setPolicyChecked(c => !c); setErrors(e => ({ ...e, policy: false })) }}>
                      <div className={`cb-chk-box ${policyChecked ? 'checked' : ''}`} />
                      <div className="cb-policy-text">
                        I have read and agree to the{' '}
                        <button className="cb-policy-link" onClick={e => { e.stopPropagation(); setPolicyOpen(true) }}>
                          home service policy
                        </button>
                      </div>
                    </div>
                    {errors.policy && <div className="cb-err">Please confirm you have read the home service policy</div>}
                  </div>
                )}
              </div>
              <div className="cb-overlay-footer">
                <button className="cb-btn-primary" onClick={() => goToPage(2)}>Continue</button>
              </div>
            </div>

            {/* PAGE 2 — Date & Time */}
            <div className="cb-overlay-page">
              <div className="cb-page-content">
                <div className="cb-page-eyebrow">Step 2 of 3</div>
                <h3 className="cb-page-title">Pick your date<br />&amp; time</h3>

                {/* Calendar */}
                <div className="cb-cal">
                  <div className="cb-cal-head">
                    <div className="cb-cal-month">{MONTHS[calMonth]} {calYear}</div>
                    <div className="cb-cal-navs">
                      <button className="cb-cal-nav" onClick={prevMonth} disabled={isCurMonth}>‹</button>
                      <button className="cb-cal-nav" onClick={nextMonth}>›</button>
                    </div>
                  </div>
                  <div className="cb-cal-dnames">
                    {['Su','Mo','Tu','We','Th','Fr','Sa'].map(d => <div key={d} className="cb-cal-dname">{d}</div>)}
                  </div>
                  <div className="cb-cal-grid">
                    {Array(firstDayOfMonth).fill(null).map((_, i) => <div key={`e${i}`} />)}
                    {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((day) => {
                      const thisDate = new Date(calYear, calMonth, day)
                      const isPast   = thisDate < TODAY_DATE
                      const isToday  = thisDate.getTime() === TODAY_DATE.getTime()
                      const isAvail  = !isPast && !isToday && isDateAvailable(calYear, calMonth, day)
                      const isSel    = selectedDay === day

                      return (
                        <div
                          key={day}
                          className={`cb-cal-day ${isSel ? 'sel' : ''} ${isPast ? 'past' : ''} ${isToday ? 'today' : ''} ${isAvail ? 'avail' : 'off'}`}
                          onClick={() => isAvail && handleDayClick(day)}
                        >
                          {day}
                        </div>
                      )
                    })}
                  </div>
                </div>

                {/* Time slots */}
                {selectedDay && (
                  <div className="cb-time-wrap">
                    <div className="cb-time-label">
                      {slotsLoading ? 'Loading...' : `Available times — ${formatDateLabel(calYear, calMonth, selectedDay)}`}
                    </div>
                    {!slotsLoading && (
                      <div className="cb-time-grid">
                        {slots.map((slot) => (
                          <div
                            key={slot.label}
                            className={`cb-time-slot ${!slot.available ? 'booked' : ''} ${selectedTime === slot.label ? 'sel' : ''}`}
                            onClick={() => slot.available && setSelectedTime(slot.label)}
                          >
                            {slot.label}
                          </div>
                        ))}
                        {slots.length === 0 && (
                          <div style={{ gridColumn: '1/-1', fontSize: 13, color: 'var(--text-muted)', padding: '16px 0' }}>
                            No available slots for this day.
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
              <div className="cb-overlay-footer">
                <button className="cb-btn-primary" disabled={!selectedDay || !selectedTime} onClick={() => goToPage(3)}>
                  Continue
                </button>
              </div>
            </div>

            {/* PAGE 3 — Your Info */}
            <div className="cb-overlay-page">
              <div className="cb-page-content">
                <div className="cb-page-eyebrow">Step 3 of 3</div>
                <h3 className="cb-page-title">Your details</h3>

                {/* Recap */}
                <div className="cb-recap">
                  <div className="cb-recap-header">
                    <div className="cb-recap-lbl">Booking Summary</div>
                    <div className="cb-recap-status">Ready to confirm</div>
                  </div>
                  <div className="cb-recap-rows">
                    {[
                      ['Service', service?.name],
                      ['Visit', visitType === 'home' ? 'Home Visit' : 'Studio Visit'],
                      visitType === 'home' && ['Address', domicileForm.street],
                      ['Date', selectedDay ? formatDateLabel(calYear, calMonth, selectedDay) : ''],
                      ['Time', selectedTime],
                      ['Duration', service?.duration_min ? `${service.duration_min} min` : ''],
                      addons.length > 0 && ['Add-ons', addons.join(', ')],
                    ].filter(Boolean).map(([k, v]) => v && (
                      <div key={k} className="cb-recap-row">
                        <span className="cb-recap-key">{k}</span>
                        <span className="cb-recap-val">{v}</span>
                      </div>
                    ))}
                    <div className="cb-recap-tear" />
                    <div className="cb-recap-row">
                      <span className="cb-recap-key">Total</span>
                      <span className="cb-recap-val gold">
                        {service?.is_free ? 'Free' : `$${Number(service?.price || 0).toFixed(0)}`}
                        {visitType === 'home' ? ` + $${workspace.domicile_fee || 45} travel` : ''}
                      </span>
                    </div>
                    {service && Number(service.deposit_amount) > 0 && (
                      <div className="cb-recap-row">
                        <span className="cb-recap-key">Deposit</span>
                        <span className="cb-recap-val gold">${service.deposit_amount} at studio</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Form */}
                <div className="cb-form-row2">
                  <div>
                    <input className={`cb-input ${errors.fname ? 'err' : ''}`} placeholder="First name" value={form.fname} onChange={e => setForm(f => ({ ...f, fname: e.target.value }))} autoComplete="given-name" />
                    {errors.fname && <div className="cb-err">Required</div>}
                  </div>
                  <div>
                    <input className={`cb-input ${errors.lname ? 'err' : ''}`} placeholder="Last name" value={form.lname} onChange={e => setForm(f => ({ ...f, lname: e.target.value }))} autoComplete="family-name" />
                    {errors.lname && <div className="cb-err">Required</div>}
                  </div>
                </div>
                <input className={`cb-input ${errors.email ? 'err' : ''}`} placeholder="Email address" type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} autoComplete="email" />
                {errors.email && <div className="cb-err">Enter a valid email</div>}
                <input className={`cb-input ${errors.phone ? 'err' : ''}`} placeholder="Phone number" type="tel" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} autoComplete="tel" />
                {errors.phone && <div className="cb-err">Enter a valid phone number</div>}
                <select className="cb-input cb-select" value={form.source} onChange={e => setForm(f => ({ ...f, source: e.target.value }))}>
                  <option value="">How did you find us? (optional)</option>
                  <option value="instagram">Instagram</option>
                  <option value="tiktok">TikTok</option>
                  <option value="friend">Friend or family</option>
                  <option value="google">Google</option>
                  <option value="returning">Returning client</option>
                  <option value="other">Other</option>
                </select>
                <textarea className="cb-input" placeholder="Notes — hair history, allergies, references… (optional)" value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} style={{ minHeight: 72, resize: 'none' }} />

                <div className="cb-policy-note">
                  By confirming you agree to the cancellation policy. {workspace.faq_settings?.cancellation_hours || 48}-hour notice required for rescheduling.
                </div>

                {submitError && <div className="cb-submit-error">{submitError}</div>}
              </div>
              <div className="cb-overlay-footer">
                <button className="cb-btn-primary" disabled={submitting} onClick={() => submitBooking(workspace)}>
                  {submitting ? 'Confirming…' : 'Confirm Booking'}
                </button>
              </div>
            </div>

            {/* PAGE 4 — Success */}
            <div className="cb-overlay-page">
              <div className="cb-page-content cb-success">
                <div className="cb-success-check">✓</div>
                <h3 className="cb-success-title">
                  You are booked, <em>{form.fname}</em>
                </h3>
                <p className="cb-success-sub">
                  A confirmation has been sent to <strong>{form.email}</strong>
                </p>
                {appointment && (
                  <div className="cb-success-ticket">
                    <div className="cb-ticket-header">
                      <div className="cb-ticket-lbl">Appointment</div>
                      <div className="cb-ticket-status">Confirmed</div>
                    </div>
                    <div className="cb-ticket-rows">
                      <div className="cb-recap-row"><span className="cb-recap-key">Service</span><span className="cb-recap-val">{service?.name}</span></div>
                      <div className="cb-recap-row"><span className="cb-recap-key">Visit</span><span className="cb-recap-val">{visitType === 'home' ? 'Home Visit' : 'Studio Visit'}</span></div>
                      <div className="cb-recap-row"><span className="cb-recap-key">Date</span><span className="cb-recap-val">{selectedDay ? formatDateLabel(calYear, calMonth, selectedDay) : ''}</span></div>
                      <div className="cb-recap-row"><span className="cb-recap-key">Time</span><span className="cb-recap-val">{selectedTime}</span></div>
                      <div className="cb-recap-row"><span className="cb-recap-key">Total</span><span className="cb-recap-val gold">{service?.is_free ? 'Free' : `$${Number(service?.price || 0).toFixed(0)}`}{visitType === 'home' ? ` + $${workspace.domicile_fee || 45}` : ''}</span></div>
                    </div>
                  </div>
                )}
                <div className="cb-success-actions">
                  <button className="cb-btn-primary" onClick={downloadICS}>Add to Calendar</button>
                  <button className="cb-btn-ghost" onClick={closeBooking}>Back to Studio</button>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════════
          PORTFOLIO OVERLAY
      ══════════════════════════════════════════════════════════════════ */}
      <div className={`cb-portfolio-overlay ${portfolioOpen ? 'open' : ''}`}>
        <div className="cb-portfolio-nav">
          <button className="cb-portfolio-back" onClick={() => setPortfolioOpen(false)}>← Back to Studio</button>
          <div className="cb-portfolio-title">Portfolio</div>
          <div />
        </div>
        <div className="cb-portfolio-content">
          <div className="cb-eyebrow" style={{ marginBottom: 8 }}>The Work</div>
          <h2 className="cb-heading" style={{ marginBottom: 24 }}>Crafted with <em>intention</em></h2>
          <div className="cb-portfolio-filters">
            {['all', 'color', 'cut', 'treatment'].map((f) => (
              <button key={f} className={`cb-filter-tab ${portfolioFilter === f ? 'active' : ''}`} onClick={() => setPortfolioFilter(f)}>
                {f === 'all' ? 'All Work' : f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>
          <div className="cb-portfolio-grid">
            {(portfolio.length > 0 ? portfolio : Array(6).fill(null)).map((photo, i) => (
              <div key={photo?.id || i} className="cb-portfolio-item">
                {photo?.url
                  ? <img src={photo.url} alt={photo.caption || ''} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  : <div className="cb-product-placeholder" style={{ height: '100%', background: '#181818' }}>✦</div>
                }
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════════
          HOME SERVICE POLICY OVERLAY
      ══════════════════════════════════════════════════════════════════ */}
      <div className={`cb-policy-overlay ${policyOpen ? 'open' : ''}`}>
        <div className="cb-portfolio-nav">
          <button className="cb-portfolio-back" onClick={() => setPolicyOpen(false)}>← Back to booking</button>
          <div className="cb-portfolio-title">Home Service Policy</div>
          <div />
        </div>
        <div className="cb-portfolio-content">
          <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 32 }}>
            Please read this policy carefully before requesting a home visit.
          </p>
          {[
            { title: 'Travel Fee', body: `A travel fee of $${workspace?.domicile_fee || 45} applies to all home visit appointments. This fee is collected at the time of service and is non-refundable.` },
            { title: 'Service Radius', body: `Home visits are available within ${workspace?.domicile_radius_km || 25} km. Addresses outside this radius cannot be serviced. You will be contacted to rebook as a studio visit if your address is out of range.` },
            { title: 'Space Requirements', body: 'You must prepare: a chair at a table with adequate lighting, access to a sink, and sufficient clear space for equipment.' },
            { title: 'Parking & Access', body: 'Parking must be available within reasonable distance. Please include all access details (floor, code, parking) in your booking notes.' },
            { title: 'Cancellation', body: `The standard ${workspace?.faq_settings?.cancellation_hours || 48}-hour cancellation policy applies. Late cancellations forfeit the travel fee in addition to any deposit.` },
          ].map(({ title, body }) => (
            <div key={title} style={{ marginBottom: 24 }}>
              <div style={{ fontSize: 11, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--gold)', marginBottom: 8, paddingBottom: 8, borderBottom: '1px solid var(--dark-4)' }}>{title}</div>
              <p style={{ fontSize: 14, color: 'var(--text-soft)', fontWeight: 300, lineHeight: 1.85 }}>{body}</p>
            </div>
          ))}
        </div>
        <div className="cb-policy-footer">
          <button className="cb-btn-primary" onClick={() => { setPolicyChecked(true); setPolicyOpen(false) }}>
            I have read — Return to booking
          </button>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════════
          CART DRAWER
      ══════════════════════════════════════════════════════════════════ */}
      {cartOpen && <div className="cb-overlay-mask" onClick={() => setCartOpen(false)} />}
      <div className={`cb-cart-drawer ${cartOpen ? 'open' : ''}`}>
        <div className="cb-cart-head">
          <div>
            <div style={{ fontSize: 9, letterSpacing: '0.22em', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Shopping Bag</div>
            <div style={{ fontFamily: 'Playfair Display, serif', fontSize: 14, color: 'var(--gold-light)', marginTop: 4 }}>{cartCount} item{cartCount !== 1 ? 's' : ''}</div>
          </div>
          <button className="cb-portfolio-back" onClick={() => setCartOpen(false)}>✕</button>
        </div>
        <div className="cb-cart-body">
          {cartItems.length === 0
            ? <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)', fontSize: 13 }}>Your bag is empty.</div>
            : cartItems.map((item) => (
              <div key={item.id} className="cb-cart-item">
                <div style={{ width: 44, height: 44, background: 'var(--dark-4)', borderRadius: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>✦</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, color: 'var(--text)', marginBottom: 2 }}>{item.name}</div>
                  <div style={{ fontSize: 13, color: 'var(--gold)', fontFamily: 'Playfair Display, serif' }}>${Number(item.price).toFixed(0)}</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 8 }}>
                    <button className="cb-qty-btn" onClick={() => changeQty(item.id, -1)}>−</button>
                    <span style={{ fontSize: 13, color: 'var(--text)' }}>{item.qty}</span>
                    <button className="cb-qty-btn" onClick={() => changeQty(item.id, 1)}>+</button>
                  </div>
                </div>
              </div>
            ))
          }
        </div>
        {cartItems.length > 0 && (
          <div className="cb-cart-footer">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <span style={{ fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Subtotal</span>
              <span style={{ fontFamily: 'Playfair Display, serif', fontSize: 22, color: 'var(--gold)' }}>${cartTotal}</span>
            </div>
            <button className="cb-btn-primary" style={{ width: '100%' }}>Proceed to Checkout →</button>
          </div>
        )}
      </div>

      {/* ── FLOAT CONTACT ── */}
      <div className="cb-float">
        {floatOpen && (
          <div className="cb-float-menu">
            {workspace.phone && (
              <div className="cb-float-item"><span className="cb-float-label">Call</span><a href={`tel:${workspace.phone}`} className="cb-float-sub">📞</a></div>
            )}
            {workspace.instagram && (
              <div className="cb-float-item"><span className="cb-float-label">Instagram</span><a href={`https://instagram.com/${workspace.instagram.replace('@', '')}`} target="_blank" rel="noreferrer" className="cb-float-sub">✦</a></div>
            )}
          </div>
        )}
        <button className="cb-float-main" onClick={() => setFloatOpen(f => !f)}>
          {floatOpen ? '✕' : '✦'}
        </button>
      </div>

    </>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// CSS — all variables and component styles
// ─────────────────────────────────────────────────────────────────────────────
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;0,600;1,400;1,500&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600&display=swap');

*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
html,body{overflow-x:hidden}

:root {
  --gold:#C9A84C;--gold-light:#E8C97A;--gold-dim:rgba(201,168,76,0.12);--gold-border:rgba(201,168,76,0.25);
  --dark:#090909;--dark-2:#101010;--dark-3:#181818;--dark-4:#242424;--dark-5:#333;
  --text:#F0EAE0;--text-muted:#9A8E7E;--text-soft:#CCC0A8;
  --error:#d0605a;--success:#56bb86;
  --ease:cubic-bezier(.25,.46,.45,.94);
}
[data-theme="light"]{
  --gold:#9A6E10;--gold-light:#B88A28;--gold-dim:rgba(154,110,16,0.08);--gold-border:rgba(154,110,16,0.20);
  --dark:#FFFFFF;--dark-2:#F7F7F7;--dark-3:#F0F0F0;--dark-4:#E4E4E4;--dark-5:#CCC;
  --text:#141210;--text-muted:#6B6158;--text-soft:#3A342E;
}

*,*::before,*::after{transition:background-color .4s ease,color .4s ease,border-color .4s ease}
.cb-overlay,.cb-portfolio-overlay,.cb-policy-overlay,.cb-overlay-inner,.cb-canvas{transition:none!important}

/* NAV */
.cb-nav{position:fixed;top:0;left:0;right:0;z-index:500;padding:0 24px;height:64px;display:flex;align-items:center;justify-content:space-between;background:rgba(10,5,2,0.98);border-bottom:1px solid rgba(201,168,76,0.1);backdrop-filter:blur(20px)}
[data-theme="light"] .cb-nav{background:rgba(14,7,2,0.98)!important}
.cb-nav-logo{font-family:'Playfair Display',serif;font-size:17px;color:var(--gold);display:flex;align-items:center;gap:8px}
.cb-nav-logo span{font-family:'DM Sans',sans-serif;font-size:11px;color:rgba(201,168,76,0.45);font-weight:300}
.cb-nav-right{display:flex;align-items:center;gap:10px}
.cb-theme-btn,.cb-cart-btn{background:transparent;border:1px solid rgba(201,168,76,0.2);color:rgba(201,168,76,0.65);width:36px;height:36px;border-radius:2px;display:flex;align-items:center;justify-content:center;cursor:pointer;font-size:14px;transition:all .2s}
.cb-theme-btn:hover,.cb-cart-btn:hover{border-color:var(--gold);color:var(--gold-light)}
.cb-cart-btn{position:relative}
.cb-cart-badge{position:absolute;top:-6px;right:-6px;background:var(--gold);color:var(--dark);font-size:9px;font-weight:700;width:16px;height:16px;border-radius:50%;display:flex;align-items:center;justify-content:center}
.cb-hamburger{display:flex;flex-direction:column;gap:5px;cursor:pointer;padding:4px}
.cb-hamburger span{display:block;width:20px;height:1.5px;background:rgba(201,168,76,0.65)}

/* HERO */
.cb-hero{min-height:100vh;padding-top:64px;position:relative;overflow:hidden;display:flex;align-items:center}
.cb-hero-bg{position:absolute;inset:0;z-index:0}
.cb-canvas{position:absolute;inset:0;width:100%;height:100%;display:block}
.cb-hero-content{position:relative;z-index:1;padding:60px 28px 80px;max-width:560px}
.cb-avail-tag{display:inline-flex;align-items:center;gap:8px;background:rgba(201,168,76,0.1);border:1px solid rgba(201,168,76,0.22);border-radius:100px;padding:5px 16px 5px 10px;font-size:10px;color:rgba(201,168,76,0.9);letter-spacing:.14em;text-transform:uppercase;margin-bottom:24px}
.cb-tag-dot{width:6px;height:6px;border-radius:50%;background:var(--gold);animation:pulse 2.5s infinite}
@keyframes pulse{0%,100%{opacity:1}50%{opacity:.2}}
.cb-hero-name{font-family:'Playfair Display',serif;font-size:clamp(48px,9vw,80px);font-weight:500;line-height:.95;color:#FAF6F1;margin-bottom:12px}
.cb-hero-eyebrow{font-size:11px;letter-spacing:.2em;text-transform:uppercase;color:rgba(250,246,241,.6);margin-bottom:18px}
.cb-hero-bio{font-size:15px;color:rgba(250,246,241,.72);font-weight:300;line-height:1.8;margin-bottom:36px;max-width:380px}
.cb-hero-cta{display:flex;gap:10px;flex-wrap:wrap;margin-bottom:36px}
.cb-socials{display:flex;align-items:center;gap:16px}
.cb-socials a{display:flex;align-items:center;gap:6px;font-size:12px;color:rgba(250,246,241,.5);text-decoration:none;transition:color .2s}
.cb-socials a:hover{color:rgba(250,246,241,.85)}
@media(max-width:500px){.cb-hero-cta{flex-direction:column}.cb-hero-cta button{width:100%;text-align:center}}

/* BUTTONS */
.cb-btn-primary{background:var(--gold);color:#141210;border:none;padding:14px 28px;font-family:'DM Sans',sans-serif;font-size:12px;font-weight:600;letter-spacing:.08em;text-transform:uppercase;cursor:pointer;border-radius:1px;transition:all .25s}
.cb-btn-primary:hover{background:var(--gold-light);box-shadow:0 8px 28px rgba(201,168,76,.25)}
.cb-btn-primary:disabled{background:var(--dark-5);color:var(--text-muted);cursor:not-allowed;box-shadow:none}
.cb-btn-ghost{background:transparent;color:rgba(250,246,241,.7);border:1px solid rgba(250,246,241,.25);padding:14px 28px;font-family:'DM Sans',sans-serif;font-size:12px;font-weight:400;letter-spacing:.08em;text-transform:uppercase;cursor:pointer;border-radius:1px;transition:all .25s}
.cb-btn-ghost:hover{border-color:rgba(250,246,241,.5);color:rgba(250,246,241,.9)}
[data-theme="light"] .cb-btn-ghost{color:var(--text-soft);border-color:var(--dark-5)}

/* TABS */
.cb-tabs{position:sticky;top:64px;z-index:400;background:rgba(10,5,2,0.98);border-bottom:1px solid rgba(201,168,76,.1);backdrop-filter:blur(20px);display:flex;padding:0 20px;overflow-x:auto}
[data-theme="light"] .cb-tabs{background:rgba(14,7,2,0.98)!important}
.cb-tab{background:transparent;border:none;color:rgba(201,168,76,.5);font-family:'DM Sans',sans-serif;font-size:10px;font-weight:500;letter-spacing:.14em;text-transform:uppercase;padding:18px 20px;cursor:pointer;display:flex;align-items:center;gap:7px;position:relative;white-space:nowrap;transition:color .25s}
.cb-tab::after{content:'';position:absolute;bottom:0;left:0;right:0;height:2px;background:var(--gold);transform:scaleX(0);transition:transform .3s var(--ease)}
.cb-tab.active{color:var(--gold-light)}
.cb-tab.active::after{transform:scaleX(1)}
.cb-tab-dot{width:5px;height:5px;border-radius:50%;background:var(--gold)}

/* PANELS */
.cb-panel{background:var(--dark)}
.cb-section{padding:72px 24px;background:var(--dark)}
.cb-section-alt{background:var(--dark-2);border-top:1px solid var(--dark-4);border-bottom:1px solid var(--dark-4)}
.cb-section-inner{max-width:1100px;margin:0 auto}
.cb-section-head{margin-bottom:40px}
.cb-eyebrow{font-size:9px;letter-spacing:.26em;text-transform:uppercase;color:var(--gold);margin-bottom:10px}
.cb-heading{font-family:'Playfair Display',serif;font-size:clamp(26px,5vw,40px);font-weight:500;line-height:1.15;color:var(--text)}
.cb-heading em{font-style:italic;color:var(--gold)}
.cb-sub{font-size:13px;color:var(--text-muted);font-weight:300;line-height:1.75;margin-top:10px}

/* SERVICES */
.cb-services-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:1px;background:var(--dark-4);border:1px solid var(--dark-4)}
.cb-svc-card{background:var(--dark-2);padding:32px 28px;cursor:pointer;transition:background .3s;position:relative;overflow:hidden}
.cb-svc-card::after{content:'';position:absolute;bottom:0;left:0;right:0;height:1px;background:linear-gradient(to right,transparent,var(--gold),transparent);transform:scaleX(0);transform-origin:left;transition:transform .4s var(--ease)}
.cb-svc-card:hover{background:var(--dark-3)}
.cb-svc-card:hover::after{transform:scaleX(1)}
.cb-svc-cat{font-size:9px;letter-spacing:.18em;text-transform:uppercase;color:var(--text-muted);margin-bottom:16px}
.cb-svc-name{font-family:'Playfair Display',serif;font-size:20px;color:var(--text);margin-bottom:6px}
.cb-svc-dur{font-size:12px;color:var(--text-muted);margin-bottom:24px}
.cb-svc-footer{display:flex;align-items:flex-end;justify-content:space-between}
.cb-svc-price{font-family:'Playfair Display',serif;font-size:24px;color:var(--gold)}
.cb-svc-book{font-size:10px;color:var(--text-muted);letter-spacing:.1em;text-transform:uppercase;border:1px solid var(--dark-5);padding:7px 14px;border-radius:1px;cursor:pointer;background:transparent;font-family:'DM Sans',sans-serif;transition:all .2s}
.cb-svc-card:hover .cb-svc-book{border-color:var(--gold-border);color:var(--gold-light)}

/* REVIEWS */
.cb-reviews-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:1px;background:var(--dark-4);border:1px solid var(--dark-4)}
.cb-review-card{background:var(--dark-2);padding:28px 24px;position:relative;transition:background .3s}
.cb-review-card:hover{background:var(--dark-3)}
.cb-review-quote{position:absolute;top:16px;right:20px;font-family:'Playfair Display',serif;font-size:56px;color:rgba(201,168,76,.05);font-style:italic;line-height:1}
.cb-review-body{font-size:13px;line-height:1.85;color:var(--text-soft);margin:12px 0 20px;font-style:italic;font-family:'Playfair Display',serif}
.cb-review-author{display:flex;align-items:center;gap:10px}
.cb-review-avatar{width:34px;height:34px;border-radius:50%;background:var(--gold-dim);border:1px solid var(--gold-border);display:flex;align-items:center;justify-content:center;font-size:13px;color:var(--gold);font-family:'Playfair Display',serif;flex-shrink:0}
.cb-review-name{font-size:13px;font-weight:500;color:var(--text)}
.cb-review-svc{font-size:10px;color:var(--text-muted);margin-top:2px;letter-spacing:.06em}

/* LOCATION */
.cb-location-grid{display:grid;grid-template-columns:1fr 1fr;gap:1px;background:var(--dark-4);border:1px solid var(--dark-4);margin-top:36px}
.cb-location-map{background:linear-gradient(155deg,#141a14,#0e120e,#0b0f0b);min-height:280px;position:relative;overflow:hidden;display:flex;align-items:center;justify-content:center}
.cb-map-grid{position:absolute;inset:0;background-image:linear-gradient(rgba(201,168,76,.04) 1px,transparent 1px),linear-gradient(90deg,rgba(201,168,76,.04) 1px,transparent 1px);background-size:48px 48px}
.cb-map-pin-wrap{position:relative;z-index:2;display:flex;flex-direction:column;align-items:center;gap:12px}
.cb-map-pin{width:40px;height:40px;background:var(--gold);border-radius:50% 50% 50% 0;transform:rotate(-45deg);display:flex;align-items:center;justify-content:center;box-shadow:0 8px 24px rgba(201,168,76,.3)}
.cb-map-pin::after{content:'';width:14px;height:14px;background:var(--dark);border-radius:50%;transform:rotate(45deg)}
.cb-map-pulse{position:absolute;border-radius:50%;border:1px solid rgba(201,168,76,.2);animation:mapPulse 2.5s infinite}
.cb-map-pulse{width:70px;height:70px}.cb-pulse-2{width:110px;height:110px;animation-delay:.5s}
@keyframes mapPulse{0%{opacity:1;transform:scale(.6)}100%{opacity:0;transform:scale(1.4)}}
.cb-location-details{background:var(--dark-2);padding:40px 32px;display:flex;flex-direction:column;gap:24px}
.cb-loc-row{display:flex;gap:14px;align-items:flex-start}
.cb-loc-icon{width:34px;height:34px;border:1px solid rgba(201,168,76,.14);border-radius:2px;display:flex;align-items:center;justify-content:center;color:var(--gold);flex-shrink:0}
.cb-loc-label{font-size:8px;letter-spacing:.18em;text-transform:uppercase;color:var(--text-muted);margin-bottom:5px}
.cb-loc-val{font-size:14px;color:var(--text);line-height:1.55}
.cb-directions-btn{display:inline-flex;align-items:center;gap:8px;background:var(--gold);color:#141210;border:none;padding:13px 24px;font-family:'DM Sans',sans-serif;font-size:12px;font-weight:600;letter-spacing:.08em;text-transform:uppercase;cursor:pointer;border-radius:1px;text-decoration:none;transition:all .25s}
.cb-directions-btn:hover{background:var(--gold-light)}
@media(max-width:640px){.cb-location-grid{grid-template-columns:1fr}}

/* FAQ */
.cb-faq-list{display:flex;flex-direction:column}
.cb-faq-item{border-bottom:1px solid var(--dark-4)}
.cb-faq-item:first-child{border-top:1px solid var(--dark-4)}
.cb-faq-q{width:100%;background:transparent;border:none;color:var(--text);font-family:'DM Sans',sans-serif;font-size:14px;text-align:left;padding:18px 0;cursor:pointer;display:flex;justify-content:space-between;align-items:center;gap:16px;transition:color .2s}
.cb-faq-q:hover{color:var(--gold-light)}
.cb-faq-icon{font-size:18px;color:var(--text-muted);transition:transform .3s;flex-shrink:0}
.cb-faq-icon.open{transform:rotate(45deg);color:var(--gold)}
.cb-faq-a{font-size:14px;color:var(--text-soft);font-weight:300;line-height:1.85;padding-bottom:18px}

/* SHOP */
.cb-shop-hero{padding:64px 24px 48px;background:var(--dark-2);border-bottom:1px solid var(--dark-4);display:flex;align-items:flex-end;justify-content:space-between;gap:24px;flex-wrap:wrap}
.cb-shop-filters{display:flex;gap:5px;flex-wrap:wrap}
.cb-filter-tab{padding:7px 16px;border:1px solid var(--dark-5);background:transparent;color:var(--text-muted);font-family:'DM Sans',sans-serif;font-size:10px;letter-spacing:.08em;cursor:pointer;border-radius:100px;transition:all .2s;text-transform:uppercase}
.cb-filter-tab.active{border-color:var(--gold);background:var(--gold-dim);color:var(--gold-light)}
.cb-filter-tab:hover{border-color:var(--gold-border);color:var(--gold-light)}

.cb-featured-product{display:grid;grid-template-columns:1fr 1.4fr;background:var(--dark-2);border-bottom:1px solid var(--dark-4);min-height:320px}
.cb-featured-img{position:relative;overflow:hidden;background:var(--dark-3);display:flex;align-items:center;justify-content:center}
.cb-featured-info{padding:44px 40px;display:flex;flex-direction:column;justify-content:center}
.cb-featured-badge{display:inline-flex;align-items:center;gap:6px;font-size:8px;letter-spacing:.2em;text-transform:uppercase;color:var(--gold-light);background:var(--gold-dim);border:1px solid var(--gold-border);padding:4px 12px;border-radius:100px;margin-bottom:14px;width:fit-content}
.cb-featured-name{font-family:'Playfair Display',serif;font-size:26px;color:var(--text);margin-bottom:10px}
.cb-featured-quote{font-size:13px;color:var(--text-soft);font-style:italic;border-left:2px solid var(--gold);padding-left:14px;margin-bottom:10px;line-height:1.75;font-family:'Playfair Display',serif}
.cb-featured-footer{display:flex;align-items:center;justify-content:space-between;gap:12px;padding-top:16px;border-top:1px solid var(--dark-4);margin-top:12px}
@media(max-width:640px){.cb-featured-product{grid-template-columns:1fr}.cb-featured-img{height:220px}}

.cb-products-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:1px;background:var(--dark-4);border:1px solid var(--dark-4);border-top:none}
.cb-product-card{background:var(--dark-2);transition:background .3s}
.cb-product-card:not(.sold-out){cursor:pointer}
.cb-product-card:not(.sold-out):hover{background:var(--dark-3)}
.cb-product-card.sold-out{opacity:.55}
.cb-product-img{position:relative;padding-bottom:90%;background:var(--dark-3);overflow:hidden;display:flex;align-items:center;justify-content:center}
.cb-product-placeholder{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font-size:40px;color:rgba(201,168,76,.1)}
.cb-badge{position:absolute;top:10px;left:10px;font-size:8px;letter-spacing:.16em;text-transform:uppercase;padding:4px 10px;border-radius:100px}
.cb-badge-soldout{background:rgba(255,255,255,.04);border:1px solid var(--dark-5);color:var(--text-muted)}
.cb-badge-limited{background:rgba(192,80,74,.12);border:1px solid rgba(192,80,74,.28);color:#e88080}
.cb-product-info{padding:18px}
.cb-product-name{font-family:'Playfair Display',serif;font-size:16px;color:var(--text);margin-bottom:6px}
.cb-product-desc{font-size:12px;color:var(--text-muted);font-weight:300;line-height:1.65;margin-bottom:14px}
.cb-product-footer{display:flex;align-items:center;justify-content:space-between;gap:8px}
.cb-product-price{font-family:'Playfair Display',serif;font-size:20px;color:var(--gold)}
.cb-add-bag-btn{background:transparent;border:1px solid var(--dark-5);color:var(--text-muted);font-family:'DM Sans',sans-serif;font-size:10px;letter-spacing:.1em;text-transform:uppercase;padding:7px 14px;border-radius:1px;cursor:pointer;transition:all .2s;white-space:nowrap}
.cb-add-bag-btn:not(:disabled):hover{border-color:var(--gold);color:var(--gold-light);background:var(--gold-dim)}
.cb-add-bag-btn:disabled{opacity:.4;cursor:not-allowed}
@media(max-width:480px){.cb-products-grid{grid-template-columns:1fr}}

/* LEARN */
.cb-learn-hero{padding:64px 24px 48px;background:var(--dark-2);border-bottom:1px solid var(--dark-4)}
.cb-offerings-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:1px;background:var(--dark-4);border:1px solid var(--dark-4);border-top:none}
.cb-offering-card{background:var(--dark-2);padding:36px 28px;transition:background .3s}
.cb-offering-card.online{background:var(--dark-3)}
.cb-offering-card:hover{background:var(--dark-3)}
.cb-offering-type{margin-bottom:18px}
.cb-type-badge{font-size:9px;letter-spacing:.18em;text-transform:uppercase;padding:5px 12px;border-radius:100px}
.cb-type-badge.inperson{background:var(--gold-dim);border:1px solid var(--gold-border);color:var(--gold-light)}
.cb-type-badge.online{background:rgba(86,187,134,.08);border:1px solid rgba(86,187,134,.22);color:#56bb86}
.cb-offering-title{font-family:'Playfair Display',serif;font-size:22px;color:var(--text);margin-bottom:10px}
.cb-offering-desc{font-size:13px;color:var(--text-muted);font-weight:300;line-height:1.8;margin-bottom:22px}
.cb-offering-meta{display:flex;gap:18px;margin-bottom:22px;font-size:12px;color:var(--text-soft)}
.cb-offering-footer{display:flex;align-items:center;justify-content:space-between;gap:12px;padding-top:20px;border-top:1px solid var(--dark-4)}
.cb-offering-price{font-family:'Playfair Display',serif;font-size:26px;color:var(--gold)}
.cb-enroll-btn{background:var(--gold);color:#141210;border:none;padding:11px 22px;font-family:'DM Sans',sans-serif;font-size:11px;font-weight:600;letter-spacing:.08em;text-transform:uppercase;cursor:pointer;border-radius:1px;transition:all .25s;white-space:nowrap}
.cb-enroll-btn:hover{background:var(--gold-light)}

/* BOOKING OVERLAY */
.cb-overlay{position:fixed;inset:0;z-index:900;background:var(--dark);display:flex;flex-direction:column;transform:translateY(100%);transition:transform .42s cubic-bezier(.25,.46,.45,.94);overflow:hidden}
.cb-overlay.open{transform:translateY(0)}
.cb-overlay-header{display:flex;align-items:center;justify-content:space-between;padding:0 20px;height:58px;border-bottom:1px solid var(--dark-4);background:var(--dark-2);flex-shrink:0}
.cb-overlay-back,.cb-overlay-close{background:transparent;border:none;color:var(--text-muted);cursor:pointer;font-family:'DM Sans',sans-serif;font-size:12px;padding:8px 0;transition:color .2s;letter-spacing:.04em;min-width:56px}
.cb-overlay-back:hover,.cb-overlay-close:hover{color:var(--text)}
.cb-overlay-close{text-align:right}
.cb-overlay-service-info{text-align:center}
.cb-overlay-svc-name{font-family:'Playfair Display',serif;font-size:14px;color:var(--text)}
.cb-overlay-svc-price{font-size:10px;color:var(--text-muted);margin-top:2px}

.cb-dots{display:flex;align-items:center;justify-content:center;gap:7px;padding:14px 0;flex-shrink:0}
.cb-dot{width:5px;height:5px;border-radius:50%;background:var(--dark-5);transition:all .3s}
.cb-dot.active{width:18px;border-radius:3px;background:var(--gold)}
.cb-dot.done{background:rgba(201,168,76,.35)}

.cb-overlay-pages{flex:1;overflow:hidden;position:relative}
.cb-overlay-inner{display:flex;height:100%;transition:transform .38s cubic-bezier(.25,.46,.45,.94)}
.cb-overlay-page{min-width:100%;height:100%;overflow-y:auto;-webkit-overflow-scrolling:touch;display:flex;flex-direction:column}
.cb-page-content{flex:1;padding:28px 20px 16px}
.cb-overlay-footer{padding:14px 20px 28px;background:var(--dark);border-top:1px solid var(--dark-4);flex-shrink:0}
.cb-overlay-footer .cb-btn-primary{width:100%;padding:16px}

.cb-page-eyebrow{font-size:8px;letter-spacing:.26em;text-transform:uppercase;color:var(--gold);margin-bottom:8px}
.cb-page-title{font-family:'Playfair Display',serif;font-size:22px;color:var(--text);line-height:1.2;margin-bottom:24px}

/* Add-ons */
.cb-addons-wrap{margin-bottom:20px;padding-bottom:20px;border-bottom:1px solid var(--dark-4)}
.cb-addons-label{font-size:8px;letter-spacing:.2em;text-transform:uppercase;color:var(--text-muted);margin-bottom:10px}
.cb-addons-chips{display:flex;flex-wrap:wrap;gap:6px}
.cb-addon-chip{padding:6px 14px;border:1px solid var(--dark-5);border-radius:100px;font-size:11px;color:var(--text-soft);cursor:pointer;transition:all .2s}
.cb-addon-chip.on{border-color:var(--gold);background:var(--gold-dim);color:var(--gold-light)}

/* Visit cards */
.cb-visit-cards{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:16px}
.cb-visit-card{border:1px solid var(--dark-5);background:var(--dark-2);padding:18px 14px;cursor:pointer;transition:all .25s;border-radius:1px;position:relative}
.cb-visit-card.selected{border-color:var(--gold);background:var(--dark-3)}
.cb-visit-card.selected::after{content:'';position:absolute;bottom:0;left:0;right:0;height:2px;background:var(--gold)}
.cb-vc-radio{width:14px;height:14px;border-radius:50%;border:1px solid var(--dark-5);margin-bottom:12px;transition:all .2s}
.cb-visit-card.selected .cb-vc-radio{border-color:var(--gold);background:var(--gold)}
.cb-vc-title{font-family:'Playfair Display',serif;font-size:15px;color:var(--text);margin-bottom:6px}
.cb-vc-sub{font-size:11px;color:var(--text-muted);font-weight:300;line-height:1.6;margin-bottom:10px}
.cb-vc-fee{font-size:11px;color:var(--text-soft)}
.cb-vc-fee-amt{font-family:'Playfair Display',serif;color:var(--gold);font-size:13px}

/* Domicile */
.cb-home-panel{margin-top:4px}
.cb-addr-box{border:1px solid var(--dark-4);padding:16px 14px;margin-bottom:8px}
.cb-addr-label{font-size:8px;letter-spacing:.2em;text-transform:uppercase;color:var(--text-muted);margin-bottom:12px;padding-bottom:10px;border-bottom:1px solid var(--dark-4)}
.cb-input{width:100%;background:var(--dark-3);border:1px solid var(--dark-5);color:var(--text);padding:11px 14px;font-family:'DM Sans',sans-serif;font-size:14px;border-radius:1px;outline:none;transition:border-color .2s;margin-bottom:8px;display:block;-webkit-appearance:none}
.cb-input:focus{border-color:rgba(201,168,76,.4)}
.cb-input.err{border-color:var(--error)}
.cb-input::placeholder{color:var(--dark-5)}
.cb-select{cursor:pointer;appearance:none;background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6' viewBox='0 0 10 6'%3E%3Cpath fill='%239A8E7E' d='M0 0l5 6 5-6z'/%3E%3C/svg%3E");background-repeat:no-repeat;background-position:right 14px center}
.cb-select option{background:#111;color:var(--text)}
.cb-row2{display:grid;grid-template-columns:1fr 1fr;gap:8px}
.cb-err{font-size:11px;color:var(--error);margin-bottom:6px;margin-top:-4px}
.cb-policy-check{display:flex;align-items:flex-start;gap:12px;border:1px solid var(--dark-4);padding:14px;cursor:pointer;margin-bottom:6px}
.cb-chk-box{width:16px;height:16px;border:1px solid var(--dark-5);border-radius:1px;background:var(--dark-3);flex-shrink:0;margin-top:1px;display:flex;align-items:center;justify-content:center;transition:all .2s}
.cb-chk-box.checked{background:var(--gold);border-color:var(--gold)}
.cb-chk-box.checked::after{content:'';width:8px;height:5px;border-left:1.5px solid #141210;border-bottom:1.5px solid #141210;transform:rotate(-45deg) translate(1px,-1px);display:block}
.cb-policy-text{font-size:13px;color:var(--text-soft);font-weight:300;line-height:1.6}
.cb-policy-link{background:none;border:none;color:var(--gold);font-family:inherit;font-size:inherit;cursor:pointer;padding:0;text-decoration:underline;text-decoration-color:rgba(201,168,76,.3);text-underline-offset:2px}
.cb-policy-note{font-size:11px;color:var(--text-muted);font-weight:300;line-height:1.7;margin-top:8px;margin-bottom:6px}
.cb-submit-error{font-size:13px;color:var(--error);background:rgba(208,96,90,.08);border:1px solid rgba(208,96,90,.2);padding:12px 14px;margin-top:10px;border-radius:1px}

/* Calendar */
.cb-cal{background:var(--dark-2);border:1px solid var(--dark-4);border-radius:1px;overflow:hidden;margin-bottom:14px}
.cb-cal-head{padding:14px 16px;border-bottom:1px solid var(--dark-4);display:flex;align-items:center;justify-content:space-between}
.cb-cal-month{font-family:'Playfair Display',serif;font-size:15px;color:var(--text)}
.cb-cal-navs{display:flex;gap:5px}
.cb-cal-nav{width:28px;height:28px;border:1px solid var(--dark-5);background:transparent;color:var(--text-soft);cursor:pointer;border-radius:1px;font-size:14px;transition:all .2s}
.cb-cal-nav:disabled{opacity:.2;cursor:default}
.cb-cal-nav:not(:disabled):hover{border-color:var(--gold-border);color:var(--gold)}
.cb-cal-dnames{display:grid;grid-template-columns:repeat(7,1fr);padding:10px 14px 4px}
.cb-cal-dname{text-align:center;font-size:9px;color:var(--text-muted);letter-spacing:.1em;text-transform:uppercase}
.cb-cal-grid{display:grid;grid-template-columns:repeat(7,1fr);padding:4px 14px 14px;gap:2px}
.cb-cal-day{aspect-ratio:1;display:flex;align-items:center;justify-content:center;font-size:12px;border-radius:2px;cursor:default;transition:all .15s;color:var(--dark-5);position:relative;user-select:none;font-family:'DM Sans',sans-serif}
.cb-cal-day.avail{color:var(--text);cursor:pointer}
.cb-cal-day.avail::after{content:'';position:absolute;bottom:2px;left:50%;transform:translateX(-50%);width:3px;height:3px;border-radius:50%;background:var(--gold)}
.cb-cal-day.avail:hover{background:var(--gold-dim);color:var(--gold-light)}
.cb-cal-day.today{border:1px solid rgba(201,168,76,.22);color:var(--gold-light)}
.cb-cal-day.sel{background:var(--gold)!important;color:#141210!important;font-weight:600;cursor:pointer}
.cb-cal-day.sel::after{display:none}

/* Time slots */
.cb-time-wrap{margin-top:4px}
.cb-time-label{font-size:9px;letter-spacing:.16em;text-transform:uppercase;color:var(--text-muted);margin-bottom:10px}
.cb-time-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:6px}
.cb-time-slot{padding:10px 6px;text-align:center;border:1px solid var(--dark-5);background:var(--dark-2);color:var(--text-soft);font-size:12px;cursor:pointer;border-radius:1px;transition:all .15s}
.cb-time-slot.booked{color:var(--dark-5);cursor:not-allowed;background:var(--dark-3);border-color:transparent;text-decoration:line-through}
.cb-time-slot:not(.booked):hover{border-color:var(--gold-border);color:var(--gold-light);background:var(--gold-dim)}
.cb-time-slot.sel{border-color:var(--gold);background:var(--gold-dim);color:var(--gold-light)}

/* Recap */
.cb-recap{border:1px solid var(--dark-4);background:var(--dark-2);margin-bottom:18px;overflow:hidden}
.cb-recap-header{padding:12px 18px;border-bottom:1px solid var(--dark-4);display:flex;align-items:center;justify-content:space-between}
.cb-recap-lbl{font-size:8px;letter-spacing:.22em;text-transform:uppercase;color:var(--text-muted)}
.cb-recap-status{font-size:10px;color:var(--success);letter-spacing:.08em}
.cb-recap-rows{padding:4px 0}
.cb-recap-row{display:flex;justify-content:space-between;align-items:flex-start;padding:9px 18px;border-bottom:1px solid rgba(255,255,255,.04);gap:14px;font-size:13px}
.cb-recap-row:last-child{border-bottom:none}
.cb-recap-key{color:var(--text-muted);flex-shrink:0;font-size:12px}
.cb-recap-val{color:var(--text-soft);text-align:right;font-weight:400}
.cb-recap-val.gold{color:var(--gold);font-family:'Playfair Display',serif;font-size:15px}
.cb-recap-tear{height:1px;background:rgba(255,255,255,.05);margin:0 18px;border-style:dashed;border-top:1px dashed rgba(255,255,255,.05);margin-bottom:2px}

/* Form row */
.cb-form-row2{display:grid;grid-template-columns:1fr 1fr;gap:8px}

/* Success */
.cb-success{display:flex;flex-direction:column;align-items:center;text-align:center;padding-top:32px;padding-bottom:32px}
.cb-success-check{width:56px;height:56px;border:1px solid rgba(86,187,134,.2);background:rgba(86,187,134,.06);border-radius:2px;display:flex;align-items:center;justify-content:center;color:var(--success);font-size:22px;margin-bottom:22px}
.cb-success-title{font-family:'Playfair Display',serif;font-size:26px;font-style:italic;color:var(--text);margin-bottom:10px}
.cb-success-sub{font-size:13px;color:var(--text-muted);font-weight:300;line-height:1.75;margin-bottom:28px;max-width:260px}
.cb-success-sub strong{color:var(--text-soft);font-weight:500}
.cb-success-ticket{width:100%;max-width:320px;background:var(--dark-2);border:1px solid var(--dark-4);text-align:left;margin-bottom:24px}
.cb-ticket-header{padding:12px 18px;border-bottom:1px solid var(--dark-4);display:flex;align-items:center;justify-content:space-between}
.cb-ticket-lbl{font-size:8px;letter-spacing:.22em;text-transform:uppercase;color:var(--text-muted)}
.cb-ticket-status{font-size:10px;color:var(--success)}
.cb-ticket-rows{padding:4px 0}
.cb-success-actions{display:flex;flex-direction:column;gap:8px;width:100%;max-width:320px}

/* PORTFOLIO OVERLAY */
.cb-portfolio-overlay,.cb-policy-overlay{position:fixed;inset:0;background:var(--dark);z-index:1000;transform:translateX(100%);transition:transform .42s cubic-bezier(.25,.46,.45,.94);overflow-y:auto;display:flex;flex-direction:column}
.cb-portfolio-overlay.open,.cb-policy-overlay.open{transform:translateX(0)}
.cb-portfolio-nav{position:sticky;top:0;padding:0 20px;height:62px;display:flex;align-items:center;justify-content:space-between;background:rgba(10,5,2,.97);border-bottom:1px solid var(--dark-4);backdrop-filter:blur(20px);z-index:10;flex-shrink:0}
.cb-portfolio-back{background:transparent;border:1px solid var(--dark-5);color:var(--text-muted);padding:7px 16px;font-family:'DM Sans',sans-serif;font-size:10px;letter-spacing:.1em;text-transform:uppercase;cursor:pointer;border-radius:1px;transition:all .2s}
.cb-portfolio-back:hover{border-color:var(--gold-border);color:var(--gold-light)}
.cb-portfolio-title{font-family:'Playfair Display',serif;font-size:15px;color:var(--gold)}
.cb-portfolio-content{padding:48px 24px 80px;flex:1}
.cb-portfolio-filters{display:flex;gap:5px;margin-bottom:28px;flex-wrap:wrap}
.cb-portfolio-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:4px}
.cb-portfolio-item{aspect-ratio:3/4;background:var(--dark-3);overflow:hidden;position:relative}
.cb-policy-footer{position:sticky;bottom:0;padding:16px 24px 28px;background:rgba(10,5,2,.97);border-top:1px solid var(--dark-4);flex-shrink:0}
.cb-policy-footer .cb-btn-primary{width:100%}

/* CART DRAWER */
.cb-overlay-mask{position:fixed;inset:0;background:rgba(0,0,0,.7);z-index:700}
.cb-cart-drawer{position:fixed;top:0;right:0;width:340px;max-width:100vw;height:100vh;background:var(--dark-2);border-left:1px solid var(--dark-4);z-index:800;transform:translateX(100%);transition:transform .38s cubic-bezier(.25,.46,.45,.94);display:flex;flex-direction:column}
.cb-cart-drawer.open{transform:translateX(0)}
.cb-cart-head{padding:18px 20px;border-bottom:1px solid var(--dark-4);display:flex;align-items:center;justify-content:space-between;flex-shrink:0}
.cb-cart-body{flex:1;overflow-y:auto;padding:16px 20px}
.cb-cart-footer{padding:16px 20px 24px;border-top:1px solid var(--dark-4);flex-shrink:0}
.cb-cart-item{display:flex;gap:12px;padding:14px 0;border-bottom:1px solid var(--dark-4)}
.cb-cart-item:last-child{border-bottom:none}
.cb-qty-btn{width:22px;height:22px;border:1px solid var(--dark-5);background:transparent;color:var(--text-muted);cursor:pointer;border-radius:1px;font-size:14px;display:flex;align-items:center;justify-content:center;transition:all .15s}
.cb-qty-btn:hover{border-color:var(--gold-border);color:var(--gold)}

/* FLOAT */
.cb-float{position:fixed;bottom:24px;right:24px;z-index:450;display:flex;flex-direction:column;align-items:flex-end;gap:8px}
.cb-float-main{width:48px;height:48px;border-radius:2px;background:var(--gold);color:#141210;border:none;cursor:pointer;font-size:18px;display:flex;align-items:center;justify-content:center;box-shadow:0 4px 20px rgba(201,168,76,.28);transition:all .25s}
.cb-float-main:hover{background:var(--gold-light);transform:translateY(-2px)}
.cb-float-menu{display:flex;flex-direction:column;gap:8px;align-items:flex-end}
.cb-float-item{display:flex;align-items:center;gap:10px}
.cb-float-label{background:var(--dark-3);border:1px solid var(--dark-4);padding:6px 12px;border-radius:1px;font-size:11px;color:var(--text-soft);white-space:nowrap}
.cb-float-sub{width:40px;height:40px;background:var(--dark-3);border:1px solid var(--dark-5);display:flex;align-items:center;justify-content:center;text-decoration:none;font-size:16px;cursor:pointer;border-radius:2px;transition:all .2s}
.cb-float-sub:hover{border-color:var(--gold-border)}
`
