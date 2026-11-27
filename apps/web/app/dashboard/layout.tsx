import { Suspense } from "react";
import ProcessingToasts from "@/components/features/processing/ProcessingToasts";
import TopNav from "@/components/layout/TopNav";

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex min-h-dvh flex-col bg-background">
      <TopNav />
      <main className="flex w-full flex-1 flex-col">
        <Suspense>{children}</Suspense>
      </main>
      <ProcessingToasts />
    </div>
  );
}
