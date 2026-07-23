# The Atom

The Atom is a production-oriented, mobile-only dating web application for India. It
uses Next.js 15, React 19, TypeScript, Tailwind CSS, Supabase, Framer Motion,
TanStack Query, React Hook Form, Zod, Embla, Virtuoso, Leaflet, and
OpenStreetMap.

The interface is designed for widths from 320px through 1024px. Wider screens
receive a purpose-built mobile-only message rather than a desktop layout.

## Product surfaces

- Immediate email/password authentication without verification emails, plus
  guided onboarding with language, profile, photos, interests,
  preferences, and verification
- AI-ranked nearby discovery with swipe and grid modes
- Rich profiles and explainable compatibility analysis
- Match celebration and AI icebreakers
- Realtime-ready chat with typing, seen state, media, voice, calls, gifts,
  AI replies, and date planning
- Interest groups, posts, events, media, and moderation surfaces
- Nearby events with Leaflet and OpenStreetMap
- Search across people, groups, interests, occupations, and places
- Gifts and claim lifecycle
- Admin-managed Shop catalog, cart, and customer ordering
- Notifications, profile editing, settings, privacy, blocking, reporting,
  incognito mode, and a safety centre
- PWA service worker, loading/error/empty states, and safe-area support
- Automatic client-side WebP compression for every user image, with a hard
  150 KiB limit enforced again by Supabase Storage policies

All people and names shown in local fallback data are fictional. Project images
were generated specifically for The Atom.

## Architecture

```text
app/            App Router pages, layouts, API health endpoint
components/     Shared UI primitives and native-mobile shell
features/       Domain-specific UI and interaction modules
hooks/          Query and PWA hooks
services/       Auth, profile, chat, and provider-neutral AI clients
store/          Small client interaction state
supabase/       Browser/server clients, schema, RLS, storage, Edge Functions
types/          Shared domain types
utils/          Data adapters, local fallback data, utility functions
public/         Optimized original assets and service worker
```

The UI works in a local fallback mode when Supabase variables are absent. This
is useful for product development; production data paths use Supabase through
the service layer.

AI is intentionally provider-neutral. Clients submit typed capabilities to the
`ai-assistant` Supabase Edge Function. The function owns provider credentials,
provider selection, auditing, safety metadata, and persistence. The included
adapter fails closed until a reviewed provider implementation is deployed.

## Local development

Requirements:

- Node.js 20.9 or newer
- npm 10 or newer
- Supabase CLI for local backend development

```bash
npm install
copy .env.example .env.local
npm run dev
```

Open `http://localhost:3000`.

## Supabase

Create a Supabase project and set:

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```

Run the schema:

```bash
supabase link --project-ref YOUR_PROJECT_REF
supabase db push
supabase functions deploy ai-assistant
```

Account registration uses a server-only Supabase admin client to create a
confirmed email/password user without sending a verification email. Keep
`SUPABASE_SERVICE_ROLE_KEY` server-only and configure it in Vercel; never expose
it through a `NEXT_PUBLIC_*` variable.

The Shop admin panel is available at `/admin/shop` and is protected by RLS.
After creating your account, run
[`supabase/SHOP_ADMIN_SETUP.sql`](supabase/SHOP_ADMIN_SETUP.sql) in the
Supabase SQL Editor with your login email to grant that account shop access.
Do not grant this role to normal customer accounts.

Before enabling an AI provider, add its server-side adapter under the Edge
Function, set `AI_PROVIDER`, configure provider secrets with `supabase secrets
set`, and run privacy/safety review. Never expose AI provider keys through
`NEXT_PUBLIC_*` variables.

The migration includes:

- Auth user mirroring
- Profiles, photos, interests, preferences, and locations
- Likes, passes, matches, chats, members, and messages
- Groups, memberships, posts, events, and attendees
- Notifications, verification, reports, blocks, and mutes
- Gifts, claims, and AI suggestions
- PostGIS discovery RPC
- Storage buckets and access policies
- A fail-closed 150 KiB image policy for profile, chat, group, report, and
  verification images
- Row Level Security on every user-data table
- Realtime publication for chat, matches, and notifications

## Quality checks

```bash
npm run lint
npm run typecheck
npm run build
npm run format:check
npm audit
```

## Vercel

Import the GitHub repository into Vercel, add the environment variables, and
deploy. `vercel.json` selects the Mumbai region and adds baseline security
headers.

For live launch, also configure:

- Optional SMS provider if phone authentication is enabled later
- Custom domain and production redirect URLs
- Storage image moderation and verification provider
- Push notification service
- Gift payment/fulfilment provider and refund policy
- Rate limits, abuse monitoring, audit retention, and incident response
- Indian privacy/legal review, age assurance, and community moderation
