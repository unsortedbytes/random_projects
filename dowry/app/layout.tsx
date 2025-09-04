import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Dowry Calculator - Just for Fun!",
  description: "A satirical website that highlights the absurdity of the dowry system through humor and awareness. Educational and entertaining!",
  keywords: "dowry calculator, satirical, awareness, education, humor, social issues",
  authors: [{ name: "Dowry Calculator" }],
  openGraph: {
    title: "Dowry Calculator - Reality Check!",
    description: "A funny yet educational tool to highlight the absurdity of the dowry system. Remember: Your worth can't be measured in money!",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Dowry Calculator - Just for Fun!",
    description: "A satirical calculator that delivers a serious message about the dowry system.",
  },
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
        {children}
      </body>
    </html>
  );
}
