import type { Metadata } from 'next';
import '@/styles/globals.css';
import { LanguageProvider } from '@/context/LanguageContext';
import { AuthProvider } from '@/context/AuthContext';
import { CartProvider } from '@/context/CartContext';
import { WishlistProvider } from '@/context/WishlistContext';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';

export const metadata: Metadata = {
  title: 'SUNMA CERAMIC | Architectural Porcelain Slabs & Luxury Tile Distributor',
  description: 'Premium ceramic, marble porcelain slabs, and architectural tile collections. Distributor, direct importer, and private-label manufacturer for high-end residential and commercial projects.',
  keywords: ['ceramic tiles', 'porcelain slabs', 'marble tiles', 'architectural tiles', 'SUNMA CERAMIC', 'Thailand ceramic importer'],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="th" className="dark">
      <body className="bg-bg-primary text-txt-main flex flex-col min-h-screen">
        <LanguageProvider>
          <AuthProvider>
            <CartProvider>
              <WishlistProvider>
                <Navbar />
                <main className="flex-grow pt-24">{children}</main>
                <Footer />
              </WishlistProvider>
            </CartProvider>
          </AuthProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
