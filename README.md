# 🎓 College Dress Marketplace

A full-stack MERN web platform where senior students can **sell** their used college uniforms, lab coats, blazers, and sports kits to junior students — with real-time chat and notifications.

![Tech Stack](https://img.shields.io/badge/Stack-MERN-F59E0B?style=flat-square)
![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react)
![Node.js](https://img.shields.io/badge/Node.js-Express-339933?style=flat-square&logo=nodedotjs)
![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?style=flat-square&logo=mongodb)
![Socket.IO](https://img.shields.io/badge/Socket.IO-Real--Time-010101?style=flat-square)

---

## ✨ Features

- 🔐 **JWT Authentication** — Register/Login as Buyer or Seller
- 📦 **Product Listings** — Upload images (Cloudinary), set price, size, condition
- 🔍 **Search & Filter** — Filter by size, condition, price range
- 💬 **Real-Time Chat** — Socket.IO powered messaging between buyers & sellers
- 🔔 **Notifications** — Instant alerts when a buyer shows interest
- 🌙 **Dark Mode** — Full dark/light theme toggle with system preference detection
- ✨ **Scroll Animations** — CSS scroll-driven animations on all pages
- 📱 **Responsive** — Works on mobile, tablet, and desktop

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 19, Vite, Tailwind CSS v4 |
| **Backend** | Node.js, Express.js |
| **Database** | MongoDB Atlas + Mongoose |
| **Auth** | JWT + bcryptjs |
| **Real-Time** | Socket.IO |
| **Images** | Cloudinary |
| **Routing** | React Router DOM v7 |

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- MongoDB Atlas account
- Cloudinary account

### 1. Clone the repo
```bash
git clone git@github.com:Irshad-dude/College-Dress-Marketplace.git
cd College-Dress-Marketplace
```

### 2. Set up environment variables

**Server:**
```bash
cd server
cp .env.example .env
# Fill in your MongoDB URI, JWT secret, Cloudinary keys
```

**Client:**
```bash
cd client
cp .env.example .env
# Update API URLs if needed
```

### 3. Install dependencies
```bash
# From root directory
npm install

# Install server deps
cd server && npm install

# Install client deps
cd ../client && npm install
```

### 4. Run the app
```bash
# From root (runs both servers concurrently)
npm run dev
```

| Service | URL |
|---------|-----|
| Frontend | http://localhost:5173 |
| Backend API | http://localhost:5001/api/v1 |
| Health Check | http://localhost:5001/health |

---

## 📁 Project Structure

```
college-dress-marketplace/
│
├── client/                    # React + Vite frontend
│   └── src/
│       ├── components/        # 17 reusable components
│       ├── pages/             # 11 pages
│       ├── context/           # Auth, Socket, Notification contexts
│       ├── hooks/             # useDarkMode
│       ├── layouts/           # PublicLayout, DashboardLayout
│       └── services/          # Axios API layer
│
├── server/                    # Node.js + Express backend
│   └── src/
│       ├── models/            # 5 Mongoose schemas
│       ├── controllers/       # 6 API controllers
│       ├── routes/            # 6 route files
│       ├── middleware/        # Auth, Error, Upload
│       └── sockets/           # Socket.IO events
│
├── package.json               # Root scripts (concurrently)
└── README.md
```

---

## 🔌 API Endpoints

```
POST   /api/v1/auth/register          Register user
POST   /api/v1/auth/login             Login
GET    /api/v1/products               List products (search/filter/page)
POST   /api/v1/products               Create listing (auth)
GET    /api/v1/products/:id           Product detail
PATCH  /api/v1/products/:id/sold      Mark as sold (auth)
POST   /api/v1/products/:id/interest  Express interest (auth)
POST   /api/v1/chats                  Start/get chat (auth)
GET    /api/v1/messages/:chatId       Get messages (auth)
POST   /api/v1/messages               Send message (auth)
GET    /api/v1/notifications          Get notifications (auth)
POST   /api/v1/upload                 Upload images to Cloudinary (auth)
GET    /health                        Server health check
```

---

## ⚙️ Environment Variables

### Server (`server/.env`)
| Variable | Description |
|----------|-------------|
| `PORT` | Server port (default: 5001) |
| `MONGO_URI` | MongoDB Atlas connection string |
| `JWT_SECRET` | Secret key for JWT signing |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name |
| `CLOUDINARY_API_KEY` | Cloudinary API key |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret |
| `FRONTEND_URL` | Frontend URL for CORS |

### Client (`client/.env`)
| Variable | Description |
|----------|-------------|
| `VITE_API_URL` | Backend API URL |
| `VITE_SOCKET_URL` | Socket.IO server URL |

---

## 🌙 Dark Mode

Dark mode is controlled by a CSS custom property system. Toggle it with the **🌙** button in the navbar or dashboard header. Preference is saved to `localStorage`.

---

## 📄 License

MIT — feel free to use and modify.

---

Built with ❤️ for students, by students.
