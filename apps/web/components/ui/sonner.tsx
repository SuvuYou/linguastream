"use client";

import { Toaster, type ToasterProps } from "sonner";
import {
  CircleCheckIcon,
  InfoIcon,
  TriangleAlertIcon,
  OctagonXIcon,
  Loader2Icon,
} from "lucide-react";

const Sonner = ({ ...props }: ToasterProps) => {
  return (
    <Toaster
      theme="dark"
      className="toaster group"
      icons={{
        success: <CircleCheckIcon className="size-4" />,
        info: <InfoIcon className="size-4" />,
        warning: <TriangleAlertIcon className="size-4" />,
        error: <OctagonXIcon className="size-4" />,
        loading: <Loader2Icon className="size-4 animate-spin" />,
      }}
      style={
        {
          "--normal-bg": "var(--popup)",
          "--normal-text": "var(--popover-foreground)",
          "--normal-border": "rgb(255 255 255 / 0.1)",
          "--border-radius": "calc(16px * var(--r))",
        } as React.CSSProperties
      }
      toastOptions={{
        classNames: {
          toast: "cn-toast shadow-float! backdrop-blur-xl",
        },
      }}
      {...props}
    />
  );
};

export { Sonner };
