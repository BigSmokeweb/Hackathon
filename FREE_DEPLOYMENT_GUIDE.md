# 100% Free Production Deployment (Vercel + Render + Supabase)

Both the **Frontend** (`next build`) and **Backend** (`nest build`) have been validated and build with **0 errors**.

---

## 🛠 Services Architecture (100% Free Tier)

| Role | Provider | Cost | Setup Time |
| :--- | :--- | :--- | :--- |
| **Postgres Database (PostGIS)** | **[Supabase](https://supabase.com)** | **$0** (Free 500MB) | ~3 mins |
| **Backend API (NestJS)** | **[Render](https://render.com)** | **$0** (Free Web Service) | ~5 mins |
| **Frontend (Next.js 14)** | **[Vercel](https://vercel.com)** | **$0** (Unlimited Free) | ~2 mins |

---

## 🚀 Step 1: Database on Supabase (3 Minutes)

1. Sign in to [Supabase](https://supabase.com) and click **"New Project"**.
2. Give it a name (e.g. `experience-platform`) and set a secure database password. Choose the closest region (e.g. `Mumbai (ap-south-1)` or `Singapore`).
3. Once created, go to **Database** (left sidebar) ➔ **Extensions**.
   - Search for **`postgis`** and toggle it **ON**.
   - Search for **`pg_trgm`** and toggle it **ON**.
   - Search for **`uuid-ossp`** and toggle it **ON**.
4. Go to **Project Settings** (gear icon) ➔ **Database** ➔ scroll to **Connection String** ➔ choose **URI** mode:
   - Copy the string: `postgresql://postgres.[ref]:[YOUR-PASSWORD]@aws-0-[region].pooler.supabase.com:6543/postgres` (or direct 5432).
5. Open your local PowerShell and push your schema & seed data into Supabase:
   ```powershell
   $env:DATABASE_URL="postgresql://postgres.[ref]:[PASSWORD]@aws-0-[region].pooler.supabase.com:5432/postgres"
   npx prisma db push --schema=backend/prisma/schema.prisma
   npm run db:seed --workspace=backend
   ```
   *(All Ahmedabad, Mumbai, Jaipur, and Delhi experiences will now be in your remote database!)*

---

## 🚀 Step 2: Backend API on Render (5 Minutes)

1. Push your latest code to your **GitHub repository**.
2. Go to [Render.com](https://render.com) ➔ click **New +** ➔ **Web Service**.
3. Connect your GitHub repository.
4. Fill in the settings:
   - **Name:** `experience-backend`
   - **Region:** Singapore or Frankfurt (closest to your DB)
   - **Root Directory:** (leave completely blank)
   - **Environment:** `Node`
   - **Build Command:**
     ```bash
     npm install && npx prisma generate --schema=backend/prisma/schema.prisma && npm run build --workspace=backend
     ```
   - **Start Command:**
     ```bash
     npm run start:prod --workspace=backend
     ```
   - **Instance Type:** `Free`
5. Click **Advanced** ➔ **Add Environment Variable**:
   ```env
   NODE_ENV=production
   PORT=10000
   DATABASE_URL=<Paste your Supabase URI from Step 1>
   JWT_ACCESS_SECRET=hackathon-access-super-token-key-2026
   JWT_REFRESH_SECRET=hackathon-refresh-super-token-key-2026
   GEMINI_API_KEY=<your-gemini-api-key>
   AI_SERVICE_ENABLED=true
   CORS_ORIGIN=*
   ```
6. Click **Create Web Service**.
7. In ~2-3 minutes, your backend will be live! Copy the URL (e.g. `https://experience-backend.onrender.com`).

---

## 🚀 Step 3: Frontend on Vercel (2 Minutes)

1. Go to [Vercel.com](https://vercel.com) ➔ **Add New...** ➔ **Project**.
2. Import your GitHub repository.
3. Configure the project:
   - **Framework Preset:** `Next.js`
   - **Root Directory:** Click **Edit** and choose `frontend`
4. Expand **Environment Variables** and add:
   ```env
   NEXT_PUBLIC_API_BASE_URL=https://experience-backend.onrender.com/api/v1
   ```
   *(Replace with your actual Render URL from Step 2)*
5. Click **Deploy**.
6. In ~45 seconds, Vercel will give you a live production URL: `https://your-project.vercel.app`.

---

## 💡 Hackathon Demo Pro-Tips

1. **Avoid Render Cold-Starts during Jury Demo:**
   Render's free tier sleeps if there are no requests for 15 minutes.
   - Go to [cron-job.org](https://cron-job.org) (100% free, no credit card).
   - Create a cron job that pings: `https://experience-backend.onrender.com/api/v1/experiences/search` every **10 minutes**.
   - This keeps your backend **warm and instantaneous** for the presentation judges!

2. **CORS Security:**
   Once Vercel gives you the frontend URL (e.g., `https://hackathon-project.vercel.app`), update `CORS_ORIGIN` in your Render Environment Variables to that exact URL.
