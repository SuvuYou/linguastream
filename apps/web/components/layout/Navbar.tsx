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
import { BookHeart, Layers, SquareLibrary } from "lucide-react";

const NAV_LINKS = [
  { href: "/dashboard", label: "Library", icon: <SquareLibrary /> },
  { href: "/dashboard/personal", label: "Personal", icon: <BookHeart /> },
  { href: "/dashboard/decks", label: "Decks", icon: <Layers /> },
] as const;

export default function AppSidebar() {
  const pathname = usePathname();

  return (
    <Sidebar className="shrink-0 h-lvh" collapsible="none">
      <SidebarHeader>
        <div className="px-4 py-1.5 pt-5 text-default font-medium underline underline-offset-4 decoration-primary decoration-2">
          LinguaStream
        </div>
      </SidebarHeader>

      <SidebarContent className="pr-3 pt-3">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu className="gap-3">
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
