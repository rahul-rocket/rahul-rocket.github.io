import type { Metadata } from "next"

import { LegalPage } from "@/components/legal/legal-page"

export const metadata: Metadata = {
  title: "Terms of Service",
  description:
    "The terms that apply to using this site: what it is, what you may do with it, and the limits of what it promises.",
  alternates: { canonical: "/terms" },
}

export default function TermsPage() {
  return (
    <LegalPage
      title="Terms of Service"
      updated="13 August 2026"
      intro={
        <p>
          This is a personal portfolio site. These terms describe what you can
          expect from it and what I ask in return. They are deliberately short,
          because the site does very little: it shows work and offers a way to
          get in touch.
        </p>
      }
    >
      <h2>1. Using the site</h2>
      <p>
        You may read, link to, and share anything published here. No account is
        needed and nothing is gated. Please do not attempt to disrupt the site
        or use it to distribute anything harmful.
      </p>

      <h2>2. Content and ownership</h2>
      <p>
        The writing, design, and imagery on this site are mine unless credited
        otherwise. Project write-ups describe work carried out for the clients
        and employers named in them; those organisations retain their own rights
        in their products, trademarks, and confidential material. Source code
        published in my public repositories is governed by the licence in each
        repository, not by this page.
      </p>
      <p>
        Quoting or referencing this site with attribution is welcome.
        Republishing it wholesale as your own is not.
      </p>

      <h2>3. Accuracy</h2>
      <p>
        Project descriptions, metrics, and dates are given in good faith and
        reflect the situation at the time of writing. Technology moves; some of
        it will age. Nothing here is professional advice, and no result
        described is a promise of the same result elsewhere.
      </p>

      <h2>4. External links</h2>
      <p>
        The site links to GitHub, LinkedIn, Upwork, client sites, and other
        third parties. Those destinations are outside my control and carry their
        own terms and privacy practices.
      </p>

      <h2>5. Availability</h2>
      <p>
        The site is hosted on GitHub Pages and provided as-is. It may be
        unavailable, changed, or taken down at any time, and I make no guarantee
        of uptime.
      </p>

      <h2>6. Liability</h2>
      <p>
        To the extent the law allows, I am not liable for loss arising from use
        of this site or reliance on its contents. Nothing here limits liability
        that cannot lawfully be limited.
      </p>

      <h2>7. Enquiries and engagements</h2>
      <p>
        Contacting me does not create a client relationship or any obligation on
        either side. Paid work is governed by a separate written agreement, and
        only that agreement — not this page — sets its terms.
      </p>

      <h2>8. Governing law</h2>
      <p>
        These terms are governed by the laws of India, and the courts of
        Ahmedabad, Gujarat have jurisdiction over any dispute arising from them.
      </p>

      <h2>9. Contact</h2>
      <p>
        Questions about these terms:{" "}
        <a href="mailto:rahulrathore576@gmail.com">rahulrathore576@gmail.com</a>.
      </p>
    </LegalPage>
  )
}
