import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Slot } from "radix-ui"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "group/badge inline-flex h-5 w-fit shrink-0 items-center justify-center gap-1 overflow-hidden rounded-4xl border border-transparent px-2 py-0.5 text-xs font-medium whitespace-nowrap transition-all focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 [&>svg]:pointer-events-none [&>svg]:size-3!",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground [a]:hover:bg-primary/80",
        secondary:
          "bg-secondary text-secondary-foreground [a]:hover:bg-secondary/80",
        destructive:
          "bg-destructive/10 text-destructive focus-visible:ring-destructive/20 dark:bg-destructive/20 dark:focus-visible:ring-destructive/40 [a]:hover:bg-destructive/20",
        outline:
          "border-border text-foreground [a]:hover:bg-muted [a]:hover:text-muted-foreground",
        ghost:
          "hover:bg-muted hover:text-muted-foreground dark:hover:bg-muted/50",
        link: "text-primary underline-offset-4 hover:underline",
        sky:     "border-[oklch(0.9_0.04_230)] bg-[oklch(0.97_0.03_230)] text-[oklch(0.42_0.13_230)]",
        amber:   "border-[oklch(0.9_0.06_80)] bg-[oklch(0.975_0.04_80)] text-[oklch(0.48_0.12_70)]",
        emerald: "border-[oklch(0.88_0.06_155)] bg-[oklch(0.97_0.04_155)] text-[oklch(0.4_0.11_155)]",
        rose:    "border-[oklch(0.9_0.05_25)] bg-[oklch(0.97_0.03_25)] text-[oklch(0.5_0.15_25)]",
        violet:  "border-[oklch(0.9_0.05_295)] bg-[oklch(0.97_0.03_295)] text-[oklch(0.48_0.13_295)]",
        neutral: "border-border bg-secondary text-secondary-foreground",
        success: "border-[oklch(0.88_0.06_155)] bg-[oklch(0.97_0.04_155)] text-[oklch(0.4_0.11_155)]",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function Badge({
  className,
  variant = "default",
  asChild = false,
  ...props
}: React.ComponentProps<"span"> &
  VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot.Root : "span"

  return (
    <Comp
      data-slot="badge"
      data-variant={variant}
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  )
}

export { Badge, badgeVariants }
