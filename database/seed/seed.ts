import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from '../schema';
import { seedCategories, seedBrands, seedCollections, seedProducts, seedRooms, seedPromotions } from './data';
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

async function seed() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    console.log('⚠️  DATABASE_URL environment variable is missing. Seed skipped or run in mock storage mode.');
    return;
  }

  console.log('🌱 Starting SUNMA CERAMIC database seed process...');
  const client = postgres(connectionString, { max: 1 });
  const db = drizzle(client, { schema });

  try {
    // 1. Seed Categories
    console.log('Inserting categories...');
    const createdCategoriesMap = new Map<string, string>();
    for (const cat of seedCategories) {
      const [inserted] = await db.insert(schema.categories).values({
        name: cat.name,
        nameTh: cat.nameTh,
        slug: cat.slug,
        description: cat.description,
        descriptionTh: cat.descriptionTh,
        image: cat.image,
        sortOrder: cat.sortOrder,
        isActive: cat.isActive,
      }).onConflictDoNothing().returning();

      if (inserted) {
        createdCategoriesMap.set(cat.slug, inserted.id);
      }
    }

    // 2. Seed Brands
    console.log('Inserting brands...');
    const createdBrandsMap = new Map<string, string>();
    for (const b of seedBrands) {
      const [inserted] = await db.insert(schema.brands).values({
        name: b.name,
        slug: b.slug,
        description: b.description,
        country: b.country,
        logo: b.logo,
        isActive: b.isActive,
      }).onConflictDoNothing().returning();

      if (inserted) {
        createdBrandsMap.set(b.slug, inserted.id);
      }
    }

    // 3. Seed Collections
    console.log('Inserting collections...');
    const createdCollectionsMap = new Map<string, string>();
    for (const c of seedCollections) {
      const [inserted] = await db.insert(schema.collections).values({
        name: c.name,
        slug: c.slug,
        description: c.description,
        isActive: c.isActive,
      }).onConflictDoNothing().returning();

      if (inserted) {
        createdCollectionsMap.set(c.slug, inserted.id);
      }
    }

    // 4. Seed Admin & Demo Users
    console.log('Inserting initial admin profile...');
    const [adminProfile] = await db.insert(schema.profiles).values({
      email: 'admin@sunmaceramic.com',
      fullName: 'SUNMA Senior Administrator',
      phone: '+66 2 800 9999',
      role: 'ADMIN',
    }).onConflictDoNothing().returning();

    const [userProfile] = await db.insert(schema.profiles).values({
      email: 'architect@studio-lux.com',
      fullName: 'Architect Customer',
      phone: '+66 81 234 5678',
      role: 'USER',
    }).onConflictDoNothing().returning();

    // 5. Seed Products & Images & Variants
    console.log('Inserting products, images, and variants...');
    for (const prod of seedProducts) {
      const catId = createdCategoriesMap.get(prod.categorySlug);
      const brandId = createdBrandsMap.get(prod.brandSlug);
      const collId = createdCollectionsMap.get(prod.collectionSlug);

      if (!catId) continue;

      const [insertedProd] = await db.insert(schema.products).values({
        productCode: prod.productCode,
        name: prod.name,
        nameTh: prod.nameTh,
        slug: prod.slug,
        description: prod.description,
        descriptionTh: prod.descriptionTh,
        shortDescription: prod.shortDescription,
        shortDescriptionTh: prod.shortDescriptionTh,
        categoryId: catId,
        brandId: brandId || null,
        collectionId: collId || null,
        thumbnail: prod.thumbnail,
        size: prod.size,
        width: prod.width ? String(prod.width) : null,
        height: prod.height ? String(prod.height) : null,
        thickness: prod.thickness ? String(prod.thickness) : null,
        material: prod.material,
        surface: prod.surface,
        color: prod.color,
        pattern: prod.pattern,
        indoorOutdoor: prod.indoorOutdoor,
        countryOfOrigin: prod.countryOfOrigin,
        piecesPerBox: prod.piecesPerBox,
        coveragePerBox: String(prod.coveragePerBox),
        weightPerBox: String(prod.weightPerBox),
        pricePerPiece: String(prod.pricePerPiece),
        pricePerBox: String(prod.pricePerBox),
        stockPieces: prod.stockPieces,
        featured: prod.featured,
        status: 'PUBLISHED',
      }).onConflictDoNothing().returning();

      if (insertedProd) {
        // Insert product images
        let sortIdx = 0;
        for (const imgUrl of prod.images) {
          await db.insert(schema.productImages).values({
            productId: insertedProd.id,
            url: imgUrl,
            isPrimary: sortIdx === 0,
            sortOrder: sortIdx,
          });
          sortIdx++;
        }

        // Insert primary product variant
        await db.insert(schema.productVariants).values({
          productId: insertedProd.id,
          sku: `${prod.productCode}-VAR-1`,
          size: prod.size,
          pricePerPiece: String(prod.pricePerPiece),
          pricePerBox: String(prod.pricePerBox),
          stockPieces: prod.stockPieces,
          piecesPerBox: prod.piecesPerBox,
          coveragePerBox: String(prod.coveragePerBox),
          weightPerBox: String(prod.weightPerBox),
        });
      }
    }

    // 6. Seed Rooms & Room Areas
    console.log('Inserting Room Studio configurations...');
    for (const roomItem of seedRooms) {
      const [insertedRoom] = await db.insert(schema.rooms).values({
        name: roomItem.name,
        nameTh: roomItem.nameTh,
        slug: roomItem.slug,
        imageUrl: roomItem.imageUrl,
        description: roomItem.description,
      }).onConflictDoNothing().returning();

      if (insertedRoom) {
        for (const area of roomItem.areas) {
          await db.insert(schema.roomAreas).values({
            roomId: insertedRoom.id,
            name: area.name,
            areaType: area.areaType,
            maskSvgPolygon: area.maskSvgPolygon,
            defaultTileAspectRatio: area.defaultTileAspectRatio,
          });
        }
      }
    }

    // 7. Seed Promotions
    console.log('Inserting promotions...');
    for (const promo of seedPromotions) {
      await db.insert(schema.promotions).values({
        name: promo.name,
        discountPercentage: promo.discountPercentage,
        startDate: promo.startDate,
        endDate: promo.endDate,
        isActive: promo.isActive,
        minQuantity: promo.minQuantity,
      });
    }

    console.log('✅ Seed completed successfully!');
  } catch (error) {
    console.error('❌ Error during seed:', error);
  } finally {
    await client.end();
  }
}

seed();
