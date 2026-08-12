"use client"

import type * as React from "react"
import { GripVertical } from "lucide-react"
import * as ResizablePrimitive from "react-resizable-panels"

import { cn } from "../lib/utils"

/**
 * react-resizable-panels v4 renamed the primitives: `PanelGroup` -> `Group`
 * and `PanelResizeHandle` -> `Separator`. The group's `direction` prop is now
 * `orientation`, and the group sets its own `flex-direction`, so the layout no
 * longer needs a `flex-col` utility.
 */
const ResizablePanelGroup = ({
  className,
  ...props
}: React.ComponentProps<typeof ResizablePrimitive.Group>) => (
  <ResizablePrimitive.Group className={cn("h-full w-full", className)} {...props} />
)

const ResizablePanel = ResizablePrimitive.Panel

/**
 * A separator reports the axis it runs along, which is the opposite of the
 * group's orientation — a horizontal group is divided by vertical separators.
 * The `aria-[orientation=horizontal]` variants below are therefore the
 * vertical-group case, and stand in for v3's `data-panel-group-direction`.
 */
const ResizableHandle = ({
  withHandle,
  className,
  ...props
}: React.ComponentProps<typeof ResizablePrimitive.Separator> & {
  withHandle?: boolean
}) => (
  <ResizablePrimitive.Separator
    className={cn(
      "relative flex w-px items-center justify-center bg-border after:absolute after:inset-y-0 after:left-1/2 after:w-1 after:-translate-x-1/2 focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-1",
      "aria-[orientation=horizontal]:h-px aria-[orientation=horizontal]:w-full aria-[orientation=horizontal]:after:left-0 aria-[orientation=horizontal]:after:h-1 aria-[orientation=horizontal]:after:w-full aria-[orientation=horizontal]:after:-translate-y-1/2 aria-[orientation=horizontal]:after:translate-x-0",
      "aria-[orientation=horizontal]:[&>div]:rotate-90",
      className
    )}
    {...props}
  >
    {withHandle && (
      <div className="z-10 flex h-4 w-3 items-center justify-center rounded-sm border bg-border">
        <GripVertical className="h-2.5 w-2.5" />
      </div>
    )}
  </ResizablePrimitive.Separator>
)

export { ResizablePanelGroup, ResizablePanel, ResizableHandle }
