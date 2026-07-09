# Mini Tracker (Expo + Supabase)

A small React Native (Expo) app that lets a signed-in user create/edit/delete “items” and shows a **Supabase Edge Function** summary of their **pending** total.

## Setup

### 1) Supabase project
1. Create a free Supabase project.
2. **Disable email confirmation (recommended for local testing):**
   - Supabase Dashboard → **Authentication** → **Providers** → **Email**
   - Turn **OFF** “Confirm email”
   - Save
3. Run the SQL migration in `supabase/migrations/0001_create_items.sql`:
   - This creates the `public.items` table.
   - Enables **Row Level Security (RLS)** and adds policies so users can only access their own rows.
3. **Deploy the Edge Function (one-time):**

   **Option A — CLI (recommended)**
   ```bash
   cd mini_tracker_app
   npm run supabase:login
   npm run supabase:link
   npm run supabase:deploy
   ```

   You can also run the same commands from the repo root (`C:\Mini_Tracker`).

   **Option B — Supabase Dashboard**
   - Go to **Edge Functions** → **Create function**
   - Name: `item-summary`
   - Paste code from `supabase/functions/item-summary/index.ts`
   - Deploy

   The app calls `POST /functions/v1/item-summary` with the user JWT so RLS still applies.

### 2) Configure the app with Supabase keys
1. Copy the example env file:
   ```bash
   cp .env.example .env
   ```
   On Windows (PowerShell): `Copy-Item .env.example .env`
2. Edit `.env` and set:
   - `EXPO_PUBLIC_SUPABASE_URL` — your project URL (Dashboard → Project Settings → API)
   - `EXPO_PUBLIC_SUPABASE_ANON_KEY` — your **anon** public key (never the service role key)

The app reads these via `app.config.ts` → `expo.extra` (loaded from `.env` at startup). Restart with `npx expo start --clear` after editing `.env`.

### 3) Run the app
1. `npm install`
2. `npm start` (or `npx expo start --android/--ios`)

## Project structure

```
├── app.config.ts
├── package.json
├── .env.example
├── README.md
├── supabase/
│   ├── migrations/0001_create_items.sql
│   └── functions/item-summary/index.ts
└── src/
    ├── app/           # Expo Router screens
    ├── hooks/
    ├── lib/
    ├── services/
    ├── state/
    ├── types/
    └── ui/
```

## What’s implemented

- **Auth**: Supabase email/password sign up + sign in, persisted session across restarts.
- **Items CRUD**: list items for the signed-in user only, plus create/edit/delete, with pull-to-refresh.
- **Real-world feature (Edge Function)**: calls `item-summary` to compute:
  - `pending_total` (sum of pending `amount`)
  - `pending_count` (number of pending items)

## What I’d do differently with more time

- Add better form validation (e.g., Zod) and stronger typing around numeric parsing.
- Add optimistic updates and retry logic for network failures.
- Add lightweight tests around services and hooks.

## Trade-offs made

- For the Edge Function summary, the computation is done inside the function after fetching pending rows (simple and clear for a take-home).
- UI is intentionally clean/functional instead of heavy animation work to keep the submission focused on correctness.

## Written Questions

### 1) Where is the Supabase anon key, and why is it acceptable?
The Supabase **anon key** is loaded from `.env` as `EXPO_PUBLIC_SUPABASE_ANON_KEY` (see `.env.example`). Shipping the anon key is acceptable because it does not grant elevated database access by itself. The real protection comes from **RLS policies** and Supabase Auth (the user’s JWT), which ensure clients can only access rows they own. A **service role key** must never be shipped in the app bundle.

### 2) FlatList of 2,000 items is janky: three concrete checks
First, ensure `renderItem` is stable (memoized with `useCallback`) and item components are memoized to reduce re-renders. Second, use pagination/windowing (`onEndReached` + limiting results, or implement infinite scroll) so the app isn’t rendering 2,000 cards at once. Third, confirm expensive work (date formatting, heavy calculations) is minimized inside `renderItem`—precompute/format when data is fetched, or use lightweight display formatting.

### 3) Debug “my items disappeared” in production
Start by checking whether the user is still authenticated (log whether `session` exists and whether the access token is valid) and whether the app successfully re-fetches items after app restart. Next, capture network/API errors from `fetchMyItems()` and also log the exact Supabase query path (table name + filters) used. If auth is fine but data still returns empty, verify RLS policies and triggers in Supabase (including recent schema changes) and confirm rows were inserted with the expected `user_id`. Finally, use Supabase logs/dashboard + client error reporting (e.g., Sentry) to pinpoint whether the failure is auth, RLS, or query logic.

### 4) When choose an Edge Function over client-side work?
Choose an Edge Function when you need to centralize logic, reduce client complexity, or avoid trusting/replicating business rules on an untrusted client. It’s also preferable when you want consistent results for all clients and can keep sensitive operations server-side. With Supabase, Edge Functions still work safely with RLS when you pass the caller’s JWT, so the function can compute summaries without exposing broader data access.

