import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Barrow-Sports | ระบบยืม-คืนอุปกรณ์กีฬาโรงเรียน",
  description: "ระบบบริหารจัดการและยืม-คืนอุปกรณ์กีฬาโรงเรียน ตรวจสอบสถานะสต็อกแบบเรียลไทม์ พร้อมหลักฐานรูปถ่ายส่งคืน",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="th"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-slate-950 text-slate-100 relative">
        <div className="ambient-glow-mesh" aria-hidden="true" />
        <div className="relative z-10 flex-1 flex flex-col">{children}</div>
      </body>
    </html>
  );
}
