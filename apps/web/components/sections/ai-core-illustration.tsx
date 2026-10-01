/**
 * Decorative "AI core" for the hero: a neural chip with circuit traces feeding
 * it from an outer ring of nodes, data pulses travelling along the traces, and
 * two counter-rotating orbit rings.
 *
 * A server component with no state — every moving part is a CSS animation from
 * globals.css (`ai-*` classes), so it costs no JavaScript and the global
 * `prefers-reduced-motion` rule freezes it to its finished frame.
 */

type Point = readonly [x: number, y: number]

const CENTER = 200
const NODE_RADIUS = 150
const NODE_COUNT = 8

/** Nodes evenly spaced on a circle, starting at 12 o'clock. */
const nodes: readonly Point[] = Array.from({ length: NODE_COUNT }, (_, i) => {
  const angle = (i / NODE_COUNT) * Math.PI * 2 - Math.PI / 2
  return [
    Math.round(CENTER + Math.cos(angle) * NODE_RADIUS),
    Math.round(CENTER + Math.sin(angle) * NODE_RADIUS),
  ] as const
})

/** Where a trace from `node` meets the chip: the nearest point on its edge. */
function chipAnchor([x, y]: Point): Point {
  const half = 52
  const clamp = (v: number) => Math.max(CENTER - half, Math.min(CENTER + half, v))
  const dx = x - CENTER
  const dy = y - CENTER
  return Math.abs(dx) > Math.abs(dy)
    ? [CENTER + Math.sign(dx) * half, clamp(y)]
    : [clamp(x), CENTER + Math.sign(dy) * half]
}

/** An orthogonal circuit trace: out from the chip, one elbow, into the node. */
function tracePath(node: Point): string {
  const [ax, ay] = chipAnchor(node)
  const [nx, ny] = node
  const horizontalExit = ax === CENTER - 52 || ax === CENTER + 52
  return horizontalExit
    ? `M${ax} ${ay} H${(ax + nx) / 2} V${ny} H${nx}`
    : `M${ax} ${ay} V${(ay + ny) / 2} H${nx} V${ny}`
}

/** Pins along each chip edge — purely visual. */
const PIN_OFFSETS = [-30, -10, 10, 30] as const

export function AiCoreIllustration({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 400 400"
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <linearGradient id="ai-grad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" style={{ stopColor: "var(--color-primary)" }} />
          <stop offset="55%" style={{ stopColor: "var(--color-spectrum-2)" }} />
          <stop offset="100%" style={{ stopColor: "var(--color-spectrum-3)" }} />
        </linearGradient>
        <radialGradient id="ai-glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" style={{ stopColor: "var(--color-primary)", stopOpacity: 0.35 }} />
          <stop offset="100%" style={{ stopColor: "var(--color-primary)", stopOpacity: 0 }} />
        </radialGradient>
      </defs>

      {/* Ambient glow behind the chip */}
      <circle cx={CENTER} cy={CENTER} r="120" fill="url(#ai-glow)" className="ai-breathe" />

      {/* Orbit rings */}
      <g className="ai-spin-slow">
        <circle cx={CENTER} cy={CENTER} r="185" stroke="url(#ai-grad)" strokeOpacity="0.35" strokeWidth="1" strokeDasharray="2 10" />
        <circle cx={CENTER} cy="15" r="4" fill="url(#ai-grad)" />
      </g>
      <g className="ai-spin-reverse">
        <circle cx={CENTER} cy={CENTER} r="168" className="stroke-border" strokeWidth="1" strokeDasharray="40 18" />
        <circle cx="368" cy={CENTER} r="3" className="fill-spectrum-3" />
      </g>

      {/* Circuit traces: a static base line plus a travelling pulse on top */}
      {nodes.map((node, i) => {
        const d = tracePath(node)
        return (
          <g key={`trace-${i}`}>
            <path d={d} className="stroke-primary/25" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            <path
              d={d}
              stroke="url(#ai-grad)"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              pathLength={100}
              className="ai-pulse"
              style={{ animationDelay: `${i * 0.35}s` }}
            />
          </g>
        )
      })}

      {/* Outer nodes */}
      {nodes.map(([x, y], i) => (
        <g key={`node-${i}`}>
          <circle cx={x} cy={y} r="12" className="fill-background stroke-border" strokeWidth="1.5" />
          <circle
            cx={x}
            cy={y}
            r="5"
            fill="url(#ai-grad)"
            className="ai-node"
            style={{ animationDelay: `${i * 0.35 + 0.9}s` }}
          />
        </g>
      ))}

      {/* Chip pins */}
      {PIN_OFFSETS.map((o) => (
        <g key={`pin-${o}`} className="stroke-muted-foreground/40" strokeWidth="2" strokeLinecap="round">
          <line x1={CENTER + o} y1="140" x2={CENTER + o} y2="132" />
          <line x1={CENTER + o} y1="260" x2={CENTER + o} y2="268" />
          <line x1="140" y1={CENTER + o} x2="132" y2={CENTER + o} />
          <line x1="260" y1={CENTER + o} x2="268" y2={CENTER + o} />
        </g>
      ))}

      {/* Chip body */}
      <rect x="140" y="140" width="120" height="120" rx="22" className="fill-card" stroke="url(#ai-grad)" strokeWidth="2" />
      <rect x="156" y="156" width="88" height="88" rx="14" className="fill-secondary" />

      {/* Spark glyph — the near-universal "AI" mark */}
      <g className="ai-spark" fill="url(#ai-grad)">
        <path d="M200 168 C203 186 208 191 226 194 C208 197 203 202 200 220 C197 202 192 197 174 194 C192 191 197 186 200 168 Z" />
        <path d="M228 168 C229 174 231 176 237 177 C231 178 229 180 228 186 C227 180 225 178 219 177 C225 176 227 174 228 168 Z" />
      </g>
      <text
        x={CENTER}
        y="238"
        textAnchor="middle"
        className="fill-muted-foreground font-mono"
        fontSize="10"
        letterSpacing="2"
      >
        NEURAL CORE
      </text>
    </svg>
  )
}
