import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { getSiteContent } from "@/lib/content/repository";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

export async function generateMetadata(): Promise<Metadata> {
  const { settings, profile } = await getSiteContent();
  const base = settings.siteUrl || "https://abhishekswami.work.gd";
  const ogImageUrl = `${base}/images/abhishek-og.jpg`;

  return {
    metadataBase: new URL(base),
    title: { default: settings.seoTitle, template: `%s — ${profile.name}` },
    description: settings.seoDescription,
    applicationName: settings.siteTitle,
    authors: [{ name: profile.name }],
    creator: profile.name,
    alternates: { canonical: "/" },
    openGraph: {
      type: "website",
      url: "/",
      siteName: settings.siteTitle,
      title: settings.seoTitle,
      description: settings.seoDescription,
      locale: "en_GB",
      images: [
        {
          url: ogImageUrl,
          width: 800,
          height: 800,
          alt: "Abhishek Swami — Software Engineer",
        },
      ],
    },
    twitter: {
      card: "summary",
      title: settings.seoTitle,
      description: settings.seoDescription,
      images: [ogImageUrl],
    },
    robots: { index: true, follow: true },
  };
}

export const viewport: Viewport = {
  themeColor: "#fdfdfd",
  colorScheme: "light",
};

/** Document shell only — each route group brings its own chrome. */
export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      data-scroll-behavior="smooth"
      className={`${geistSans.variable} ${geistMono.variable} antialiased`}
    >
      <body className="flex min-h-svh flex-col">{children}</body>
    </html>
  );
}
