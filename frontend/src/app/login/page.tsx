'use client';

import React, { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { Button } from '@/components/ui/Button';
import { ShieldCheck, LogIn, AlertCircle } from 'lucide-react';

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect') || '/shop';
  const notice = searchParams.get('notice');

  const { login } = useAuth();
  const { t } = useLanguage();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMsg('Please provide email and password.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg('');

    const res = await login(email, password);
    setIsSubmitting(false);

    if (res.success) {
      router.push(redirect);
    } else {
      let msg = res.message || 'Login failed.';
      if (msg.includes('ยังไม่ได้ลงทะเบียน') || msg.includes('not registered') || msg.includes('EMAIL_NOT_REGISTERED')) {
        msg = (t as any).auth?.emailNotRegistered || 'This email is not registered in our system. Please sign up first.';
      } else if (msg.includes('รหัสผ่านไม่ถูกต้อง') || msg.includes('Invalid password') || msg.includes('INVALID_PASSWORD')) {
        msg = (t as any).auth?.invalidPassword || 'Invalid password. Please check your password and try again.';
      }
      setErrorMsg(msg);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-16 space-y-6">
      <div className="text-center space-y-2">
        <div className="font-heading text-2xl font-bold tracking-[0.25em] text-white">
          SUNMA
        </div>
        <div className="text-[10px] tracking-[0.4em] font-semibold text-stone uppercase -mt-1">
          CERAMIC
        </div>
        <h1 className="font-heading text-xl font-bold text-gold pt-3">
          {t.nav.login}
        </h1>
      </div>

      {notice === 'cart' && (
        <div className="p-3 bg-gold/15 border border-gold/40 text-gold rounded text-xs font-semibold flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          {t.product.authNoticeCart}
        </div>
      )}

      {errorMsg && (
        <div className="p-3 bg-red-950/60 border border-red-500/40 text-red-300 rounded text-xs font-semibold">
          {errorMsg}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-bg-card border border-border-subtle p-6 rounded-lg space-y-4">
        <div className="space-y-1 text-xs">
          <label className="block text-stone font-semibold">Email Address</label>
          <input
            type="email"
            required
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="architect@studio-lux.com"
            className="w-full bg-bg-secondary border border-border-subtle rounded p-2.5 text-white focus:outline-none focus:border-gold"
          />
        </div>

        <div className="space-y-1 text-xs">
          <label className="block text-stone font-semibold">Password</label>
          <input
            type="password"
            required
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="••••••••"
            className="w-full bg-bg-secondary border border-border-subtle rounded p-2.5 text-white focus:outline-none focus:border-gold"
          />
        </div>

        <Button type="submit" variant="gold" size="lg" className="w-full" disabled={isSubmitting}>
          <LogIn className="w-4 h-4 mr-2" />
          {isSubmitting ? 'Authenticating...' : t.nav.login}
        </Button>

        <div className="pt-2 border-t border-border-subtle flex items-center justify-between text-xs text-stone">
          <span>Don't have an account?</span>
          <Link href="/register" className="text-gold font-bold hover:underline">
            {t.nav.register}
          </Link>
        </div>
      </form>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="p-20 text-center text-gold font-bold">Loading Login...</div>}>
      <LoginContent />
    </Suspense>
  );
}
