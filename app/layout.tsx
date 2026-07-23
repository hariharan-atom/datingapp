import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { Toaster } from "sonner";

import { AppProviders } from "@/components/providers/app-providers";
import { ViewportGuard } from "@/components/shell/viewport-guard";

import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: {
    default: "Milo — Meet with intention",
    template: "%s · Milo",
  },
  description:
    "A thoughtful, safety-first dating experience built for meaningful connections in India.",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Milo",
  },
  formatDetection: {
    telephone: false,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
  themeColor: "#FFFFFF",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={inter.variable}>
        <AppProviders>
          <ViewportGuard>{children}</ViewportGuard>
          <Toaster
            position="top-center"
            toastOptions={{
              className:
                "!rounded-2xl !border-border !bg-white/95 !font-sans !shadow-float !backdrop-blur-xl",
            }}
          />
        </AppProviders>
      </body>
    </html>
  );
}
