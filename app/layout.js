import { Poppins } from "next/font/google";
import "./globals.css";
import NextTopLoader from "nextjs-toploader";
import Navbaar from "@/components/Navbaar";
import Footer from "@/components/Footer";
import SessionWrapper from "./component/SessionWrapper";
import TrackCity from "./component/TrackCity";
import { Analytics } from "@vercel/analytics/next"

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
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
        className={`${poppins.variable} antialiased`}
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
