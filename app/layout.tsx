import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ToastProvider } from "@/context/ToastContext";
import { AuthProvider } from "@/context/AuthContext";
import { CartProvider } from "@/context/CartContext";
import ConditionalShell from "@/components/ConditionalShell";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "LongtechCart - Next-Gen Tech Marketplace & Governance",
  description: "High-performance Tech E-Commerce platform and merchant portal powered by Next.js and Go Fiber v3",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-screen flex flex-col bg-[#F4F7FC] dark:bg-[#0B0F19] text-slate-900 dark:text-slate-100 antialiased selection:bg-blue-500 selection:text-white">
        <ToastProvider>
          <AuthProvider>
            <CartProvider>
              <ConditionalShell>{children}</ConditionalShell>
            </CartProvider>
          </AuthProvider>
        </ToastProvider>
      </body>
    </html>
  );
}
