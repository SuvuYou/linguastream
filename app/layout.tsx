import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/layout/Navbar";
import Providers from "@/components/layout/Providers";
import { cn } from "@/lib/utils";
import { SidebarProvider } from "@/components/ui/sidebar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "LinguaStream",
  description: "Language learning through immersion",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={cn(
        "dark",
        "h-full",
        "antialiased",
        geistSans.variable,
        geistMono.variable,
      )}
    >
      <body>
        <SidebarProvider>
          <Navbar />
          <main className="flex min-h-dvh w-full flex-col bg-sidebar">
            <Providers>{children}</Providers>
          </main>
        </SidebarProvider>
      </body>
    </html>
  );
}
