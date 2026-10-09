import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ZERO CLOTHING — Performance Wear",
  description: "Performance wear made for movement. Discover ZERO CLOTHING compression wear and athletic essentials.",
  applicationName: "ZERO CLOTHING",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
