import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Mindshare Map — AI-Governed Field Insight",
  description:
    "Synthetic demo showing how advisor meeting briefs become governed, measurable learning signals without using any real data."
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-50 text-slate-900">{children}</body>
    </html>
  );
}
