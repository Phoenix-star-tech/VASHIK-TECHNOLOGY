import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-primary',
});

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: '#ffffff',
};

export const metadata: Metadata = {
  metadataBase: new URL('https://vashik.in/'),
  title: 'VASHIK TECHNOLOGIES — We build what matters | Scalable Digital Engineering',
  description:
    'VASHIK TECHNOLOGIES builds scalable digital platforms, modern web applications, enterprise systems, and custom engineering solutions that power high-growth businesses. We engineer infrastructure, not decoration.',
  keywords: [
    // Brand & Identity
    'VASHIK',
    'VASHIK TECHNOLOGIES',
    'Vashik Technologies',
    'Vashik Technology',
    'Vashik',
    'vashik.in',
    'VASHIK engineering',
    // Core Services & Software Development
    'software development company',
    'custom software development',
    'web development company',
    'full stack development',
    'enterprise platforms',
    'enterprise software solutions',
    'cloud architecture',
    'cloud infrastructure',
    'digital engineering',
    'system design',
    'technical infrastructure',
    // Web Design & Website Development Packages
    'responsive web design',
    'modern website design',
    'startup website development',
    'business website packages',
    'e-commerce website development',
    'Next.js development company',
    'React web applications',
    'custom UI UX design',
    'high performance web development',
    'SEO friendly web development',
    // IT, Consulting & Solutions
    'digital transformation services',
    'IT consulting services',
    'API development and integration',
    'database architecture and management',
    'scalable digital platforms',
    'performance optimization',
    'software company India',
    'web development company Hyderabad',
  ],
  authors: [{ name: 'VASHIK TECHNOLOGIES' }],
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  alternates: {
    canonical: 'https://vashik.in/',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://vashik.in/',
    siteName: 'VASHIK TECHNOLOGIES',
    title: 'VASHIK TECHNOLOGIES — We build what matters',
    description:
      'VASHIK builds scalable digital platforms, modern web applications, enterprise systems, and engineering solutions that power modern businesses.',
    images: [
      {
        url: '/logo.png',
        width: 800,
        height: 600,
        alt: 'VASHIK TECHNOLOGIES Logo',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'VASHIK TECHNOLOGIES — We build what matters',
    description:
      'VASHIK builds scalable digital platforms, modern web applications, enterprise systems, and engineering solutions that power modern businesses.',
    images: ['/logo.png'],
  },
  icons: {
    icon: '/favicon.png?v=2',
  },
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'VASHIK TECHNOLOGIES',
  url: 'https://vashik.in/',
  logo: 'https://vashik.in/logo.png',
  description:
    'VASHIK TECHNOLOGIES builds scalable digital platforms, enterprise systems, and engineering solutions that power modern businesses.',
  sameAs: [],
  contactPoint: {
    '@type': 'ContactPoint',
    contactType: 'Customer Support',
    email: 'vashiktechnology@gmail.com',
  },
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
