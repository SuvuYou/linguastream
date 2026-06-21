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

const NAV_LINKS = [
  { href: "/", label: "Library" },
  { href: "/personal", label: "Personal" },
  { href: "/decks", label: "Decks" },
  { href: "/study", label: "Study" },
  { href: "/design", label: "Design" },
] as const;

export default function AppSidebar() {
  const pathname = usePathname();

  return (
    <Sidebar>
      <SidebarHeader>
        <div className="px-2 py-1.5 text-sm font-medium">LinguaStream</div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {NAV_LINKS.map(({ href, label }) => {
                const isActive = pathname === href;
                return (
                  <SidebarMenuItem key={href}>
                    <SidebarMenuButton asChild isActive={isActive}>
                      <Link
                        href={href}
                        aria-current={isActive ? "page" : undefined}
                      >
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
