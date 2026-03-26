# 📚 BookClub Tracker

A full-stack **Book Club & Reading Tracker** web application built with Express.js, MongoDB, and EJS.  
Features a dark-academia aesthetic with session-based auth, full CRUD for books, book clubs, user management, charts, and profile settings.

---

## 🗂 Project Structure

```
bookclub/
├── config/
│   ├── db.js               # MongoDB connection
│   └── session.js          # express-session + connect-mongo config
├── controllers/
│   ├── authController.js
│   ├── bookController.js
│   ├── clubController.js
│   ├── dashboardController.js
│   ├── profileController.js
│   └── userController.js
├── middleware/
│   ├── auth.js             # isAuthenticated, isAdmin, isGuest
│   └── multer.js           # cover image & avatar upload
├── models/
│   ├── Book.js
│   ├── Club.js
│   └── User.js
├── routes/
│   ├── auth.js
│   ├── books.js
│   ├── clubs.js
│   ├── dashboard.js
│   ├── profile.js
│   └── users.js
├── views/
│   ├── auth/               login.ejs, register.ejs
│   ├── books/              index, create, edit, show
│   ├── clubs/              index, create, show
│   ├── dashboard/          index.ejs
│   ├── partials/           head, sidebar, topbar, flash, delete-modal, scripts
│   ├── profile/            index.ejs
│   ├── users/              index.ejs
│   ├── 404.ejs
│   └── 500.ejs
├── public/
│   ├── css/style.css
│   ├── js/main.js
│   └── uploads/
│       ├── covers/
│       └── avatars/
├── .env.example
├── .gitignore
├── app.js
└── package.json
```

---

## ⚡ Quick Start (Local)

### 1. Clone / download the project

```bash
cd bookclub
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up environment variables

```bash
cp .env.example .env
```

Open `.env` and fill in your values:

```env
PORT=3000
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/bookclub?retryWrites=true&w=majority
SESSION_SECRET=some_long_random_string_here
NODE_ENV=development
```

### 4. Run the app

```bash
# Development (auto-restart with nodemon)
npm run dev

# Production
npm start
```

Open your browser at **http://localhost:3000**

---

## ☁️ MongoDB Atlas Setup

1. Go to [https://cloud.mongodb.com](https://cloud.mongodb.com) and create a free account
2. Create a new **Project** → **Build a Database** → choose **M0 Free** tier
3. Set a **username** and **password** (save these)
4. Under **Network Access** → Add IP Address → **Allow Access from Anywhere** (`0.0.0.0/0`) for dev
5. Under **Database** → **Connect** → **Connect your application**
6. Copy the connection string and replace `<username>` and `<password>` with your credentials
7. Paste into your `.env` as `MONGODB_URI`

---

## 🚀 GitHub Upload Instructions

```bash
# 1. Initialize git repo inside the project folder
git init

# 2. Stage all files
git add .

# 3. Initial commit
git commit -m "Initial commit: BookClub Tracker"

# 4. Create a new repo on GitHub (no README), then add the remote
git remote add origin https://github.com/YOUR_USERNAME/bookclub-tracker.git

# 5. Push
git branch -M main
git push -u origin main
```

---

## 🔐 Features

| Feature | Details |
|---|---|
| Auth | Register, Login, Logout (session-based + bcrypt) |
| Books CRUD | Add, view, edit, delete books with cover image upload |
| Reading Status | want-to-read / currently-reading / completed / dropped |
| Star Reviews | Rate and review your own books |
| Dashboard | Stats cards + Bar chart (monthly) + Doughnut chart (by genre) + progress bar |
| Book Clubs | Create, join, leave, delete clubs |
| Admin Panel | View all users, change roles, delete users |
| Profile | Edit name/email/bio/goal, change avatar, change password |
| Responsive | Mobile sidebar toggle, responsive grid layouts |

---

## 📦 Tech Stack

| Package | Purpose |
|---|---|
| express | Web framework |
| mongoose | MongoDB ODM |
| ejs | Templating engine |
| express-session | Session management |
| connect-mongo | Store sessions in MongoDB |
| bcryptjs | Password hashing |
| multer | File/image uploads |
| connect-flash | Flash messages |
| method-override | PUT/DELETE in HTML forms |
| dotenv | Environment variables |
| nodemon (dev) | Auto-restart on file changes |
| Chart.js (CDN) | Dashboard charts |
