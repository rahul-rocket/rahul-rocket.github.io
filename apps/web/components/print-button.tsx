"use client"

import { Printer } from "lucide-react"
import { Button } from "@portfolio/ui/button"

/** Prints the current page; the print stylesheet in globals.css does the rest. */
export function PrintButton() {
  return (
    <Button size="lg" onClick={() => window.print()}>
      <Printer className="h-4 w-4" aria-hidden="true" />
      Print or save as PDF
    </Button>
  )
}
