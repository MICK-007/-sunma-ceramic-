'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Phone, Mail, MapPin, CheckCircle } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

export interface CMSContactInfoProps {
  content?: {
    title?: string;
    subtitle?: string;
    settings?: {
      eyebrow?: string;
      eyebrowTh?: string;
      title?: string;
      titleTh?: string;
      formTitle?: string;
      formTitleTh?: string;
      showroomTitle?: string;
      showroomTitleTh?: string;
      atelierName?: string;
      atelierNameTh?: string;
      address?: string;
      addressTh?: string;
      phoneLabel?: string;
      phoneLabelTh?: string;
      phone?: string;
      emailLabel?: string;
      emailLabelTh?: string;
      email?: string;
    };
  };
}

export const CMSContactInfo: React.FC<CMSContactInfoProps> = ({ content }) => {
  const { language } = useLanguage();
  const isThai = language === 'TH';
  const [submitted, setSubmitted] = useState(false);

  let settings = content?.settings || {};
  if (typeof settings === 'string') {
    try {
      settings = JSON.parse(settings);
    } catch (e) {
      settings = {};
    }
  }

  const defaultEyebrowEn = 'TS MATERIAL HEADQUARTERS & SHOWROOM';
  const defaultEyebrowTh = 'สำนักงานใหญ่และโชว์รูม บริษัท ทีเอส แมททีเรียล จำกัด';
  const defaultTitle = 'Contact TILE STUDIO';
  const defaultFormTitleEn = 'Request Project Quotation or Sample Kit';
  const defaultFormTitleTh = 'ขอใบเสนอราคาโครงการ หรือชุดตัวอย่างกระเบื้อง';
  const defaultShowroomTitleEn = 'Headquarters & Showroom';
  const defaultShowroomTitleTh = 'สำนักงานใหญ่และโชว์รูม';
  const defaultAtelierName = 'บริษัท ทีเอส แมททีเรียล จำกัด (TS MATERIAL Co., Ltd.)';
  const defaultAddressEn = '8/32 Moo 3, Pracha Samran Road, Soi Sap Prasit, Khlong Sip Song, Nong Chok, Bangkok 10530';
  const defaultAddressTh = '8/32 ม.3 ถนนประชาสำราญ ซอยทรัพย์ประสิทธิ์ แขวงคลองสิบสอง เขตหนองจอก กทม. 10530';
  const defaultPhoneLabelEn = 'Direct Consultations & Sales';
  const defaultPhoneLabelTh = 'ปรึกษางานสเปกและฝ่ายขาย';
  const defaultPhone = '065-009-3661';
  const defaultEmailLabelEn = 'Specification & Project Desk';
  const defaultEmailLabelTh = 'ฝ่ายประสานงานโครงการ';
  const defaultEmail = 'tsmaterial15@gmail.com';

  const rawEyebrowEn = settings.eyebrow && !settings.eyebrow.includes('SUNMA') ? settings.eyebrow : defaultEyebrowEn;
  const rawEyebrowTh = settings.eyebrowTh && !settings.eyebrowTh.includes('ซันม่า') ? settings.eyebrowTh : defaultEyebrowTh;
  const eyebrow = isThai ? rawEyebrowTh : rawEyebrowEn;

  const rawTitle = content?.title && !content.title.includes('SUNMA')
    ? content.title
    : settings.title && !settings.title.includes('SUNMA')
    ? settings.title
    : defaultTitle;
  const rawTitleTh = settings.titleTh && !settings.titleTh.includes('ซันม่า') ? settings.titleTh : rawTitle;
  const title = isThai ? rawTitleTh : rawTitle;

  const formTitle = isThai
    ? settings.formTitleTh || settings.formTitle || defaultFormTitleTh
    : settings.formTitle || defaultFormTitleEn;

  const showroomTitle = isThai
    ? settings.showroomTitleTh || settings.showroomTitle || defaultShowroomTitleTh
    : settings.showroomTitle || defaultShowroomTitleEn;

  const rawAtelierName = settings.atelierName && !settings.atelierName.includes('SUNMA') ? settings.atelierName : defaultAtelierName;
  const rawAtelierNameTh = settings.atelierNameTh && !settings.atelierNameTh.includes('ซันม่า') ? settings.atelierNameTh : defaultAtelierName;
  const atelierName = isThai ? rawAtelierNameTh : rawAtelierName;

  const rawAddressEn = settings.address && !settings.address.includes('Sukhumvit') ? settings.address : defaultAddressEn;
  const rawAddressTh = settings.addressTh && !settings.addressTh.includes('สุขุมวิท') ? settings.addressTh : defaultAddressTh;
  const address = isThai ? rawAddressTh : rawAddressEn;

  const phoneLabel = isThai
    ? settings.phoneLabelTh || settings.phoneLabel || defaultPhoneLabelTh
    : settings.phoneLabel || defaultPhoneLabelEn;

  const phone = settings.phone || defaultPhone;

  const emailLabel = isThai
    ? settings.emailLabelTh || settings.emailLabel || defaultEmailLabelTh
    : settings.emailLabel || defaultEmailLabelEn;

  const email = settings.email || defaultEmail;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="space-y-10">
      <div className="border-b border-border-subtle pb-6 text-left">
        <span className="text-[11px] uppercase font-semibold tracking-[0.3em] text-gold block mb-1">
          {eyebrow}
        </span>
        <h1 className="font-heading text-3xl sm:text-4xl font-normal text-txt-main">
          {title}
        </h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 text-left">
        {/* Left Form */}
        <div className="lg:col-span-7 bg-bg-card border border-border-subtle p-8 sm:p-10 rounded-[2px] space-y-6 shadow-xs">
          <h2 className="font-heading text-xl font-normal text-txt-main">
            {formTitle}
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
              {showroomTitle}
            </h3>

            <div className="space-y-4 text-txt-muted font-light">
              <div className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-gold shrink-0 mt-0.5" />
                <div>
                  <span className="font-medium text-txt-main block">{atelierName}</span>
                  <span className="text-[11px] text-txt-muted block mb-1">
                    {isThai ? 'เลขประจำตัวผู้เสียภาษี: 0105568089913' : 'Tax ID: 0105568089913'}
                  </span>
                  <span className="whitespace-pre-line">{address}</span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-gold shrink-0" />
                <div>
                  <span className="font-medium text-txt-main block">
                    {phoneLabel}
                  </span>
                  {phone}
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-gold shrink-0" />
                <div>
                  <span className="font-medium text-txt-main block">
                    {emailLabel}
                  </span>
                  <a href={`mailto:${email}`} className="hover:text-gold transition-colors">
                    {email}
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
