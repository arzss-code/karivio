import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  title: "Careergen - AI Resume & Cover Letter Builder",
  description: "Build professional, ATS-friendly resumes and cover letters in seconds with AI. Free, private, and easy to use.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} scroll-smooth`}>
      <body className="min-h-screen flex flex-col bg-[var(--color-surface)] text-[var(--color-text)] font-sans antialiased overflow-x-hidden">
        {children}
      </body>
    </html>
  );
}
