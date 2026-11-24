import Navbar from "@/components/layout/Navbar";
import { SidebarProvider } from "@/components/ui/sidebar";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <SidebarProvider>
      <Navbar />
      <main className="flex min-h-dvh w-full flex-col bg-sidebar">
        {children}
      </main>
    </SidebarProvider>
  );
}
