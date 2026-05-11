import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;0,700;1,400&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  html { -webkit-font-smoothing: antialiased; scroll-behavior: smooth; }

  :root {
    --ink: #1a1714;
    --ink-2: #3d3830;
    --ink-3: #7a7268;
    --gold: #b5893a;
    --cream: #f9f7f3;
    --cream-2: #f3f0ea;
    --border: #e4ddd1;
    --white: #ffffff;
  }

  .legal-page {
    font-family: 'DM Sans', sans-serif;
    background: var(--cream);
    min-height: 100vh;
    color: var(--ink);
  }

  .legal-nav {
    position: sticky;
    top: 0;
    z-index: 100;
    background: rgba(249, 247, 243, 0.95);
    backdrop-filter: blur(16px);
    border-bottom: 1px solid var(--border);
    padding: 0 2rem;
    height: 60px;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
  .legal-logo {
    font-family: 'Playfair Display', serif;
    font-size: 1.2rem;
    font-weight: 500;
    color: var(--ink);
    cursor: pointer;
    letter-spacing: -0.01em;
  }
  .legal-logo span { color: var(--gold); }
  .legal-back {
    font-size: 0.8rem;
    font-weight: 500;
    color: var(--ink-3);
    cursor: pointer;
    letter-spacing: 0.04em;
    text-transform: uppercase;
    transition: color 0.2s;
    background: none;
    border: none;
    font-family: 'DM Sans', sans-serif;
  }
  .legal-back:hover { color: var(--gold); }

  .legal-hero {
    background: var(--white);
    border-bottom: 1px solid var(--border);
    padding: 3.5rem 2rem 0;
    text-align: center;
  }
  .legal-hero-tag {
    display: inline-block;
    font-size: 0.7rem;
    font-weight: 500;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: var(--gold);
    background: rgba(181, 137, 58, 0.08);
    border: 1px solid rgba(181, 137, 58, 0.2);
    padding: 0.3rem 0.8rem;
    border-radius: 20px;
    margin-bottom: 1.2rem;
  }
  .legal-hero h1 {
    font-family: 'Playfair Display', serif;
    font-size: clamp(1.8rem, 4vw, 2.6rem);
    font-weight: 500;
    color: var(--ink);
    letter-spacing: -0.02em;
    line-height: 1.2;
    margin-bottom: 0.8rem;
  }
  .legal-hero p {
    font-size: 0.88rem;
    color: var(--ink-3);
    font-weight: 300;
    margin-bottom: 2rem;
  }

  .legal-tabs {
    display: flex;
    justify-content: center;
    gap: 0;
    border-top: 1px solid var(--border);
    margin-top: 0.5rem;
  }
  .legal-tab {
    padding: 1rem 2.5rem;
    font-size: 0.82rem;
    font-weight: 500;
    letter-spacing: 0.04em;
    text-transform: uppercase;
    color: var(--ink-3);
    cursor: pointer;
    border-bottom: 2px solid transparent;
    transition: all 0.2s;
    background: none;
    border-left: none;
    border-right: none;
    border-top: none;
    font-family: 'DM Sans', sans-serif;
  }
  .legal-tab:hover { color: var(--ink); }
  .legal-tab.active {
    color: var(--gold);
    border-bottom-color: var(--gold);
  }

  .legal-content {
    max-width: 760px;
    margin: 0 auto;
    padding: 3rem 2rem 5rem;
  }

  .legal-section { margin-bottom: 2.8rem; }
  .legal-section:last-child { margin-bottom: 0; }

  .legal-section-num {
    font-size: 0.68rem;
    font-weight: 500;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: var(--gold);
    margin-bottom: 0.5rem;
  }

  .legal-section h2 {
    font-family: 'Playfair Display', serif;
    font-size: 1.2rem;
    font-weight: 500;
    color: var(--ink);
    margin-bottom: 1rem;
    letter-spacing: -0.01em;
    padding-bottom: 0.6rem;
    border-bottom: 1px solid var(--border);
  }

  .legal-section p {
    font-size: 0.88rem;
    line-height: 1.8;
    color: var(--ink-2);
    font-weight: 300;
    margin-bottom: 0.9rem;
  }
  .legal-section p:last-child { margin-bottom: 0; }

  .legal-section ul {
    margin: 0.6rem 0 0.9rem 0;
    padding-left: 1.4rem;
  }
  .legal-section ul li {
    font-size: 0.88rem;
    line-height: 1.8;
    color: var(--ink-2);
    font-weight: 300;
    margin-bottom: 0.3rem;
  }

  .legal-section strong { font-weight: 500; color: var(--ink); }

  .legal-highlight {
    background: var(--cream-2);
    border: 1px solid var(--border);
    border-left: 3px solid var(--gold);
    border-radius: 0 6px 6px 0;
    padding: 1rem 1.2rem;
    margin: 1rem 0;
  }
  .legal-highlight p { margin: 0; font-size: 0.85rem; }

  .legal-contact-box {
    background: var(--white);
    border: 1px solid var(--border);
    border-radius: 10px;
    padding: 1.5rem;
    margin-top: 1rem;
  }
  .legal-contact-box p { margin: 0; font-size: 0.85rem; }
  .legal-contact-box a { color: var(--gold); text-decoration: none; }
  .legal-contact-box a:hover { text-decoration: underline; }

  .legal-divider {
    display: flex;
    align-items: center;
    gap: 1rem;
    margin: 2.5rem 0;
  }
  .legal-divider-line { flex: 1; height: 1px; background: var(--border); }
  .legal-divider-dot { width: 4px; height: 4px; background: var(--gold); border-radius: 50%; }

  .legal-updated {
    text-align: center;
    font-size: 0.78rem;
    color: var(--ink-3);
    font-weight: 300;
    margin-top: 3rem;
    padding-top: 2rem;
    border-top: 1px solid var(--border);
  }

  .legal-fade { animation: legalFade 0.35s ease; }
  @keyframes legalFade {
    from { opacity: 0; transform: translateY(8px); }
    to   { opacity: 1; transform: translateY(0); }
  }
`

const EFFECTIVE_DATE = 'May 8, 2026'
const COMPANY = 'Organized.'
const CONTACT_EMAIL = 'legal@beorganized.io'
const WEBSITE = 'beorganized.io'

function Divider() {
  return (
    <div className="legal-divider">
      <div className="legal-divider-line"/>
      <div className="legal-divider-dot"/>
      <div className="legal-divider-line"/>
    </div>
  )
}

function TermsContent() {
  return (
    <div className="legal-fade">
      <div className="legal-section">
        <div className="legal-section-num">Section 1</div>
        <h2>Acceptance of Terms</h2>
        <p>By accessing or using the {COMPANY} platform at <strong>{WEBSITE}</strong>, you agree to be bound by these Terms of Service. If you do not agree, you may not use our services.</p>
        <p>These terms apply to all users, including beauty and wellness professionals (subscribers) and their clients who book through the platform.</p>
      </div>

      <Divider/>

      <div className="legal-section">
        <div className="legal-section-num">Section 2</div>
        <h2>Description of Services</h2>
        <p>{COMPANY} is a SaaS booking and business management platform for beauty and wellness professionals, including hair stylists, nail technicians, estheticians, and massage therapists.</p>
        <p>The platform provides:</p>
        <ul>
          <li>A professional dashboard to manage appointments, clients, services, products, and formations</li>
          <li>A public-facing booking page accessible to clients via a unique URL</li>
          <li>Payment processing through Stripe for client deposits</li>
          <li>Automated email communications for booking confirmations and reminders</li>
        </ul>
      </div>

      <Divider/>

      <div className="legal-section">
        <div className="legal-section-num">Section 3</div>
        <h2>Subscription Plans and Billing</h2>
        <p>{COMPANY} offers two subscription tiers: <strong>Essential</strong> and <strong>Pro</strong>. Subscriptions are billed monthly or annually, as selected at checkout.</p>
        <div className="legal-highlight">
          <p><strong>Free plan limitations:</strong> Free accounts are limited to 5 services and do not include Products, Formations, Portfolio, Reviews, Payment Deposits, AI Photo Enhancement, or Advanced Analytics. These features require a paid subscription.</p>
        </div>
        <p>All payments are processed securely through Stripe. By providing payment information, you authorize {COMPANY} to charge your payment method on a recurring basis per your selected plan.</p>
        <p>You may cancel at any time. Cancellation takes effect at the end of the current billing period. No refunds are issued for partial billing periods, except as required by applicable law.</p>
      </div>

      <Divider/>

      <div className="legal-section">
        <div className="legal-section-num">Section 4</div>
        <h2>Client Payments and Deposits</h2>
        <p>Professional subscribers may require a deposit from clients at booking. Deposits are processed through Stripe Connect and held pending confirmation or release by the professional.</p>
        <p><strong>Authorization holds:</strong> Client deposits are placed as holds valid for up to 7 days. Uncaptured holds are automatically released after 6 days. {COMPANY} is not responsible for bank fees or delays associated with holds or releases.</p>
        <p>Refunds processed through {COMPANY} may take 5–10 business days to appear on the client's statement, depending on their financial institution.</p>
      </div>

      <Divider/>

      <div className="legal-section">
        <div className="legal-section-num">Section 5</div>
        <h2>Acceptable Use</h2>
        <p>You agree not to use the {COMPANY} platform to:</p>
        <ul>
          <li>Violate any applicable federal, provincial, or local laws or regulations</li>
          <li>Misrepresent your identity or professional credentials to clients</li>
          <li>Collect or store client data beyond what is necessary for legitimate business operations</li>
          <li>Transmit spam, unsolicited communications, or malicious content</li>
          <li>Gain unauthorized access to any portion of the platform or its infrastructure</li>
          <li>Use automated tools to scrape or extract data from the platform</li>
          <li>Engage in activity that could disrupt or damage the platform</li>
        </ul>
        <p>We reserve the right to suspend or terminate accounts that violate these terms without prior notice.</p>
      </div>

      <Divider/>

      <div className="legal-section">
        <div className="legal-section-num">Section 6</div>
        <h2>Account Responsibilities</h2>
        <p>You are responsible for maintaining the confidentiality of your account credentials and for all activity under your account. Notify us immediately at <strong>{CONTACT_EMAIL}</strong> if you suspect unauthorized access.</p>
        <p>You are solely responsible for the accuracy of your business information, service listings, pricing, and communications with your clients. {COMPANY} is not a party to any transaction between you and your clients.</p>
      </div>

      <Divider/>

      <div className="legal-section">
        <div className="legal-section-num">Section 7</div>
        <h2>Intellectual Property</h2>
        <p>{COMPANY} and its logos, design, software, and content are the exclusive property of {COMPANY} and are protected by Canadian and international intellectual property laws.</p>
        <p>You retain ownership of all content you upload (photos, portfolio images, product descriptions). By uploading content, you grant {COMPANY} a non-exclusive, royalty-free license to display it solely for the purpose of operating the platform.</p>
      </div>

      <Divider/>

      <div className="legal-section">
        <div className="legal-section-num">Section 8</div>
        <h2>Limitation of Liability</h2>
        <p>To the maximum extent permitted by applicable law, {COMPANY} shall not be liable for any indirect, incidental, special, consequential, or punitive damages, including loss of revenue, loss of data, or business interruption.</p>
        <p>Our total liability for any claims arising from these terms shall not exceed the amount you paid to us in the 12 months preceding the claim.</p>
        <div className="legal-highlight">
          <p>{COMPANY} is a platform provider only. We are not responsible for the quality of services provided by professionals using our platform, nor for disputes between professionals and their clients.</p>
        </div>
      </div>

      <Divider/>

      <div className="legal-section">
        <div className="legal-section-num">Section 9</div>
        <h2>Termination</h2>
        <p>You may terminate your account at any time by contacting us at <strong>{CONTACT_EMAIL}</strong>. Upon termination, your access will be disabled and your data retained for 30 days before permanent deletion, unless required by law to retain it longer.</p>
        <p>We reserve the right to terminate or suspend your account immediately, without prior notice, for violations of these Terms or for conduct we determine to be harmful to the platform or other users.</p>
      </div>

      <Divider/>

      <div className="legal-section">
        <div className="legal-section-num">Section 10</div>
        <h2>Governing Law</h2>
        <p>These Terms of Service are governed by the laws of the Province of Quebec and the federal laws of Canada applicable therein, without regard to conflict of law principles.</p>
        <p>Disputes shall be resolved in the courts of competent jurisdiction in the Province of Quebec, Canada.</p>
      </div>

      <Divider/>

      <div className="legal-section">
        <div className="legal-section-num">Section 11</div>
        <h2>Changes to Terms</h2>
        <p>We reserve the right to update these Terms at any time. Material changes will be communicated via email or platform notice. Continued use after changes constitutes acceptance of the revised terms.</p>
      </div>

      <Divider/>

      <div className="legal-section">
        <div className="legal-section-num">Section 12</div>
        <h2>Responsabilité des Vendeurs et Expédition</h2>
        <p>{COMPANY} est une plateforme technologique qui permet aux professionnels indépendants de gérer leur business. Les produits, services et formations listés sur les pages des professionnels sont vendus PAR ces professionnels, et non par {COMPANY}.</p>
        <p>{COMPANY} n'est pas partie prenante dans les transactions commerciales entre les professionnels et leurs clients. À ce titre :</p>
        <ul>
          <li>La livraison, les délais d'expédition et les frais de port sont sous l'entière responsabilité du professionnel vendeur.</li>
          <li>Les politiques de retour et de remboursement sont définies par chaque professionnel indépendamment.</li>
          <li>{COMPANY} ne peut être tenu responsable des retards, pertes, dommages ou litiges relatifs aux commandes de produits physiques.</li>
          <li>En cas de litige, le client doit contacter directement le professionnel concerné.</li>
        </ul>
        <p>{COMPANY} fournit uniquement l'infrastructure technique permettant aux professionnels de gérer leurs paiements via Stripe. Les fonds sont transférés directement au professionnel vendeur.</p>
      </div>

      <Divider/>

      <div className="legal-section">
        <div className="legal-section-num">Section 12 — EN</div>
        <h2>Vendor Responsibility &amp; Shipping</h2>
        <p>{COMPANY} is a technology platform that enables independent professionals to manage their business. Products, services and formations listed on professional pages are sold BY those professionals, not by {COMPANY}.</p>
        <p>{COMPANY} is not a party to commercial transactions between professionals and their clients. Therefore:</p>
        <ul>
          <li>Shipping, delivery timelines and shipping fees are the sole responsibility of the selling professional.</li>
          <li>Return and refund policies are defined by each professional independently.</li>
          <li>{COMPANY} cannot be held liable for delays, losses, damages or disputes related to physical product orders.</li>
          <li>In case of dispute, clients must contact the professional directly.</li>
        </ul>
        <p>{COMPANY} only provides the technical infrastructure allowing professionals to manage their payments via Stripe. Funds are transferred directly to the selling professional.</p>
      </div>

      <Divider/>

      <div className="legal-section">
        <div className="legal-section-num">Contact</div>
        <h2>Questions</h2>
        <div className="legal-contact-box">
          <p><strong>{COMPANY}</strong><br/><br/><a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a></p>
        </div>
      </div>

      <div className="legal-updated">Last updated: {EFFECTIVE_DATE}</div>
    </div>
  )
}

function PrivacyContent() {
  return (
    <div className="legal-fade">
      <div className="legal-section">
        <div className="legal-section-num">Overview</div>
        <h2>Our Commitment to Privacy</h2>
        <p>{COMPANY} is committed to protecting your personal information in accordance with the <strong>Personal Information Protection and Electronic Documents Act (PIPEDA)</strong> and Quebec's <strong>Law 25 (Act to modernize legislative provisions as regards the protection of personal information)</strong>.</p>
        <div className="legal-highlight">
          <p>This Privacy Policy explains what information we collect, why we collect it, how we use it, and your rights. By using {WEBSITE}, you consent to the practices described herein.</p>
        </div>
      </div>

      <Divider/>

      <div className="legal-section">
        <div className="legal-section-num">Section 1</div>
        <h2>Information We Collect</h2>
        <p><strong>From professional subscribers:</strong></p>
        <ul>
          <li>Name, email address, and phone number (account creation)</li>
          <li>Business name, city, and professional handle</li>
          <li>Profile photos and portfolio images (uploaded voluntarily)</li>
          <li>Service, product, and formation listings</li>
          <li>Banking and payment information (processed by Stripe — we do not store card numbers)</li>
          <li>Business availability and schedule settings</li>
        </ul>
        <p><strong>From clients (end users booking appointments):</strong></p>
        <ul>
          <li>Name, email address, and phone number (booking form)</li>
          <li>Appointment details (date, time, service selected)</li>
          <li>Payment card information (processed by Stripe — not stored by {COMPANY})</li>
          <li>Notes provided during booking</li>
        </ul>
        <p><strong>Automatically collected:</strong></p>
        <ul>
          <li>IP address (used for rate limiting and security)</li>
          <li>Browser type and device information</li>
          <li>Pages visited and features used (analytics)</li>
          <li>Timestamps of actions on the platform</li>
        </ul>
      </div>

      <Divider/>

      <div className="legal-section">
        <div className="legal-section-num">Section 2</div>
        <h2>How We Use Your Information</h2>
        <p>We use the information we collect to:</p>
        <ul>
          <li>Provide, operate, and maintain the {COMPANY} platform</li>
          <li>Process bookings and payments between professionals and their clients</li>
          <li>Send booking confirmations, reminders, and review requests via email</li>
          <li>Authenticate users and secure accounts</li>
          <li>Respond to support requests and technical issues</li>
          <li>Enforce our Terms of Service and prevent fraud or abuse</li>
          <li>Improve the platform through aggregated, anonymized analytics</li>
          <li>Comply with legal obligations under Canadian law</li>
        </ul>
        <p>We do not sell, rent, or share your personal information with third parties for marketing purposes.</p>
      </div>

      <Divider/>

      <div className="legal-section">
        <div className="legal-section-num">Section 3</div>
        <h2>Third-Party Service Providers</h2>
        <p>We share limited personal information with trusted third-party providers solely to operate the platform:</p>
        <ul>
          <li><strong>Supabase</strong> — Database and authentication infrastructure (servers in US/EU)</li>
          <li><strong>Stripe</strong> — Payment processing and payouts. Stripe's privacy policy governs payment data handling.</li>
          <li><strong>Resend</strong> — Transactional email delivery (booking confirmations, reminders)</li>
          <li><strong>Vercel</strong> — Hosting and content delivery network</li>
          <li><strong>fal.ai</strong> — AI-powered product photo enhancement (Pro feature; images are processed transiently and not retained)</li>
        </ul>
        <p>Each provider is contractually obligated to protect your information and may not use it for any purpose other than providing services to us.</p>
        <div className="legal-highlight">
          <p><strong>Cross-border transfers:</strong> Some providers operate servers outside of Canada. By using {COMPANY}, you consent to the transfer of your information to countries that may have different data protection standards. We take reasonable steps to ensure your information is protected in accordance with this policy.</p>
        </div>
      </div>

      <Divider/>

      <div className="legal-section">
        <div className="legal-section-num">Section 4</div>
        <h2>Data Retention</h2>
        <ul>
          <li><strong>Active accounts:</strong> Data retained for the duration of your account</li>
          <li><strong>Cancelled accounts:</strong> Data retained for 30 days post-cancellation, then permanently deleted</li>
          <li><strong>Booking records:</strong> Appointment history retained for 24 months, then anonymized</li>
          <li><strong>Financial records:</strong> Transaction records retained for 7 years as required by Canadian tax law</li>
        </ul>
      </div>

      <Divider/>

      <div className="legal-section">
        <div className="legal-section-num">Section 5</div>
        <h2>Your Rights</h2>
        <p>Under PIPEDA and Quebec Law 25, you have the following rights:</p>
        <ul>
          <li><strong>Right to access:</strong> Request a copy of the personal information we hold about you</li>
          <li><strong>Right to rectification:</strong> Request correction of inaccurate or incomplete information</li>
          <li><strong>Right to deletion:</strong> Request deletion of your personal information, subject to legal retention requirements</li>
          <li><strong>Right to withdraw consent:</strong> Withdraw consent to certain uses of your information at any time</li>
          <li><strong>Right to data portability:</strong> Request your data in a commonly used electronic format</li>
          <li><strong>Right to lodge a complaint:</strong> File a complaint with the Office of the Privacy Commissioner of Canada (OPC) at <em>priv.gc.ca</em></li>
        </ul>
        <p>To exercise any of these rights, contact our Privacy Officer at <strong>{CONTACT_EMAIL}</strong>. We will respond within 30 days.</p>
      </div>

      <Divider/>

      <div className="legal-section">
        <div className="legal-section-num">Section 6</div>
        <h2>Security</h2>
        <p>We implement appropriate technical and organizational measures to protect your personal information:</p>
        <ul>
          <li>Encrypted data transmission (HTTPS/TLS)</li>
          <li>Row-level security on all database tables — each professional sees only their own data</li>
          <li>Secure authentication with email verification</li>
          <li>Regular security audits and access controls</li>
          <li>PCI-compliant payment processing through Stripe (we never store card numbers)</li>
        </ul>
        <p>No method of transmission over the internet is 100% secure. We cannot guarantee absolute security.</p>
      </div>

      <Divider/>

      <div className="legal-section">
        <div className="legal-section-num">Section 7</div>
        <h2>Cookies</h2>
        <p>{COMPANY} uses minimal cookies necessary for platform operation:</p>
        <ul>
          <li><strong>Authentication cookies:</strong> To keep you signed in during your session (essential)</li>
          <li><strong>Preference cookies:</strong> To remember your language and display settings (functional)</li>
        </ul>
        <p>We do not use advertising or tracking cookies. Disabling essential cookies may impair platform functionality.</p>
      </div>

      <Divider/>

      <div className="legal-section">
        <div className="legal-section-num">Section 8</div>
        <h2>Children's Privacy</h2>
        <p>The {COMPANY} platform is intended for use by adults (18+). We do not knowingly collect personal information from individuals under 18. If you believe we have inadvertently collected information from a minor, contact us immediately and we will take steps to delete it.</p>
      </div>

      <Divider/>

      <div className="legal-section">
        <div className="legal-section-num">Section 9</div>
        <h2>Privacy Officer &amp; Contact</h2>
        <p>{COMPANY} has designated a Privacy Officer responsible for overseeing compliance with this policy and applicable privacy legislation.</p>
        <div className="legal-contact-box">
          <p>
            <strong>Privacy Officer — {COMPANY}</strong><br/><br/>
            For privacy inquiries, access requests, complaints, or to withdraw consent:<br/><br/>
            <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a><br/><br/>
            We will respond within <strong>30 calendar days</strong> as required under PIPEDA.
          </p>
        </div>
      </div>

      <Divider/>

      <div className="legal-section">
        <div className="legal-section-num">Section 10</div>
        <h2>Changes to This Policy</h2>
        <p>We may update this Privacy Policy from time to time. Material changes will be communicated via email to your registered address. Continued use of the platform after notification constitutes acceptance of the revised policy.</p>
      </div>

      <div className="legal-updated">
        Last updated: {EFFECTIVE_DATE}&nbsp;&nbsp;·&nbsp;&nbsp;Effective under PIPEDA and Quebec Law 25
      </div>
    </div>
  )
}

export default function Legal() {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const [tab, setTab] = useState(searchParams.get('tab') === 'privacy' ? 'privacy' : 'terms')

  useEffect(() => {
    setSearchParams({ tab }, { replace: true })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [tab])

  return (
    <>
      <style>{css}</style>
      <div className="legal-page">

        <nav className="legal-nav">
          <div className="legal-logo" onClick={() => navigate('/')}>
            Organized<span>.</span>
          </div>
          <button className="legal-back" onClick={() => navigate(-1)}>
            ← Back
          </button>
        </nav>

        <div className="legal-hero">
          <div className="legal-hero-tag">Legal</div>
          <h1>{tab === 'terms' ? 'Terms of Service' : 'Privacy Policy'}</h1>
          <p>
            {tab === 'terms'
              ? 'Please read these terms carefully before using Organized.'
              : 'How we collect, use, and protect your personal information under PIPEDA.'}
          </p>
          <div className="legal-tabs">
            <button className={`legal-tab ${tab === 'terms' ? 'active' : ''}`} onClick={() => setTab('terms')}>
              Terms of Service
            </button>
            <button className={`legal-tab ${tab === 'privacy' ? 'active' : ''}`} onClick={() => setTab('privacy')}>
              Privacy Policy
            </button>
          </div>
        </div>

        <div className="legal-content">
          {tab === 'terms' ? <TermsContent /> : <PrivacyContent />}
        </div>

      </div>
    </>
  )
}
