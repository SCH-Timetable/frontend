# Enterprise UI Dashboard — ScheduleAI (Badr University)

A React 19 + Vite + Tailwind CSS v4 front end for a university timetable, room, and
lab allocation system. Originally exported from Figma Make; this copy has been
stripped of Figma-Make-only tooling so it runs as a normal, standalone Vite project.

## Quick start

```bash
npm install
npm run dev        # http://localhost:5173
```

```bash
npm run build       # production build -> dist/
npm run preview     # serve the production build locally
```

Requires Node 20+ (built and tested on Node 22).

## Project structure

```
src/
  main.tsx           React entrypoint — mounts <App /> inside <ThemeProvider>
  App.tsx             Admin shell: schedule grid (rooms/labs/staff views),
                       version control (draft/published), conflict side panel
  LoginScreen.tsx      Role-based sign-in (admin / lecturer / student)
  PortalScreen.tsx     Lecturer-facing portal
  RoomsScreen.tsx      Room & lab booking screen
  AnalyticsScreen.tsx  Utilization / analytics charts (recharts)
  StudentPortal.tsx    Student-facing timetable + credit summary
  theme.tsx            Design-token system (ThemeProvider + useTheme)
  data.ts              Mock data + shared types (Session, Conflict, Alternative…)
  roomsData.ts         Mock room/lab inventory data
  index.css            Tailwind v4 entry + design tokens (@theme inline)
```

There is currently **no backend** — every screen reads from the static mock
objects in `src/data.ts` and `src/roomsData.ts` and everything (auth, drafts,
conflict state) lives in React state (`useState` in `App.tsx`) that resets on
reload.

## Where to plug in a backend

The mock types already line up closely with a normalized schema (course →
section → allocation → conflict), so wiring this to a real API is mostly a
matter of swapping the static imports for fetch calls:

| Front-end concept | File | Maps to |
|---|---|---|
| `Session` | `data.ts` | one allocation (staff + room + day/slot + group) |
| `Conflict` / `Alternative` | `data.ts` | a detected clash + suggested fix |
| `ROOMS`, `LABS`, `STAFF` | `data.ts` | room/lab/staff directories |
| room inventory, equipment, capacity | `roomsData.ts` | room/equipment records |
| draft/published version list | `App.tsx` (`VERSIONS` const) | schedule versions |
| login role selection | `LoginScreen.tsx` | auth/session |

Suggested approach:

1. **Introduce an API client.** Add a small `src/api/client.ts` wrapping `fetch`
   (base URL from `import.meta.env.VITE_API_URL`), and an `.env` file (already
   gitignored) for local config.
2. **Replace static data with data-fetching hooks.** Turn the constants in
   `data.ts` / `roomsData.ts` into `useEffect`/`useState` (or React Query /
   SWR, if you add one) calls in the screens that use them — `App.tsx`,
   `RoomsScreen.tsx`, `AnalyticsScreen.tsx`, `StudentPortal.tsx`.
3. **Move conflict detection server-side.** Today conflicts are pre-baked into
   the mock data (`CONFLICTS` in `data.ts`, `conflictId` on sessions). A real
   backend should compute these (see the "hard-conflict validation engine"
   pattern) and the front end should just render whatever the API returns.
4. **Wire the version control UI to real endpoints.** `App.tsx`'s `VERSIONS`
   array and the publish/draft actions are the natural home for
   `POST /schedule-versions`, `POST /schedule-versions/:id/publish`, etc.
5. **Replace the mock login** in `LoginScreen.tsx` with real auth (session
   cookie or token), and gate `App.tsx` / `PortalScreen.tsx` /
   `StudentPortal.tsx` behind the authenticated role.

If you're pairing this with a PostgreSQL schema, the `sch_*` tables (academic
term, room, staff, allocation, conflict, schedule version) map directly onto
the concepts above — `Session` ≈ `sch_allocation` joined out for display,
`Conflict`/`Alternative` ≈ `sch_conflict`/`sch_recommendation`, and the
draft/published version list ≈ `sch_schedule_version`.

## Notes

- Styling is Tailwind CSS v4 via the `@tailwindcss/vite` plugin — no
  `tailwind.config.js` needed; theme tokens live in `src/index.css`
  (`@theme inline { ... }`) and `src/theme.tsx`.
- Charts use `recharts`.
- The `@` import alias points at `src/` (configured in `vite.config.ts` and
  `tsconfig.json`).
