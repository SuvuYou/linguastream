"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import SignOutButton from "@/components/features/signin/SignOutButton";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import {
  BookHeart,
  Layers,
  BookOpen,
  Paintbrush,
  SquareLibrary,
} from "lucide-react";

const NAV_LINKS = [
  { href: "/", label: "Library", icon: <SquareLibrary /> },
  { href: "/personal", label: "Personal", icon: <BookHeart /> },
  { href: "/decks", label: "Decks", icon: <Layers /> },
  { href: "/study", label: "Study", icon: <BookOpen /> },
  { href: "/design", label: "Design", icon: <Paintbrush /> },
] as const;

export default function AppSidebar() {
  const pathname = usePathname();

  return (
    <Sidebar>
      <SidebarHeader>
        <div className="px-2 py-1.5 text-sm font-medium">LinguaStream</div>
      </SidebarHeader>

      <SidebarContent className="pr-3 pt-3">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu className="gap-1">
              {NAV_LINKS.map(({ href, label, icon }) => {
                const isActive = pathname === href;

                return (
                  <SidebarMenuItem key={href}>
                    <SidebarMenuButton asChild isActive={isActive}>
                      <Link
                        href={href}
                        aria-current={isActive ? "page" : undefined}
                      >
                        {icon}
                        {label}
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SignOutButton />
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
