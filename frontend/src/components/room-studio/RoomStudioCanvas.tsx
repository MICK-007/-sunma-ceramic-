'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { Sparkles, RotateCcw, Layers, Check, ArrowRight } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';

export interface RoomArea {
  id: string;
  name: string;
  areaType: 'Floor' | 'Wall' | 'Backsplash';
  maskSvgPolygon: string;
  defaultTileAspectRatio: string;
}

export interface Room {
  id: string;
  name: string;
  nameTh?: string;
  slug: string;
  imageUrl: string;
  description: string;
  areas: RoomArea[];
}

export interface TileProduct {
  id: string;
  name: string;
  nameTh?: string;
  slug: string;
  size: string;
  thumbnail: string;
  pricePerPiece: number;
  pattern: string;
}

interface RoomStudioProps {
  rooms: Room[];
  products: TileProduct[];
  initialTileSlug?: string;
}

export const RoomStudioCanvas: React.FC<RoomStudioProps> = ({
  rooms,
  products,
  initialTileSlug,
}) => {
  const { language, t } = useLanguage();
  const isThai = language === 'TH';

  const [activeRoom, setActiveRoom] = useState<Room>(rooms[0]);
  const [activeArea, setActiveArea] = useState<RoomArea>(rooms[0]?.areas[0]);
  const [selectedTile, setSelectedTile] = useState<TileProduct | null>(() => {
    if (initialTileSlug) {
      const match = products.find(p => p.slug === initialTileSlug);
      if (match) return match;
    }
    return null;
  });

  // Track map of areaId -> selectedTile
  const [appliedTiles, setAppliedTiles] = useState<Record<string, TileProduct>>({});

  useEffect(() => {
    if (rooms.length > 0) {
      setActiveRoom(rooms[0]);
      if (rooms[0].areas.length > 0) {
        setActiveArea(rooms[0].areas[0]);
      }
    }
  }, [rooms]);

  useEffect(() => {
    if (initialTileSlug && products.length > 0) {
      const match = products.find(p => p.slug === initialTileSlug);
      if (match) {
        setSelectedTile(match);
        if (activeArea) {
          setAppliedTiles(prev => ({ ...prev, [activeArea.id]: match }));
        }
      }
    }
  }, [initialTileSlug, products]);

  const handleSelectRoom = (room: Room) => {
    setActiveRoom(room);
    if (room.areas.length > 0) {
      setActiveArea(room.areas[0]);
    }
  };

  const handleApplyTile = (tile: TileProduct) => {
    setSelectedTile(tile);
    if (activeArea) {
      setAppliedTiles(prev => ({ ...prev, [activeArea.id]: tile }));
    }
  };

  const handleReset = () => {
    setAppliedTiles({});
    setSelectedTile(null);
  };

  // Determine grid pattern sizing based on selected tile size
  const getGridPatternSize = (tile: TileProduct) => {
    if (tile.size.includes('120')) return 'bg-[length:120px_60px]';
    if (tile.size.includes('30x60')) return 'bg-[length:60px_30px]';
    return 'bg-[length:80px_80px]';
  };

  return (
    <div className="space-y-8">
      {/* Studio Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between bg-bg-card border border-border-subtle p-6 rounded-lg gap-4">
        <div>
          <div className="inline-flex items-center gap-2 text-gold text-xs font-bold uppercase tracking-[0.2em] mb-1">
            <Sparkles className="w-4 h-4" />
            {t.roomStudio.title}
          </div>
          <h1 className="font-heading text-xl md:text-2xl font-bold text-txt-main">
            {t.roomStudio.subtitle}
          </h1>
          <p className="text-xs text-txt-muted mt-1">
            Seamless texture repeat simulation calibrated for physical tile dimensions (60x60, 60x120, 30x60).
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={handleReset}>
            <RotateCcw className="w-3.5 h-3.5 mr-1.5" />
            {t.roomStudio.reset}
          </Button>
        </div>
      </div>

      {/* Main Studio Interactive Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Control Column: Room & Area Selectors */}
        <div className="lg:col-span-3 space-y-6">
          {/* Room Selector */}
          <div className="bg-bg-card border border-border-subtle rounded-lg p-4 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-gold flex items-center gap-2">
              <Layers className="w-4 h-4" />
              {t.roomStudio.selectRoom}
            </h3>
            <div className="space-y-2">
              {rooms.map(room => (
                <button
                  key={room.id}
                  onClick={() => handleSelectRoom(room)}
                  className={`w-full text-left p-3 rounded-lg border text-xs transition-all flex items-center justify-between ${
                    activeRoom.id === room.id
                      ? 'border-gold bg-gold/15 text-gold font-bold shadow-md'
                      : 'border-border-subtle text-txt-muted hover:border-stone hover:text-txt-main bg-bg-secondary'
                  }`}
                >
                  <span className="line-clamp-1">{isThai && room.nameTh ? room.nameTh : room.name}</span>
                  {activeRoom.id === room.id && <Check className="w-4 h-4 text-gold shrink-0 ml-2" />}
                </button>
              ))}
            </div>
          </div>

          {/* Area Selector */}
          <div className="bg-bg-card border border-border-subtle rounded-lg p-4 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-gold flex items-center gap-2">
              <Layers className="w-4 h-4" />
              {t.roomStudio.selectArea}
            </h3>
            <div className="space-y-2">
              {activeRoom.areas.map(area => (
                <button
                  key={area.id}
                  onClick={() => setActiveArea(area)}
                  className={`w-full text-left p-2.5 rounded border text-xs transition-all flex items-center justify-between ${
                    activeArea?.id === area.id
                      ? 'border-gold bg-gold/15 text-gold font-bold'
                      : 'border-border-subtle text-txt-muted hover:text-txt-main bg-bg-secondary'
                  }`}
                >
                  <div>
                    <span className="block font-semibold">{area.name}</span>
                    <span className="text-[10px] text-stone uppercase">{area.areaType} Zone</span>
                  </div>
                  {activeArea?.id === area.id && <Badge variant="gold">Active</Badge>}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Center Simulation Preview Canvas */}
        <div className="lg:col-span-6 flex flex-col space-y-4">
          <div className="relative aspect-[16/9] w-full rounded-xl overflow-hidden border border-border-gold shadow-2xl bg-black">
            {/* Background Room Base Image */}
            <Image
              src={activeRoom.imageUrl}
              alt={activeRoom.name}
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover"
            />

            {/* SVG Mask Layer for Dynamic Texture Overlay */}
            <svg
              className="absolute inset-0 w-full h-full pointer-events-none"
              viewBox="0 0 1600 900"
              preserveAspectRatio="none"
            >
              <defs>
                {activeRoom.areas.map(area => {
                  const tileForArea = appliedTiles[area.id] || selectedTile;
                  if (!tileForArea) return null;
                  const patternId = `tile-pattern-${area.id}`;
                  return (
                    <pattern
                      key={patternId}
                      id={patternId}
                      width="120"
                      height="120"
                      patternUnits="userSpaceOnUse"
                    >
                      <image
                        href={tileForArea.thumbnail}
                        x="0"
                        y="0"
                        width="120"
                        height="120"
                        preserveAspectRatio="none"
                      />
                      {/* Architectural Tile Grid Overlay Lines */}
                      <path
                        d="M 120 0 L 0 0 0 120"
                        fill="none"
                        stroke="rgba(0,0,0,0.35)"
                        strokeWidth="1.5"
                      />
                    </pattern>
                  );
                })}
              </defs>

              {/* Render Mask Polygons with repeating tile patterns */}
              {activeRoom.areas.map(area => {
                const tileForArea = appliedTiles[area.id] || selectedTile;
                if (!tileForArea) return null;
                return (
                  <polygon
                    key={area.id}
                    points={area.maskSvgPolygon}
                    fill={`url(#tile-pattern-${area.id})`}
                    opacity="0.88"
                    style={{ mixBlendMode: 'multiply' }}
                    className="transition-all duration-500"
                  />
                );
              })}
            </svg>

            {/* Active Area Indicator Tag */}
            <div className="absolute top-4 left-4 bg-black/70 backdrop-blur-md px-3 py-1.5 rounded-full border border-gold/40 text-xs font-bold text-gold uppercase tracking-wider flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-gold animate-ping" />
              Viewing: {activeArea?.name} {selectedTile ? `(${selectedTile.name})` : '(Original Base Floor)'}
            </div>
          </div>

          {/* Active Applied Surface Spec Bar */}
          <div className="bg-bg-card border border-border-subtle p-4 rounded-lg flex items-center justify-between text-xs min-h-[64px]">
            {selectedTile ? (
              <>
                <div>
                  <span className="text-stone uppercase text-[10px] block font-semibold">Active Tile Surface</span>
                  <span className="font-heading font-bold text-txt-main">{selectedTile.name}</span>
                  <span className="text-stone ml-2 font-mono">({selectedTile.size} cm)</span>
                </div>
                <div className="text-right">
                  <span className="text-gold font-bold block">฿{selectedTile.pricePerPiece.toLocaleString()} / pc</span>
                  <a
                    href={`/products/${selectedTile.slug}`}
                    className="text-[10px] text-stone hover:text-white underline inline-flex items-center gap-1"
                  >
                    Product Details <ArrowRight className="w-3 h-3" />
                  </a>
                </div>
              </>
            ) : (
              <div className="text-stone-light text-xs italic flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-gold" />
                เลือกลายกระเบื้องจากเมนูด้านขวามือ เพื่อแสดงผลจำลองบนพื้นห้อง
              </div>
            )}
          </div>
        </div>

        {/* Right Product Tile Selector Grid */}
        <div className="lg:col-span-3 space-y-4">
          <div className="bg-bg-card border border-border-subtle rounded-lg p-4 space-y-3 max-h-[600px] overflow-y-auto">
            <h3 className="text-xs font-bold uppercase tracking-wider text-gold flex items-center gap-2 sticky top-0 bg-bg-card py-1 z-10">
              <Sparkles className="w-4 h-4" />
              {t.roomStudio.selectTile}
            </h3>

            <div className="grid grid-cols-2 gap-3">
              {products.map(tile => {
                const isSelected = selectedTile?.id === tile.id;
                return (
                  <button
                    key={tile.id}
                    onClick={() => handleApplyTile(tile)}
                    className={`group relative rounded border overflow-hidden text-left transition-all ${
                      isSelected
                        ? 'border-gold ring-2 ring-gold bg-gold/10'
                        : 'border-border-subtle hover:border-stone bg-bg-secondary'
                    }`}
                  >
                    <div className="relative aspect-square w-full">
                      <Image
                        src={tile.thumbnail}
                        alt={tile.name}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform"
                      />
                    </div>
                    <div className="p-2">
                      <span className="text-[9px] font-mono text-stone block uppercase">
                        {tile.size}
                      </span>
                      <span className="text-xs font-bold text-txt-main line-clamp-1 group-hover:text-gold transition-colors">
                        {tile.name}
                      </span>
                      <span className="text-[10px] font-bold text-gold block mt-0.5">
                        ฿{tile.pricePerPiece}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
