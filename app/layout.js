import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ClientWrapper } from "./providers";

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

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        <ClientWrapper>
          <div className="h-screen">{children}</div>
        </ClientWrapper>
      </body>
    </html>
  );
}
