import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "PARADOX | AI Alternate Reality Engine",
  description: "Explore alternate timelines powered by artificial intelligence. Rewrite Reality.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={cn(inter.className, "aurora-bg text-white min-h-screen")}>
        <div className="aurora-blob" />
        {children}
      </body>
    </html>
  );
}
