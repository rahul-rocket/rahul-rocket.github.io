import type { Metadata } from "next"

import { LegalPage } from "@/components/legal/legal-page"

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "How this site handles information: what is collected, what is not, and who processes it.",
  alternates: { canonical: "/privacy" },
}

export default function PrivacyPage() {
  return (
    <LegalPage
      title="Privacy Policy"
      updated="13 August 2026"
      intro={
        <p>
          This site is a statically generated portfolio hosted on GitHub Pages.
          There are no accounts, no logins, and no analytics or advertising
          scripts. This page describes the little data that does change hands.
        </p>
      }
    >
      <h2>1. Information collected</h2>
      <p>
        There is no server behind this site — every page is a file, built ahead
        of time and served as-is. Nothing is collected by the site itself.
        Information reaches me in only two ways:
      </p>
      <ul>
        <li>
          <strong>What you send me.</strong> If you use the contact form or
          email me directly, I receive whatever you choose to write: typically a
          name, an email address, and a message.
        </li>
        <li>
          <strong>Standard server logs.</strong> GitHub Pages, which hosts the
          site, records ordinary request data such as IP address and browser
          type. Those logs belong to GitHub and are governed by their privacy
          statement, not mine.
        </li>
      </ul>

      <h2>2. How it is used</h2>
      <p>
        Anything you send is used to reply to you and to carry on that
        conversation. It is not added to a mailing list, profiled, or used to
        target advertising.
      </p>

      <h2>3. Third parties</h2>
      <p>
        A handful of services are involved in delivering the site, and each sees
        only what it needs:
      </p>
      <ul>
        <li>
          <strong>GitHub Pages</strong> serves the files and keeps the request
          logs described above.
        </li>
        <li>
          <strong>GitHub&apos;s avatar and API services</strong> supply the
          profile picture and contribution data shown on the home page. The
          contribution figures are fetched when the site is built, not when you
          visit; the avatar image is requested by your browser from{" "}
          <code>avatars.githubusercontent.com</code>.
        </li>
        <li>
          <strong>The contact form endpoint.</strong> When one is configured,
          the form posts your message to that third-party service so it can be
          delivered to me. When it is not, the form composes a message in your
          own email client instead and nothing is transmitted by the page.
        </li>
        <li>
          <strong>Image hosts</strong> such as Unsplash serve some illustrative
          images and therefore see the request for them.
        </li>
      </ul>

      <h2>4. Retention</h2>
      <p>
        Email correspondence is kept for as long as it is useful to the
        conversation and then deleted. I do not maintain a separate database of
        visitors, because there is nothing collecting one.
      </p>

      <h2>5. Your choices</h2>
      <p>
        You can ask me to delete any correspondence you have sent, and I will.
        Write to{" "}
        <a href="mailto:rahulrathore576@gmail.com">rahulrathore576@gmail.com</a>.
        Blocking third-party requests in your browser will stop the avatar and
        remote images loading; the rest of the site works normally without them.
      </p>

      <h2>6. Changes</h2>
      <p>
        If this policy changes, the date at the top of the page changes with it.
        The full history of this page is public in the site&apos;s repository.
      </p>

      <h2>7. Contact</h2>
      <p>
        Questions about any of the above:{" "}
        <a href="mailto:rahulrathore576@gmail.com">rahulrathore576@gmail.com</a>.
      </p>
    </LegalPage>
  )
}
