'use client';

import React, { useEffect, useState } from 'react';
import { api } from '@/services/api';
import { CMSFooter } from '@/components/cms/CMSFooter';

export const Footer = () => {
  const [cmsFooterContent, setCmsFooterContent] = useState<any>(null);

  useEffect(() => {
    let isMounted = true;
    api.getPublicCmsPage('footer').then(res => {
      if (isMounted && res?.success && res?.data?.sections?.[0]) {
        setCmsFooterContent(res.data.sections[0]);
      }
    }).catch(() => {});

    return () => {
      isMounted = false;
    };
  }, []);

  return <CMSFooter content={cmsFooterContent} />;
};

