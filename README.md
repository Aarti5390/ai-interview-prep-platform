# 🎙️ AI Interview Prep Platform

**Real‑time AI‑powered mock interviews to help you ace technical interviews.**

[![Live Demo](https://img.shields.io/badge/Live_Demo-Vercel-000?logo=vercel)](https://ai-interview-prep-platform-orcin.vercel.app)
[![GitHub repo](https://img.shields.io/badge/GitHub-Aarti5390-181717?logo=github)](https://github.com/Aarti5390/ai-interview-prep-platform)
[![MIT License](https://img.shields.io/badge/License-MIT-green)](LICENSE)

---

## 📖 Overview

This platform simulates a real technical interview. You select a **topic** (e.g., React, JavaScript, Python), **difficulty** (easy/medium/hard), and **number of questions**. The app generates dynamic questions using **Groq AI**, evaluates your answers, and returns a score (1‑10) with **strengths, weaknesses, and actionable suggestions**.

Built with the **MERN stack** (MongoDB, Express, React, Node.js), it also includes:

- 🔐 JWT authentication & role‑based access (user / admin)
- 👑 Admin dashboard (user & interview management, pagination, filters, CSV export)
- 📊 Personal dashboard with stats + score trend chart
- 📄 Downloadable PDF interview reports
- 🌓 Fully responsive (works on all devices)

---

## ✨ Features

### 👤 For Users
| Feature | Description |
|---------|-------------|
| 🔐 Authentication | Secure login / registration with JWT |
| 🎯 Custom interviews | Choose topic, difficulty, question count |
| 🤖 AI evaluation | Score (1‑10) + strengths, weaknesses, suggestions |
| 📈 Dashboard | Overall score, completed interviews, practice time |
| 📜 History | Paginated list of past interviews |
| 📊 Trend chart | Score progress over last 5 interviews |
| 📑 PDF report | Download detailed result report |
| 👤 Profile | Update name, qualification, upload resume |

### 👑 For Admins
| Feature | Description |
|---------|-------------|
| 📊 Platform stats | Total users, interviews, average score |
| 👥 User management | View all users with pagination |
| 📋 Interview management | View all interviews, filter by email/status |
| 🔍 Search & filter | Quickly find interviews |
| 📎 CSV export | Export user data |

---

## 🛠️ Tech Stack

| Layer       | Technology |
|-------------|------------|
| Frontend    | React (Vite), Axios, Recharts, CSS3, FontAwesome |
| Backend     | Node.js, Express.js, JWT, bcrypt, Mongoose |
| Database    | MongoDB Atlas |
| AI          | Groq API (`llama-3.3-70b-versatile`) |
| Deployment  | Vercel (frontend) + Render (backend) |
| Other       | Git, GitHub, Postman, html2pdf.js |

---

## 🚀 Live Demo

👉 [**https://ai-interview-prep-platform-orcin.vercel.app**](https://ai-interview-prep-platform-orcin.vercel.app)

> **Test User** (regular)  
> Email: `test@example.com`  
> Password: `123456`

> **Admin Demo** (full access to admin panel)  
> Email: `admin@example.com`  
> Password: `123456`

---

## 📁 Project Structure

```plaintext
ai-interview-prep-platform/
├── client/                 # React frontend (Vite)
│   ├── src/
│   │   ├── api/            # Axios config
│   │   ├── components/     # Layout, ProfileModal, ErrorBoundary
│   │   ├── pages/          # All pages (Dashboard, AdminDashboard, InterviewPage, ...)
│   │   ├── context/        # ThemeContext (dark mode)
│   │   ├── App.jsx
│   │   └── main.jsx
│   └── package.json
├── server/                 # Node.js backend
│   ├── src/
│   │   ├── config/         # DB connection
│   │   ├── controllers/    # Auth, Interview, Admin, Profile
│   │   ├── middleware/     # Auth, upload
│   │   ├── models/         # User, Interview
│   │   ├── routes/         # API routes
│   │   ├── services/       # Groq AI service
│   │   ├── app.js
│   │   └── server.js
│   └── package.json
├── screenshots/            # Add your images here
├── .gitignore
└── README.md
```

---

## 🔧 Local Setup

### Prerequisites
- Node.js (v18 or later)
- npm or yarn
- MongoDB Atlas account (or local MongoDB)

### 1. Clone the repository
```bash
git clone https://github.com/Aarti5390/ai-interview-prep-platform.git
cd ai-interview-prep-platform
```

### 2. Backend setup
```bash
cd server
npm install
```

Create a `.env` file in `server/`:
```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_super_secret_key
GROQ_API_KEY=your_groq_api_key
```

Start the backend:
```bash
npm run dev
```

### 3. Frontend setup
```bash
cd ../client
npm install
```

Create a `.env` file in `client/`:
```env
VITE_API_URL=http://localhost:5000
```

Start the frontend:
```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

---

## 🌍 Deployment

- **Backend:** [Render](https://render.com) – connect GitHub repo, root directory `server`, add environment variables.
- **Frontend:** [Vercel](https://vercel.com) – connect repo, root directory `client`, add `VITE_API_URL` (your live backend URL).
- **Database:** [MongoDB Atlas](https://www.mongodb.com/atlas) – create free cluster, whitelist `0.0.0.0/0`, use the connection string.

---

## 🤝 Contributing

Contributions are welcome! Feel free to open an issue or submit a pull request.

---

## 📄 License

This project is licensed under the **MIT License** – see the [LICENSE](LICENSE) file for details.

---

## 📬 Contact

**Aarti Deepak Swami**  
📧 aartiswami8896@gmail.com  
🔗 [LinkedIn](https://linkedin.com/in/aarti-swami5390)  
🐙 [GitHub](https://github.com/Aarti5390)

---

## 🙏 Acknowledgements

- [Groq](https://groq.com) for the fast LLM API
- [Render](https://render.com) & [Vercel](https://vercel.com) for free hosting
- [Font Awesome](https://fontawesome.com) & [Recharts](https://recharts.org)