export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <main className="flex min-h-dvh w-full flex-col bg-sidebar">
      {children}
    </main>
  );
}
