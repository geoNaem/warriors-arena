import type { Metadata } from "next";
import { Orbitron, Cairo } from "next/font/google";
import "./globals.css";

const orbitron = Orbitron({
  subsets: ["latin"],
  weight: ["400", "700", "900"],
  variable: "--font-orbitron",
  display: "swap",
});

const cairo = Cairo({
  subsets: ["arabic", "latin"],
  weight: ["400", "600"],
  variable: "--font-cairo",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Warriors Arena | Laser Tag & Gel Blasters in Heliopolis Cairo",
  description: "Enter the Arena. Dominate the Game. Cairo's premier Laser Tag and Gel Blasters playground in Heliopolis.",
  other: {
    "csp-endpoint": "/api/csp-report",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // We'll manage language state in a client component, but default to 'en' / 'ltr'
  return (
    <html lang="en" dir="ltr" className={`${orbitron.variable} ${cairo.variable}`}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <meta httpEquiv="Content-Security-Policy" content="default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://fonts.googleapis.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; img-src 'self' data: https:; font-src https://fonts.gstatic.com" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5" />
      </head>
      <body className="noise-overlay selection:bg-[#39FF14] selection:text-black">
        <main>{children}</main>
      </body>
    </html>
  );
}
