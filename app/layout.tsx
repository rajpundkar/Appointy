import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Appointy — Scheduling that just clicks",
  description: "Open-source scheduling for individuals and teams. Polished booking pages, real availability, custom forms, file uploads, and automatic video links.",
  openGraph: {
    title: "Appointy — Scheduling that just clicks",
    description: "A polished, customisable booking page for individuals and teams. Free forever for one.",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
