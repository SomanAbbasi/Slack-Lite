# Slack-Lite

A Slack-style collaboration app built with Next.js 16, React 19, Convex, and Convex Auth.

## Features

- Email/password + Google/GitHub authentication
- Workspaces with invite codes and join links
- Channels (create/rename/delete for admins)
- Realtime channel messaging with edit/delete
- Direct messages (1:1 conversations)
- Threads and emoji reactions
- Image attachments via Convex storage
- Search across channels, members, and messages
- In-app activity notifications for mentions, replies, and reactions
- Member roles (admin/member), leave/remove, and profile panel

## Stack

- **Frontend:** Next.js App Router, Tailwind CSS 4, shadcn/ui, Jotai
- **Backend:** Convex (database, realtime, file storage, auth)

## Setup

1. Install dependencies (npm):

```bash
npm install
```

2. Copy environment values:

```bash
cp .env.example .env.local
```

3. Start Convex and set `NEXT_PUBLIC_CONVEX_URL` from the Convex dashboard:

```bash
npm run convex:dev
```

4. Configure Auth secrets in Convex:

```bash
npx convex env set AUTH_SECRET <random-secret>
npx convex env set SITE_URL http://localhost:3000
# Optional OAuth:
npx convex env set AUTH_GOOGLE_ID ...
npx convex env set AUTH_GOOGLE_SECRET ...
npx convex env set AUTH_GITHUB_ID ...
npx convex env set AUTH_GITHUB_SECRET ...
```

5. Run the Next.js app:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Scripts

| Script | Description |
| --- | --- |
| `npm run dev` | Start Next.js (webpack) |
| `npm run convex:dev` | Start Convex backend |
| `npm run build` | Production build |
| `npm run lint` | ESLint |

## Deploy

1. Deploy Convex production: `npx convex deploy`
2. Set production auth env vars in Convex
3. Deploy the Next.js app to Vercel with `NEXT_PUBLIC_CONVEX_URL` pointing at the production Convex deployment
4. Set `SITE_URL` to your Vercel URL

## Notes

- Node `>=20.9 <23` is required (see `.nvmrc`)
- Use the npm lockfile (`package-lock.json`) as the source of truth
- Keep both terminals running: `npm run convex:dev` and `npm run dev`
- Auth requires `SITE_URL` (and `AUTH_SECRET`) on the Convex deployment; `CONVEX_SITE_URL` is set automatically by Convex
