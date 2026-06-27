import type { Metadata } from "next";
import { Syne, Space_Mono, Playfair_Display } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { SmoothScroll } from "@/components/SmoothScroll";

// Structural / Display Typography
const syne = Syne({ 
  subsets: ["latin"],
  variable: "--font-syne",
  weight: ["400", "500", "600", "700", "800"],
});

// Technical / Meta Typography
const spaceMono = Space_Mono({ 
  subsets: ["latin"],
  variable: "--font-space-mono",
  weight: ["400", "700"],
});

// Editorial / Artifact Typography
const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  weight: ["400", "600", "800"],
  style: ["normal", "italic"]
});

export const metadata: Metadata = {
  title: "PARADOX | AI Alternate Reality Engine",
  description: "High-fidelity alternate history simulation engine.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={cn(
        syne.variable, 
        spaceMono.variable, 
        playfair.variable,
        "structural-bg text-primary min-h-screen font-mono selection:bg-amber-500 selection:text-black"
      )}>
        <SmoothScroll>
          {children}
        </SmoothScroll>
      </body>
    </html>
  );
}
