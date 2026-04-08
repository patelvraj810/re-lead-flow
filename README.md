# Real Estate Lead-Flow Pipeline

> Capture → Nurture → Scheduler — an MVP pipeline for real estate lead management.

## Architecture

```
┌─────────────┐     ┌─────────────┐     ┌──────────────┐
│   CAPTURE    │────▶│   NURTURE   │────▶│  SCHEDULER   │
│ Lead Forms   │     │ Sequences   │     │ Appointments │
│ + Scoring    │     │ + Drip      │     │ + Calendar   │
└─────────────┘     └─────────────┘     └──────────────┘
       │                   │                    │
       └───────────┬───────┴────────────────────┘
                   ▼
            ┌─────────────┐
            │  SUPABASE   │
            │  PostgreSQL  │
            └─────────────┘
```

## Tech Stack

| Layer | Choice |
|-------|--------|
| Frontend | Next.js 15 (App Router) + Tailwind + shadcn/ui |
| Backend | Next.js API Routes + Server Actions |
| Database | Supabase (PostgreSQL) |
| Validation | Zod |
| Icons | Lucide React |

## Getting Started

```bash
# 1. Set up Supabase
cp .env.local.example .env.local
# Fill in your Supabase URL and anon key

# 2. Run the schema
# Apply supabase/schema.sql in the Supabase SQL editor

# 3. Install and run
npm install
npm run dev
```

## Project Structure

```
src/
├── app/
│   ├── page.tsx              # Dashboard (pipeline overview)
│   ├── layout.tsx            # Root layout
│   ├── leads/
│   │   ├── page.tsx          # Lead list
│   │   └── [id]/page.tsx     # Lead detail
│   ├── nurture/
│   │   └── page.tsx          # Sequence management
│   ├── schedule/
│   │   └── page.tsx          # Appointment scheduler
│   └── api/
│       ├── leads/            # Lead CRUD
│       ├── nurture/          # Sequence + enrollment API
│       └── appointments/     # Appointment API
├── lib/
│   ├── supabase/             # Supabase client helpers
│   ├── types.ts              # Shared TypeScript types
│   └── scoring.ts            # Lead scoring logic
└── components/
    ├── ui/                   # shadcn-style primitives
    ├── lead-capture-form.tsx # Embedded lead form
    ├── pipeline-board.tsx    # Kanban-style pipeline view
    ├── nurture-timeline.tsx  # Sequence step visualization
    └── appointment-card.tsx  # Appointment display
```

## Pipeline Stages

1. **New** → Lead captured (form, Zillow, referral)
2. **Contacted** → First outreach sent
3. **Nurturing** → In active drip sequence
4. **Qualified** → Ready for appointment
5. **Scheduled** → Appointment booked
6. **Closed Won/Lost** → Outcome recorded

## API Routes

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/leads` | List leads (filterable) |
| POST | `/api/leads` | Create lead + auto-enroll in nurture |
| PATCH | `/api/leads/[id]` | Update lead status/fields |
| GET | `/api/nurture/sequences` | List sequences |
| POST | `/api/nurture/enroll` | Enroll lead in sequence |
| POST | `/api/nurture/process` | Process due nurture steps (cron) |
| GET | `/api/appointments` | List appointments |
| POST | `/api/appointments` | Create appointment |
| PATCH | `/api/appointments/[id]` | Update appointment status |

## Lead Scoring

The system automatically calculates a lead score (0-100) based on:

- **Source**: Referrals (30pts), Zillow (20pts), Open House (25pts), etc.
- **Contact completeness**: Phone (+10pts), full name (+10pts)
- **Property interest**: Investing (25pts), Selling (20pts), Buying (15pts)
- **Budget range**: Higher budgets = higher scores
- **Location specificity**: More locations = more serious

## Database Schema

The Supabase schema includes:

- `leads`: Core lead data with status tracking
- `nurture_sequences`: Predefined email/SMS sequences
- `nurture_steps`: Individual steps in sequences
- `nurture_enrollments`: Which leads are in which sequences
- `nurture_log`: Track all outreach events
- `appointments`: Scheduled meetings and tours
- `activity_log`: Unified timeline per lead

## Deployment

```bash
# Build for production
npm run build

# Start production server
npm run start
```

## Environment Variables

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

## Features Implemented

✅ Lead capture form with validation & live score preview
✅ Pipeline dashboard with status tracking & stats
✅ Lead management list view with status summary cards
✅ Individual lead detail pages with activity timeline
✅ Lead status advancement (Kanban-style buttons on pipeline board)
✅ Auto-enrollment in nurture sequences on lead creation
✅ Auto-enrollment on status change (e.g., new → nurturing)
✅ Nurture sequence management with step visualization
✅ Nurture enrollment tracking with opt-out
✅ Nurture step processing endpoint (cron-ready `/api/nurture/process`)
✅ Template rendering with variable substitution ({{first_name}}, {{preferred_locations}}, etc.)
✅ Appointment scheduler with lead selection
✅ Per-lead appointment scheduling from detail page
✅ Activity log per lead (status changes, nurture events, appointments)
✅ Automatic lead scoring (0-100) based on source, budget, interest, contact completeness
✅ Mock Supabase client for build/development without DB connection
✅ Responsive UI with Tailwind + shadcn/ui
✅ TypeScript types throughout
✅ All CRUD API endpoints

## API Routes

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/leads` | List leads (filterable by status, source, min_score) |
| POST | `/api/leads` | Create lead + auto-enroll in matching nurture sequences |
| GET | `/api/leads/[id]` | Get single lead |
| PATCH | `/api/leads/[id]` | Update lead status/fields + auto-enroll on status change |
| DELETE | `/api/leads/[id]` | Delete lead |
| GET | `/api/nurture/sequences` | List sequences with steps |
| POST | `/api/nurture/sequences` | Create sequence with steps |
| POST | `/api/nurture/enroll` | Enroll lead in sequence |
| DELETE | `/api/nurture/enroll` | Opt out of sequence |
| POST | `/api/nurture/process` | Process due nurture steps (cron-ready) |
| GET | `/api/appointments` | List appointments (filterable) |
| POST | `/api/appointments` | Create appointment + update lead status |
| PATCH | `/api/appointments/[id]` | Update appointment status |
| DELETE | `/api/appointments/[id]` | Delete appointment |

## Next Steps

- Add authentication (Clerk, Auth.js)
- Implement email/SMS sending (Resend, Twilio)
- Add calendar integration (Google Calendar API)
- Build admin dashboard for analytics
- Add lead import/export functionality
- Set up Vercel Cron for `/api/nurture/process`
