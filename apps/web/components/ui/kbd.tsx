import * as React from "react";

import { cn } from "@/lib/utils";

function Kbd({ className, ...props }: React.ComponentProps<"kbd">) {
  return (
    <kbd
      data-slot="kbd"
      className={cn(
        "inline-flex h-5 min-w-5 items-center justify-center rounded-xs border border-border px-1 font-mono text-[11px] text-text-3 select-none",
        className,
      )}
      {...props}
    />
  );
}

export { Kbd };
