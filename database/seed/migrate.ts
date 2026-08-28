import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from '../schema';
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

async function runMigrate() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    console.error('DATABASE_URL is missing.');
    return;
  }

  console.log('⚡ Pushing Drizzle Schema tables to Supabase PostgreSQL...');
  const client = postgres(connectionString, { max: 1 });

  try {
    // 1. Create Enums
    await client`CREATE TYPE "user_role" AS ENUM ('USER', 'ADMIN');`.catch(() => {});
    await client`CREATE TYPE "product_status" AS ENUM ('DRAFT', 'PUBLISHED', 'ARCHIVED');`.catch(() => {});
    await client`CREATE TYPE "order_status" AS ENUM ('Pending', 'Confirmed', 'Preparing', 'Cancelled');`.catch(() => {});
    await client`CREATE TYPE "area_type" AS ENUM ('Floor', 'Wall', 'Backsplash');`.catch(() => {});

    // 2. Create Profiles
    await client`
      CREATE TABLE IF NOT EXISTS "profiles" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "supabase_auth_id" varchar(255) UNIQUE,
        "email" varchar(255) NOT NULL UNIQUE,
        "full_name" varchar(255),
        "phone" varchar(50),
        "role" "user_role" DEFAULT 'USER' NOT NULL,
        "created_at" timestamp DEFAULT now() NOT NULL,
        "updated_at" timestamp DEFAULT now() NOT NULL
      );
    `;

    // 3. Create Categories
    await client`
      CREATE TABLE IF NOT EXISTS "categories" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "name" varchar(255) NOT NULL,
        "name_th" varchar(255) NOT NULL,
        "slug" varchar(255) NOT NULL UNIQUE,
        "description" text,
        "description_th" text,
        "image" text,
        "sort_order" integer DEFAULT 0 NOT NULL,
        "is_active" boolean DEFAULT true NOT NULL,
        "created_at" timestamp DEFAULT now() NOT NULL
      );
    `;

    // 4. Create Brands
    await client`
      CREATE TABLE IF NOT EXISTS "brands" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "name" varchar(255) NOT NULL,
        "slug" varchar(255) NOT NULL UNIQUE,
        "description" text,
        "logo" text,
        "country" varchar(100),
        "is_active" boolean DEFAULT true NOT NULL,
        "created_at" timestamp DEFAULT now() NOT NULL
      );
    `;

    // 5. Create Collections
    await client`
      CREATE TABLE IF NOT EXISTS "collections" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "name" varchar(255) NOT NULL,
        "slug" varchar(255) NOT NULL UNIQUE,
        "description" text,
        "is_active" boolean DEFAULT true NOT NULL,
        "created_at" timestamp DEFAULT now() NOT NULL
      );
    `;

    // 6. Create Products
    await client`
      CREATE TABLE IF NOT EXISTS "products" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "product_code" varchar(100) NOT NULL UNIQUE,
        "name" varchar(255) NOT NULL,
        "name_th" varchar(255),
        "slug" varchar(255) NOT NULL UNIQUE,
        "description" text,
        "description_th" text,
        "short_description" text,
        "short_description_th" text,
        "brand_id" uuid REFERENCES "brands"("id") ON DELETE SET NULL,
        "category_id" uuid REFERENCES "categories"("id") ON DELETE CASCADE NOT NULL,
        "collection_id" uuid REFERENCES "collections"("id") ON DELETE SET NULL,
        "thumbnail" text,
        "size" varchar(50) NOT NULL,
        "width" numeric(8, 2),
        "height" numeric(8, 2),
        "thickness" numeric(6, 2),
        "material" varchar(100),
        "surface" varchar(100),
        "color" varchar(100),
        "pattern" varchar(100),
        "indoor_outdoor" varchar(50) DEFAULT 'Indoor/Outdoor',
        "country_of_origin" varchar(100),
        "pieces_per_box" integer DEFAULT 4 NOT NULL,
        "coverage_per_box" numeric(8, 2),
        "weight_per_box" numeric(8, 2),
        "price_per_piece" numeric(10, 2) NOT NULL,
        "price_per_box" numeric(10, 2) NOT NULL,
        "stock_pieces" integer DEFAULT 0 NOT NULL,
        "minimum_order_quantity" integer DEFAULT 1 NOT NULL,
        "status" "product_status" DEFAULT 'PUBLISHED' NOT NULL,
        "featured" boolean DEFAULT false NOT NULL,
        "created_at" timestamp DEFAULT now() NOT NULL,
        "updated_at" timestamp DEFAULT now() NOT NULL
      );
    `;

    // 7. Create Product Images
    await client`
      CREATE TABLE IF NOT EXISTS "product_images" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "product_id" uuid REFERENCES "products"("id") ON DELETE CASCADE NOT NULL,
        "url" text NOT NULL,
        "is_primary" boolean DEFAULT false NOT NULL,
        "sort_order" integer DEFAULT 0 NOT NULL
      );
    `;

    // 8. Create Product Variants
    await client`
      CREATE TABLE IF NOT EXISTS "product_variants" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "product_id" uuid REFERENCES "products"("id") ON DELETE CASCADE NOT NULL,
        "sku" varchar(100) NOT NULL UNIQUE,
        "size" varchar(50) NOT NULL,
        "price_per_piece" numeric(10, 2) NOT NULL,
        "price_per_box" numeric(10, 2) NOT NULL,
        "stock_pieces" integer DEFAULT 0 NOT NULL,
        "pieces_per_box" integer DEFAULT 4 NOT NULL,
        "coverage_per_box" numeric(8, 2),
        "weight_per_box" numeric(8, 2)
      );
    `;

    // 9. Create Carts & Cart Items
    await client`
      CREATE TABLE IF NOT EXISTS "carts" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "user_id" uuid REFERENCES "profiles"("id") ON DELETE CASCADE,
        "session_id" varchar(255),
        "updated_at" timestamp DEFAULT now() NOT NULL
      );
    `;

    await client`
      CREATE TABLE IF NOT EXISTS "cart_items" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "cart_id" uuid REFERENCES "carts"("id") ON DELETE CASCADE NOT NULL,
        "product_id" uuid REFERENCES "products"("id") ON DELETE CASCADE NOT NULL,
        "variant_id" uuid REFERENCES "product_variants"("id") ON DELETE SET NULL,
        "quantity" integer DEFAULT 1 NOT NULL,
        "unit_price" numeric(10, 2) NOT NULL
      );
    `;

    // 10. Create Wishlists & Items
    await client`
      CREATE TABLE IF NOT EXISTS "wishlists" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "user_id" uuid REFERENCES "profiles"("id") ON DELETE CASCADE NOT NULL UNIQUE,
        "created_at" timestamp DEFAULT now() NOT NULL
      );
    `;

    await client`
      CREATE TABLE IF NOT EXISTS "wishlist_items" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "wishlist_id" uuid REFERENCES "wishlists"("id") ON DELETE CASCADE NOT NULL,
        "product_id" uuid REFERENCES "products"("id") ON DELETE CASCADE NOT NULL,
        "created_at" timestamp DEFAULT now() NOT NULL
      );
    `;

    // 11. Create Orders & Order Items
    await client`
      CREATE TABLE IF NOT EXISTS "orders" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "order_number" varchar(50) NOT NULL UNIQUE,
        "user_id" uuid REFERENCES "profiles"("id") ON DELETE SET NULL,
        "status" "order_status" DEFAULT 'Pending' NOT NULL,
        "total_amount" numeric(12, 2) NOT NULL,
        "shipping_fee" numeric(10, 2) DEFAULT '0.00' NOT NULL,
        "tax_amount" numeric(10, 2) DEFAULT '0.00' NOT NULL,
        "payment_method" varchar(50) NOT NULL,
        "shipping_address" jsonb NOT NULL,
        "recipient_name" varchar(255) NOT NULL,
        "recipient_phone" varchar(50) NOT NULL,
        "tax_invoice_requested" boolean DEFAULT false NOT NULL,
        "tax_invoice_details" jsonb,
        "created_at" timestamp DEFAULT now() NOT NULL,
        "updated_at" timestamp DEFAULT now() NOT NULL
      );
    `;

    await client`
      CREATE TABLE IF NOT EXISTS "order_items" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "order_id" uuid REFERENCES "orders"("id") ON DELETE CASCADE NOT NULL,
        "product_id" uuid REFERENCES "products"("id") ON DELETE SET NULL,
        "product_name" varchar(255) NOT NULL,
        "product_code" varchar(100) NOT NULL,
        "variant_info" varchar(255),
        "quantity" integer NOT NULL,
        "price_per_unit" numeric(10, 2) NOT NULL,
        "total_price" numeric(12, 2) NOT NULL
      );
    `;

    // 12. Create Promotions
    await client`
      CREATE TABLE IF NOT EXISTS "promotions" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "name" varchar(255) NOT NULL,
        "discount_percentage" numeric(5, 2) NOT NULL,
        "start_date" timestamp NOT NULL,
        "end_date" timestamp NOT NULL,
        "is_active" boolean DEFAULT true NOT NULL,
        "min_quantity" integer DEFAULT 1 NOT NULL,
        "created_at" timestamp DEFAULT now() NOT NULL
      );
    `;

    // 13. Create Rooms & Room Areas
    await client`
      CREATE TABLE IF NOT EXISTS "rooms" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "name" varchar(255) NOT NULL,
        "name_th" varchar(255),
        "slug" varchar(255) NOT NULL UNIQUE,
        "image_url" text NOT NULL,
        "description" text
      );
    `;

    await client`
      CREATE TABLE IF NOT EXISTS "room_areas" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "room_id" uuid REFERENCES "rooms"("id") ON DELETE CASCADE NOT NULL,
        "name" varchar(255) NOT NULL,
        "area_type" "area_type" NOT NULL,
        "mask_svg_polygon" text NOT NULL,
        "default_tile_aspect_ratio" varchar(50) DEFAULT '1:1'
      );
    `;

    console.log('✅ Schema tables created successfully on Supabase PostgreSQL!');
  } catch (err) {
    console.error('❌ Error during schema creation:', err);
  } finally {
    await client.end();
  }
}

runMigrate();
