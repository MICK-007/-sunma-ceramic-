import React from 'react';
import Link from 'next/link';
import { Eye, ShieldAlert, ArrowLeft } from 'lucide-react';

interface PreviewBannerProps {
  slug: string;
  isDraft: boolean;
}

export const PreviewBanner: React.FC<PreviewBannerProps> = ({ slug, isDraft }) => {
  return (
    <div className="bg-amber-500 text-black px-4 py-2 flex flex-col sm:flex-row items-center justify-between gap-2 shadow-lg relative z-50 text-xs font-bold font-mono tracking-wider border-b border-amber-600">
      <div className="flex items-center gap-2">
        <ShieldAlert className="w-4 h-4 text-black animate-pulse" />
        <span>DRAFT PREVIEW MODE</span>
        <span className="bg-black text-amber-400 px-2 py-0.5 rounded text-[10px] uppercase font-sans">
          Page: {slug}
        </span>
      </div>

      <div className="flex items-center gap-4">
        <span className="text-[11px] font-normal hidden md:inline">
          Viewing live unpublished draft content. Public visitors see only published content.
        </span>
        <Link
          href="/admin"
          className="inline-flex items-center gap-1 bg-black text-white hover:bg-neutral-800 px-3 py-1 rounded text-xs transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Admin
        </Link>
      </div>
    </div>
  );
};
