import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import ConvexClientProvider from "./convex-client-provider";
import { ConvexAuthNextjsServerProvider } from "@convex-dev/auth/nextjs/server";
import { Modals } from "@/components/modals";
import { Toaster } from "sonner";
import { JotaiProvider } from "@/components/jotai-provider";
import { AuthGate } from "@/components/auth-gate";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Slack-Lite",
    template: "%s · Slack-Lite",
  },
  description: "Realtime team messaging for your workspace",
  applicationName: "Slack-Lite",
  icons: {
    icon: [{ url: "/icon", type: "image/png" }],
    apple: [{ url: "/apple-icon", type: "image/png" }],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body
        suppressHydrationWarning
        className="min-h-full flex flex-col font-sans"
      >
        <ConvexAuthNextjsServerProvider>
          <ConvexClientProvider>
            <JotaiProvider>
              <Toaster />
              <Modals />
              <AuthGate>{children}</AuthGate>
            </JotaiProvider>
          </ConvexClientProvider>
        </ConvexAuthNextjsServerProvider>
      </body>
    </html>
  );
}
