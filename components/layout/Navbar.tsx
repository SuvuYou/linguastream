"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";

export default function Navbar() {
  const pathname = usePathname();

  const linkClass = (href: string) =>
    `px-4 text-sm h-full flex items-center border-r border-primary-border border-b-2 ${
      pathname === href
        ? "border-b-active-border text-primary-text"
        : "border-b-transparent text-secondary-text hover:bg-background-hover"
    }`;

  return (
    <nav className="flex items-center h-12 border-b border-primary-border">
      <div className="flex items-center px-4 font-medium text-sm border-r border-primary-border h-full ">
        LinguaStream
      </div>
      <Link href="/" className={linkClass("/")}>
        Library
      </Link>

      <Link href="/personal" className={linkClass("/personal")}>
        Personal
      </Link>

      <Link href="/decks" className={linkClass("/decks")}>
        Decks
      </Link>

      <Link href="/study" className={linkClass("/study")}>
        Study
      </Link>
    </nav>
  );
}
