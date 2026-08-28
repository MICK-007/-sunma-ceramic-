'use client';

import { useEffect } from 'react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Global Error:', error);
  }, [error]);

  return (
    <html lang="th" className="dark">
      <body className="bg-[#0C0D0E] text-[#F3F3F3] min-h-screen flex flex-col items-center justify-center p-4">
        <div className="text-center space-y-4 max-w-md">
          <h1 className="text-3xl font-bold text-[#D4AF37]">SUNMA CERAMIC</h1>
          <h2 className="text-xl font-bold">System Maintenance / Application Error</h2>
          <p className="text-sm text-gray-400">
            {error?.message || 'เกิดข้อผิดพลาดในการโหลดระบบ'}
          </p>
          <button
            onClick={() => reset()}
            className="px-6 py-2.5 bg-[#D4AF37] text-black font-bold rounded hover:bg-[#E5C158] transition-colors text-sm"
          >
            ลองใหม่อีกครั้ง (Try Again)
          </button>
        </div>
      </body>
    </html>
  );
}
