# Social Plugin — Setup

Cross-post from the admin console to **Facebook Pages**, **Instagram Business**, and **LinkedIn**.
Implemented as a self-contained module under `lib/social/` + `app/admin/social/` +
`app/api/admin/social/` + `app/api/cron/social-publish/`.

## 1. Required env vars

Set these in Vercel → Project → Settings → Environment Variables → **Production**:

```
FACEBOOK_APP_ID=...            # Meta App → Settings → Basic
FACEBOOK_APP_SECRET=...        # Meta App → Settings → Basic (App Secret, shown once)
LINKEDIN_CLIENT_ID=...         # LinkedIn App → Auth → Client ID
LINKEDIN_CLIENT_SECRET=...     # LinkedIn App → Auth → Client Secret
CRON_SECRET=...                # any random string; protects /api/cron/*
SOCIAL_AUTO_PUBLISH_BLOG=false # set true to auto-cross-post on blog publish
```

Instagram and Facebook **share** the same Meta App — no separate creds needed.

## 2. Create the Meta App (Facebook + Instagram)

1. Go to https://developers.facebook.com/apps → **Create App** → **Business** type.
2. Add the **Facebook Login for Business** product.
3. Settings → Basic: copy **App ID** → `FACEBOOK_APP_ID`, **App Secret** → `FACEBOOK_APP_SECRET`.
4. Facebook Login for Business → Settings → **Valid OAuth Redirect URIs**, add:
   - `https://your-domain.com/api/admin/social/facebook/callback`
   - `https://your-domain.com/api/admin/social/instagram/callback`
5. App Review → Permissions and Features, request:
   - `pages_show_list` (instant)
   - `pages_manage_posts` (instant)
   - `pages_read_engagement` (instant)
   - `instagram_basic` (instant for personal; business requires Business verification)
   - `instagram_content_publish` (instant for personal; business requires verification)
6. For Instagram: link your Instagram Business/Creator account to one of your Pages
   in the Instagram mobile app → Settings → Account → Linked Accounts → Facebook.

Make the app **Live** (toggle at the top of App Review) before the admin can publish
to real accounts; in **Development** mode only admins/developers/testers of the app can connect.

## 3. Create the LinkedIn App

1. Go to https://www.linkedin.com/developers/ → **Create App**.
2. Add the **Sign In with LinkedIn using OpenID Connect** product.
3. Auth → copy **Client ID** and **Client Secret**.
4. OAuth 2.0 settings → **Redirect URLs**, add:
   `https://your-domain.com/api/admin/social/linkedin/callback`
5. Products → Request Access to **Share on LinkedIn** (gives you `w_member_social`,
   instant approval for personal posts).
6. For Company Page posting: also request `w_organization_social` +
   `r_organization_social` (manual review, 1-2 weeks). Update the SCOPES array in
   `lib/social/adapters/linkedin.ts` once approved.

## 4. Vercel Cron

Create `vercel.json` (or add to existing one) to call the social dispatcher every minute:

```json
{
  "crons": [
    { "path": "/api/cron/social-publish", "schedule": "* * * * *" }
  ]
}
```

Then redeploy. The cron endpoint is auth'd via `Authorization: Bearer ${CRON_SECRET}`,
which Vercel Cron sends automatically when `CRON_SECRET` is set in the project's env.

## 5. Database migration

After deploying:

```bash
npx prisma migrate dev --name add_social_plugin    # local
npx prisma migrate deploy                          # production (or let Vercel do it via build hook)
```

If you don't run a migration tool, push the schema directly:

```bash
npx prisma db push
```

The plugin adds three tables: `SocialAccount`, `SocialPost`, `SocialPostAttempt`,
plus three enums (`SocialPlatform`, `SocialPostStatus`, `SocialAttemptStatus`).

## 6. Day-to-day use

- `/admin/social` — overview + recent posts
- `/admin/social/accounts` — connect/disconnect accounts per platform
- `/admin/social/posts/new` — composer
- `/admin/social/posts/[id]` — per-post attempt log + retry / cancel

From `/admin/blog`, each post has a **Share** button that pre-fills the composer
with the post's excerpt + canonical URL + cover image.

## 7. Auto-publish on blog publish (opt-in)

Set `SOCIAL_AUTO_PUBLISH_BLOG=true` in env. When you toggle a blog post from Draft →
Published, the plugin automatically creates a queued SocialPost targeting ALL
connected accounts and publishes it immediately. Off by default so you can curate
your first cross-posts manually before turning the autopilot on.

## 8. Troubleshooting

- **"Platform X is not configured"** — env vars missing in the env Vercel is
  serving. Check Project → Settings → Environment Variables includes the env
  for the **Production** environment, then redeploy.
- **Instagram rejects the post** — IG requires a publicly-fetchable image URL.
  The composer blocks sending without an image when IG is targeted.
- **Facebook token expired** — Page access tokens are effectively permanent,
  but if the user is removed as a Page admin the token dies. Reconnect.
- **LinkedIn token expired** — LinkedIn tokens last 60 days. We store the
  refresh token; auto-refresh will be added in v2. For now, reconnect when
  it expires (the /admin/social/accounts page surfaces expiry dates).