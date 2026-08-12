import * as React from "react"

const MOBILE_BREAKPOINT = 768
const MOBILE_QUERY = `(max-width: ${MOBILE_BREAKPOINT - 1}px)`

function subscribe(onStoreChange: () => void) {
  const mql = window.matchMedia(MOBILE_QUERY)
  mql.addEventListener("change", onStoreChange)
  return () => mql.removeEventListener("change", onStoreChange)
}

/**
 * `useSyncExternalStore` is the intended way to read a browser API that changes
 * outside React. Subscribing in an effect and seeding state with `setState`
 * works but costs an extra render on mount, which React 19's compiler lint
 * rules flag.
 */
export function useIsMobile(): boolean {
  return React.useSyncExternalStore(
    subscribe,
    () => window.matchMedia(MOBILE_QUERY).matches,
    // There is no viewport while server rendering, so report "not mobile" and
    // let hydration correct it -- the same result the previous
    // `useState(undefined)` seed produced.
    () => false
  )
}
