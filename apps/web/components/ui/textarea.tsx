import * as React from "react";

import { cn } from "@/lib/utils";

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "flex field-sizing-content min-h-[70px] w-full resize-none rounded-md px-2.5 py-2 leading-snug border border-border bg-inset text-base transition-[color,background-color,border-color] outline-none placeholder:text-text-3 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive md:text-sm",
        className,
      )}
      {...props}
    />
  );
}

export { Textarea };
