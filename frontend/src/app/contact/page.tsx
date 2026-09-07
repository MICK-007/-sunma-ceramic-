'use client';

import React, { useState } from 'react';
import { Breadcrumb } from '@/components/ui/Breadcrumb';
import { Button } from '@/components/ui/Button';
import { Phone, Mail, MapPin, CheckCircle } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

export default function ContactPage() {
  const { language } = useLanguage();
  const isThai = language === 'TH';
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      <Breadcrumb items={[{ label: isThai ? 'ติดต่อเราและขอใบเสนอราคา' : 'Contact & Quotations' }]} />

      <div className="border-b border-border-subtle pb-6 text-left">
        <span className="text-[11px] uppercase font-semibold tracking-[0.3em] text-gold block mb-1">
          {isThai ? 'ติดต่อสอบถามโครงการและโชว์รูม' : 'PROJECT INQUIRY & SHOWROOM'}
        </span>
        <h1 className="font-heading text-3xl sm:text-4xl font-normal text-txt-main">
          {isThai ? 'ติดต่อ SUNMA CERAMIC' : 'Contact SUNMA CERAMIC'}
        </h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 text-left">
        {/* Left Form */}
        <div className="lg:col-span-7 bg-bg-card border border-border-subtle p-8 sm:p-10 rounded-[2px] space-y-6 shadow-xs">
          <h2 className="font-heading text-xl font-normal text-txt-main">
            {isThai ? 'ขอใบเสนอราคาโครงการ หรือชุดตัวอย่างกระเบื้อง' : 'Request Project Quotation or Sample Kit'}
          </h2>

          {submitted ? (
            <div className="p-6 bg-gold/10 border border-gold/40 rounded-[2px] text-center space-y-2 animate-fadeIn">
              <CheckCircle className="w-10 h-10 text-gold mx-auto" />
              <h3 className="font-heading text-lg font-normal text-txt-main">
                {isThai ? 'ได้รับคำขอใบเสนอราคาเรียบร้อยแล้ว' : 'Quotation Request Received'}
              </h3>
              <p className="text-xs text-txt-muted font-light">
                {isThai
                  ? 'เจ้าหน้าที่ตัวแทนสเปกโครงการจะติดต่อกลับภายใน 24 ชั่วโมงพร้อมข้อมูลสเปกกระเบื้อง'
                  : 'Our architectural representative will contact you within 24 hours with project specifications.'}
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-txt-muted font-medium uppercase tracking-wider text-[10.5px] mb-1.5">
                    {isThai ? 'ชื่อผู้ติดต่อ *' : 'Your Name *'}
                  </label>
                  <input
                    type="text"
                    required
                    placeholder={isThai ? 'คุณสมชาย (สถาปนิก)' : 'Khun Somchai (Architect)'}
                    className="w-full bg-bg-secondary border border-border-subtle rounded-[2px] p-3 text-txt-main placeholder-txt-muted/50 focus:outline-none focus:border-gold"
                  />
                </div>
                <div>
                  <label className="block text-txt-muted font-medium uppercase tracking-wider text-[10.5px] mb-1.5">
                    {isThai ? 'บริษัท / สตูดิโอออกแบบ' : 'Company / Atelier'}
                  </label>
                  <input
                    type="text"
                    placeholder={isThai ? 'สตูดิโอสถาปัตยกรรม' : 'Studio Lux Architecture'}
                    className="w-full bg-bg-secondary border border-border-subtle rounded-[2px] p-3 text-txt-main placeholder-txt-muted/50 focus:outline-none focus:border-gold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-txt-muted font-medium uppercase tracking-wider text-[10.5px] mb-1.5">
                    {isThai ? 'เบอร์โทรศัพท์ติดต่อ *' : 'Phone Number *'}
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="081-234-5678"
                    className="w-full bg-bg-secondary border border-border-subtle rounded-[2px] p-3 text-txt-main placeholder-txt-muted/50 focus:outline-none focus:border-gold"
                  />
                </div>
                <div>
                  <label className="block text-txt-muted font-medium uppercase tracking-wider text-[10.5px] mb-1.5">
                    {isThai ? 'อีเมล *' : 'Email Address *'}
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="project@studio.com"
                    className="w-full bg-bg-secondary border border-border-subtle rounded-[2px] p-3 text-txt-main placeholder-txt-muted/50 focus:outline-none focus:border-gold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-txt-muted font-medium uppercase tracking-wider text-[10.5px] mb-1.5">
                  {isThai ? 'ขอบเขตโครงการและสเปกกระเบื้องที่ต้องการ' : 'Project Scope & Tile Specifications'}
                </label>
                <textarea
                  rows={4}
                  placeholder={
                    isThai
                      ? 'ระบุพื้นที่โดยประมาณ (ตร.ม.), ขนาดกระเบื้องที่ต้องการ (60x60, 60x120, แผ่นสแลป), หรือกำหนดเวลาส่งมอบ...'
                      : 'Specify required area in sq.m, tile size (60x60, 60x120, porcelain slab), or delivery timeline...'
                  }
                  className="w-full bg-bg-secondary border border-border-subtle rounded-[2px] p-3 text-txt-main placeholder-txt-muted/50 focus:outline-none focus:border-gold"
                />
              </div>

              <Button type="submit" variant="gold" size="lg" className="w-full shadow-md">
                {isThai ? 'ส่งข้อมูลสอบถามโครงการ' : 'Submit Architectural Inquiry'}
              </Button>
            </form>
          )}
        </div>

        {/* Right Info */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-bg-card border border-border-subtle p-8 rounded-[2px] space-y-5 text-xs shadow-xs text-left">
            <h3 className="font-heading text-sm font-semibold text-txt-main uppercase tracking-widest border-b border-border-subtle pb-3">
              {isThai ? 'โชว์รูมและสตูดิโอ กรุงเทพฯ' : 'Bangkok Flagship Atelier'}
            </h3>

            <div className="space-y-4 text-txt-muted font-light">
              <div className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-gold shrink-0 mt-0.5" />
                <div>
                  <span className="font-medium text-txt-main block">SUNMA CERAMIC ATELIER</span>
                  {isThai
                    ? '88/12 ถนนสุขุมวิท 55 (ทองหล่อ) แขวงคลองตันเหนือ เขตวัฒนา กรุงเทพฯ 10110'
                    : '88/12 Sukhumvit 55 Road (Thonglor), Klongtan Nua, Vadhana, Bangkok 10110'}
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-gold shrink-0" />
                <div>
                  <span className="font-medium text-txt-main block">
                    {isThai ? 'ปรึกษางานสเปกโดยตรง' : 'Direct Consultations'}
                  </span>
                  +66 (0) 2-800-9999 / +66 (0) 81-234-5678
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-gold shrink-0" />
                <div>
                  <span className="font-medium text-txt-main block">
                    {isThai ? 'ฝ่ายประสานงานโครงการ' : 'Specification Desk'}
                  </span>
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
