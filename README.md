# 🧠 Course Compass — MERN Full-Stack Assessment

A full-stack web application to search, explore, and get AI-powered recommendations for university courses. Built using Next.js, Node.js, MongoDB, Redis, and Docker.

---

## 🚀 Features

### 🔐 Authentication
- JWT-based Admin Signup & Login
- Passwords hashed with bcrypt
- Protected API routes via middleware

### 📂 CSV Upload
- Upload course data via CSV
- Parsed and bulk-stored in MongoDB

### 🔍 Course Search
- Keyword-based search with MongoDB regex filtering
- Filter by university, level, and tuition fee

### ⚡ Redis Caching
- Caches course listing and search results
- TTL-based cache invalidation
- Reduces repeated database queries

### 🤖 AI Recommendations
- Gemini AI-ready implementation (mocked for assessment)
- Suggests courses based on user's description

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 15, TypeScript, Tailwind CSS |
| Backend | Node.js, Express.js |
| Database | MongoDB with Mongoose |
| Cache | Redis |
| Auth | JWT + bcrypt |
| DevOps | Docker, Docker Compose |
| State | React Context API |

---

## 📁 Project Structure

```
mern-assesment/
├── backend/
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── courseController.js
│   │   └── recommendationController.js
│   ├── middleware/
│   │   ├── authMiddleware.js
│   │   └── upload.js
│   ├── models/
│   │   ├── Admin.js
│   │   └── Course.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── adminRoutes.js
│   │   ├── courseRoutes.js
│   │   └── recommendationRoutes.js
│   ├── config/
│   │   └── redis.js
│   ├── server.js
│   ├── Dockerfile
│   
├── frontend-modified/
│   ├── src/
│   │   ├── app/
│   │   │   ├── page.tsx                  # Home — course listing
│   │   │   ├── admin/login/page.tsx      # Admin login
│   │   │   ├── admin/signup/page.tsx     # Admin signup
│   │   │   ├── admin/dashboard/page.tsx  # CSV upload dashboard
│   │   │   └── course-match/page.tsx     # AI recommendations
│   │   ├── context/
│   │   │   └── AuthContext.tsx           # Global auth state
│   │   └── lib/
│   │       └── api.ts                    # All API calls
│   ├── Dockerfile
│   
└── docker-compose.yml
```

---

## ⚙️ Setup Instructions

### Prerequisites
- Node.js v20+
- MongoDB running locally or a MongoDB Atlas URI
- Redis running locally

### 1️⃣ Clone Repository

```bash
git clone https://github.com/Adity322/course-compass.git
cd course-compass
```

---

### 🖥️ Run Without Docker

#### Backend

```bash
cd backend
npm install
```

Create a `.env` file inside `backend/`:

```env
MONGO_URI=mongodb://localhost:27017/mern-assessment
JWT_SECRET=supersecretkey
REDIS_URL=redis://localhost:6379
```

```bash
node server.js
# Server running on http://localhost:8000
```

#### Frontend

```bash
cd frontend-modified
npm install
```

Create a `.env.local` file inside `frontend-modified/`:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

```bash
npm run dev
# App running on http://localhost:9002
```

#### 🌐 Access
- Frontend → http://localhost:9002
- Backend → http://localhost:8000

---

### 🐳 Run With Docker

#### Prerequisites
- Docker Desktop installed and running

Create a `.env` file in the **root** folder:

```env
JWT_SECRET=your_secret_key_here
```

```bash
docker-compose up --build
```

This starts 4 containers automatically:

| Container | Port | Description |
|-----------|------|-------------|
| MongoDB | 27017 | Database |
| Redis | 6379 | Cache |
| Backend | 8000 | Express API |
| Frontend | 9002 | Next.js App |

```bash
# Run in background
docker-compose up --build -d

# Stop everything
docker-compose down
```

---

## 🔗 API Endpoints

### Auth — `/api/auth`

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/auth/signup` | Register a new admin | No |
| POST | `/api/auth/login` | Login and get JWT token | No |

**Login response:**
```json
{
  "token": "eyJhbGci...",
  "admin": { "id": "abc123", "email": "admin@example.com" }
}
```

### Admin — `/api/admin`

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/admin/dashboard` | Protected admin route | ✅ Yes |

### Courses — `/api/courses`

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/courses` | Get all courses (Redis cached) | No |
| POST | `/api/courses/upload` | Upload courses via CSV | ✅ Yes |
| GET | `/api/courses/search?query=` | Search courses (Redis cached) | ✅ Yes |

### Recommendations — `/api/recommendations`

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/recommendations` | Get AI course recommendations | ✅ Yes |

**Request body:**
```json
{ "description": "I love AI and machine learning" }
```

**Response:**
```json
{
  "suggestions": [
    {
      "courseName": "Introduction to AI",
      "universityName": "Stanford University",
      "matchScore": 96,
      "rationale": "Perfect match for AI-focused learners."
    }
  ]
}
```

---

## 📊 Assignment Implementation Details

### Part 1a — User Authentication

- Admin signup and login implemented using **MongoDB**
- Passwords hashed with **bcryptjs** (salt rounds: 10) before storing
- On successful login, a **JWT token** is generated with 1-day expiry
- Protected routes use `authMiddleware.js` which verifies the JWT on every request
- Unauthorized requests receive a `401` response

### Part 1b — Gemini AI Recommendations

- Endpoint: `POST /api/recommendations`
- Accepts a `description` field describing the user's interests and background
- Currently uses **mock recommendations** based on keyword matching (data, web, AI, etc.)
- To integrate real Gemini API, replace mock logic in `controllers/recommendationController.js`:

```js
import { GoogleGenerativeAI } from "@google/generative-ai";
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const model = genAI.getGenerativeModel({ model: "gemini-pro" });
const result = await model.generateContent(
  `Given this student description: "${description}", suggest 3 university courses 
   with courseName, universityName, matchScore (0-100), and rationale.`
);
```

### Part 1c — Course Management, Search & Cache

- **CSV Upload:** `POST /api/courses/upload` parses CSV using `csv-parser` and bulk inserts into MongoDB
- **Redis Caching Strategy:**
  - `GET /api/courses` — checks Redis first, falls back to MongoDB, caches for **5 minutes**
  - `GET /api/courses/search` — caches search results by query string for **60 seconds**
  - On cache miss: fetches from MongoDB → stores in Redis → returns response

### Part 2a — CI/CD Pipeline

```
Code Push (GitHub)
      ↓
GitHub Actions triggered
      ↓
Stage 1 — Install & Lint
  - npm install
  - eslint check
      ↓
Stage 2 — Test
  - Run unit tests (Jest)
  - Run API tests (Supertest)
      ↓
Stage 3 — Build
  - Build Next.js frontend
  - Build Docker images
      ↓
Stage 4 — Deploy
  - Push Docker images to Docker Hub
  - SSH into Linux server
  - docker-compose up --build -d
```

| Stage | Tool |
|-------|------|
| Source Control | GitHub |
| CI/CD Runner | GitHub Actions |
| Testing | Jest, Supertest |
| Containerization | Docker |
| Image Registry | Docker Hub |
| Deployment | SSH + docker-compose |

### Part 2b — Dockerization

- `backend/Dockerfile` — builds the Express API using Node.js 20 Alpine
- `frontend-modified/Dockerfile` — multi-stage build for Next.js (build stage + production runner)
- `docker-compose.yml` — orchestrates MongoDB, Redis, Backend, and Frontend together

### Part 3b — State Management: React Context API

**Choice:** React Context API (`src/context/AuthContext.tsx`)

**Why Context over Redux/Zustand:**
- Global state is simple — just JWT token + admin info
- Redux adds significant boilerplate for minimal benefit at this scale
- Context is built into React with zero extra dependencies
- Persists auth state to `localStorage` so it survives page refreshes

**What it manages:**
- `token` — JWT returned from login
- `admin` — `{ id, email }` of the logged-in admin
- `isLoggedIn` — boolean derived from token presence
- `login()` / `logout()` — functions to update state and sync localStorage

### Part 3c — Client-Side Caching: sessionStorage

**Implementation:** `sessionStorage` with 5-minute TTL in `src/app/page.tsx`

**How it works:**
1. On first load → fetch from `GET /api/courses` → store in `sessionStorage`
2. On subsequent visits within the same tab → return from cache instantly
3. After 5 minutes → cache expires → fresh fetch from backend

**Benefits:**
- Eliminates redundant API calls when navigating back to the home page
- Faster page loads — no network round-trip for repeated visits
- Reduces load on backend and MongoDB
- Scoped to the browser tab — no stale data across sessions

---

## ✅ Features Summary

- ✅ Admin Signup & Login with JWT
- ✅ Password hashing with bcrypt
- ✅ Protected routes with JWT middleware
- ✅ CSV course upload to MongoDB
- ✅ Redis caching on course listing and search
- ✅ AI course recommendations (Gemini-ready, mocked for assessment)
- ✅ Course listing with search and filters
- ✅ Client-side caching with sessionStorage
- ✅ Global auth state with React Context API
- ✅ Fully Dockerized with docker-compose
- ✅ Admin signup page with validation

---

## 💡 Future Improvements

- Real Gemini AI integration
- Advanced filters and pagination
- User dashboard
- Role-based access control

---

## 📌 Notes

Gemini AI is mocked due to API key limitations during assessment. The integration point is clearly marked in `controllers/recommendationController.js`.

---

## 👨‍💻 Author

**Aditya Singh**
