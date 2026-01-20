import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const badgeVariants = cva(
    "inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-normal transition-colors focus:outline-none focus:ring-2 focus:ring-neutral-400 focus:ring-offset-2",
    {
        variants: {
            variant: {
                default:
                    "border-transparent bg-neutral-900 text-neutral-50 hover:bg-neutral-900/80",
                secondary:
                    "border-transparent bg-neutral-100 text-neutral-900 hover:bg-neutral-100/80",
                destructive:
                    "border-transparent bg-red-500 text-neutral-50 hover:bg-red-500/80",
                outline: "text-neutral-50",
                // Helyon Custom Variants
                "bias-buy": "border-blue-500/20 bg-blue-500/10 text-blue-500",
                "bias-sell": "border-orange-500/20 bg-orange-500/10 text-orange-500",
                "success": "border-emerald-500/20 bg-emerald-500/10 text-emerald-500",
                "warning": "border-yellow-500/20 bg-yellow-500/10 text-yellow-500",
                "danger": "border-red-500/20 bg-red-500/10 text-red-500",
            },
        },
        defaultVariants: {
            variant: "default",
        },
    }
)

export interface BadgeProps
    extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> { }

function Badge({ className, variant, ...props }: BadgeProps) {
    return (
        <div className={cn(badgeVariants({ variant }), className)} {...props} />
    )
}

export { Badge, badgeVariants }
