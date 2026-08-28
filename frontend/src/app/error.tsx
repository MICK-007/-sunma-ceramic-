'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/Button';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Unhandled Application Error:', error);
  }, [error]);

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center px-4 text-center space-y-4">
      <h2 className="font-heading text-2xl font-bold text-white">เกิดข้อผิดพลาดในการโหลดข้อมูล</h2>
      <p className="text-stone-light text-sm max-w-md">
        {error?.message || 'โปรดตรวจสอบการเชื่อมต่อ หรือลองใหม่อีกครั้ง'}
      </p>
      <Button variant="gold" onClick={() => reset()}>
        ลองอีกครั้ง (Try Again)
      </Button>
    </div>
  );
}
