import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center px-4 text-center space-y-4">
      <h1 className="font-heading text-6xl font-bold text-gold">404</h1>
      <h2 className="font-heading text-2xl font-bold text-white">ไม่พบหน้าที่คุณต้องการ (Page Not Found)</h2>
      <p className="text-stone-light text-sm max-w-md">
        หน้าที่คุณกำลังเรียกดูอาจถูกย้าย ลบออก หรือใส่ URL ไม่ถูกต้อง
      </p>
      <Link
        href="/"
        className="px-6 py-2.5 bg-gold text-black font-bold rounded hover:bg-gold-hover transition-colors text-sm"
      >
        กลับหน้าหลัก (Back to Home)
      </Link>
    </div>
  );
}
