import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Suspense } from "react";
import { ClientWrapper } from "./providers";
import { PrefetchDebugger } from "./components";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Slack Clone",
  description: "A barebone Slack/chat app built with Next.js",
};

function AppFallback() {
  return (
    <div className="flex h-screen items-center justify-center bg-gray-100">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
    </div>
  );
}

export default function RootLayout({ children, sidebar }) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        <ClientWrapper>
          <div className="h-screen ">
            {sidebar}
            {children}
          </div>
          <PrefetchDebugger />
        </ClientWrapper>
      </body>
    </html>
  );
}
