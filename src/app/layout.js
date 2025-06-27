import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { UserProvider } from "@/context/UserContext";
import { RecordProvider } from "@/context/RecordContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "EHR",
  description: "Advanced electronic health record management for healthcare professionals",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        suppressHydrationWarning
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <AuthProvider>
          <UserProvider>
            <RecordProvider>
              {children}
            </RecordProvider>
          </UserProvider>
          {/* <Navbar isLanding={false} /> */}
        </AuthProvider>
      </body>
    </html>
  );
}
