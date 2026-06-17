@AGENTS.md

# ERMS — Estate Real-estate Management System

## What This Is
MVP web app for **Reportage Properties** (Dubai real estate developer). Sales agents browse property inventory and generate branded PDF sales offers. Admin manages data via a password-gated panel.

## Tech Stack
- **Next.js 15** (App Router) + TypeScript
- **Tailwind CSS** + **shadcn/ui**
- **Supabase** (PostgreSQL) — project ID: `abvlazglftjadnufjmfp`, region: `ap-southeast-2`
- **@react-pdf/renderer** for PDF generation
- **Deployment target**: Vercel (free tier)

## Project Structure
```
src/
├── app/
│   ├── page.tsx                 # Agent page — server component, fetches data
│   ├── admin/
│   │   ├── page.tsx             # Admin page — password-gated CRUD
│   │   └── actions.ts           # Server actions for admin mutations
│   └── api/offer/route.ts       # PDF generation endpoint (POST)
├── components/
│   ├── inventory-browser.tsx    # Client wrapper — manages filters + selection state
│   ├── inventory-filters.tsx    # Filter bar (project, category, bedrooms, view, search)
│   ├── inventory-table.tsx      # Sortable data table with client-side filtering
│   ├── unit-detail-modal.tsx    # Side panel with unit details + "Generate Offer" button
│   ├── admin-unit-form.tsx      # Add/edit unit dialog form
│   └── offer-pdf.tsx            # React-pdf branded PDF template
├── lib/
│   ├── supabase.ts              # Supabase client
│   └── types.ts                 # TypeScript types (Project, Unit, UnitWithProject)
└── data/
    └── seed.ts                  # Seed script — parses Excel files into Supabase
```

## Database
Two tables in Supabase (schema in `supabase/migrations/001_initial_schema.sql`):
- **projects** — 32 projects (Verdana 1-10, Reportage Hills, Taormina, Bianca, Alba, etc.)
- **units** — 1,499 units seeded from client Excel files

## Key Details
- **Brand colors**: dark green `#1a3c34` + white
- **Admin password**: stored in `.env.local` as `ADMIN_PASSWORD`
- **No auth system** — admin uses a simple password gate, agent page is public
- **Data source**: Two Excel availability files parsed by `seed.ts` from `~/Downloads/Reportage/`
- **RLS**: Enabled with open public policies (to be restricted in v2)

## Current Status (as of 2026-06-17)
- All core pages built and functional (agent inventory browser, admin panel, PDF generation)
- Supabase connected with real credentials
- Database seeded with 1,499 units across 32 projects
- Dev server runs on http://localhost:3000
- Some sheets from Excel files were skipped (unmapped newer Verdana projects: 3M-3O, 3U-3V, 6W-6Y)

## What's Left / Next Steps
- Add mappings for unmapped Verdana sheets (3M, 3N, 3O, 3U, 3V, 6W, 6X, 6Y) in seed.ts
- Deploy to Vercel
- Add Reportage logo (currently using "R." text placeholder)
- Future: proper auth, role-based access, Supabase Storage for assets
