import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { TabNavigation } from './components/TabNavigation';
import { AppStoreProvider } from './lib/store';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "LSD - Loudspeaker Designer",
  description: "Design and simulate loudspeaker enclosures",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <AppStoreProvider>
          <main className="pb-16">
            {children}
          </main>
          <TabNavigation />
        </AppStoreProvider>
      </body>
    </html>
  );
}
