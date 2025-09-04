import type { Metadata } from "next";
import { Inter, Poppins, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "./components/ThemeProvider";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  display: "swap",
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
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${inter.variable} ${poppins.variable} ${jetbrainsMono.variable} font-sans antialiased`}
      >
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
