import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "react-hot-toast";
import { cookies } from "next/headers";
import "./globals.css";
import Sidebar from "./components/Sidebar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "PayrollPro — Smart Payroll Automation",
  description: "Generate payslips, automate salary emails, and manage your workforce from a single dashboard.",
};

import { AccessibilityProvider } from "../lib/AccessibilityContext";

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const session = cookieStore.get("session")?.value;

  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="bg-slate-50 text-slate-900 antialiased selection:bg-blue-600 selection:text-white">
        <AccessibilityProvider>
          {session && <Sidebar />}
          <main className={`${session ? "pt-14 lg:pt-0 lg:ml-64" : ""}`}>
            {children}
          </main>
          <Toaster position="top-right" />
        </AccessibilityProvider>
      </body>
    </html>
  );
}
