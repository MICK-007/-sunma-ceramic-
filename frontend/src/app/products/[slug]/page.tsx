'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useLanguage } from '@/context/LanguageContext';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';
import { api } from '@/services/api';
import { ProductGallery } from '@/components/product/ProductGallery';
import { SpecificationTable } from '@/components/product/SpecificationTable';
import { Breadcrumb } from '@/components/ui/Breadcrumb';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { ShoppingBag, Heart, Sparkles, Plus, Minus, Check, ArrowLeft, ShieldAlert } from 'lucide-react';

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;
  const { t, language } = useLanguage();
  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const isThai = language === 'TH';

  const [product, setProduct] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [quantity, setQuantity] = useState<number>(1); // In pieces
  const [feedbackMsg, setFeedbackMsg] = useState<string>('');

  useEffect(() => {
    if (!slug) return;
    setIsLoading(true);
    api
      .getProductBySlug(slug)
      .then(res => {
        if (res.success) {
          setProduct(res.data);
        }
      })
      .finally(() => setIsLoading(false));
  }, [slug]);

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center text-stone font-semibold">
        {t.common.loading}
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center space-y-4">
        <h2 className="text-xl font-heading font-bold text-white">Product Not Found</h2>
        <Link href="/shop">
          <Button variant="gold">Return to Catalog</Button>
        </Link>
      </div>
    );
  }

  const isFav = isInWishlist(product.id);
  const piecesPerBox = product.piecesPerBox || 4;
  const calculatedBoxes = (quantity / piecesPerBox).toFixed(1);
  const totalPrice = quantity * product.pricePerPiece;

  const handleAddToCart = async () => {
    setFeedbackMsg('');
    const res = await addToCart(product.id, quantity, product);
    if (res.success) {
      setFeedbackMsg('Item added to your shopping cart!');
      setTimeout(() => setFeedbackMsg(''), 4000);
    } else if (res.message) {
      setFeedbackMsg(res.message);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <Breadcrumb
        items={[
          { label: t.nav.shop, href: '/shop' },
          { label: product.categoryName || 'Tiles', href: `/shop?category=${product.categoryId}` },
          { label: product.name },
        ]}
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Left Column: Gallery */}
        <div className="lg:col-span-7 space-y-4">
          <ProductGallery images={product.images || [product.thumbnail]} productName={product.name} />
        </div>

        {/* Right Column: Product Info & Actions */}
        <div className="lg:col-span-5 space-y-6">
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-stone font-semibold uppercase tracking-wider">
              <span>{product.brandName || 'SUNMA Atelier'}</span>
              <span>CODE: {product.productCode}</span>
            </div>

            <h1 className="font-heading text-2xl sm:text-3xl font-bold text-white">
              {isThai && product.nameTh ? product.nameTh : product.name}
            </h1>

            <div className="flex items-center gap-2 pt-1">
              <Badge variant="gold">{product.size} cm</Badge>
              <Badge variant="stone">{product.material}</Badge>
              <Badge variant="stone">{product.surface} Surface</Badge>
            </div>
          </div>

          <p className="text-xs text-txt-muted leading-relaxed">
            {isThai && product.descriptionTh ? product.descriptionTh : product.description}
          </p>

          {/* Pricing Box */}
          <div className="bg-bg-card border border-border-subtle p-5 rounded-lg space-y-3">
            <div className="flex items-baseline justify-between">
              <div>
                <span className="text-2xl font-bold font-heading text-gold">
                  ฿{product.pricePerPiece.toLocaleString()}
                </span>
                <span className="text-xs text-txt-muted ml-1">/ piece</span>
              </div>
              <div className="text-right">
                <span className="text-sm font-semibold text-stone-light">
                  ฿{product.pricePerBox.toLocaleString()}
                </span>
                <span className="text-xs text-stone ml-1">/ box ({piecesPerBox} pcs)</span>
              </div>
            </div>

            <div className="text-xs text-stone border-t border-border-subtle pt-2 flex justify-between">
              <span>Stock Status:</span>
              <span className="font-bold text-emerald-400">
                {product.stockPieces > 0 ? `${product.stockPieces} pieces available` : 'Out of Stock'}
              </span>
            </div>
          </div>

          {/* Quantity Selector */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-txt-main block">
              {t.product.quantity}
            </label>
            <div className="flex items-center space-x-4">
              <div className="flex items-center border border-border-subtle bg-bg-secondary rounded p-1">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="p-2 text-stone hover:text-white"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <input
                  type="number"
                  value={quantity}
                  onChange={e => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-16 text-center bg-transparent text-xs font-bold text-white focus:outline-none"
                />
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="p-2 text-stone hover:text-white"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              <div className="text-xs text-stone font-semibold">
                = approx. <span className="text-gold font-bold">{calculatedBoxes}</span> boxes (Total: ฿{totalPrice.toLocaleString()})
              </div>
            </div>
          </div>

          {/* Primary Action Buttons */}
          <div className="space-y-3 pt-2">
            <div className="flex gap-3">
              <Button variant="gold" size="lg" className="flex-1" onClick={handleAddToCart}>
                <ShoppingBag className="w-4 h-4 mr-2" />
                {t.product.addToCart}
              </Button>
              <button
                onClick={() => toggleWishlist(product.id)}
                className={`p-3.5 rounded border transition-colors ${
                  isFav
                    ? 'bg-gold text-bg-primary border-gold'
                    : 'border-border-subtle text-white hover:border-gold hover:text-gold bg-bg-card'
                }`}
                title="Save to Wishlist"
              >
                <Heart className={`w-5 h-5 ${isFav ? 'fill-current' : ''}`} />
              </button>
            </div>

            {/* Room Studio Launch Action */}
            <Link href={`/room-studio?tile=${product.slug}`} className="block">
              <Button variant="outline" size="md" className="w-full bg-black/40">
                <Sparkles className="w-4 h-4 mr-2 text-gold" />
                {t.product.tryInRoomStudio}
              </Button>
            </Link>
          </div>

          {/* Feedback Message Alert */}
          {feedbackMsg && (
            <div className="p-3 bg-gold/15 border border-gold/40 text-gold rounded text-xs font-semibold flex items-center gap-2 animate-fadeIn">
              <Check className="w-4 h-4 shrink-0" />
              {feedbackMsg}
            </div>
          )}

          {/* Specification Table */}
          <div className="pt-4">
            <SpecificationTable product={product} />
          </div>
        </div>
      </div>
    </div>
  );
}
