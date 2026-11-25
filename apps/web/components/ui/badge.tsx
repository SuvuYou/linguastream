import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { Slot } from "radix-ui";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "group/badge inline-flex w-fit shrink-0 items-center justify-center gap-1 overflow-hidden rounded-xs border border-transparent whitespace-nowrap transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring [&>svg]:pointer-events-none [&>svg:not([class*='size-'])]:size-3",
  {
    variants: {
      variant: {
        default: "bg-raised-2 text-foreground [a]:hover:bg-raised-2/80",
        secondary: "bg-white/8 text-text-2 [a]:hover:bg-white/12",
        accent: "bg-primary/14 text-accent-text [a]:hover:bg-primary/20",
        solid: "bg-primary font-semibold text-primary-foreground",
        destructive:
          "bg-destructive/16 text-destructive [a]:hover:bg-destructive/24",
        warning: "bg-warning/16 text-warning",
        outline: "border-border text-text-2 [a]:hover:bg-raised",
        ghost: "text-text-2 hover:bg-raised",
        link: "text-accent-text underline-offset-4 hover:underline",
      },
      size: {
        xs: "h-5 px-1.5 text-[11px]",
        sm: "h-6 px-2 text-xs",
        default: "h-7 px-2.5 text-[13px]",
        lg: "h-8 px-3 text-sm",
      },
    },
    defaultVariants: {
      size: "xs",
      variant: "default",
    },
  },
);

function Badge({
  className,
  variant = "default",
  size = "xs",
  asChild = false,
  ...props
}: React.ComponentProps<"span"> &
  VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot.Root : "span";

  return (
    <Comp
      data-slot="badge"
      data-variant={variant}
      className={cn(badgeVariants({ variant, size }), className)}
      {...props}
    />
  );
}

export { Badge, badgeVariants };
