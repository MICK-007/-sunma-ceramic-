'use client';

import React, { useEffect, useState } from 'react';
import { api } from '@/services/api';
import { CmsSectionRenderer } from '@/components/cms/CmsSectionRenderer';
import { PreviewBanner } from '@/components/cms/PreviewBanner';

interface PreviewPageProps {
  params: {
    slug: string;
  };
}

export default function CmsPreviewPage({ params }: PreviewPageProps) {
  const { slug } = params;
  const [draftData, setDraftData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [statusCode, setStatusCode] = useState<number>(200);

  useEffect(() => {
    let isMounted = true;
    api.getAdminCmsDraftPage(slug).then(res => {
      if (!isMounted) return;
      if (res && res.success && res.data) {
        setDraftData(res.data);
      } else {
        const msg = res?.message || `Failed to load draft content for page '${slug}'.`;
        setErrorMessage(msg);
        if (msg.includes('Authentication') || msg.includes('log in')) {
          setStatusCode(401);
        } else if (msg.includes('Access denied') || msg.includes('privileges')) {
          setStatusCode(403);
        } else {
          setStatusCode(404);
        }
      }
      setLoading(false);
    }).catch(() => {
      if (isMounted) {
        setErrorMessage('Error connecting to backend draft service.');
        setStatusCode(500);
        setLoading(false);
      }
    });

    return () => {
      isMounted = false;
    };
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-bg-primary text-white flex items-center justify-center p-6">
        <div className="text-center space-y-2">
          <div className="w-8 h-8 border-2 border-gold border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-stone-light">Loading Admin Draft Preview...</p>
        </div>
      </div>
    );
  }

  if (errorMessage || !draftData) {
    return (
      <div className="min-h-screen bg-bg-primary text-white flex flex-col items-center justify-center p-6 text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-red-950/80 border border-red-500/50 flex items-center justify-center text-red-400 font-bold text-xl">
          {statusCode}
        </div>
        <h1 className="font-heading text-2xl font-bold">CMS Draft Preview Error</h1>
        <p className="text-sm text-stone-light max-w-md">{errorMessage}</p>
        <a
          href="/admin"
          className="inline-block px-4 py-2 bg-gold hover:bg-gold-light text-black font-bold text-xs rounded transition-colors"
        >
          Return to Admin Dashboard
        </a>
      </div>
    );
  }

  const sections = draftData.sections || [];

  return (
    <div className="min-h-screen bg-bg-primary text-txt-main">
      <PreviewBanner slug={slug} isDraft={true} />
      <main className="space-y-24 pb-20">
        <CmsSectionRenderer sections={sections} />
      </main>
    </div>
  );
}
