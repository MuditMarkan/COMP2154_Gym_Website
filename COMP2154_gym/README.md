# Visual Gym Tracker Pro

A simple, visual workout tracking web application designed for gym enthusiasts who want to plan workouts, log exercises efficiently, and track progress over time.

## Features

- **User Authentication**: Secure registration and login system
- **Workout Planning**: Schedule exercises for future dates
- **Visual Exercise Library**: 15+ default exercises with images and tutorial links
- **Custom Exercises**: Add and manage your own exercises
- **Workout Logging**: Real-time logging with countdown timer
- **Progress Tracking**: Visual charts showing workout history
- **Responsive Design**: Works on desktop and mobile devices

## Technology Stack

- **Frontend**: HTML5, CSS3, JavaScript, Chart.js
- **Backend**: Node.js, Express.js
- **Database**: PostgreSQL (Supabase)
- **Authentication**: JWT tokens with bcrypt password hashing

## Setup Instructions

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Supabase account

### 1. Clone the Repository

```bash
git clone <repository-url>
cd visual-gym-tracker-pro
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up Supabase Database

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to the SQL editor in your Supabase dashboard
3. Copy and paste the contents of `database/schema.sql`
4. Run the SQL to create tables and insert default exercises

### 4. Configure Environment Variables

1. Copy `.env.example` to `.env`
2. Fill in your Supabase credentials:

```env
SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anon_key
JWT_SECRET=your_random_jwt_secret_string
```

### 5. Run the Application

For development:
```bash
npm run dev
```

For production:
```bash
npm start
```

The application will be available at `http://localhost:3000`

## Usage

### Getting Started

1. **Register**: Create a new account with username, email, and password
2. **Login**: Sign in with your credentials
3. **Plan Workout**: Select a date and add exercises with sets, reps, and weight
4. **Log Workout**: Use the timer and update exercise status during your workout
5. **Track Progress**: View charts showing your progress over time

### Key Features

#### Dashboard
- Select workout date
- Add exercises to your workout plan
- View scheduled exercises with planned sets/reps/weight
- Update exercise status (pending/completed/skipped)
- Access workout timer

#### Exercise Library
- Browse 15+ default exercises with images
- View tutorial links for proper form
- Add custom exercises with your own images and tutorials
- Delete custom exercises you no longer need

#### Progress Tracking
- Select any exercise to view progress chart
- See weight progression over time
- Track your improvement across workout sessions

#### Workout Timer
- Built-in countdown timer for rest periods
- Start, pause, and reset functionality
- Modal overlay for easy access during workouts

## Project Structure

```
visual-gym-tracker-pro/
├── config/
│   └── database.js          # Supabase configuration
├── database/
│   └── schema.sql           # Database schema and default data
├── middleware/
│   └── auth.js              # JWT authentication middleware
├── public/
│   ├── index.html           # Main HTML file
│   ├── styles.css           # CSS styles
│   └── app.js               # Frontend JavaScript
├── routes/
│   ├── auth.js              # Authentication routes
│   ├── exercises.js         # Exercise management routes
│   └── workouts.js          # Workout management routes
├── .env.example             # Environment variables template
├── package.json             # Node.js dependencies
├── server.js                # Express server setup
└── README.md                # This file
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user

### Exercises
- `GET /api/exercises` - Get all exercises (default + user custom)
- `POST /api/exercises` - Create custom exercise
- `DELETE /api/exercises/:id` - Delete custom exercise

### Workouts
- `GET /api/workouts/:date` - Get workouts for specific date
- `POST /api/workouts` - Schedule new workout
- `PUT /api/workouts/:id` - Update workout status/completion
- `GET /api/workouts/history/:exerciseId` - Get exercise history for progress

## Team Members

- **Mudit Markan** (101575511) - Full-Stack Lead, QA tester for frontend
- **Ahmed Abdo** (101589014) - Backend Developer, QA tester for backend  
- **Vincenzo Iori** (101489724) - Frontend Developer, Documentation lead

## Course Information

- **Course**: System Development Project (COMP 2154)
- **Team**: Group 71
- **Deliverable**: Project Implementation

## License

This project is licensed under the MIT License - see the package.json file for details.

## Supabase 
password: Muditmarkan@2945