import { Button as ButtonPrimitive } from "@base-ui/react/button"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "cn"

const buttonVariants = cva(
  "group/button inline-flex shrink-0 items-center justify-center rounded-[4px] border border-transparent bg-clip-padding text-xs font-semibold whitespace-nowrap transition-all outline-none select-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 active:not-aria-[haspopup]:translate-y-px disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-3.5",
  {
    variants: {
      variant: {
        default:
          "border border-[#381e0f] bg-gradient-to-b from-[#7c4424] to-[#5c3118] text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.25),0_2px_6px_-1px_rgba(56,30,15,0.35)] hover:from-[#a05a2c] hover:to-[#381e0f] rounded-[4px]",
        outline:
          "border border-brand/20 bg-white text-foreground shadow-[inset_0_1px_0_rgba(255,255,255,0.95),0_1px_2px_rgba(56,30,15,0.05)] hover:border-[#7c4424] hover:bg-[#faf6ed] hover:text-[#381e0f] rounded-[4px] aria-expanded:bg-muted aria-expanded:text-foreground dark:border-input dark:bg-input/30 dark:hover:bg-input/50",
        secondary:
          "border border-brand/15 bg-brand-50 text-brand shadow-2xs hover:bg-brand-100 rounded-[4px] aria-expanded:bg-secondary aria-expanded:text-secondary-foreground",
        ghost:
          "hover:bg-muted hover:text-foreground aria-expanded:bg-muted aria-expanded:text-foreground dark:hover:bg-muted/50 rounded-[4px]",
        destructive:
          "border border-destructive/40 bg-gradient-to-b from-destructive to-destructive/90 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.18),0_2px_6px_-1px_rgba(200,70,61,0.35)] hover:opacity-95 rounded-[4px] focus-visible:border-destructive/40 focus-visible:ring-destructive/20",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default:
          "h-8 gap-1.5 px-3 rounded-[4px] text-xs font-semibold has-data-[icon=inline-end]:pr-2.5 has-data-[icon=inline-start]:pl-2.5",
        xs: "h-6 gap-1 rounded-[4px] px-2 text-[11px] font-semibold in-data-[slot=button-group]:rounded-[4px] has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 [&_svg:not([class*='size-'])]:size-3",
        sm: "h-7 gap-1 rounded-[4px] px-2.5 text-xs font-semibold in-data-[slot=button-group]:rounded-[4px] has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 [&_svg:not([class*='size-'])]:size-3.5",
        lg: "h-9 gap-2 px-4 rounded-[4px] text-xs font-semibold has-data-[icon=inline-end]:pr-3 has-data-[icon=inline-start]:pl-3",
        icon: "size-8 rounded-[4px]",
        "icon-xs":
          "size-6 rounded-[4px] in-data-[slot=button-group]:rounded-[4px] [&_svg:not([class*='size-'])]:size-3",
        "icon-sm":
          "size-7 rounded-[4px] in-data-[slot=button-group]:rounded-[4px]",
        "icon-lg": "size-9 rounded-[4px]",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant = "default",
  size = "default",
  ...props
}: ButtonPrimitive.Props & VariantProps<typeof buttonVariants>) {
  return (
    <ButtonPrimitive
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
