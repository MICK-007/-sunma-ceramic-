import type { Metadata } from 'next';
import '@/styles/globals.css';
import { LanguageProvider } from '@/context/LanguageContext';
import { AuthProvider } from '@/context/AuthContext';
import { CartProvider } from '@/context/CartContext';
import { WishlistProvider } from '@/context/WishlistContext';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { MainLayoutWrapper } from '@/components/layout/MainLayoutWrapper';

import { Playfair_Display, Plus_Jakarta_Sans, Noto_Sans_Thai } from 'next/font/google';

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-heading',
  display: 'swap',
});

const jakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-body',
  display: 'swap',
});

const notoSansThai = Noto_Sans_Thai({
  subsets: ['thai', 'latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-thai',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'TILE STUDIO | Architectural Ceramic Atelier - TS MATERIAL',
  description: 'Premium architectural ceramic, porcelain slabs, and luxury surface collections by TS MATERIAL CO., LTD.',
  keywords: ['TILE STUDIO', 'TS MATERIAL', 'ceramic tiles', 'porcelain slabs', 'marble tiles', 'architectural tiles', 'Thailand ceramic importer', 'architectural surfaces'],
};


export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="th" className={`${playfair.variable} ${jakarta.variable} ${notoSansThai.variable}`}>
      <body className="bg-bg-primary text-txt-main flex flex-col min-h-screen selection:bg-gold selection:text-white">
        <LanguageProvider>
          <AuthProvider>
            <CartProvider>
              <WishlistProvider>
                <Navbar />
                <MainLayoutWrapper>{children}</MainLayoutWrapper>
                <Footer />
              </WishlistProvider>
            </CartProvider>
          </AuthProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
