import type { Metadata, Viewport } from "next";
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

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export const metadata: Metadata = {
  title: "Barrow-Sports | ระบบยืม-คืนอุปกรณ์กีฬาโรงเรียน",
  description: "ระบบบริหารจัดการและยืม-คืนอุปกรณ์กีฬาโรงเรียน ตรวจสอบสถานะสต็อกแบบเรียลไทม์ พร้อมหลักฐานรูปถ่ายส่งคืน",
};

function ThemeInit() {
  const script = `(function(){try{var s=localStorage.getItem('barrow-theme');var t=s||(window.matchMedia('(prefers-color-scheme: light)').matches?'light':'dark');if(t==='dark')document.documentElement.classList.add('dark');}catch(e){document.documentElement.classList.add('dark');}})();`;
  return <script dangerouslySetInnerHTML={{ __html: script }} />;
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="th" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`} suppressHydrationWarning>
      <head>
        <ThemeInit />
      </head>
      <body className="min-h-full flex flex-col relative">
        <div className="ambient-glow-mesh" aria-hidden="true" />
        <div className="relative z-10 flex-1 flex flex-col">{children}</div>
      </body>
    </html>
  );
}
