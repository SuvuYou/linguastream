"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import AccountMenu from "./AccountMenu";

export const NAV_LINKS = [
  { href: "/dashboard/personal", label: "Library" },
  { href: "/dashboard/decks", label: "Decks" },
  { href: "/dashboard/study", label: "Study" },
] as const;

function isCurrent(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

export default function TopNav() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/90 backdrop-blur-md">
      <div className="mx-auto flex w-full max-w-[1400px] items-center gap-1.5 px-6 py-3 max-[560px]:px-4">
      <Link
        href="/dashboard/personal"
        aria-label="LinguaStream, go to the library"
        className="mr-3 flex shrink-0 items-center gap-2.5 rounded-md text-[15px] font-bold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring max-[560px]:mr-1"
      >
        <span aria-hidden="true" className="size-[22px] rounded-sm bg-primary" />
        <span className="max-[560px]:sr-only">LinguaStream</span>
      </Link>
      <nav aria-label="Main" className="flex min-w-0 flex-1 items-center gap-1 overflow-x-auto">
        {NAV_LINKS.map(({ href, label }) => {
          const current = isCurrent(pathname, href);
          return (
            <Link
              key={href}
              href={href}
              aria-current={current ? "page" : undefined}
              className={cn(
                "flex h-9 shrink-0 items-center rounded-md px-3 text-sm text-text-2 transition-colors hover:bg-raised hover:text-foreground focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring",
                current && "bg-tab-on font-semibold text-accent-text hover:bg-tab-on hover:text-accent-text",
              )}
            >
              {label}
            </Link>
          );
        })}
      </nav>
      <AccountMenu />
      </div>
    </header>
  );
}
