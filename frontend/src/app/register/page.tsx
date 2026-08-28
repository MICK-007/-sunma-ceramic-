'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { Button } from '@/components/ui/Button';
import { UserPlus } from 'lucide-react';

export default function RegisterPage() {
  const router = useRouter();
  const { register } = useAuth();
  const { t } = useLanguage();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMsg('Please complete all required fields.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg('');

    const res = await register(email, password, fullName, phone);
    setIsSubmitting(false);

    if (res.success) {
      router.push('/shop');
    } else {
      setErrorMsg(res.message || 'Registration failed.');
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
          {t.nav.register}
        </h1>
      </div>

      {errorMsg && (
        <div className="p-3 bg-red-950/60 border border-red-500/40 text-red-300 rounded text-xs font-semibold">
          {errorMsg}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-bg-card border border-border-subtle p-6 rounded-lg space-y-4">
        <div className="space-y-1 text-xs">
          <label className="block text-stone font-semibold">Full Name / Business Representative</label>
          <input
            type="text"
            required
            value={fullName}
            onChange={e => setFullName(e.target.value)}
            placeholder="Somchai Studio Lux"
            className="w-full bg-bg-secondary border border-border-subtle rounded p-2.5 text-white focus:outline-none focus:border-gold"
          />
        </div>

        <div className="space-y-1 text-xs">
          <label className="block text-stone font-semibold">Phone Number</label>
          <input
            type="text"
            value={phone}
            onChange={e => setPhone(e.target.value)}
            placeholder="081-234-5678"
            className="w-full bg-bg-secondary border border-border-subtle rounded p-2.5 text-white focus:outline-none focus:border-gold"
          />
        </div>

        <div className="space-y-1 text-xs">
          <label className="block text-stone font-semibold">Email Address *</label>
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
          <label className="block text-stone font-semibold">Password *</label>
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
          <UserPlus className="w-4 h-4 mr-2" />
          {isSubmitting ? 'Creating Account...' : t.nav.register}
        </Button>

        <div className="pt-2 border-t border-border-subtle flex items-center justify-between text-xs text-stone">
          <span>Already registered?</span>
          <Link href="/login" className="text-gold font-bold hover:underline">
            {t.nav.login}
          </Link>
        </div>
      </form>
    </div>
  );
}
