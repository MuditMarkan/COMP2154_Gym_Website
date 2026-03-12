-- Visual Gym Tracker Pro Database Schema
-- Run this in your Supabase SQL editor

-- Fix: Disable RLS if tables already exist with RLS enabled
ALTER TABLE IF EXISTS users DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS exercises DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS workouts DISABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view own profile" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;
DROP POLICY IF EXISTS "Users can view exercises" ON exercises;
DROP POLICY IF EXISTS "Users can create custom exercises" ON exercises;
DROP POLICY IF EXISTS "Users can delete own custom exercises" ON exercises;
DROP POLICY IF EXISTS "Users can view own workouts" ON workouts;
DROP POLICY IF EXISTS "Users can create own workouts" ON workouts;
DROP POLICY IF EXISTS "Users can update own workouts" ON workouts;
DROP POLICY IF EXISTS "Users can delete own workouts" ON workouts;

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    username VARCHAR(50) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Exercises table (includes default and custom exercises)
CREATE TABLE IF NOT EXISTS exercises (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    muscle_group VARCHAR(50) NOT NULL,
    image_url TEXT,
    tutorial_url TEXT,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    is_custom BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Workouts table
CREATE TABLE IF NOT EXISTS workouts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    exercise_id UUID NOT NULL REFERENCES exercises(id) ON DELETE CASCADE,
    workout_date DATE NOT NULL,
    planned_sets INTEGER NOT NULL,
    planned_reps INTEGER NOT NULL,
    planned_weight DECIMAL(5,2) NOT NULL,
    completed_sets INTEGER,
    completed_reps INTEGER,
    completed_weight DECIMAL(5,2),
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'skipped')),
    completed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert default exercises (only if not already inserted)
INSERT INTO exercises (name, muscle_group, image_url, tutorial_url, is_custom) 
SELECT * FROM (VALUES
    ('Bench Press', 'Chest', 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=300&h=200&fit=crop', 'https://www.youtube.com/watch?v=rT7DgCr-3pg', FALSE),
    ('Squat', 'Legs', 'https://images.unsplash.com/photo-1566241440091-ec10de8db2e1?w=300&h=200&fit=crop', 'https://www.youtube.com/watch?v=ultWZbUMPL8', FALSE),
    ('Deadlift', 'Back', 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=300&h=200&fit=crop', 'https://www.youtube.com/watch?v=ytGaGIn3SjE', FALSE),
    ('Overhead Press', 'Shoulders', 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=300&h=200&fit=crop', 'https://www.youtube.com/watch?v=2yjwXTZQDDI', FALSE),
    ('Pull-ups', 'Back', 'https://images.unsplash.com/photo-1599058917212-d750089bc07e?w=300&h=200&fit=crop', 'https://www.youtube.com/watch?v=eGo4IYlbE5g', FALSE),
    ('Dips', 'Triceps', 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=300&h=200&fit=crop', 'https://www.youtube.com/watch?v=2z8JmcrW-As', FALSE),
    ('Barbell Row', 'Back', 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=300&h=200&fit=crop', 'https://www.youtube.com/watch?v=FWJR5Ve8bnQ', FALSE),
    ('Incline Bench Press', 'Chest', 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=300&h=200&fit=crop', 'https://www.youtube.com/watch?v=jPLdzuHckI8', FALSE),
    ('Leg Press', 'Legs', 'https://images.unsplash.com/photo-1566241440091-ec10de8db2e1?w=300&h=200&fit=crop', 'https://www.youtube.com/watch?v=IZxyjW7MPJQ', FALSE),
    ('Lat Pulldown', 'Back', 'https://images.unsplash.com/photo-1599058917212-d750089bc07e?w=300&h=200&fit=crop', 'https://www.youtube.com/watch?v=CAwf7n6Luuc', FALSE),
    ('Bicep Curls', 'Biceps', 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=300&h=200&fit=crop', 'https://www.youtube.com/watch?v=ykJmrZ5v0Oo', FALSE),
    ('Tricep Extensions', 'Triceps', 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=300&h=200&fit=crop', 'https://www.youtube.com/watch?v=_gsUck-7M74', FALSE),
    ('Leg Curls', 'Hamstrings', 'https://images.unsplash.com/photo-1566241440091-ec10de8db2e1?w=300&h=200&fit=crop', 'https://www.youtube.com/watch?v=ELOCsoDSmrg', FALSE),
    ('Calf Raises', 'Calves', 'https://images.unsplash.com/photo-1566241440091-ec10de8db2e1?w=300&h=200&fit=crop', 'https://www.youtube.com/watch?v=gwLzBJYoWlI', FALSE),
    ('Plank', 'Core', 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=300&h=200&fit=crop', 'https://www.youtube.com/watch?v=ASdvN_XEl_c', FALSE)
) AS new_exercises(name, muscle_group, image_url, tutorial_url, is_custom)
WHERE NOT EXISTS (
    SELECT 1 FROM exercises WHERE exercises.name = new_exercises.name AND exercises.is_custom = FALSE
);

-- Create indexes for better performance (only if they don't exist)
CREATE INDEX IF NOT EXISTS idx_workouts_user_date ON workouts(user_id, workout_date);
CREATE INDEX IF NOT EXISTS idx_workouts_exercise ON workouts(exercise_id);
CREATE INDEX IF NOT EXISTS idx_exercises_user ON exercises(user_id);

-- Enable Row Level Security (RLS) - Disabled for custom auth system
-- ALTER TABLE users ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE exercises ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE workouts ENABLE ROW LEVEL SECURITY;

-- Note: RLS policies commented out since we're using custom JWT authentication
-- instead of Supabase's built-in auth system. Our middleware handles authorization.

-- If you want to enable RLS later with Supabase Auth, uncomment the lines above
-- and update the authentication system to use Supabase's auth.signUp() and auth.signIn()