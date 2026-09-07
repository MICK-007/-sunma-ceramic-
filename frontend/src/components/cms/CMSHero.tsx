import React from 'react';
import { ArchitecturalHero } from '../home/ArchitecturalHero';

export interface CMSHeroProps {
  content: any;
}

export const CMSHero: React.FC<CMSHeroProps> = ({ content }) => {
  return <ArchitecturalHero content={content} />;
};
