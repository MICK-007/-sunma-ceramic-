'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useLanguage } from '@/context/LanguageContext';
import { ArrowRight, Compass, Layers, Sun, Sunset, Moon, ExternalLink } from 'lucide-react';

export interface VillaScene {
  id: string;
  step: string;
  roomNameEn: string;
  roomNameTh: string;
  subtitleEn: string;
  subtitleTh: string;
  descriptionEn: string;
  descriptionTh: string;
  bgDay: string;
  bgGolden: string;
  bgNight: string;
  featuredTile: {
    name: string;
    code: string;
    series: string;
    size: string;
    finish: string;
    thickness: string;
    slipRating?: string;
    absorption: string;
    origin: string;
    samplePrice: string;
    slug: string;
  };
  hotspots: {
    id: string;
    top: string;
    left: string;
    labelEn: string;
    labelTh: string;
    surfaceType: string;
    tileDetail: string;
  }[];
}

const VILLA_SCENES: VillaScene[] = [
  {
    id: 'exterior',
    step: '01 / 06',
    roomNameEn: 'Monolithic Facade',
    roomNameTh: 'ด้านหน้าอาคารโมโนลิธ',
    subtitleEn: 'EXTERIOR RAINSCREEN & SLAB CLADDING',
    subtitleTh: 'การกรุกระเบื้องพอร์ซเลนภายนอกอาคาร',
    descriptionEn: 'Large-format titanium basalt slabs engineered to endure UV rays, thermal shock, and tropical weathering with zero discoloration.',
    descriptionTh: 'แผ่นพอร์ซเลนสแลปขนาดใหญ่พิเศษ ทนทานต่อรังสี UV และสภาพอากาศร้อนชื้นโดยไม่เปลี่ยนสี',
    bgDay: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=2000&q=90',
    bgGolden: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=2000&q=90',
    bgNight: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=2000&q=90',
    featuredTile: {
      name: 'Titanium Basalt Ultra-Slab',
      code: 'SUN-EXT-901',
      series: 'Architectural Monolith',
      size: '1200 x 2700 mm',
      finish: 'Matte Micro-Structure',
      thickness: '6.0 mm (Rainscreen)',
      slipRating: 'R10 Exterior',
      absorption: '< 0.05% Impervious',
      origin: 'Bologna, Italy',
      samplePrice: '450 THB',
      slug: 'basaltic-minimal',
    },
    hotspots: [
      {
        id: 'hs-facade',
        top: '42%',
        left: '35%',
        labelEn: 'Cantilevered Facade Slabs',
        labelTh: 'ผนังอาคารโครงสร้างยื่น',
        surfaceType: 'Exterior Cladding',
        tileDetail: '1200x2700mm Basaltic Slate',
      },
      {
        id: 'hs-entrance',
        top: '68%',
        left: '60%',
        labelEn: 'Arrival Portico Paving',
        labelTh: 'พื้นทางเข้าซุ้มหน้าอาคาร',
        surfaceType: 'Heavy Traffic Paver',
        tileDetail: '600x1200mm Textured Granite Porcelain',
      },
    ],
  },
  {
    id: 'foyer',
    step: '02 / 06',
    roomNameEn: 'Grand Foyer',
    roomNameTh: 'โถงต้อนรับใหญ่',
    subtitleEn: 'BOOKMATCHED CALACATTA SLAB GALLERY',
    subtitleTh: 'แผ่นหินอ่อนพอร์ซเลนต่อลายบุคมัทช์',
    descriptionEn: 'Double-height entrance paved with continuous Italian Calacatta Oro polished porcelain slabs with zero-tolerance rectified edges.',
    descriptionTh: 'โถงทางเข้าเพดานสูง ปูด้วยแผ่นหินอ่อนคริสตัลพอร์ซเลน Calacatta Oro เจียรขอบตรงแบบไร้รอยต่อ',
    bgDay: 'https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=2000&q=90',
    bgGolden: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=2000&q=90',
    bgNight: 'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=2000&q=90',
    featuredTile: {
      name: 'Calacatta Oro Imperiale Bookmatched',
      code: 'SUN-MAR-102',
      series: 'Imperial Marble Atelier',
      size: '1600 x 3200 mm',
      finish: 'Silk Polished / Honed Lux',
      thickness: '9.0 mm',
      slipRating: 'R9 Residential',
      absorption: '< 0.03%',
      origin: 'Carrara, Italy',
      samplePrice: '550 THB',
      slug: 'calacatta-imperiale',
    },
    hotspots: [
      {
        id: 'hs-foyer-floor',
        top: '74%',
        left: '52%',
        labelEn: 'Continuous Vein-Match Floor',
        labelTh: 'พื้นหินอ่อนต่อลายแนวต่อเนื่อง',
        surfaceType: 'Interior Floor',
        tileDetail: '1600x3200mm Bookmatch Duo',
      },
      {
        id: 'hs-foyer-wall',
        top: '38%',
        left: '26%',
        labelEn: 'Feature Gallery Wall',
        labelTh: 'ผนังศิลปะลายหินอ่อนประดับ',
        surfaceType: 'Wall Cladding',
        tileDetail: 'Silky Honed Alabaster Slab',
      },
    ],
  },
  {
    id: 'living',
    step: '03 / 06',
    roomNameEn: 'Living Pavilion',
    roomNameTh: 'ห้องนั่งเล่นหลักแบบเปิด',
    subtitleEn: 'HONED TRAVERTINE & FLUTED RELIEF',
    subtitleTh: 'พื้นหินทราเวอร์ทีนและผนังลอนเซรามิก',
    descriptionEn: 'Sunken living area combining Navona honed travertine flooring with vertical fluted porcelain architectural cladding.',
    descriptionTh: 'พื้นที่นั่งเล่นเปิดโล่ง ปูด้วยหินทราเวอร์ทีนผิวฮอนด์ พร้อมผนังตกแต่งลอนตั้งเพื่อมิติแสงเงา',
    bgDay: 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=2000&q=90',
    bgGolden: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=2000&q=90',
    bgNight: 'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=2000&q=90',
    featuredTile: {
      name: 'Navona Travertine Cross-Cut',
      code: 'SUN-TRV-304',
      series: 'Travertine Architectural',
      size: '800 x 1600 mm',
      finish: 'Velvet Honed Touch',
      thickness: '9.5 mm',
      slipRating: 'R10 Indoor',
      absorption: '< 0.08%',
      origin: 'Tivoli, Italy',
      samplePrice: '400 THB',
      slug: 'basaltic-minimal',
    },
    hotspots: [
      {
        id: 'hs-living-floor',
        top: '80%',
        left: '45%',
        labelEn: 'Honed Travertine Floor',
        labelTh: 'พื้นหินทราเวอร์ทีนผิวเนื้อนุ่ม',
        surfaceType: 'Living Floor',
        tileDetail: '800x1600mm Velvet Honed',
      },
      {
        id: 'hs-fireplace',
        top: '46%',
        left: '75%',
        labelEn: 'Fluted Ceramic Fireplace',
        labelTh: 'ผนังเตาผิงลอนเรขาคณิต',
        surfaceType: 'Relief Cladding',
        tileDetail: 'Fluted Relief Architectural Panel',
      },
    ],
  },
  {
    id: 'kitchen',
    step: '04 / 06',
    roomNameEn: 'Culinary Atelier',
    roomNameTh: 'ห้องครัวและเคาน์เตอร์ไอส์แลนด์',
    subtitleEn: 'SINTERED STONE WATERFALL ISLAND',
    subtitleTh: 'เคาน์เตอร์หินซินเทอร์ไร้รอยต่อ',
    descriptionEn: 'Monolithic 4-meter kitchen island wrapped in food-safe, non-porous sintered stone impervious to heat, citric acid, and oil.',
    descriptionTh: 'เคาน์เตอร์เกาะกลางขนาด 4 เมตร หุ้มด้วยหินซินเทอร์ฟู้ดเกรด ทนความร้อนสูง ไร้คราบน้ำมันและกรดมะนาว',
    bgDay: 'https://images.unsplash.com/photo-1600585152220-90363fe7e115?auto=format&fit=crop&w=2000&q=90',
    bgGolden: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=2000&q=90',
    bgNight: 'https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?auto=format&fit=crop&w=2000&q=90',
    featuredTile: {
      name: 'Nero Marquina Sintered Stone',
      code: 'SUN-SNT-502',
      series: 'Culinary Sintered Stone',
      size: '1600 x 3200 mm',
      finish: 'Ultra-Matte Anti-Fingerprint',
      thickness: '12.0 mm Countertop Grade',
      absorption: '0.00% Zero Porosity',
      origin: 'Castellon, Spain',
      samplePrice: '600 THB',
      slug: 'basaltic-minimal',
    },
    hotspots: [
      {
        id: 'hs-kitchen-island',
        top: '65%',
        left: '48%',
        labelEn: 'Seamless Waterfall Counter',
        labelTh: 'ท็อปเคาน์เตอร์ไร้รอยต่อ',
        surfaceType: 'Sintered Stone Countertop',
        tileDetail: '12mm Nero Marquina Food-Safe',
      },
      {
        id: 'hs-kitchen-splash',
        top: '38%',
        left: '70%',
        labelEn: 'Anti-Stain Wall Backsplash',
        labelTh: 'ผนังกันเปื้อนครบวงจร',
        surfaceType: 'Wall Slab',
        tileDetail: 'Continuous Matching Backsplash',
      },
    ],
  },
  {
    id: 'bathroom',
    step: '05 / 06',
    roomNameEn: 'Sanctuary Spa',
    roomNameTh: 'ห้องน้ำมาสเตอร์สปา',
    subtitleEn: 'STATUARIO MARBLE & NON-SLIP MATTE',
    subtitleTh: 'ผนังหินอ่อน Statuario และพื้นกันลื่น',
    descriptionEn: 'Private master bath sanctuary with floor-to-ceiling Statuario Venato slabs and micro-textured non-slip wetroom flooring.',
    descriptionTh: 'ห้องน้ำมาสเตอร์ระดับสปา กรุผนังด้วย Statuario Venato ลายละเอียด และพื้นห้องอาบน้ำกันลื่นพิเศษ',
    bgDay: 'https://images.unsplash.com/photo-1600566752355-35792bedcfea?auto=format&fit=crop&w=2000&q=90',
    bgGolden: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=2000&q=90',
    bgNight: 'https://images.unsplash.com/photo-1507652313519-d4e9174996dd?auto=format&fit=crop&w=2000&q=90',
    featuredTile: {
      name: 'Statuario Venato Pure Silk',
      code: 'SUN-SPA-701',
      series: 'Sanctuary Spa Collections',
      size: '1200 x 2400 mm',
      finish: 'Satin Matte / Soft Grain',
      thickness: '9.0 mm',
      slipRating: 'R11 Non-Slip Wet Area',
      absorption: '< 0.02%',
      origin: 'Carrara, Italy',
      samplePrice: '500 THB',
      slug: 'calacatta-imperiale',
    },
    hotspots: [
      {
        id: 'hs-spa-wall',
        top: '40%',
        left: '32%',
        labelEn: 'Bookmatched Shower Wall',
        labelTh: 'ผนังโซนอาบน้ำลายต่อเนียนกริบ',
        surfaceType: 'Wetroom Wall Slab',
        tileDetail: '1200x2400mm Statuario Silk',
      },
      {
        id: 'hs-spa-floor',
        top: '78%',
        left: '60%',
        labelEn: 'R11 Micro-Grip Floor',
        labelTh: 'พื้นกันลื่นมาตรฐาน R11',
        surfaceType: 'Wet Area Floor',
        tileDetail: '600x1200mm Anti-Slip Velvet',
      },
    ],
  },
  {
    id: 'terrace',
    step: '06 / 06',
    roomNameEn: 'Infinity Terrace',
    roomNameTh: 'ระเบียงสระว่ายน้ำอินฟินิตี้',
    subtitleEn: '20MM OUTDOOR STRUCTURAL PAVERS',
    subtitleTh: 'กระเบื้องปูพื้นภายนอกหนา 20 มม.',
    descriptionEn: 'Cantilevered pool deck and outdoor pavilion utilizing 20mm monolithic pavers for direct dry-laying on grass, gravel, or pedestals.',
    descriptionTh: 'ระเบียงสระว่ายน้ำ ปูด้วยแผ่นพอร์ซเลนหนา 20 มม. สามารถวางแห้งบนขาปรับระดับ กรวด หรือสนามหญ้าได้โดยตรง',
    bgDay: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=2000&q=90',
    bgGolden: 'https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?auto=format&fit=crop&w=2000&q=90',
    bgNight: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=2000&q=90',
    featuredTile: {
      name: 'Basaltic 20mm Outdoor Paver',
      code: 'SUN-OUT-808',
      series: 'Architectural Outdoor 20mm',
      size: '600 x 1200 mm',
      finish: 'Structured Bush-Hammered R11+C',
      thickness: '20.0 mm Monolithic',
      slipRating: 'R11 + C (Poolside Safe)',
      absorption: '< 0.05% Frost & Heat Proof',
      origin: 'Valencia, Spain',
      samplePrice: '450 THB',
      slug: 'basaltic-minimal',
    },
    hotspots: [
      {
        id: 'hs-pool-deck',
        top: '75%',
        left: '42%',
        labelEn: 'Anti-Slip Poolside Deck',
        labelTh: 'พื้นรอบสระว่ายน้ำกันลื่นพิเศษ',
        surfaceType: '20mm Monolithic Paver',
        tileDetail: 'R11+C Wet Barefoot Safe',
      },
      {
        id: 'hs-terrace-coping',
        top: '55%',
        left: '70%',
        labelEn: 'Integrated Pool Coping',
        labelTh: 'ขอบสระว่ายน้ำแบบชิ้นเดียว',
        surfaceType: 'Special Edge Piece',
        tileDetail: 'Bullnose Seamless Finish',
      },
    ],
  },
];

export const ArchitecturalVillaExperience: React.FC = () => {
  const { language } = useLanguage();
  const isThai = language === 'TH';

  const [activeSceneIndex, setActiveSceneIndex] = useState<number>(0);
  const [lightingMode, setLightingMode] = useState<'day' | 'golden' | 'night'>('day');
  const [activeHotspot, setActiveHotspot] = useState<any | null>(null);
  const [isSpecDrawerOpen, setIsSpecDrawerOpen] = useState<boolean>(false);

  const scene = VILLA_SCENES[activeSceneIndex];

  const currentBg =
    lightingMode === 'day'
      ? scene.bgDay
      : lightingMode === 'golden'
      ? scene.bgGolden
      : scene.bgNight;

  const handleNext = () => {
    setActiveSceneIndex((prev) => (prev + 1) % VILLA_SCENES.length);
    setActiveHotspot(null);
  };

  const handlePrev = () => {
    setActiveSceneIndex((prev) => (prev - 1 + VILLA_SCENES.length) % VILLA_SCENES.length);
    setActiveHotspot(null);
  };

  return (
    <section className="relative w-full min-h-[88vh] flex flex-col justify-between overflow-hidden bg-contrast-bg text-contrast-text select-none border-y border-border-subtle">
      {/* 1. Cinematic Background Layer with Smooth Image Transition */}
      <div className="absolute inset-0 z-0">
        <Image
          key={`${scene.id}-${lightingMode}`}
          src={currentBg}
          alt={scene.roomNameEn}
          fill
          priority
          sizes="100vw"
          className="object-cover object-center opacity-85 transition-opacity duration-1000 scale-[1.01]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-contrast-bg via-transparent to-contrast-bg/60" />
        <div className="absolute inset-0 bg-gradient-to-r from-contrast-bg/85 via-transparent to-contrast-bg/30" />
      </div>

      {/* 2. Top Architectural HUD Header */}
      <div className="relative z-20 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-8 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-[2px] bg-white/10 backdrop-blur-md border border-white/20 text-[10.5px] font-semibold uppercase tracking-[0.25em] text-gold">
            <Compass className="w-3.5 h-3.5" />
            3D ARCHITECTURAL VILLA ATELIER
          </div>
          <span className="hidden sm:inline-block text-[11px] text-white/50 tracking-wider">
            SCENE {scene.step}
          </span>
        </div>

        {/* Lighting Atmosphere Mode Switcher */}
        <div className="flex items-center gap-1 bg-black/40 backdrop-blur-md p-1 rounded-[2px] border border-white/15 text-xs">
          <button
            onClick={() => setLightingMode('day')}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-[2px] text-[10.5px] font-medium tracking-wider uppercase transition-all ${
              lightingMode === 'day' ? 'bg-white/20 text-white shadow-xs' : 'text-white/60 hover:text-white'
            }`}
            title="Day Natural Light"
          >
            <Sun className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Day</span>
          </button>
          <button
            onClick={() => setLightingMode('golden')}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-[2px] text-[10.5px] font-medium tracking-wider uppercase transition-all ${
              lightingMode === 'golden' ? 'bg-amber-500/20 text-amber-300 border border-amber-400/30' : 'text-white/60 hover:text-white'
            }`}
            title="Golden Hour Sunset"
          >
            <Sunset className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Golden</span>
          </button>
          <button
            onClick={() => setLightingMode('night')}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-[2px] text-[10.5px] font-medium tracking-wider uppercase transition-all ${
              lightingMode === 'night' ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-400/30' : 'text-white/60 hover:text-white'
            }`}
            title="Architectural Night Lighting"
          >
            <Moon className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Night</span>
          </button>
        </div>
      </div>

      {/* 3. Interactive Hotspots Overlay */}
      <div className="absolute inset-0 z-10 pointer-events-none">
        <div className="relative w-full h-full max-w-7xl mx-auto">
          {scene.hotspots.map((hs) => {
            const isSelected = activeHotspot?.id === hs.id;
            return (
              <div
                key={hs.id}
                style={{ top: hs.top, left: hs.left }}
                className="absolute pointer-events-auto transform -translate-x-1/2 -translate-y-1/2"
              >
                <button
                  onClick={() => setActiveHotspot(isSelected ? null : hs)}
                  className="group relative flex items-center justify-center p-2 focus:outline-none"
                  aria-label={hs.labelEn}
                >
                  <span className="absolute w-7 h-7 rounded-full bg-gold/30 animate-ping" />
                  <span className="relative w-4 h-4 rounded-full bg-white border border-gold shadow-md flex items-center justify-center group-hover:scale-125 transition-transform">
                    <span className="w-1.5 h-1.5 rounded-full bg-txt-main" />
                  </span>
                </button>

                {/* Hotspot Floating Tooltip */}
                {isSelected && (
                  <div className="absolute left-6 top-0 w-64 bg-contrast-surface/95 backdrop-blur-md border border-white/20 p-3.5 rounded-[2px] shadow-2xl space-y-2 text-left z-30 animate-fadeIn">
                    <div className="flex items-center justify-between text-[9px] uppercase tracking-widest text-gold font-semibold">
                      <span>{hs.surfaceType}</span>
                      <span className="text-white/40">HOTSPOT</span>
                    </div>
                    <div className="text-xs font-heading font-bold text-white">
                      {isThai ? hs.labelTh : hs.labelEn}
                    </div>
                    <div className="text-[11px] text-white/70">
                      {hs.tileDetail}
                    </div>
                    <button
                      onClick={() => setIsSpecDrawerOpen(true)}
                      className="w-full text-center py-1.5 bg-white/10 hover:bg-white/20 text-white text-[10px] font-semibold uppercase tracking-wider rounded-[2px] transition-colors"
                    >
                      View Surface Specs →
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. Main Editorial Story & Scene Highlight */}
      <div className="relative z-20 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 flex flex-col lg:flex-row items-end justify-between gap-8">
        {/* Left Side: Room Title & Architectural Narration */}
        <div className="space-y-4 max-w-2xl text-left">
          <div className="text-[10px] uppercase font-semibold tracking-[0.3em] text-gold">
            {isThai ? scene.subtitleTh : scene.subtitleEn}
          </div>
          <h2 className="font-heading text-4xl sm:text-6xl font-normal text-white tracking-tight leading-none">
            {isThai ? scene.roomNameTh : scene.roomNameEn}
          </h2>
          <p className="text-xs sm:text-sm text-white/75 leading-relaxed max-w-xl font-light">
            {isThai ? scene.descriptionTh : scene.descriptionEn}
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-4">
            <button
              onClick={() => setIsSpecDrawerOpen(true)}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-white text-txt-main hover:bg-stone-light text-[11px] font-semibold uppercase tracking-widest rounded-[2px] transition-all shadow-md"
            >
              <Layers className="w-3.5 h-3.5" />
              Surface Specs & Finish
            </button>
            <Link
              href={`/shop?collection=${scene.featuredTile.slug}`}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-black/40 hover:bg-black/60 border border-white/20 text-white text-[11px] font-medium uppercase tracking-widest rounded-[2px] backdrop-blur-md transition-all"
            >
              Catalog Series <ArrowRight className="w-3.5 h-3.5 text-gold" />
            </Link>
          </div>
        </div>

        {/* Right Side: Featured Material Floating Spec Card */}
        <div className="w-full lg:w-80 bg-black/40 backdrop-blur-md border border-white/15 p-5 rounded-[2px] space-y-4 text-left shadow-2xl">
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <div>
              <span className="text-[9px] uppercase tracking-widest text-gold font-semibold block">
                FEATURED SURFACE
              </span>
              <div className="font-heading text-base font-semibold text-white truncate max-w-[180px]">
                {scene.featuredTile.name}
              </div>
            </div>
            <span className="text-[10px] text-white/50 font-mono">{scene.featuredTile.code}</span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-[10.5px]">
            <div>
              <span className="text-white/40 block text-[9px] uppercase">Format:</span>
              <span className="text-white font-medium">{scene.featuredTile.size}</span>
            </div>
            <div>
              <span className="text-white/40 block text-[9px] uppercase">Finish:</span>
              <span className="text-white font-medium">{scene.featuredTile.finish}</span>
            </div>
            <div>
              <span className="text-white/40 block text-[9px] uppercase">Origin:</span>
              <span className="text-white font-medium">{scene.featuredTile.origin}</span>
            </div>
            <div>
              <span className="text-white/40 block text-[9px] uppercase">Absorption:</span>
              <span className="text-white font-medium">{scene.featuredTile.absorption}</span>
            </div>
          </div>

          <div className="pt-2 border-t border-white/10 flex items-center justify-between text-xs">
            <span className="text-gold font-semibold">{scene.featuredTile.samplePrice} / Sample</span>
            <Link
              href={`/shop?search=${encodeURIComponent(scene.featuredTile.name)}`}
              className="text-[10.5px] uppercase tracking-wider text-white hover:text-gold font-medium inline-flex items-center gap-1"
            >
              Order Sample <ExternalLink className="w-3 h-3" />
            </Link>
          </div>
        </div>
      </div>

      {/* 5. Bottom Timeline Scene Navigation */}
      <div className="relative z-20 w-full bg-contrast-surface/90 backdrop-blur-md border-t border-white/10 py-3">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4">
          <div className="flex items-center space-x-1 sm:space-x-2 overflow-x-auto py-1">
            {VILLA_SCENES.map((s, idx) => {
              const isActive = idx === activeSceneIndex;
              return (
                <button
                  key={s.id}
                  onClick={() => {
                    setActiveSceneIndex(idx);
                    setActiveHotspot(null);
                  }}
                  className={`px-3 py-1.5 text-[10.5px] font-medium uppercase tracking-wider rounded-[2px] transition-all shrink-0 ${
                    isActive
                      ? 'bg-white text-txt-main font-semibold shadow-xs'
                      : 'text-white/60 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <span className="text-[9px] font-mono mr-1.5 opacity-60">0{idx + 1}</span>
                  {isThai ? s.roomNameTh : s.roomNameEn}
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handlePrev}
              className="p-2 bg-white/10 hover:bg-white/20 text-white rounded-[2px] transition-colors"
              aria-label="Previous scene"
            >
              ←
            </button>
            <button
              onClick={handleNext}
              className="p-2 bg-white/10 hover:bg-white/20 text-white rounded-[2px] transition-colors"
              aria-label="Next scene"
            >
              →
            </button>
          </div>
        </div>
      </div>

      {/* 6. Technical Surface Specification Slide-over Modal */}
      {isSpecDrawerOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div className="bg-contrast-surface border border-white/20 rounded-[2px] max-w-lg w-full p-6 space-y-6 shadow-2xl text-left">
            <div className="flex items-center justify-between pb-3 border-b border-white/15">
              <div>
                <span className="text-[10px] uppercase font-semibold tracking-widest text-gold block">
                  TECHNICAL SPECIFICATION SHEET
                </span>
                <h3 className="font-heading text-xl font-normal text-white">
                  {scene.featuredTile.name}
                </h3>
              </div>
              <button
                onClick={() => setIsSpecDrawerOpen(false)}
                className="text-white/60 hover:text-white p-1 text-sm font-mono"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs text-white/80">
              <div className="flex justify-between py-1.5 border-b border-white/10">
                <span className="text-white/50">Collection Series:</span>
                <span className="font-medium text-white">{scene.featuredTile.series}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-white/10">
                <span className="text-white/50">Nominal Slab Dimensions:</span>
                <span className="font-mono font-medium text-white">{scene.featuredTile.size}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-white/10">
                <span className="text-white/50">Surface Touch & Texture:</span>
                <span className="font-medium text-white">{scene.featuredTile.finish}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-white/10">
                <span className="text-white/50">Calibrated Thickness:</span>
                <span className="font-mono font-medium text-white">{scene.featuredTile.thickness}</span>
              </div>
              {scene.featuredTile.slipRating && (
                <div className="flex justify-between py-1.5 border-b border-white/10">
                  <span className="text-white/50">Slip Resistance Rating:</span>
                  <span className="font-mono font-medium text-gold">{scene.featuredTile.slipRating}</span>
                </div>
              )}
              <div className="flex justify-between py-1.5 border-b border-white/10">
                <span className="text-white/50">Water Absorption (ISO 10545-3):</span>
                <span className="font-mono font-medium text-emerald-400">{scene.featuredTile.absorption}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-white/10">
                <span className="text-white/50">Atelier Origin:</span>
                <span className="font-medium text-white">{scene.featuredTile.origin}</span>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-end gap-3">
              <button
                onClick={() => setIsSpecDrawerOpen(false)}
                className="px-4 py-2 text-xs font-medium text-white/70 hover:text-white uppercase tracking-wider"
              >
                Close
              </button>
              <Link
                href={`/shop?search=${encodeURIComponent(scene.featuredTile.name)}`}
                className="px-5 py-2.5 bg-gold hover:bg-gold-hover text-white text-xs font-semibold uppercase tracking-widest rounded-[2px] transition-colors"
              >
                Explore In Catalog
              </Link>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
