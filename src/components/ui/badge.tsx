import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-[#c9a84c]/20",
  {
    variants: {
      variant: {
        default: "bg-[#c9a84c]/15 text-[#c9a84c] border border-[#c9a84c]/20",
        secondary: "bg-[#14161a] text-[#8a8e9a] border border-[#1e2028]",
        destructive: "bg-[#ef4444]/15 text-[#ef4444] border border-[#ef4444]/20",
        outline: "text-[#8a8e9a] border border-[#1e2028]",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />
}

export { Badge, badgeVariants }