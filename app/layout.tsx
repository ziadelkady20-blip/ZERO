import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ZERO CLOTHING — Modern Menswear",
  description: "Discover ZERO CLOTHING menswear: considered everyday essentials, refined fits, and versatile pieces for the modern man.",
  applicationName: "ZERO CLOTHING",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
