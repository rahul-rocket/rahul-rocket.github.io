import type { Metadata } from "next"

import { LegalPage } from "@/components/legal/legal-page"

export const metadata: Metadata = {
  title: "Cookie Policy",
  description:
    "What this site stores in your browser: a single theme preference, and no tracking cookies.",
  alternates: { canonical: "/cookies" },
}

export default function CookiesPage() {
  return (
    <LegalPage
      title="Cookie Policy"
      updated="13 August 2026"
      intro={
        <p>
          Short version: this site sets no cookies at all. It stores one value in
          your browser — which colour theme you picked — and that value never
          leaves your device.
        </p>
      }
    >
      <h2>1. Cookies</h2>
      <p>
        None are set by this site. There is no analytics, no advertising
        network, no consent banner, and no cross-site tracking, because there is
        nothing to consent to. That is also why you were never asked.
      </p>

      <h2>2. What is stored locally</h2>
      <p>
        One entry is written to your browser&apos;s <strong>local storage</strong>{" "}
        — not a cookie, and never sent with any request:
      </p>
      <ul>
        <li>
          <strong>
            <code>theme</code>
          </strong>{" "}
          — holds <code>light</code>, <code>dark</code>, or <code>system</code>,
          so the site opens in the theme you chose last. It is set only when you
          use the theme switch in the footer.
        </li>
      </ul>
      <p>
        Clearing site data in your browser removes it, and the site falls back
        to following your operating system&apos;s appearance setting.
      </p>

      <h2>3. Third-party requests</h2>
      <p>
        Your browser fetches a few assets from other hosts — the GitHub avatar
        from <code>avatars.githubusercontent.com</code> and some illustrative
        images from Unsplash. Those hosts see the request itself, and may set
        their own cookies according to their policies. Blocking them affects
        only whether those images appear.
      </p>

      <h2>4. Changes</h2>
      <p>
        If the site ever starts using cookies, this page will say so before it
        does, and the date at the top will change.
      </p>

      <h2>5. Contact</h2>
      <p>
        Questions:{" "}
        <a href="mailto:rahulrathore576@gmail.com">rahulrathore576@gmail.com</a>.
        See also the{" "}
        <a href="/privacy">Privacy Policy</a>.
      </p>
    </LegalPage>
  )
}
