# Visual Gym Tracker Pro

A simple, visual, and free workout tracking web application for gym enthusiasts who want to plan workouts, log exercises efficiently, and track progress over time.

**Course:** COMP 2154 – System Development Project  
**Team:** Group 71  
**GitHub:** https://github.com/MuditMarkan/COMP2154_Gym_Website.git

---

## Team Members

| Name | Student ID | Role |
|------|-----------|------|
| Mudit Markan | 101575511 | Full-Stack Lead |
| Ahmed Abdo | 101589014 | Backend Developer |
| Vincenzo Iori | 101489724 | Frontend Developer |

---

## Features

- **User Authentication** – Secure registration and login with JWT tokens and bcrypt password hashing
- **Workout Dashboard** – Schedule exercises for any date with planned sets, reps, and weight
- **Visual Exercise Library** – 15+ default exercises with images and YouTube tutorial links
- **Custom Exercises** – Add and delete your own exercises
- **Workout Timer** – 30-second rest countdown between sets with embedded tutorial video
- **Auto-Completion** – Workout automatically marked as completed when all sets are done
- **Progress Tracking** – Charts showing weight progression over time using Chart.js
- **Responsive Design** – Works on desktop and mobile browsers

---

## Technology Stack

| Layer | Technology |
|-------|-----------|
| Frontend | HTML5, CSS3, Vanilla JavaScript, Chart.js |
| Backend | Node.js, Express.js |
| Database | PostgreSQL (Supabase) |
| Authentication | JWT + bcrypt |
| Testing | Jest + Supertest |
| Version Control | Git + GitHub |

---

## Project Structure

```
visual-gym-tracker-pro/
├── config/
│   └── database.js          # Supabase client configuration
├── database/
│   └── schema.sql           # PostgreSQL schema + default exercise data
├── docs/
│   ├── PROGRESS_REPORT_1.md # Week 9 progress report
│   └── PROGRESS_REPORT_3.md # Week 11 progress report
├── middleware/
│   └── auth.js              # JWT authentication middleware
├── public/
│   ├── index.html           # Main frontend HTML
│   ├── styles.css           # CSS styles
│   └── app.js               # Frontend JavaScript
├── routes/
│   ├── auth.js              # Register and login endpoints
│   ├── exercises.js         # Exercise management endpoints
│   └── workouts.js          # Workout scheduling and logging endpoints
├── tests/
│   └── app.test.js          # Jest + Supertest test suite (21 tests)
├── .env.example             # Environment variables template
├── .gitignore
├── package.json
├── server.js                # Express server entry point
└── README.md
```

---

## API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login and receive JWT token |

### Exercises
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/exercises` | Get all exercises (default + custom) |
| POST | `/api/exercises` | Create custom exercise |
| DELETE | `/api/exercises/:id` | Delete custom exercise |

### Workouts
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/workouts/:date` | Get workouts for a specific date |
| POST | `/api/workouts` | Schedule a new workout |
| PUT | `/api/workouts/:id` | Update workout status and log completion |
| GET | `/api/workouts/history/:exerciseId` | Get exercise history for progress chart |

---

## Setup Instructions

### Prerequisites
- Node.js v14 or higher
- npm
- Supabase account (free tier)

### 1. Clone the Repository
```bash
git clone https://github.com/MuditMarkan/COMP2154_Gym_Website.git
cd COMP2154_Gym_Website
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Set Up Supabase Database
1. Create a new project at [supabase.com](https://supabase.com)
2. Go to **SQL Editor** in your Supabase dashboard
3. Copy and paste the contents of `database/schema.sql`
4. Click **Run** to create tables and seed default exercises

### 4. Configure Environment Variables
1. Copy `.env.example` to `.env`
2. Fill in your Supabase credentials from **Settings → API**:

```env
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_ANON_KEY=your_publishable_key_here
JWT_SECRET=your_random_secret_string_here
```

### 5. Start the Application
```bash
# Development (with auto-restart)
npm run dev

# Production
npm start
```

Open your browser at `http://localhost:3000`

---

## Running Tests

The project includes a full automated test suite with 21 tests covering all API endpoints.

```bash
npm test
```

### Test Results

```
Tests:       21 passed, 21 total
Test Suites: 1 passed, 1 total
```

| Suite | Tests | Status |
|-------|-------|--------|
| Authentication | 5 | ✅ Passing |
| Exercise Library | 6 | ✅ Passing |
| Workout Scheduling & Logging | 5 | ✅ Passing |
| Progress Tracking | 2 | ✅ Passing |
| Security & Authorization | 2 | ✅ Passing |

---

## Database Schema

Three main tables:

- **users** – Stores registered user accounts (UUID, username, email, hashed password)
- **exercises** – Default and custom exercises (UUID, name, muscle group, image, tutorial URL)
- **workouts** – Scheduled and completed workout sessions (UUID, user, exercise, date, sets, reps, weight, status)

---

## Security

- Passwords hashed with bcrypt (10 salt rounds)
- JWT tokens with 24-hour expiry
- All API routes protected by JWT middleware
- Environment variables excluded from version control via `.gitignore`
- Row Level Security disabled in favor of server-side JWT authorization

---

## Progress Reports

| Report | Week | Focus |
|--------|------|-------|
| [Progress Report 1](docs/PROGRESS_REPORT_1.md) | Week 9 | Core implementation, database setup, authentication |
| [Progress Report 3](docs/PROGRESS_REPORT_3.md) | Week 11 | Testing, validation, bug fixes |

---

## License

MIT License – Group 71, COMP 2154
