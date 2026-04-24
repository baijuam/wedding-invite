import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Amal & Athira Wedding",
  description: "You are invited to celebrate the wedding of Amal & Athira on 23 August 2026 at Sivagiri Mutt, Varkala.",
  openGraph: {
    title: "Amal & Athira Wedding",
    description: "Join us on 23 August 2026 at Sivagiri Mutt, Varkala.",
    url: "https://amal-athira-rouge-pi.vercel.app",
    siteName: "Amal & Athira Wedding",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Amal & Athira Wedding Invitation",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Amal & Athira Wedding",
    description: "Join us on 23 August 2026 at Sivagiri Mutt, Varkala.",
    images: ["/og-image.png"],
  },
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}