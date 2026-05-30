import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  metadataBase: new URL("https://karivio.vercel.app"),
  title: {
    default: "Karivio - AI Resume & Cover Letter Builder",
    template: "%s | Karivio",
  },
  description: "Build professional, ATS-friendly resumes and cover letters in seconds with AI. Free, private, and easy to use.",
  keywords: ["resume builder", "cover letter builder", "AI resume", "ATS resume", "karivio", "career generator"],
  authors: [{ name: "Atsiila Arya Nabiih" }],
  openGraph: {
    title: "Karivio - AI Resume & Cover Letter Builder",
    description: "Build professional, ATS-friendly resumes and cover letters in seconds with AI.",
    url: "https://karivio.vercel.app",
    siteName: "Karivio",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Karivio - AI Resume Builder",
    description: "Build ATS-friendly resumes and cover letters with AI.",
  },
  robots: {
    index: true,
    follow: true,
  },
  verification: {
    google: "v1aItii6d-xt-rWO2IGg4E--lsiXQpfCONYw5UIQm7c",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} scroll-smooth`} data-scroll-behavior="smooth">
      <body className="min-h-screen flex flex-col bg-[var(--color-surface)] text-[var(--color-text)] font-sans antialiased overflow-x-hidden">
        {children}
      </body>
    </html>
  );
}
