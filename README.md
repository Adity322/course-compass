# 🧠 Course Compass – Full Stack Course Management System

A full-stack web application to search, explore, and get recommendations for university courses.
Built using **Next.js, Node.js, MongoDB, and Redis** with performance optimization and AI-based recommendations.

---

## 🚀 Features

### 🔐 Authentication

* JWT-based Signup & Login
* Protected API routes

### 📂 CSV Upload

* Upload course data via CSV
* Parsed and stored in MongoDB

### 🔍 Course Search

* Keyword-based search
* MongoDB regex filtering

### ⚡ Redis Caching

* Caches search results
* Reduces database load
* TTL-based invalidation

### 🤖 AI Recommendations

* Mock Gemini AI implementation
* Suggests courses based on user input

---

## 🛠️ Tech Stack

**Frontend**

* Next.js (App Router)
* Tailwind CSS
* TypeScript

**Backend**

* Node.js
* Express.js
* MongoDB
* Redis

**DevOps**

* Docker
* Docker Compose

---

## ⚙️ Setup Instructions

### 1️⃣ Clone Repository

git clone https://github.com/Adity322/course-compass.git
cd course-compass

---

## 🖥️ Run Without Docker

### Backend

cd backend
npm install
node server.js

### Frontend

cd frontend-modified
npm install
npm run dev

---

### 🌐 Access

* Frontend → http://localhost:9002
* Backend → http://localhost:8000

---

## 🐳 Run With Docker

docker-compose up --build

---

### Services

* Frontend → http://localhost:9002
* Backend → http://localhost:8000
* Redis → localhost:6379
* MongoDB → localhost:27017

---

## 🔗 API Endpoints

### Auth

* POST /api/auth/signup
* POST /api/auth/login

### Courses

* POST /api/courses/upload
* GET /api/courses/search

### AI

* POST /api/recommendations

---

## 📊 Performance Optimization

Redis caching is used to:

* Improve response time
* Reduce repeated DB queries
* Enhance scalability

---

## 💡 Highlights

* Full-stack integration
* Redis optimization
* CSV-based ingestion
* Scalable architecture

---

## 🧠 Future Improvements

* Real Gemini AI integration
* Advanced filters
* User dashboard
* Pagination

---

## 📌 Notes

Gemini AI is mocked due to API limitations.

---

## 👨‍💻 Author

Aditya Singh
