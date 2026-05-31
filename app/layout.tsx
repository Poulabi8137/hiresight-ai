import type { Metadata } from "next";
import { Inter, Sora } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { AppShell } from "@/components/app-shell";
import { Toaster } from "sonner";

const fontSans = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap"
});

const fontDisplay = Sora({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap"
});

const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  title: {
    default: "HireSight AI | Video Resume Hiring Platform",
    template: "%s | HireSight AI"
  },
  description:
    "AI-powered video resume screening, candidate matching, and recruiter workflows.",
  metadataBase: new URL(appUrl),
  openGraph: {
    type: "website",
    locale: "en_US",
    url: appUrl,
    siteName: "HireSight AI",
    title: "HireSight AI | Video Resume Hiring Platform",
    description:
      "AI-powered video resume screening, candidate matching, and recruiter workflows.",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "HireSight AI" }]
  },
  twitter: {
    card: "summary_large_image",
    title: "HireSight AI | Video Resume Hiring Platform",
    description:
      "AI-powered video resume screening, candidate matching, and recruiter workflows."
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-video-preview": -1, "max-image-preview": "large" }
  },
  icons: { icon: "/favicon.ico" }
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning className={`${fontSans.variable} ${fontDisplay.variable}`}>
      <body className="font-sans">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <AppShell>{children}</AppShell>
          <Toaster
            position="bottom-right"
            toastOptions={{
              style: { background: "hsl(var(--background))", border: "1px solid hsl(var(--border))", color: "hsl(var(--foreground))" },
              duration: 4000
            }}
          />
        </ThemeProvider>
      </body>
    </html>
  );
}
