# ReWear — Full-Stack Sustainable Fashion Exchange

> Points-based pre-owned clothing exchange platform.
> Frontend: Vanilla HTML/CSS/JS on GitHub Pages
> Backend: Node.js + Express + Prisma + PostgreSQL (Neon) + Cloudinary

---

## 📁 Project Structure

```
rewear/
├── frontend/               ← Your existing frontend (minimal changes only)
│   ├── index.html
│   ├── dashboard.html
│   ├── add-item.html
│   ├── admin-panel.html
│   ├── about.html
│   ├── contact.html
│   ├── assets/
│   ├── images/
│   ├── styles/
│   ├── HTML_MODIFICATIONS.html   ← Read this! Exact HTML changes needed
│   └── js/
│       ├── api.js           ← NEW: Central API client
│       ├── auth.js          ← NEW: Login/signup wiring
│       ├── dashboard.js     ← NEW: Real dashboard data
│       ├── items.js         ← NEW: Real items on homepage
│       ├── add-item.js      ← NEW: Item listing form
│       └── admin.js         ← NEW: Admin panel data
│
└── backend/
    ├── .env.example
    ├── .gitignore
    ├── package.json
    ├── README.md
    ├── prisma/
    │   ├── schema.prisma
    │   └── seed.js
    └── src/
        ├── index.js
        ├── config/
        │   ├── prisma.js
        │   └── cloudinary.js
        ├── middleware/
        │   ├── auth.middleware.js
        │   └── error.middleware.js
        ├── controllers/
        │   ├── auth.controller.js
        │   ├── item.controller.js
        │   ├── order.controller.js
        │   ├── user.controller.js
        │   ├── wishlist.controller.js
        │   └── admin.controller.js
        ├── services/
        │   ├── auth.service.js
        │   ├── item.service.js
        │   ├── order.service.js
        │   ├── user.service.js
        │   ├── wishlist.service.js
        │   └── admin.service.js
        └── routes/
            ├── auth.routes.js
            ├── item.routes.js
            ├── order.routes.js
            ├── user.routes.js
            ├── wishlist.routes.js
            └── admin.routes.js
```

---

## 🚀 Quick Start (Local Development)

### Prerequisites
- Node.js v18+
- A free [Neon](https://neon.tech) PostgreSQL database
- A free [Cloudinary](https://cloudinary.com) account

### Step 1 — Clone & Install

```bash
cd rewear/backend
npm install
npx prisma generate
```

### Step 2 — Environment Setup

```bash
cp .env.example .env
```

Edit `.env` with your values:
```env
DATABASE_URL="postgresql://USER:PASSWORD@HOST/rewear?sslmode=require"
JWT_SECRET=your_random_64char_secret_here
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
FRONTEND_URL=https://ritikamittal-19.github.io
```

**Generate a JWT secret:**
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### Step 3 — Database Setup

```bash
# Push schema to Neon (creates all tables)
npm run db:push

# Seed with admin user + sample data
npm run db:seed
```

### Step 4 — Run Backend

```bash
npm run dev
# Server starts on http://localhost:5000
```

### Step 5 — Frontend Setup

Open `frontend/js/api.js` and update the `API_BASE` constant:
```js
const API_BASE = "http://localhost:5000/api"; // for local dev
```

Then open your HTML files with VS Code Live Server or any local server.


## 🧪 Postman Testing Guide

### 1. Health Check
```
GET http://localhost:5000/api/health
```
Expected: `{ "status": "ok" }`

### 2. Register
```
POST http://localhost:5000/api/auth/register
Content-Type: application/json

{
  "firstName": "Test",
  "lastName": "User",
  "email": "test@example.com",
  "password": "password123"
}
```
Copy the `token` from the response.

### 3. Set Auth Token in Postman
In Postman → Authorization tab → Bearer Token → paste your token.

### 4. Browse Items
```
GET http://localhost:5000/api/items
GET http://localhost:5000/api/items?category=DRESSES&limit=5
GET http://localhost:5000/api/items?search=denim
```

### 5. Create Listing (multipart/form-data)
```
POST http://localhost:5000/api/items
Authorization: Bearer <token>
Body: form-data

title: Vintage Denim Jacket
description: Great condition, barely worn
category: OUTERWEAR
size: M
condition: EXCELLENT
points: 65
images: [select file]
```

### 6. Request an Item
```
POST http://localhost:5000/api/orders
Authorization: Bearer <token>
Content-Type: application/json

{ "itemId": 1, "note": "Love this jacket!" }
```

### 7. Admin Login
```
POST http://localhost:5000/api/auth/login
{ "email": "admin@rewear.com", "password": "admin123" }
```

---

## 🚀 Deployment

### Backend → Render (Free Tier)

1. Push `backend/` folder to a GitHub repo
2. Go to [render.com](https://render.com) → New Web Service
3. Connect your GitHub repo
4. Settings:
   - **Build Command:** `npm install && npx prisma generate && npx prisma db push`
   - **Start Command:** `npm start`
5. Add all `.env` variables in Render's Environment tab
6. Deploy → copy your Render URL (e.g. `https://rewear-api.onrender.com`)

### Database → Neon (Free Tier)

1. Go to [neon.tech](https://neon.tech) → Create project → `rewear`
2. Copy the connection string
3. Paste into `DATABASE_URL` in Render environment variables

### Frontend → Update API URL

In `frontend/js/api.js`, change:
```js
const API_BASE = "https://rewear-api.onrender.com/api"; // your Render URL
```

Then push to GitHub — GitHub Pages auto-deploys. ✅


## 🗄️ Database Models

- **User** — email, password (hashed), points, role (USER/ADMIN)
- **Item** — title, images, category, size, condition, points, status
- **Order** — buyer, seller, item, pointsUsed, status (request → accept → complete)
- **Wishlist** — userId + itemId (unique pair)
- **Review** — rating (1-5), comment, reviewer, reviewee

---

## 🛡️ Security Features

- Passwords hashed with bcrypt (12 rounds)
- JWT tokens expire in 7 days
- Rate limiting: 100 req/15min global, 10 req/15min on auth routes
- Helmet.js security headers
- Input validation with express-validator on all POST/PUT routes
- CORS restricted to your frontend domain
- Admin routes double-protected (JWT + role check)
- Points transfer uses Prisma transactions (atomic, no partial updates)

---

## 📈 V2 Roadmap

- [ ] Google OAuth
- [ ] Email notifications (Resend / Nodemailer)
- [ ] Real-time notifications (Socket.io)
- [ ] Review & rating system
- [ ] Cash/UPI payment integration (Razorpay)
- [ ] Item search with Elasticsearch
- [ ] PWA support
