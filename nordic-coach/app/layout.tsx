import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Nordic Coach",
  description: "Football Coaching & Development Platform",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="da">
      <body>{children}</body>
    </html>
  );
}
