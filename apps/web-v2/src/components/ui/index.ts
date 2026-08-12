/**
 * The design system's public surface.
 *
 * A barrel here — unlike the feature barrels ARCHITECTURE §5 mandates — is a
 * convenience, not a boundary: deep imports into `@/components/ui/button` are
 * equally legal and are what tree-shaking prefers. Import from here when a file
 * pulls several primitives; import deep when it pulls one.
 *
 * Everything exported is a Server Component. Not one of these files carries
 * `'use client'`, which is deliberate: the token layer is presentational, and a
 * client boundary inside it would pull every consumer's subtree into the bundle
 * (CLAUDE.md §5). Interaction that needs state belongs to the feature, or to a
 * client leaf that wraps one of these.
 *
 * `icons.tsx` is deliberately NOT re-exported. Icons are imported one at a time
 * (`import { ArrowRightIcon } from '@/components/ui/icons'`), and a barrel entry
 * would make it easy to write `import { Button, MoonIcon } from '@/components/ui'`
 * — one import specifier that reaches the whole set. UI_GUIDELINES §11's
 * "barrel-free deep imports" rule exists for exactly that shape.
 */

export { Badge, type BadgeProps, badgeVariants } from './badge'
export { Button, type ButtonProps, buttonVariants } from './button'
export {
	Card,
	CardBody,
	CardFooter,
	CardHeader,
	CardMedia,
	type CardProps,
	CardTitle,
} from './card'
export {
	Container,
	type ContainerProps,
	containerVariants,
} from './container'
export { Divider, type DividerProps, dividerVariants } from './divider'
export { Eyebrow, type EyebrowProps } from './eyebrow'
export {
	AutoGrid,
	type AutoGridProps,
	autoGridVariants,
	Grid,
	type GridProps,
	gridVariants,
} from './grid'
export {
	Heading,
	type HeadingLevel,
	type HeadingProps,
	headingVariants,
} from './heading'
export { createIcon, Icon, type IconProps } from './icon'
export { Prose } from './prose'
export { Section, type SectionProps, sectionVariants } from './section'
export { Skeleton } from './skeleton'
export { Slot } from './slot'
export { Stack, type StackProps, stackVariants } from './stack'
export { Surface, type SurfaceProps, surfaceVariants } from './surface'
export { SubtleText, Text, type TextProps, textVariants } from './text'
export { VisuallyHidden } from './visually-hidden'
