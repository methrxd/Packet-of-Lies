import type { Metadata } from "next";

import { MatrixBackdrop } from "@/components/app/matrix-backdrop";
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
  icons: {
    icon: "/polFavicon.svg",
    shortcut: "/polFavicon.svg",
    apple: "/polFavicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark h-full">
      <body className="min-h-full bg-[var(--bg-app)] font-sans text-foreground antialiased">
        <MatrixBackdrop />
        <TooltipProvider delay={150}>
          <div className="relative z-10 min-h-svh">{children}</div>
        </TooltipProvider>
      </body>
    </html>
  );
}
