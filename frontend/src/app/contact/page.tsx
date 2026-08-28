'use client';

import React, { useState } from 'react';
import { Breadcrumb } from '@/components/ui/Breadcrumb';
import { Button } from '@/components/ui/Button';
import { Phone, Mail, MapPin, CheckCircle } from 'lucide-react';

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      <Breadcrumb items={[{ label: 'Contact & Quotations' }]} />

      <div className="border-b border-border-subtle pb-4">
        <span className="text-xs uppercase font-bold tracking-[0.25em] text-gold block">
          PROJECT INQUIRY & SHOWROOM
        </span>
        <h1 className="font-heading text-3xl font-bold text-white">
          Contact SUNMA CERAMIC
        </h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Left Form */}
        <div className="lg:col-span-7 bg-bg-card border border-border-subtle p-8 rounded-xl space-y-6">
          <h2 className="font-heading text-lg font-bold text-white uppercase tracking-wider">
            Request Project Quotation or Sample Box
          </h2>

          {submitted ? (
            <div className="p-6 bg-gold/15 border border-gold rounded-lg text-center space-y-2 animate-fadeIn">
              <CheckCircle className="w-10 h-10 text-gold mx-auto" />
              <h3 className="font-heading text-lg font-bold text-white">Quotation Request Received</h3>
              <p className="text-xs text-stone-light">
                Our architectural representative will contact you within 24 hours with project specifications.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-stone font-semibold mb-1">Your Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="Somchai Architect"
                    className="w-full bg-bg-secondary border border-border-subtle rounded p-3 text-white focus:outline-none focus:border-gold"
                  />
                </div>
                <div>
                  <label className="block text-stone font-semibold mb-1">Company / Studio</label>
                  <input
                    type="text"
                    placeholder="Studio Lux Architecture"
                    className="w-full bg-bg-secondary border border-border-subtle rounded p-3 text-white focus:outline-none focus:border-gold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-stone font-semibold mb-1">Phone Number *</label>
                  <input
                    type="text"
                    required
                    placeholder="081-234-5678"
                    className="w-full bg-bg-secondary border border-border-subtle rounded p-3 text-white focus:outline-none focus:border-gold"
                  />
                </div>
                <div>
                  <label className="block text-stone font-semibold mb-1">Email Address *</label>
                  <input
                    type="email"
                    required
                    placeholder="project@studio.com"
                    className="w-full bg-bg-secondary border border-border-subtle rounded p-3 text-white focus:outline-none focus:border-gold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-stone font-semibold mb-1">Project Details & Tile Requirements</label>
                <textarea
                  rows={4}
                  placeholder="Specify required quantity in sq.m, tile size (60x60, 60x120), or target budget..."
                  className="w-full bg-bg-secondary border border-border-subtle rounded p-3 text-white focus:outline-none focus:border-gold"
                />
              </div>

              <Button type="submit" variant="gold" size="lg" className="w-full">
                Submit Inquiry
              </Button>
            </form>
          )}
        </div>

        {/* Right Info */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-bg-card border border-border-subtle p-6 rounded-xl space-y-4 text-xs">
            <h3 className="font-heading text-sm font-bold text-gold uppercase tracking-wider border-b border-border-subtle pb-3">
              Bangkok Flagship Showroom
            </h3>

            <div className="space-y-3 text-stone-light">
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-gold shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-white block">SUNMA CERAMIC ATELIER</span>
                  88/12 Sukhumvit 55 Road (Thonglor), Klongtan Nua, Vadhana, Bangkok 10110
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-gold shrink-0" />
                <div>
                  <span className="font-bold text-white block">Phone Inquiries</span>
                  +66 (0) 2-800-9999 / +66 (0) 81-234-5678
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-gold shrink-0" />
                <div>
                  <span className="font-bold text-white block">Official Email</span>
                  project@sunmaceramic.com
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
