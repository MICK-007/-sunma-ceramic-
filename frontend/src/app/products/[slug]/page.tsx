'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useLanguage } from '@/context/LanguageContext';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';
import { api } from '@/services/api';
import { useAuth } from '@/context/AuthContext';
import { ProductGallery } from '@/components/product/ProductGallery';
import { SpecificationTable } from '@/components/product/SpecificationTable';
import { Breadcrumb } from '@/components/ui/Breadcrumb';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { ShoppingBag, Heart, Sparkles, Plus, Minus, Check, ArrowLeft, ShieldAlert, Edit } from 'lucide-react';

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;
  const { t, language } = useLanguage();
  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { isAdmin } = useAuth();
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
        <h2 className="text-xl font-heading font-normal text-txt-main">
          {isThai ? 'ไม่พบข้อมูลสินค้า' : 'Product Not Found'}
        </h2>
        <Link href="/shop">
          <Button variant="gold">{isThai ? 'กลับไปยังแคตตาล็อก' : 'Return to Catalog'}</Button>
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
      setFeedbackMsg(isThai ? 'เพิ่มสินค้าลงในตระกร้าเรียบร้อยแล้ว!' : 'Item added to your shopping cart!');
      setTimeout(() => setFeedbackMsg(''), 4000);
    } else if (res.message) {
      setFeedbackMsg(isThai ? 'กรุณาเข้าสู่ระบบเพื่อเพิ่มสินค้าลงในตระกร้า' : res.message);
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
        <div className="lg:col-span-5 space-y-6 text-left">
          <div className="space-y-2.5">
            <div className="flex items-center justify-between text-xs text-txt-muted font-medium uppercase tracking-wider">
              <span>{product.brandName || 'SUNMA Atelier'}</span>
              <span className="font-mono">CODE: {product.productCode}</span>
            </div>

            <h1 className="font-heading text-2xl sm:text-4xl font-normal text-txt-main tracking-tight">
              {isThai && product.nameTh ? product.nameTh : product.name}
            </h1>

            <div className="flex items-center gap-2 pt-1">
              <Badge variant="gold">{product.size} cm</Badge>
              <Badge variant="stone">{isThai ? (product.material === 'Porcelain' ? 'พอร์ซเลน' : product.material === 'Ceramic' ? 'เซรามิก' : product.material) : product.material}</Badge>
              <Badge variant="stone">{isThai ? `ผิว${product.surface}` : `${product.surface} Surface`}</Badge>
            </div>
          </div>

          {/* Admin Edit Shortcut */}
          {isAdmin && (
            <div className="p-3 bg-gold/10 border border-gold/30 rounded-[2px] flex items-center justify-between">
              <div className="text-xs text-txt-main font-medium flex items-center gap-1.5">
                <span className="text-gold font-bold">👑 Admin:</span>
                <span className="text-txt-muted">
                  {isThai ? 'เข้าสู่ระบบด้วยสิทธิ์ผู้ดูแล' : 'Admin Privileges Active'}
                </span>
              </div>
              <Link href="/admin/products">
                <Button variant="gold" size="sm" className="text-xs h-7 rounded-[2px]">
                  <Edit className="w-3 h-3 mr-1" />
                  {isThai ? 'แก้ไขสินค้าในแอดมิน' : 'Edit in Admin'}
                </Button>
              </Link>
            </div>
          )}

          <p className="text-xs sm:text-sm text-txt-muted leading-relaxed font-light">
            {isThai && product.descriptionTh ? product.descriptionTh : product.description}
          </p>

          {/* Pricing Box */}
          <div className="bg-bg-card border border-border-subtle p-6 rounded-[2px] space-y-3.5 shadow-xs">
            <div className="flex items-baseline justify-between">
              <div>
                <span className="text-3xl font-normal font-heading text-txt-main font-mono">
                  ฿{product.pricePerPiece.toLocaleString()}
                </span>
                <span className="text-xs text-txt-muted ml-1">/ {isThai ? 'แผ่น' : 'piece'}</span>
              </div>
              <div className="text-right">
                <span className="text-sm font-semibold text-txt-main font-mono">
                  ฿{product.pricePerBox.toLocaleString()}
                </span>
                <span className="text-xs text-txt-muted ml-1">/ {isThai ? 'กล่อง' : 'box'} ({piecesPerBox} {isThai ? 'แผ่น' : 'pcs'})</span>
              </div>
            </div>

            <div className="text-xs text-txt-muted border-t border-border-subtle pt-3 flex justify-between">
              <span>{isThai ? 'สถานะสินค้าคงคลัง:' : 'Inventory Status:'}</span>
              <span className={`font-semibold ${product.stockPieces > 0 ? 'text-emerald-600' : 'text-rose-500'}`}>
                {product.stockPieces > 0
                  ? (isThai ? `มีสินค้าพร้อมส่ง ${product.stockPieces} แผ่น` : `${product.stockPieces} pieces in stock`)
                  : (isThai ? 'สั่งผลิตตามรอบ' : 'Order on request')}
              </span>
            </div>
          </div>

          {/* Quantity Selector */}
          <div className="space-y-2">
            <label className="text-[11px] font-semibold uppercase tracking-wider text-txt-muted block">
              {t.product.quantity}
            </label>
            <div className="flex items-center space-x-4">
              <div className="flex items-center border border-border-subtle bg-bg-secondary rounded-[2px] p-1">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="p-2 text-txt-muted hover:text-txt-main"
                  aria-label="Decrease quantity"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <input
                  type="number"
                  value={quantity}
                  onChange={e => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-16 text-center bg-transparent text-xs font-semibold text-txt-main focus:outline-none font-mono"
                />
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="p-2 text-txt-muted hover:text-txt-main"
                  aria-label="Increase quantity"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              <div className="text-xs text-txt-muted font-light">
                {isThai ? (
                  <>
                    = ประมาณ <span className="text-txt-main font-semibold font-mono">{calculatedBoxes}</span> กล่อง (รวม: <span className="text-txt-main font-semibold font-mono">฿{totalPrice.toLocaleString()}</span>)
                  </>
                ) : (
                  <>
                    = approx. <span className="text-txt-main font-semibold font-mono">{calculatedBoxes}</span> boxes (Total: <span className="text-txt-main font-semibold font-mono">฿{totalPrice.toLocaleString()}</span>)
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Primary Action Buttons */}
          <div className="space-y-3 pt-2">
            <div className="flex gap-3">
              <Button variant="gold" size="lg" className="flex-1 shadow-md" onClick={handleAddToCart}>
                <ShoppingBag className="w-4 h-4 mr-2" />
                {t.product.addToCart}
              </Button>
              <button
                onClick={() => toggleWishlist(product.id)}
                className={`p-3.5 rounded-[2px] border transition-colors ${
                  isFav
                    ? 'bg-gold text-white border-gold shadow-xs'
                    : 'border-border-subtle text-txt-muted hover:border-gold hover:text-gold bg-bg-card'
                }`}
                title={isThai ? 'บันทึกในรายการโปรด' : 'Save to Wishlist'}
                aria-label={isThai ? 'บันทึกในรายการโปรด' : 'Save to Wishlist'}
              >
                <Heart className={`w-5 h-5 ${isFav ? 'fill-current text-white' : ''}`} />
              </button>
            </div>

            {/* Room Studio Launch Action */}
            <Link href={`/room-studio?tile=${product.slug}`} className="block">
              <Button variant="outline" size="md" className="w-full">
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
