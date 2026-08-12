import { createIcon } from './icon'

/**
 * THE icon set. One set is a brand decision (DESIGN_SYSTEM §8), so this is the
 * only file in the codebase that may contain ICON geometry.
 *
 * The one deliberate exception is `components/brand/logo.tsx`, which holds the
 * brand mark. It is not an icon: it is never chosen from this list, it has one
 * lockup, and it must NOT inherit the set's size steps or stroke weight. That
 * component's header carries the full argument — the rule above is about
 * keeping one *icon* language, not about the wordmark.
 *
 * Geometry from Lucide (ISC licence, © Lucide Contributors), vendored rather
 * than installed — the reasoning is in the header of `icon.tsx`. Copy the path
 * data verbatim from lucide.dev when adding one; redrawing it by hand is how a
 * set stops looking like a set.
 *
 * KEEP THIS LIST SHORT. TECH_STACK §2's rule for vendored source is "copy only
 * what is used; a component sitting unused is deleted", and it applies per icon.
 * Every entry here should be traceable to a call site.
 */

export const ArrowRightIcon = createIcon(
	'ArrowRightIcon',
	<>
		<path d="M5 12h14" />
		<path d="m12 5 7 7-7 7" />
	</>,
)

/** Outbound or "opens elsewhere on this site" — the diagonal reads as away. */
export const ArrowUpRightIcon = createIcon(
	'ArrowUpRightIcon',
	<>
		<path d="M7 7h10v10" />
		<path d="M7 17 17 7" />
	</>,
)

/** Back to top — the only vertical arrow on the site. */
export const ArrowUpIcon = createIcon(
	'ArrowUpIcon',
	<>
		<path d="m5 12 7-7 7 7" />
		<path d="M12 19V5" />
	</>,
)

export const ChevronDownIcon = createIcon(
	'ChevronDownIcon',
	<path d="m6 9 6 6 6-6" />,
)

/** Breadcrumb separator. Always `aria-hidden` — the `<ol>` carries the structure. */
export const ChevronRightIcon = createIcon(
	'ChevronRightIcon',
	<path d="m9 18 6-6-6-6" />,
)

export const CheckIcon = createIcon('CheckIcon', <path d="M20 6 9 17l-5-5" />)

export const CloseIcon = createIcon(
	'CloseIcon',
	<>
		<path d="M18 6 6 18" />
		<path d="m6 6 12 12" />
	</>,
)

export const MenuIcon = createIcon(
	'MenuIcon',
	<>
		<path d="M4 6h16" />
		<path d="M4 12h16" />
		<path d="M4 18h16" />
	</>,
)

/**
 * For a link leaving the site. It accompanies text — never replaces it — and
 * the link itself still says where it goes, because an icon is not a
 * destination.
 */
export const ExternalLinkIcon = createIcon(
	'ExternalLinkIcon',
	<>
		<path d="M15 3h6v6" />
		<path d="M10 14 21 3" />
		<path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
	</>,
)

export const SearchIcon = createIcon(
	'SearchIcon',
	<>
		<circle cx="11" cy="11" r="8" />
		<path d="m21 21-4.3-4.3" />
	</>,
)

export const SunIcon = createIcon(
	'SunIcon',
	<>
		<circle cx="12" cy="12" r="4" />
		<path d="M12 2v2" />
		<path d="M12 20v2" />
		<path d="m4.93 4.93 1.41 1.41" />
		<path d="m17.66 17.66 1.41 1.41" />
		<path d="M2 12h2" />
		<path d="M20 12h2" />
		<path d="m6.34 17.66-1.41 1.41" />
		<path d="m19.07 4.93-1.41 1.41" />
	</>,
)

export const MoonIcon = createIcon(
	'MoonIcon',
	<path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />,
)

/** MDX `Callout`, `note` variant. */
export const InfoIcon = createIcon(
	'InfoIcon',
	<>
		<circle cx="12" cy="12" r="10" />
		<path d="M12 16v-4" />
		<path d="M12 8h.01" />
	</>,
)

/** MDX `Callout`, `warning` variant. */
export const AlertTriangleIcon = createIcon(
	'AlertTriangleIcon',
	<>
		<path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3" />
		<path d="M12 9v4" />
		<path d="M12 17h.01" />
	</>,
)

/** MDX `Callout`, `tip` variant. */
export const LightbulbIcon = createIcon(
	'LightbulbIcon',
	<>
		<path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5" />
		<path d="M9 18h6" />
		<path d="M10 22h4" />
	</>,
)

/** `/experience`, `/journey`, `/now` — a dated record. */
export const CalendarIcon = createIcon(
	'CalendarIcon',
	<>
		<path d="M8 2v4" />
		<path d="M16 2v4" />
		<rect width="18" height="18" x="3" y="4" rx="2" />
		<path d="M3 10h18" />
	</>,
)

/** `/experience`, `/about` — location. */
export const MapPinIcon = createIcon(
	'MapPinIcon',
	<>
		<path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0" />
		<circle cx="12" cy="10" r="3" />
	</>,
)

/** `/contact` and the command palette's copy-email action. */
export const MailIcon = createIcon(
	'MailIcon',
	<>
		<rect width="20" height="16" x="2" y="4" rx="2" />
		<path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
	</>,
)

/** Code-block copy control, and the palette's copy actions. */
export const CopyIcon = createIcon(
	'CopyIcon',
	<>
		<rect width="14" height="14" x="8" y="8" rx="2" />
		<path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
	</>,
)

/** `/open-source` — the repository entries. */
export const GitHubIcon = createIcon(
	'GitHubIcon',
	<>
		<path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.4 5.4 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
		<path d="M9 18c-4.51 2-5-2-7-2" />
	</>,
)

/** `/resume` — the PDF download. */
export const DownloadIcon = createIcon(
	'DownloadIcon',
	<>
		<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
		<path d="M7 10l5 5 5-5" />
		<path d="M12 15V3" />
	</>,
)

/** `/services` and the "what I do" blocks — a delivered artifact. */
export const LayersIcon = createIcon(
	'LayersIcon',
	<>
		<path d="m12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83Z" />
		<path d="m6.08 10.37-3.5 1.59a1 1 0 0 0 0 1.83l8.6 3.91a2 2 0 0 0 1.65 0l8.58-3.9a1 1 0 0 0 0-1.83l-3.5-1.6" />
		<path d="m6.08 15.37-3.5 1.59a1 1 0 0 0 0 1.83l8.6 3.91a2 2 0 0 0 1.65 0l8.58-3.9a1 1 0 0 0 0-1.83l-3.5-1.6" />
	</>,
)

/** "What I do" — the judgment pillar. */
export const CompassIcon = createIcon(
	'CompassIcon',
	<>
		<circle cx="12" cy="12" r="10" />
		<path d="m16.24 7.76-2.12 6.36-6.36 2.12 2.12-6.36z" />
	</>,
)

/** "What I do" — the clarity pillar. */
export const PenIcon = createIcon(
	'PenIcon',
	<path d="M21.17 2.83a2.83 2.83 0 0 0-4 0L3 17v4h4L21.17 6.83a2.83 2.83 0 0 0 0-4Z" />,
)
