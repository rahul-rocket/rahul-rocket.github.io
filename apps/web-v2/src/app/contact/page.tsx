import type { Metadata } from 'next'
import { PageContainer } from '@/components/layout/page-container'
import { PageHeader } from '@/components/layout/page-header'
import { JsonLdScript } from '@/components/seo/json-ld'
import { Heading } from '@/components/ui/heading'
import { MailIcon } from '@/components/ui/icons'
import { Section } from '@/components/ui/section'
import { Stack } from '@/components/ui/stack'
import { Text } from '@/components/ui/text'
import { contactEmail, mailtoHref, site } from '@/config/site'
import { ContactForm } from '@/features/contact'
import { pageMetadata } from '@/lib/seo/metadata'
import { graph, pageSchema, personSchema } from '@/lib/seo/structured-data'

/**
 * `/contact` — C-01, C-02, C-11. docs/WEBSITE_STRUCTURE.md §4.12.
 *
 * THE FORM IS ALWAYS RENDERED, WHICH IT DID NOT USE TO BE. The old arrangement
 * showed a `mailto:` link instead whenever `site.formspreeEndpoint` was empty,
 * because a form that posts to nowhere silently discards a message. That risk is
 * real and it has not been accepted — it has been removed: with no endpoint the
 * form is a composer that hands the finished message to the reader's own mail
 * client, so there is no path on which something typed here goes nowhere. See
 * the long header on `features/contact/contact-form.tsx`.
 *
 * The `mailto:` is still on the page, beside the button and in the guidance
 * column, because it is the whole offer for a reader without JavaScript and the
 * preferred one for anyone who would rather start in their own client.
 */

const DESCRIPTION =
	'The fastest route to a useful reply is a paragraph about the actual problem. Here is where to send it and what to include.'

export const metadata: Metadata = pageMetadata({
	title: 'Contact',
	description: DESCRIPTION,
	path: '/contact/',
})

const SUBJECT = 'Hello from rahul-rocket.github.io'
const BODY = [
	'What you are building:',
	'',
	'The problem in front of you:',
	'',
	'What a good outcome looks like:',
	'',
].join('\n')

export default function ContactPage() {
	const fallback = mailtoHref(SUBJECT, BODY)

	return (
		<PageContainer tone="contact" width="page">
			<JsonLdScript
				data={graph(
					pageSchema({
						type: 'ContactPage',
						path: '/contact/',
						name: 'Contact',
						description: DESCRIPTION,
					}),
					personSchema(),
				)}
			/>

			<PageHeader eyebrow="Contact" title="Get in touch" lede={DESCRIPTION} />

			<div className="flex flex-col gap-16 lg:flex-row lg:items-start lg:gap-16">
				<div className="flex min-w-0 flex-1 flex-col gap-8">
					<ContactForm
						endpoint={site.formspreeEndpoint}
						fallbackHref={fallback}
						subject={SUBJECT}
					/>

					{/*
					  Kept below the form rather than replaced by it. The prompt-filled
					  `mailto:` is the path that works with scripting off, and it is the
					  one `e2e/contact.spec.ts` asserts is always present — the page's
					  invariant is "there is always a working way to send a message",
					  not "there is a form".
					*/}
					<Stack gap={2} align="start">
						<a
							href={fallback}
							className="inline-flex min-h-12 items-center gap-2 rounded-full border border-border-strong px-6 py-3 font-medium text-text no-underline transition-colors duration-fast hover:border-accent-muted hover:bg-surface-hover"
						>
							<MailIcon size="sm" />
							Write to {contactEmail()}
						</a>
						<Text size="sm" tone="muted">
							That link opens your mail client with the questions on the right
							already in the body.
						</Text>
					</Stack>
				</div>

				<aside
					aria-labelledby="contact-guidance"
					className="flex shrink-0 flex-col gap-8 lg:w-80"
				>
					<Section as="div" labelledBy="contact-guidance" spacing="none">
						<Stack gap={3}>
							<Heading id="contact-guidance" level={2} size="h3">
								What to include for a fast reply
							</Heading>
							<ul className="flex list-disc flex-col gap-2 pl-5 text-sm text-text-muted">
								<li>What you are building, in one sentence.</li>
								<li>
									The problem in front of you, and what you have already tried.
								</li>
								<li>What a good outcome looks like, and roughly by when.</li>
								<li>Whether you want a second opinion or a pair of hands.</li>
							</ul>
						</Stack>
					</Section>

					<Section as="div" labelledBy="contact-expectations" spacing="none">
						<Stack gap={3}>
							<Heading id="contact-expectations" level={2} size="h3">
								What to expect
							</Heading>
							<Text size="sm" tone="muted">
								I read everything and reply to anything that is not a template,
								usually within a few days. If what you need is outside what I do
								well, I will say so rather than take the work — and I will point
								you at someone if I can.
							</Text>
						</Stack>
					</Section>

					<Section as="div" labelledBy="contact-elsewhere" spacing="none">
						<Stack gap={3}>
							<Heading id="contact-elsewhere" level={2} size="h3">
								Elsewhere
							</Heading>
							<ul className="flex flex-col gap-2 text-sm">
								<li>
									<a href={site.social.github} rel="me">
										GitHub
									</a>
								</li>
								<li>
									<a href="/services/">How I work with clients</a>
								</li>
								<li>
									<a href="/resume/">Résumé</a>
								</li>
							</ul>
						</Stack>
					</Section>
				</aside>
			</div>
		</PageContainer>
	)
}
