import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service — Appointy",
  description: "The terms that govern your use of Appointy.",
};

const lastUpdated = "May 28, 2026";

export default function TermsPage() {
  return (
    <>
      <p style={eyebrow}>Legal</p>
      <h1 style={h1}>Terms of Service</h1>
      <p style={meta}>Last updated: {lastUpdated}</p>

      <p style={lead}>
        These Terms of Service (&ldquo;Terms&rdquo;) govern your access to and use of Appointy (the
        &ldquo;Service&rdquo;) at appointy.xyz. By creating an account or using the Service you agree
        to these Terms. If you don&apos;t agree, do not use the Service.
      </p>

      <h2 style={h2}>1. The service</h2>
      <p style={p}>
        Appointy is a scheduling tool that lets you publish booking pages, receive bookings with
        custom forms, manage availability, and optionally generate Google Meet links via Google
        Calendar integration. The source code is open-source under AGPL-3.0 — you are also free to
        self-host your own instance.
      </p>

      <h2 style={h2}>2. Eligibility</h2>
      <p style={p}>
        You must be at least 13 years old (or 16 where applicable) to use the Service. By using it
        you represent that you meet this requirement and have the authority to enter these Terms on
        behalf of any organization you specify.
      </p>

      <h2 style={h2}>3. Your account</h2>
      <ul style={ul}>
        <li>You&apos;re responsible for keeping your login credentials confidential.</li>
        <li>You must provide accurate information during signup and keep it up to date.</li>
        <li>You&apos;re responsible for all activity that occurs under your account.</li>
        <li>Notify us immediately of any unauthorized access by emailing <a href="mailto:security@appointy.xyz" style={a}>security@appointy.xyz</a>.</li>
      </ul>

      <h2 style={h2}>4. Acceptable use</h2>
      <p style={p}>You agree NOT to use the Service to:</p>
      <ul style={ul}>
        <li>Send spam, phishing, unsolicited bulk messages, or harassing content.</li>
        <li>Upload files containing malware, viruses, or any malicious payload.</li>
        <li>Attempt to gain unauthorized access to other users&apos; data or the underlying infrastructure.</li>
        <li>Probe, scan, or test the vulnerability of any system or network without written consent.</li>
        <li>Use the Service for any illegal purpose or in violation of any applicable law.</li>
        <li>Impersonate any person or entity, or misrepresent your affiliation with one.</li>
        <li>Resell, sublicense, or distribute access to the hosted Service without our written consent.</li>
      </ul>
      <p style={p}>
        Violation may result in immediate suspension or termination of your account.
      </p>

      <h2 style={h2}>5. User content</h2>
      <p style={p}>
        Bookings, form answers, files, profile data, and any other content you submit (&ldquo;User Content&rdquo;)
        remains yours. By submitting User Content, you grant us a limited, non-exclusive licence to
        store, process, and display it solely for the purpose of operating the Service for you.
      </p>
      <p style={p}>
        You&apos;re responsible for User Content. You warrant that you have the rights to submit it and
        that it doesn&apos;t violate any law, third-party right, or these Terms.
      </p>

      <h2 style={h2}>6. Plans &amp; billing</h2>
      <ul style={ul}>
        <li>The <strong>Free</strong> plan is free, supports a single user, and may have feature limits.</li>
        <li>The <strong>Organization</strong> plan is a paid plan with team features. Pricing is shown on our billing page.</li>
        <li>Paid subscriptions auto-renew until cancelled. You may cancel anytime from Admin → Billing; cancellations take effect at the end of the current billing period.</li>
        <li>Fees are non-refundable except where required by law.</li>
        <li>We may change pricing with at least 30 days&apos; notice; changes apply to future billing periods.</li>
      </ul>

      <h2 style={h2}>7. Third-party integrations</h2>
      <p style={p}>
        When you connect a third-party service (e.g., Google), you authorize us to use it on your
        behalf solely to provide the integration. Your use of those services is also governed by
        their respective terms. We&apos;re not responsible for outages, errors, or policy changes
        affecting third-party services.
      </p>

      <h2 style={h2}>8. Service availability</h2>
      <p style={p}>
        We aim for high availability but do not guarantee uptime. The Service is provided
        &ldquo;as is&rdquo; and &ldquo;as available&rdquo;. We may modify, suspend, or discontinue
        any part of the Service at any time, with notice when reasonably possible.
      </p>

      <h2 style={h2}>9. Termination</h2>
      <p style={p}>
        You may delete your account at any time by emailing us. We may suspend or terminate your
        account if you violate these Terms or if required by law. On termination, your access ends
        immediately and we may delete your data after 30 days, except where we&apos;re legally
        required to retain it.
      </p>

      <h2 style={h2}>10. Open-source license</h2>
      <p style={p}>
        The Appointy source code is licensed under the <a href="https://www.gnu.org/licenses/agpl-3.0" target="_blank" rel="noopener" style={a}>GNU Affero General Public License v3.0</a>.
        These Terms govern the hosted Service at appointy.xyz only; the licence governs the source code.
      </p>

      <h2 style={h2}>11. Disclaimers</h2>
      <p style={p}>
        TO THE MAXIMUM EXTENT PERMITTED BY LAW, THE SERVICE IS PROVIDED &ldquo;AS IS&rdquo; WITHOUT
        WARRANTIES OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO IMPLIED WARRANTIES
        OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT.
      </p>

      <h2 style={h2}>12. Limitation of liability</h2>
      <p style={p}>
        TO THE MAXIMUM EXTENT PERMITTED BY LAW, IN NO EVENT WILL APPOINTY OR ITS CONTRIBUTORS BE
        LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, OR FOR LOSS
        OF PROFITS, REVENUE, DATA, OR USE, ARISING OUT OF YOUR USE OF THE SERVICE. OUR TOTAL
        LIABILITY FOR ANY CLAIM RELATED TO THE SERVICE IS LIMITED TO THE AMOUNT YOU PAID US IN THE 12
        MONTHS PRECEDING THE CLAIM, OR INR 1,000, WHICHEVER IS LESS.
      </p>

      <h2 style={h2}>13. Indemnity</h2>
      <p style={p}>
        You agree to indemnify and hold harmless Appointy and its contributors from any claims,
        damages, or expenses arising from your User Content, your use of the Service, or your
        violation of these Terms or any third-party rights.
      </p>

      <h2 style={h2}>14. Changes to these terms</h2>
      <p style={p}>
        We may update these Terms periodically. Material changes will be announced via email and
        reflected here with a new &ldquo;Last updated&rdquo; date. Continued use of the Service
        after changes constitutes acceptance.
      </p>

      <h2 style={h2}>15. Governing law</h2>
      <p style={p}>
        These Terms are governed by the laws of India, without regard to conflict-of-law principles.
        Any disputes will be resolved exclusively in the courts of Ahmedabad, Gujarat, India.
      </p>

      <h2 style={h2}>16. Contact</h2>
      <p style={p}>
        For questions about these Terms, email <a href="mailto:hello@appointy.xyz" style={a}>hello@appointy.xyz</a>.
      </p>
    </>
  );
}

const eyebrow: React.CSSProperties = { color: "var(--text-tertiary)", fontSize: ".75rem", fontWeight: 700, letterSpacing: ".08em", textTransform: "uppercase", marginBottom: ".5rem" };
const h1: React.CSSProperties = { fontSize: "clamp(2rem, 4vw, 2.75rem)", fontWeight: 800, letterSpacing: "-.025em", lineHeight: 1.1, color: "var(--text-primary)" };
const meta: React.CSSProperties = { color: "var(--text-tertiary)", fontSize: ".875rem", marginTop: ".5rem", marginBottom: "2rem" };
const lead: React.CSSProperties = { color: "var(--text-secondary)", fontSize: "1.0625rem", lineHeight: 1.6, marginBottom: "2rem" };
const h2: React.CSSProperties = { fontSize: "1.375rem", fontWeight: 700, letterSpacing: "-.01em", marginTop: "2.5rem", marginBottom: "1rem", color: "var(--text-primary)" };
const p: React.CSSProperties = { color: "var(--text-secondary)", lineHeight: 1.65, fontSize: ".9375rem", marginBottom: ".75rem" };
const ul: React.CSSProperties = { color: "var(--text-secondary)", lineHeight: 1.7, fontSize: ".9375rem", marginLeft: "1.25rem", marginBottom: "1rem" };
const a: React.CSSProperties = { color: "var(--text-primary)", textDecoration: "underline", textDecorationColor: "var(--border-strong)" };
