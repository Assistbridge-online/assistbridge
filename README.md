# AssistBridge

> Research & technical assistance, on demand. Production-ready platform connecting clients worldwide with vetted experts across every discipline.

**Domain:** [assistbridge.online](https://assistbridge.online)  
**Stack:** Next.js 16 · React 19 · TypeScript · Tailwind CSS · Prisma · NextAuth v5 · Stripe + PayPal · Resend  
**Status:** Production build passing · 73 routes · Fully functional with seeded demo data

---

## Quick start (local, 60 seconds)

```bash
# 1. Install dependencies (already done if you cloned the repo)
npm install

# 2. Set up local SQLite database
cp .env.example .env
# (NEXTAUTH_SECRET and DATABASE_URL are already set to dev defaults)

# 3. Push schema and seed demo data
npm run db:push
npm run db:seed

# 4. Start the dev server
npm run dev
# → http://localhost:3000
```

**Demo logins** (after seeding):

| Role | Email | Password |
|---|---|---|
| Admin | `patywafula2019@gmail.com` | `admin123` |
| Client | `client@demo.com` | `demo1234` |
| Expert | `sarah@demo.com` | `demo1234` |

---

## What you get

### Public site (15 pages)
- **Home** (`/`) - hero, how-it-works, services grid, disciplines, testimonials, pricing teaser, CTA
- **Services** (`/services`) + 12 service categories
- **Disciplines** (`/disciplines`) + 12 detail pages
- **Experts** (`/experts`) - browse with filters, 8 expert profiles
- **How it works** (`/how-it-works`)
- **Pricing** (`/pricing`) - 3 tiers + FAQ
- **About** (`/about`) - story, values, team
- **Contact** (`/contact`) - form (saves to DB + emails you)
- **FAQ** (`/faq`) - 18+ Q&As
- **Become an Expert** (`/become-an-expert`) - application form
- **Blog** (`/blog`) + 3 posts
- **Legal**: Privacy, Terms, Refund, Cookies

### Auth
- Email/password (bcrypt) with email verification
- Forgot/reset password
- Google OAuth (optional)
- GitHub OAuth (optional)

### Client dashboard (`/dashboard`, 7 pages)
Overview, My Orders, New Request, Messages, Payments, Settings

### Expert dashboard (`/expert`, 7 pages)
Overview, Available Jobs, My Jobs (with workspace), Earnings, Profile editor, Settings

### Admin dashboard (`/admin`, 9 pages)
Overview, Users, Experts (vet applications), Orders, Payments, Disputes, Services, Content, Settings

### API routes (12)
- `/api/contact`, `/api/expert-apply`, `/api/quote-request`, `/api/newsletter`
- `/api/upload` (file uploads)
- `/api/orders/[id]/messages` (GET + POST)
- `/api/orders/[id]/deliver`
- `/api/webhooks/stripe`, `/api/webhooks/paypal`
- `/api/auth/[...nextauth]`

### SEO & system
- Per-page metadata + Open Graph
- `sitemap.xml` (dynamic) + `robots.txt`
- Custom 404 / error / loading pages
- Security headers (CSP, X-Frame, referrer policy)
- Cookie consent banner (GDPR)
- `next/image` with remote pattern allowlist (Unsplash, Pravatar, Picsum)

---

## Database

### Local development (SQLite, default)
Already configured. The `prisma/schema.prisma` is set to SQLite for instant local dev. Data is in `prisma/dev.db`.

### Production (PostgreSQL)
For production, switch the schema to PostgreSQL (Supabase, Neon, Railway, or your own):

```bash
# Restore PostgreSQL schema
git checkout prisma/schema.prisma  # or use the original from your backup

# Update .env
DATABASE_URL="postgresql://postgres:PASSWORD@HOST:5432/postgres"

# Run migrations
npx prisma db push
npx prisma db seed
```

Recommended: **Supabase** (free tier) - sign up at [supabase.com](https://supabase.com), create a project, copy the connection string from Project Settings -> Database.

---

## Deploy to Vercel (recommended)

```bash
# 1. Install Vercel CLI
npm i -g vercel

# 2. Login
vercel login

# 3. Deploy
vercel --prod
```

In the Vercel dashboard, after first deploy:
1. **Settings -> Environment Variables** - add all variables from `.env.example` (with production values)
2. **Settings -> Domains** - add `assistbridge.online` (and `www.`), follow the DNS instructions
3. **Storage -> Connect Store** (optional) - connect a Supabase/Neon Postgres for production DB

---

## Environment variables

All variables documented in `.env.example`. Required for production:

| Variable | Required | Purpose |
|---|---|---|
| `DATABASE_URL` | ✓ | PostgreSQL connection string |
| `NEXTAUTH_SECRET` | ✓ | Random 32-byte string for session signing |
| `NEXTAUTH_URL` | ✓ | Your site URL (`https://assistbridge.online`) |
| `RESEND_API_KEY` | for email | Send transactional email |
| `RESEND_WEBHOOK_SECRET` | for inbound email | Verify Resend inbound webhook signatures |
| `STRIPE_SECRET_KEY` | for payments | Stripe server-side |
| `STRIPE_WEBHOOK_SECRET` | for payments | Webhook signature verification |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | for payments | Stripe client-side |
| `PAYPAL_CLIENT_ID` / `PAYPAL_CLIENT_SECRET` | optional | PayPal fallback |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | optional | Google OAuth |
| `GITHUB_CLIENT_ID` / `GITHUB_CLIENT_SECRET` | optional | GitHub OAuth |

Generate a strong secret:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

---

## Setting up payments

### Stripe
1. Sign up at [stripe.com](https://stripe.com)
2. Dashboard → Developers → API keys → copy `Secret key` and `Publishable key`
3. Dashboard → Developers → Webhooks → add endpoint `https://assistbridge.online/api/webhooks/stripe` → select events `checkout.session.completed`, `payment_intent.succeeded`, `charge.refunded` → copy signing secret
4. Add all 3 to Vercel env

### PayPal
1. Sign up at [developer.paypal.com](https://developer.paypal.com)
2. Apps & Credentials → create app → copy Client ID and Secret
3. Start with `PAYPAL_MODE=sandbox` for testing, switch to `live` for production

---

## Setting up business email (`info@assistbridge.online`)

Email deliverability from `gmail.com` is poor. Set up a real address:

**Option A - Zoho Mail Free (recommended, 5 users free)**
1. Sign up at [zoho.com/mail](https://www.zoho.com/mail/)
2. Add your domain, verify via DNS
3. Create `info@assistbridge.online`
4. Add SPF, DKIM, DMARC records (Zoho walks you through it)

**Option B - Google Workspace ($6/user/month)**
1. Sign up at [workspace.google.com](https://workspace.google.com)
2. Verify domain, create mailbox

Then in Resend:
1. Sign up at [resend.com](https://resend.com)
2. Domains → add `assistbridge.online` → add the DNS records Resend provides
3. API Keys → create a key → add to env as `RESEND_API_KEY`
4. Update `EMAIL_FROM` to use the verified domain

---

## File structure

```
assistbridge/
├── app/                    # Next.js App Router
│   ├── (marketing)/       # 15 public pages (shared Header + Footer)
│   ├── (auth)/            # 4 auth pages
│   ├── dashboard/         # Client area
│   ├── expert/            # Expert area
│   ├── admin/             # Admin area
│   ├── api/               # 12 API routes
│   ├── sitemap.ts, robots.ts, layout.tsx, globals.css
│   ├── not-found.tsx, error.tsx, global-error.tsx, loading.tsx
├── components/            # UI components (Logo, Header, Footer, etc.)
├── lib/
│   ├── actions/           # Server actions (auth, orders, expert, admin, payment)
│   ├── db.ts              # Prisma client singleton
│   ├── stripe.ts, paypal.ts, email.ts, email-templates.ts
│   ├── site.ts            # Site config
│   ├── utils.ts           # cn, formatters, constants
├── prisma/
│   ├── schema.prisma      # Active schema (SQLite for dev)
│   ├── schema.sqlite.prisma
│   ├── seed.ts            # Demo data seed
│   └── dev.db             # Local SQLite database
├── public/                # Static assets (logo etc.)
├── auth.ts, auth.config.ts
├── middleware.ts
├── tailwind.config.ts, postcss.config.mjs
├── tsconfig.json
├── next.config.ts
└── .env, .env.example
```

---

## Useful commands

```bash
npm run dev          # Start dev server (http://localhost:3000)
npm run build        # Production build
npm run start        # Start production server
npm run lint         # ESLint
npm run db:push      # Apply Prisma schema to DB
npm run db:seed      # Seed demo data
npm run db:reset     # Reset DB and re-seed
npm run db:studio    # Open Prisma Studio (DB GUI)
```

---

## License

UNLICENSED - proprietary, © AssistBridge LLC.
