import postgres from 'postgres';
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

async function seedCms() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    console.error('DATABASE_URL is missing.');
    return;
  }

  console.log('🌱 Seeding CMS initial content to Supabase PostgreSQL...');
  const client = postgres(connectionString, { max: 1 });

  try {
    // 1. Seed 'home' page
    const pageRows = await client`
      INSERT INTO cms_pages (slug, title, seo_title, seo_description, is_published)
      VALUES (
        'home',
        'SUNMA CERAMIC Home Page',
        'SUNMA CERAMIC | Luxury Porcelain & Ceramic Surfaces',
        'Distributor, direct importer, and private-label manufacturer of architectural porcelain slabs and luxury ceramic surface solutions in Bangkok, Thailand.',
        true
      )
      ON CONFLICT (slug) DO UPDATE SET title = EXCLUDED.title
      RETURNING id;
    `;
    const homePageId = pageRows[0].id;
    console.log('✅ Created/Fetched CMS Home Page:', homePageId);

    // 2. Seed Sections for Home Page
    // Section 1: HERO
    await client`
      INSERT INTO cms_sections (page_id, section_key, section_type, title, subtitle, sort_order, is_enabled, settings)
      VALUES (
        ${homePageId},
        'hero',
        'HERO',
        'ARCHITECTURAL SURFACE ATELIER',
        'Discover Thailand''s finest curated porcelain slabs, relief wall tiles, and engineered architectural surface solutions.',
        1,
        true,
        ${JSON.stringify({
          eyebrow: 'LUXURY CERAMIC TILES',
          bgImage: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=2000&q=90',
          btn1Label: 'Explore Catalog',
          btn1Url: '/shop',
          btn2Label: 'Try Room Studio',
          btn2Url: '/room-studio',
        })}::jsonb
      )
      ON CONFLICT (page_id, section_key) DO UPDATE SET title = EXCLUDED.title;
    `;
    console.log('  -> Hero section seeded');

    // Section 2: CURATED TILE COLLECTIONS
    const collectionsSection = await client`
      INSERT INTO cms_sections (page_id, section_key, section_type, title, subtitle, sort_order, is_enabled)
      VALUES (
        ${homePageId},
        'collections',
        'COLLECTION_GRID',
        'Curated Tile Collections',
        'ARCHITECTURAL SERIES',
        2,
        true
      )
      ON CONFLICT (page_id, section_key) DO UPDATE SET title = EXCLUDED.title
      RETURNING id;
    `;
    const colSecId = collectionsSection[0].id;

    // Clean existing items before seeding to avoid duplicates
    await client`DELETE FROM cms_section_items WHERE section_id = ${colSecId}`;

    const collectionsItems = [
      {
        title: 'Calacatta Imperiale',
        description: 'Gold veined alabaster marble porcelain.',
        linkUrl: '/shop?collection=calacatta-imperiale',
        customImageUrl: 'https://images.unsplash.com/photo-1615873968403-89e068629265?auto=format&fit=crop&w=800&q=80',
        sortOrder: 1,
      },
      {
        title: 'Basaltic Minimal',
        description: 'Volcanic slate & micro-textured basalt slabs.',
        linkUrl: '/shop?collection=basaltic-minimal',
        customImageUrl: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=800&q=80',
        sortOrder: 2,
      },
      {
        title: 'Nordic Oak Timber',
        description: 'Embossed wood grain ceramic planks.',
        linkUrl: '/shop?collection=nordic-oak',
        customImageUrl: 'https://images.unsplash.com/photo-1513161455074-7554c9146233?auto=format&fit=crop&w=800&q=80',
        sortOrder: 3,
      },
      {
        title: 'Terrazzo Artisanal',
        description: 'Quartz aggregate composite surfaces.',
        linkUrl: '/shop?category=floor-tiles',
        customImageUrl: 'https://images.unsplash.com/photo-1590381105924-c72589b9ef3f?auto=format&fit=crop&w=800&q=80',
        sortOrder: 4,
      },
    ];

    for (const item of collectionsItems) {
      await client`
        INSERT INTO cms_section_items (section_id, title, description, link_url, custom_image_url, sort_order, is_enabled)
        VALUES (${colSecId}, ${item.title}, ${item.description}, ${item.linkUrl}, ${item.customImageUrl}, ${item.sortOrder}, true)
      `;
    }
    console.log('  -> Curated Collections items seeded');

    // Section 3: FEATURED PRODUCTS
    await client`
      INSERT INTO cms_sections (page_id, section_key, section_type, title, subtitle, sort_order, is_enabled, settings)
      VALUES (
        ${homePageId},
        'featured_products',
        'FEATURED_PRODUCTS',
        'Curated Architectural Slabs',
        'SELECTED CATALOG',
        3,
        true,
        ${JSON.stringify({ limit: 6, viewAllUrl: '/shop?featured=true' })}::jsonb
      )
      ON CONFLICT (page_id, section_key) DO UPDATE SET title = EXCLUDED.title;
    `;

    // Section 4: MANUFACTURERS & IMPORTS
    const brandSec = await client`
      INSERT INTO cms_sections (page_id, section_key, section_type, title, subtitle, sort_order, is_enabled)
      VALUES (
        ${homePageId},
        'brands',
        'BRAND_GRID',
        'Global Tile Manufacturers & Ateliers',
        'MANUFACTURERS & IMPORTS',
        4,
        true
      )
      ON CONFLICT (page_id, section_key) DO UPDATE SET title = EXCLUDED.title
      RETURNING id;
    `;
    const brandSecId = brandSec[0].id;

    await client`DELETE FROM cms_section_items WHERE section_id = ${brandSecId}`;

    const brandItems = [
      {
        title: 'SUNMA Atelier',
        description: 'Private-label custom porcelain & large format slabs.',
        badgeTag: 'Thailand',
        linkUrl: '/shop?brand=sunma-atelier',
        sortOrder: 1,
      },
      {
        title: "Marmi d'Italia",
        description: 'Authentic Italian marble porcelain & bookmatched slabs.',
        badgeTag: 'Italy',
        linkUrl: '/shop?brand=marmi-d-italia',
        sortOrder: 2,
      },
      {
        title: 'Kurokin Surface',
        description: 'Precision Japanese textured ceramic & exterior cladding.',
        badgeTag: 'Japan',
        linkUrl: '/shop?brand=kurokin-surface',
        sortOrder: 3,
      },
      {
        title: 'Iberica Ceramica',
        description: 'Spanish hand-painted decorative tiles & terracotta pavers.',
        badgeTag: 'Spain',
        linkUrl: '/shop?brand=iberica-ceramica',
        sortOrder: 4,
      },
    ];

    for (const b of brandItems) {
      await client`
        INSERT INTO cms_section_items (section_id, title, description, badge_tag, link_url, sort_order, is_enabled)
        VALUES (${brandSecId}, ${b.title}, ${b.description}, ${b.badgeTag}, ${b.linkUrl}, ${b.sortOrder}, true)
      `;
    }
    console.log('  -> Brand items seeded');

    // Section 5: WHY CHOOSE SUNMA
    const whySec = await client`
      INSERT INTO cms_sections (page_id, section_key, section_type, title, subtitle, sort_order, is_enabled)
      VALUES (
        ${homePageId},
        'why_choose',
        'WHY_CHOOSE',
        'Why Choose SUNMA CERAMIC',
        'OUR STANDARDS',
        5,
        true
      )
      ON CONFLICT (page_id, section_key) DO UPDATE SET title = EXCLUDED.title
      RETURNING id;
    `;
    const whySecId = whySec[0].id;

    await client`DELETE FROM cms_section_items WHERE section_id = ${whySecId}`;

    const whyItems = [
      {
        title: '100% Certified Quality',
        description: 'ISO 13006 & EN 14411 European standard compliance for commercial durability.',
        iconName: 'ShieldCheck',
        sortOrder: 1,
      },
      {
        title: 'Direct Global Importer',
        description: 'Direct factory partnerships eliminating middleman markups for project developers.',
        iconName: 'Globe2',
        sortOrder: 2,
      },
      {
        title: 'Complete Surface Solutions',
        description: 'From 6mm slim cladding to 20mm heavy-duty outdoor paver technology.',
        iconName: 'Layers',
        sortOrder: 3,
      },
    ];

    for (const w of whyItems) {
      await client`
        INSERT INTO cms_section_items (section_id, title, description, icon_name, sort_order, is_enabled)
        VALUES (${whySecId}, ${w.title}, ${w.description}, ${w.iconName}, ${w.sortOrder}, true)
      `;
    }
    console.log('  -> Why Choose SUNMA items seeded');

    // Section 6: ARCHITECT & B2B SERVICES
    await client`
      INSERT INTO cms_sections (page_id, section_key, section_type, title, subtitle, sort_order, is_enabled, settings)
      VALUES (
        ${homePageId},
        'b2b_services',
        'B2B_CTA',
        'Architect & Commercial Project Supply',
        'ARCHITECT & CONTRACTOR SERVICES',
        6,
        true,
        ${JSON.stringify({
          description: 'Special wholesale rates, custom slab cutting, sample kits, and project specifier support for architects, interior designers, and real estate developers.',
          buttonLabel: 'Request Project Quote',
          buttonUrl: '/contact',
        })}::jsonb
      )
      ON CONFLICT (page_id, section_key) DO UPDATE SET title = EXCLUDED.title;
    `;

    // 3. Seed 'footer' page / section
    const footerPage = await client`
      INSERT INTO cms_pages (slug, title, is_published)
      VALUES ('footer', 'Global Footer', true)
      ON CONFLICT (slug) DO UPDATE SET title = EXCLUDED.title
      RETURNING id;
    `;
    const footerPageId = footerPage[0].id;

    await client`
      INSERT INTO cms_sections (page_id, section_key, section_type, title, subtitle, sort_order, is_enabled, settings)
      VALUES (
        ${footerPageId},
        'footer_main',
        'FOOTER',
        'SUNMA CERAMIC',
        'BANGKOK SHOWROOM & ATELIER',
        1,
        true,
        ${JSON.stringify({
          brandDesc: 'Distributor, direct importer, and private-label manufacturer of architectural porcelain slabs and luxury ceramic surface solutions.',
          address: '88/12 Sukhumvit 55 Road, Klongtan Nua, Vadhana, Bangkok 10110',
          phone: '+66 (0) 2-800-9999 / +66 (0) 81-234-5678',
          email: 'project@sunmaceramic.com',
          businessHours: 'Mon - Sat: 09:00 - 18:00 (Except Public Holidays)',
          copyright: 'SUNMA CERAMIC CO., LTD. All rights reserved.',
        })}::jsonb
      )
      ON CONFLICT (page_id, section_key) DO UPDATE SET title = EXCLUDED.title;
    `;
    console.log('✅ Footer section seeded successfully');

    console.log('\n🎉 CMS Initial Content Seeding Completed Successfully!');
  } catch (err) {
    console.error('❌ Error seeding CMS data:', err);
  } finally {
    await client.end();
  }
}

seedCms();
