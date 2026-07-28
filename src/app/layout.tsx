import type { Metadata } from 'next';
import { LanguageProvider } from '@/context/LanguageContext';
import './globals.css';

export const metadata: Metadata = {
  title: 'LuxeShine - Bespoke Clean & Detail Artistry | Home & Office',
  description:
    'LuxeShine provides premier residential cleaning, office sanitization, deep cleaning, and agency-approved end of lease cleaning services. Secure online booking in 2 minutes.',
  keywords: 'premium cleaning, luxury house cleaning, deep cleaning, end of lease clean, commercial office clean, Beverly Hills cleaner',
  authors: [{ name: 'LuxeShine Team' }],
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <LanguageProvider>
          {children}
        </LanguageProvider>
      </body>
    </html>
  );
}
