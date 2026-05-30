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
      <body className="min-h-full flex flex-col bg-slate-50 text-slate-900">
        {session && <Sidebar />}
        <main className={`flex-1 min-w-0 ${session ? "ml-64" : ""}`}>
          <div className="h-full">
            {children}
          </div>
        </main>
        <Toaster position="top-right" />
      </body>
    </html>
  );
}
