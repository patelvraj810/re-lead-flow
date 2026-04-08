import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Sidebar } from "@/components/sidebar";
import { Toaster } from "sonner";

const inter = Inter({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const jetbrains = JetBrains_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "ReFlow — Real Estate Lead Pipeline",
  description: "Premium lead capture, nurture, and scheduling for real estate professionals.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${jetbrains.variable} h-full antialiased`}
    >
      <body className="min-h-full flex bg-background text-foreground">
        <Sidebar />
        <main className="flex-1 ml-0 lg:ml-64 min-h-screen">
          <div className="p-4 md:p-8">
            {children}
          </div>
        </main>
        <Toaster
          position="top-right"
          theme="dark"
          toastOptions={{
            style: {
              background: '#111113',
              border: '1px solid #27272a',
              color: '#fafafa',
            },
          }}
        />
      </body>
    </html>
  );
}