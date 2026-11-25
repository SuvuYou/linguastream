"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { ToggleGroup as ToggleGroupPrimitive } from "radix-ui";

import { cn } from "@/lib/utils";

const toggleGroupVariants = cva("flex w-fit", {
  variants: {
    variant: {
      segmented: "gap-0.5 rounded-md bg-inset p-1",
      option: "gap-2",
    },
  },
  defaultVariants: {
    variant: "segmented",
  },
});

const toggleGroupItemVariants = cva(
  "inline-flex cursor-pointer items-center justify-center whitespace-nowrap transition-colors outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        segmented:
          "h-[30px] gap-1.5 rounded-sm px-3 text-[13px] text-text-2 hover:text-foreground data-[state=on]:bg-raised-2 data-[state=on]:font-semibold data-[state=on]:text-foreground",
        option:
          "min-h-16 flex-1 flex-col gap-1.5 rounded-lg border border-white/8 bg-white/4 px-3 py-2 text-[13px] text-text-2 hover:border-white/15 hover:text-foreground data-[state=on]:border-primary/45 data-[state=on]:bg-primary/18 data-[state=on]:font-semibold data-[state=on]:text-accent-text",
      },
    },
    defaultVariants: {
      variant: "segmented",
    },
  },
);

const ToggleGroupContext = React.createContext<
  VariantProps<typeof toggleGroupItemVariants>
>({ variant: "segmented" });

function ToggleGroup({
  className,
  variant = "segmented",
  children,
  ...props
}: React.ComponentProps<typeof ToggleGroupPrimitive.Root> &
  VariantProps<typeof toggleGroupVariants>) {
  return (
    <ToggleGroupPrimitive.Root
      data-slot="toggle-group"
      data-variant={variant}
      className={cn(toggleGroupVariants({ variant }), className)}
      {...props}
    >
      <ToggleGroupContext.Provider value={{ variant }}>
        {children}
      </ToggleGroupContext.Provider>
    </ToggleGroupPrimitive.Root>
  );
}

function ToggleGroupItem({
  className,
  ...props
}: React.ComponentProps<typeof ToggleGroupPrimitive.Item>) {
  const { variant } = React.useContext(ToggleGroupContext);

  return (
    <ToggleGroupPrimitive.Item
      data-slot="toggle-group-item"
      className={cn(toggleGroupItemVariants({ variant }), className)}
      {...props}
    />
  );
}

export { ToggleGroup, ToggleGroupItem };
