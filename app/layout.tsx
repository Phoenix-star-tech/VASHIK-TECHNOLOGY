import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-primary',
});

export const metadata: Metadata = {
  metadataBase: new URL('https://vashik-technology.vercel.app/'),
  title: 'VASHIK TECHNOLOGY — We build what matters',
  description:
    'VASHIK builds scalable digital platforms, enterprise systems, and engineering solutions that power modern businesses. We engineer infrastructure, not decoration.',
  keywords: [
    'digital engineering',
    'enterprise platforms',
    'software development',
    'cloud architecture',
    'system design',
    'VASHIK engineering',
    'technical infrastructure',
  ],
  authors: [{ name: 'VASHIK TECHNOLOGY' }],
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: 'https://vashik-technology.vercel.app/',
  },
  openGraph: {
    type: 'website',
    url: 'https://vashik-technology.vercel.app/',
    title: 'VASHIK TECHNOLOGY — We build what matters',
    description:
      'VASHIK builds scalable digital platforms, enterprise systems, and engineering solutions that power modern businesses. We engineer infrastructure, not decoration.',
    images: [
      {
        url: '/logo.png',
        width: 800,
        height: 600,
        alt: 'VASHIK TECHNOLOGY Logo',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'VASHIK TECHNOLOGY — We build what matters',
    description:
      'VASHIK builds scalable digital platforms, enterprise systems, and engineering solutions that power modern businesses. We engineer infrastructure, not decoration.',
    images: ['/logo.png'],
  },
  icons: {
    icon: '/favicon.png?v=2',
  },
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'VASHIK TECHNOLOGY',
  url: 'https://vashik-technology.vercel.app/',
  logo: 'https://vashik-technology.vercel.app/logo.png',
  description:
    'VASHIK builds scalable digital platforms, enterprise systems, and engineering solutions that power modern businesses.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable}>
      <head>
        <meta name="theme-color" content="#ffffff" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
