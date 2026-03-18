import type { Metadata } from 'next';
import { Cinzel, Cinzel_Decorative, EB_Garamond } from 'next/font/google';
import '@/styles/globals.css';
import { AuthProvider } from '@/components/auth/AuthProvider';
import { Navbar } from '@/components/nav/Navbar';

const cinzel = Cinzel({
  subsets: ['latin'],
  weight: ['400', '600', '700', '900'],
  variable: '--font-cinzel',
  display: 'swap',
});

const cinzelDecorative = Cinzel_Decorative({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-cinzel-dec',
  display: 'swap',
});

const ebGaramond = EB_Garamond({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  style: ['normal', 'italic'],
  variable: '--font-garamond',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Ekklesia Agora — A Gathering Place for Eastern Orthodox Christians',
  description:
    'An Eastern Orthodox Christian platform for video sharing, community discussion, Scripture reading, and patristic study.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${cinzel.variable} ${cinzelDecorative.variable} ${ebGaramond.variable}`}
    >
      <body className="bg-navy font-garamond text-text-light pt-[70px] min-h-screen">
        <AuthProvider>
          <Navbar />
          <main className="relative z-10">
            {children}
          </main>
        </AuthProvider>
      </body>
    </html>
  );
}
