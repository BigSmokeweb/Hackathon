# Railway Deployment Guide

This project is a monorepo containing:
- `backend/` (NestJS, Prisma, PostgreSQL + PostGIS)
- `frontend/` (Next.js 14 App Router)
- `shared/` (Shared Types & Zod Schemas)

---

## 🎯 Architecture on Railway

In Railway, you will have **3 services in one project**:
1. **PostgreSQL Database** (with PostGIS enabled)
2. **Backend Service** (NestJS API)
3. **Frontend Service** (Next.js App)

---

## 🚀 Step-by-Step Setup

### Step 1: Create Railway Project & PostgreSQL
1. Go to [railway.com](https://railway.com) and click **"New Project"**.
2. Select **"Provision PostgreSQL"**.
3. Once the Postgres database card is created, click on it, go to the **"Data"** or **"Query"** tab, and run:
   ```sql
   CREATE EXTENSION IF NOT EXISTS postgis;
   CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
   CREATE EXTENSION IF NOT EXISTS pg_trgm;
   ```
4. Under the database **"Variables"** tab, note down `DATABASE_URL`.

---

### Step 2: Deploy Backend Service
1. In the same Railway project canvas, click **"+ New"** ➔ **"GitHub Repo"** ➔ select this repository.
2. Click on the newly added service card and open **"Settings"**:
   - **Service Name:** `backend`
   - **Root Directory:** `/` (leave root so workspaces resolve)
   - **Build Command:**
     ```bash
     npm install && npx prisma generate --schema=backend/prisma/schema.prisma && npm run build --workspace=backend
     ```
   - **Deploy / Start Command:**
     ```bash
     npx prisma migrate deploy --schema=backend/prisma/schema.prisma && npm run db:seed --workspace=backend && npm run start:prod --workspace=backend
     ```
3. Open the **"Variables"** tab and add:
   ```env
   NODE_ENV=production
   PORT=4000
   DATABASE_URL=${{Postgres.DATABASE_URL}}
   JWT_ACCESS_SECRET=super-secret-production-access-key-xyz-1234
   JWT_REFRESH_SECRET=super-secret-production-refresh-key-xyz-5678
   GEMINI_API_KEY=<your-gemini-api-key>
   AI_SERVICE_ENABLED=true
   CORS_ORIGIN=*
   ```
   *(Note: You can link `${{Postgres.DATABASE_URL}}` directly using Railway's variable reference dropdown).*
4. In **Settings** ➔ **Networking**, click **"Generate Domain"** (e.g. `https://backend-production-xxxx.up.railway.app`).

---

### Step 3: Deploy Frontend Service
1. Click **"+ New"** ➔ **"GitHub Repo"** ➔ select the same repo again.
2. In the new service card, go to **"Settings"**:
   - **Service Name:** `frontend`
   - **Root Directory:** `/`
   - **Build Command:**
     ```bash
     npm install && npm run build --workspace=frontend
     ```
   - **Deploy / Start Command:**
     ```bash
     npm run start --workspace=frontend
     ```
3. Open the **"Variables"** tab and add:
   ```env
   NODE_ENV=production
   PORT=3000
   NEXT_PUBLIC_API_BASE_URL=https://<your-backend-domain>.up.railway.app/api/v1
   ```
4. In **Settings** ➔ **Networking**, click **"Generate Domain"** (e.g. `https://frontend-production-xxxx.up.railway.app`).

---

### Step 4: Final Link (CORS)
1. Go back to the **`backend`** service variables.
2. Update `CORS_ORIGIN` to your frontend domain:
   ```env
   CORS_ORIGIN=https://<your-frontend-domain>.up.railway.app
   ```
Railway will auto-redeploy, and your entire hackathon app will be live with full database persistence, AI features, and 3D graphics!
