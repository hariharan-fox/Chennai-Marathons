# Chennai Marathons — Directory Site

Static frontend (`index.html`) + Vercel serverless API routes (`/api`) + Supabase (Postgres) database.

## 1. Create the Supabase project

1. Go to https://supabase.com → sign up / log in → **New Project**.
2. Pick any name/region, set a database password (save it somewhere — you likely won't need it again since we use the API keys below, not a direct DB connection).
3. Once the project is ready, go to **SQL Editor → New Query**, paste the contents of `supabase-schema.sql` from this folder, and click **Run**. This creates the `listings` and `ad_banners` tables and seeds the 3 ad slots plus two sample listings.
4. Go to **Project Settings → API**. You'll need two values from here:
   - **Project URL** → this is `SUPABASE_URL`
   - **service_role key** (under "Project API keys" — NOT the `anon` key) → this is `SUPABASE_SERVICE_ROLE_KEY`

   The service role key bypasses Row Level Security and must stay server-side only — it's used in `lib/supabase.js`, never sent to the browser.

## 2. Push this project to GitHub

Vercel deploys from a Git repository.

```bash
cd chennai-marathons-vercel
git init
git add .
git commit -m "Initial commit"
```

Create a new empty repo on GitHub, then:

```bash
git remote add origin https://github.com/YOUR_USERNAME/chennai-marathons.git
git branch -M main
git push -u origin main
```

## 3. Deploy on Vercel

1. Go to https://vercel.com → **Add New → Project** → import the GitHub repo you just pushed.
2. Framework preset: leave as **Other** (no build step needed — it's static HTML + serverless functions).
3. Before clicking Deploy, open **Environment Variables** and add:
   - `SUPABASE_URL` — from step 1
   - `SUPABASE_SERVICE_ROLE_KEY` — from step 1
   - `ADMIN_PASSWORD` — pick a strong password for the admin panel
   - `ADMIN_SECRET` — any long random string (used to sign admin session tokens; e.g. generate one with `openssl rand -hex 32`)
4. Click **Deploy**. Vercel installs `@supabase/supabase-js` automatically from `package.json`.

Your site is now live at the `.vercel.app` URL Vercel gives you.

## 4. Add your own domain

**Project → Settings → Domains → Add**, then update your domain's DNS at your registrar (usually an `A` record to `76.76.21.21` for a root domain, or a `CNAME` to `cname.vercel-dns.com` for a subdomain like `www`). Vercel shows you the exact records to add for your specific domain.

## 5. Access the admin panel

The admin panel has no visible link on the site. Go to `https://yourdomain.com/#admin` and sign in with the `ADMIN_PASSWORD` you set in step 3. From there: approve/reject/delete submissions, and manage the 3 ad banner slots under the **Ad Banners** tab.

## Local testing (optional)

```bash
npm i -g vercel
npm install
cp .env.example .env.local   # fill in real values
vercel dev
```

This runs the site with working API routes on `http://localhost:3000`.

## Project structure

```
index.html              → the whole frontend (listings, submit form, admin)
api/admin-login.js       → POST — checks password, returns a signed session token
api/listings.js          → GET (public: approved only / admin: all), POST (public submit)
api/listings/[id].js     → PATCH (approve/reject), DELETE — admin only
api/banners.js           → GET (public), PUT (admin only)
lib/supabase.js          → Supabase client (service role key)
lib/auth.js              → admin token signing/verification
supabase-schema.sql       → run once in Supabase's SQL Editor
```
