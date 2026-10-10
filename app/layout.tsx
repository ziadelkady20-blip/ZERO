import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ZERO CLOTHING — Everyday Essentials",
  description: "Discover ZERO CLOTHING: considered everyday essentials, refined fits, and versatile pieces designed for your own standard.",
  applicationName: "ZERO CLOTHING",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
