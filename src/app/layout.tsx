import type { Metadata } from "next";

import { TooltipProvider } from "@/components/ui/tooltip";

import "@fontsource/geist";
import "@fontsource-variable/inter";
import "@fontsource-variable/jetbrains-mono";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Packet of Lies",
    template: "%s | Packet of Lies",
  },
  description: "Security operations workspace",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark h-full">
      <body className="min-h-full bg-[var(--bg-app)] font-sans text-foreground antialiased">
        <TooltipProvider delay={150}>{children}</TooltipProvider>
      </body>
    </html>
  );
}
