import { Geist, Geist_Mono, Inter } from "next/font/google";
import "bootstrap/dist/css/bootstrap.min.css";
const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});
const inter = Inter({ variable: "--font-inter", subsets: ["latin"] });

export const metadata = {
  title: "BingeBeats",
  icons: {
    icon: [
      { url: "./favicon-light.ico", media: "(prefers-color-scheme: light)" },
      { url: "./favicon-dark.ico", media: "(prefers-color-scheme: dark)" },
    ],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} bg-body`}>
        {children}
      </body>
    </html>
  );
}
