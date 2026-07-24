import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "@/components/theme-provider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AuraDebug.inn — AI Code Debugging Agent",
  description:
    "AuraDebug.inn is an LLM-powered AI debugging agent that finds bugs in any programming language, returns corrected code, and explains the logic step by step. A final-year AI & Data Science project.",
  keywords: [
    "AI debugger",
    "code debugging agent",
    "LLM",
    "AI & DS project",
    "code fixer",
    "Next.js",
    "TypeScript",
  ],
  authors: [{ name: "AuraDebug.inn" }],
  icons: {
    icon: "https://z-cdn.chatglm.cn/z-ai/static/logo.svg",
  },
  openGraph: {
    title: "AuraDebug.inn — AI Code Debugging Agent",
    description:
      "Paste code in any language. The AI agent finds the bugs, returns corrected code, and explains the logic.",
    siteName: "AuraDebug.inn",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
