import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import NextTopLoader from "nextjs-toploader";
import Navbaar from "@/components/Navbaar";
import Footer from "@/components/Footer";
import SessionWrapper from "./component/SessionWrapper";
import TrackCity from "./component/TrackCity";
import { Analytics } from "@vercel/analytics/next"

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "JMD - Outdoor Advertising",
  description: "JMD is a leading outdoor advertising company in India, specializing in innovative and impactful advertising solutions across various cities.",
  keywords: [
    "JMD",
    "Outdoor Advertising",
    "India",
    "Advertising Company",
    "Billboards",
    "Digital Signage",
    "Brand Promotion",
    "Marketing Solutions",
  ],
  icons: {
    icon: "/favicon.svg"
  }
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <SessionWrapper>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <TrackCity />
        <NextTopLoader/>
        <Navbaar />
        <div className="container min-h-[100vh] min-w-full">
          {children}
        </div>
        <Footer />
        <Analytics />
      </body>
      </SessionWrapper>
    </html>
  );
}
