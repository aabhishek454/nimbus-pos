# ☁️ Nimbus POS

A premium, glass-crafted SaaS Point-of-Sale and Restaurant Management platform built with **Next.js**, **Node.js/Express**, and **MongoDB**.

![Dark Theme](https://img.shields.io/badge/Theme-Dark%20%2F%20Light-blueviolet)
![Next.js](https://img.shields.io/badge/Frontend-Next.js%2016-000?logo=next.js)
![Express](https://img.shields.io/badge/Backend-Express%205-green?logo=express)
![MongoDB](https://img.shields.io/badge/Database-MongoDB-47A248?logo=mongodb)

---

## ✨ Features

### 🏪 Owner Workspace
- Real-time analytics dashboard with Recharts
- Staff & employee management with attendance tracking
- Expense tracking and monthly reporting
- Inventory management
- Excel & PDF export support

### 🧾 Employee POS
- Fast order creation and bill generation
- Receipt generation (PDF)
- Streamlined counter workflow

### 🛡️ Admin Console
- Platform-wide business monitoring
- User activity tracking
- Multi-tenant management

### 🎨 Design
- Premium glassmorphism UI with dark/light theme toggle
- Smooth Framer Motion animations
- Fully responsive layout
- Modern typography with Inter font

---

## 🛠️ Tech Stack

| Layer      | Technology                        |
|------------|-----------------------------------|
| Frontend   | Next.js 16, React 19, TypeScript  |
| Styling    | Tailwind CSS 4, Framer Motion     |
| Backend    | Node.js, Express 5                |
| Database   | MongoDB, Mongoose 9               |
| Auth       | JWT, bcrypt                       |
| Charts     | Recharts                          |
| Exports    | ExcelJS, PDFKit                   |

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- MongoDB (local or Atlas)

### 1. Clone the repo

```bash
git clone https://github.com/<your-username>/nimbus-pos.git
cd nimbus-pos
```

### 2. Setup Backend

```bash
cd backend
npm install
```

Create a `.env` file in `backend/`:

```env
MONGO_URI=mongodb://127.0.0.1:27017/saas-restaurant
JWT_SECRET=your_jwt_secret_here
PORT=5000
```

### 3. Setup Frontend

```bash
cd frontend
npm install
```

Create a `.env.local` file in `frontend/`:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

### 4. Run Development Servers

```bash
# Terminal 1 — Backend
cd backend
npm run dev

# Terminal 2 — Frontend
cd frontend
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📁 Project Structure

```
nimbus-pos/
├── backend/
│   ├── config/          # Database configuration
│   ├── controllers/     # Route handlers
│   ├── middleware/       # Auth & role middleware
│   ├── models/          # Mongoose schemas
│   ├── routes/          # API routes
│   ├── scripts/         # Utility scripts
│   ├── app.js           # Express app setup
│   └── server.js        # Server entry point
├── frontend/
│   ├── src/
│   │   ├── app/         # Next.js App Router pages
│   │   ├── components/  # Reusable UI components
│   │   └── lib/         # Utilities, auth, axios
│   └── public/          # Static assets
└── README.md
```

---

## 👥 Authors

- **Abhishek** & **Vishal**

---

## 📄 License

This project is for educational and personal use.
