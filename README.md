# SUNMA CERAMIC | Premium Architectural Ceramic & Tile E-Commerce Platform

Production-ready full-stack monorepo web platform for **SUNMA CERAMIC**, a luxury ceramic and tile distributor, direct importer, and private-label manufacturer based in Bangkok.

![SUNMA CERAMIC](https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80)

---

## 🏛️ Architecture Overview

The application is architected as an enterprise monorepo separating frontend presentation, backend REST services, and database schemas:

- **`/frontend`**: Next.js 14 App Router + TypeScript + Tailwind CSS + Custom Dark Luxury UI Design System.
- **`/backend`**: Express.js + TypeScript + REST API + Controller/Service/Repository pattern + Middleware Auth & Admin Role validation.
- **`/database`**: Supabase PostgreSQL + Drizzle ORM + Migration scripts + Seed script with 20+ realistic tile products & Room Studio configurations.

```
sunma-ceramic/
├── frontend/             # Next.js App Router Frontend
│   ├── src/
│   │   ├── app/          # App Pages (shop, room-studio, cart, checkout, account, admin...)
│   │   ├── components/   # Dark Luxury UI Primitives, Navbar, Footer, Product Cards & Room Studio Canvas
│   │   ├── context/      # AuthContext, CartContext, WishlistContext, LanguageContext (i18n)
│   │   ├── locales/      # Thai (TH) and English (EN) translation dictionaries
│   │   ├── services/     # REST API Client Integration
│   │   └── styles/       # CSS Design Tokens (--font-heading, --font-body, --color-gold...)
│   └── package.json
├── backend/              # Express REST API Server
│   ├── src/
│   │   ├── config/       # Environment & Port setup
│   │   ├── controllers/  # Auth, Product, Cart, Order, Wishlist, Room, Admin Controllers
│   │   ├── middleware/   # JWT Auth & Admin Role Protection
│   │   ├── repositories/ # Seeded Store & Database Synchronization Layer
│   │   ├── routes/       # Express Route Mounts
│   │   └── types/        # Shared TypeScript Interfaces
│   └── package.json
├── database/             # Supabase PostgreSQL & Drizzle ORM
│   ├── schema/           # Drizzle Schema (products, orders, rooms, promotions, profiles...)
│   ├── seed/             # Realistic Ceramic Tile & Room Data Seeders
│   └── drizzle.config.ts
├── README.md
└── .env.example
```

---

## 🚀 Key Features

1. **Dark Luxury Aesthetic & Design Tokens**:
   - Palette: Deep Black (`#0C0D0E`), Off-White (`#F3F3F3`), Stone Brown (`#8C8275`), Subtle Gold (`#D4AF37`).
   - Centralized CSS variable tokens for heading display font (`--font-heading`) and body font (`--font-body`).

2. **Internationalization (i18n)**:
   - Live switchable language support: **Thai (TH) | English (EN)**.

3. **Room Studio V1 (Controlled Surface Simulator)**:
   - Interactive canvas visualizer with live repeat tile pattern overlay calibrated for physical tile dimensions (60x60 square, 60x120 slab, 30x60 wall tile).
   - Pre-defined room presets: Living Room, Sanctuary Bathroom, Master Bedroom, Chef Kitchen, Outdoor Terrace.

4. **Product Catalog & E-Commerce Logic**:
   - Multi-parameter filtering: Category, Brand, Size, Surface, Material, Price.
   - Pricing display per piece and per box with automatic box coverage calculations.
   - Inventory tracking strictly in **PIECES** (`stockPieces`).
   - Shopping cart requirement rule: Guest browsing allowed; clicking **Add to Cart** requires and redirects to login/registration.

5. **Checkout & Tax Invoice**:
   - Full shipping address form.
   - 7% VAT Tax Invoice request fields (Company Name, Tax ID, Branch, Tax Address).
   - Payment options: Bank Transfer, PromptPay QR, Credit Card.

6. **Customer Account Portal**:
   - Order history with statuses (`Pending` → `Confirmed` → `Preparing` → `Cancelled`).
   - Saved Wishlist & Profile management.

7. **Executive Admin Dashboard (`/admin`)**:
   - Role-based authorization enforced on backend.
   - Revenue charts & key metrics (Total Sales, Orders, Customers, Products, Low Stock alerts).
   - Products CRUD modal, Order status controller, Customer lifetime spend table, Inventory piece/box converter, and Promotion manager.

---

## 🛠️ Setup & Installation Instructions

### 1. Prerequisites
- Node.js >= 18.0.0
- npm >= 9.0.0

### 2. Environment Variables Setup
Copy `.env.example` to root `.env`:
```bash
cp .env.example .env
```

Ensure variables are configured:
```ini
DATABASE_URL="postgresql://postgres:password@localhost:5432/sunma_ceramic"
PORT=5000
NEXT_PUBLIC_API_URL="http://localhost:5000/api"
JWT_SECRET="sunma_ceramic_jwt_secret_key_2026_super_secure"
```

### 3. Install Dependencies
Install dependencies across the monorepo:
```bash
npm install
npm --prefix backend install
npm --prefix frontend install
npm --prefix database install
```

### 4. Running Backend Server
Start the Express REST API in development mode:
```bash
npm run dev:backend
```
The backend server runs on `http://localhost:5000`. Healthcheck: `http://localhost:5000/api/health`.

### 5. Running Frontend Web App
In a separate terminal window, start the Next.js development server:
```bash
npm run dev:frontend
```
The frontend web app runs on `http://localhost:3000`.

---

## 🔑 Demo Accounts

To test the application immediately out of the box:

- **Administrator Account**:
  - Email: `admin@sunmaceramic.com`
  - Password: `admin` (or click *"Log in as Administrator (Demo)"* on `/login`)
  - Access: Full access to `/admin` dashboard.

- **Customer / Architect Account**:
  - Email: `architect@studio-lux.com`
  - Password: `user123`

---

## 🗄️ Database Migrations & Seeding

If using a live PostgreSQL instance with Supabase and Drizzle:

```bash
# Generate SQL migration scripts
npm run db:generate

# Execute database migrations
npm run db:migrate

# Seed database with realistic ceramic tile data & Room Studio presets
npm run db:seed
```

---

## 🌟 Future Upgrade Roadmap (V2)

- Room Studio V2 (Interactive perspective control, user-uploaded room photo masking, AI surface visualization).
- Payment Gateway Integration (Omise / Stripe live tokenized payments).
- Automated Shipping Fee Calculator based on weight in kg and province distance.
- ERP & Warehouse API syncing.
