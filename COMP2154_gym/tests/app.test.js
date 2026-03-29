const request = require('supertest');
const express = require('express');
const cors = require('cors');
require('dotenv').config();

// Build app without calling app.listen()
const app = express();
app.use(cors());
app.use(express.json());
app.use('/api/auth', require('../routes/auth'));
app.use('/api/exercises', require('../routes/exercises'));
app.use('/api/workouts', require('../routes/workouts'));

// ─── Test State ────────────────────────────────────────────────────────────────
let authToken = '';
let userId = '';
let customExerciseId = '';
let workoutId = '';
let defaultExerciseId = '';

const TEST_EMAIL = `testuser_${Date.now()}@gymtracker.com`;
const TEST_PASSWORD = 'TestPass123!';
const TEST_USERNAME = 'TestUser';
const TODAY = new Date().toISOString().split('T')[0];

// ─── 1. AUTH TESTS ─────────────────────────────────────────────────────────────
describe('1. Authentication', () => {

  test('POST /api/auth/register - should register a new user', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ username: TEST_USERNAME, email: TEST_EMAIL, password: TEST_PASSWORD });

    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toContain('Registration successful');
  });

  test('POST /api/auth/register - should reject duplicate email', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ username: TEST_USERNAME, email: TEST_EMAIL, password: TEST_PASSWORD });

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBe('User already exists');
  });

  test('POST /api/auth/login - should login with correct credentials', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: TEST_EMAIL, password: TEST_PASSWORD });

    expect(res.statusCode).toBe(200);
    expect(res.body.token).toBeDefined();
    expect(res.body.user.email).toBe(TEST_EMAIL);
    expect(res.body.user.username).toBe(TEST_USERNAME);

    // Save token for subsequent tests
    authToken = res.body.token;
    userId = res.body.user.id;
  });

  test('POST /api/auth/login - should reject wrong password', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: TEST_EMAIL, password: 'WrongPassword!' });

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toContain('Invalid credentials');
  });

  test('POST /api/auth/login - should reject non-existent email', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'nobody@nowhere.com', password: TEST_PASSWORD });

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toContain('Invalid credentials');
  });

});

// ─── 2. EXERCISE TESTS ─────────────────────────────────────────────────────────
describe('2. Exercise Library', () => {

  test('GET /api/exercises - should reject request without token', async () => {
    const res = await request(app).get('/api/exercises');
    expect(res.statusCode).toBe(401);
  });

  test('GET /api/exercises - should return exercises with valid token', async () => {
    const res = await request(app)
      .get('/api/exercises')
      .set('Authorization', `Bearer ${authToken}`);

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThanOrEqual(15); // at least 15 default exercises

    // Save a default exercise ID for workout tests
    defaultExerciseId = res.body[0].id;
  });

  test('GET /api/exercises - should include required fields', async () => {
    const res = await request(app)
      .get('/api/exercises')
      .set('Authorization', `Bearer ${authToken}`);

    const exercise = res.body[0];
    expect(exercise).toHaveProperty('id');
    expect(exercise).toHaveProperty('name');
    expect(exercise).toHaveProperty('muscle_group');
  });

  test('POST /api/exercises - should create a custom exercise', async () => {
    const res = await request(app)
      .post('/api/exercises')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        name: 'Test Custom Exercise',
        muscle_group: 'Test Muscle',
        image_url: '',
        tutorial_url: ''
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.name).toBe('Test Custom Exercise');
    expect(res.body.is_custom).toBe(true);

    customExerciseId = res.body.id;
  });

  test('POST /api/exercises - should reject without token', async () => {
    const res = await request(app)
      .post('/api/exercises')
      .send({ name: 'Unauthorized Exercise', muscle_group: 'None' });

    expect(res.statusCode).toBe(401);
  });

  test('DELETE /api/exercises/:id - should delete custom exercise', async () => {
    const res = await request(app)
      .delete(`/api/exercises/${customExerciseId}`)
      .set('Authorization', `Bearer ${authToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe('Exercise deleted successfully');
  });

});

// ─── 3. WORKOUT TESTS ──────────────────────────────────────────────────────────
describe('3. Workout Scheduling & Logging', () => {

  test('GET /api/workouts/:date - should reject without token', async () => {
    const res = await request(app).get(`/api/workouts/${TODAY}`);
    expect(res.statusCode).toBe(401);
  });

  test('GET /api/workouts/:date - should return empty array for new date', async () => {
    const res = await request(app)
      .get(`/api/workouts/${TODAY}`)
      .set('Authorization', `Bearer ${authToken}`);

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  test('POST /api/workouts - should schedule a workout', async () => {
    const res = await request(app)
      .post('/api/workouts')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        exercise_id: defaultExerciseId,
        workout_date: TODAY,
        planned_sets: 3,
        planned_reps: 10,
        planned_weight: 50
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.planned_sets).toBe(3);
    expect(res.body.planned_reps).toBe(10);
    expect(parseFloat(res.body.planned_weight)).toBe(50); // handle string or number
    expect(res.body.status).toBe('pending');
    expect(res.body.exercises).toBeDefined();

    workoutId = res.body.id;
    console.log('Saved workoutId:', workoutId);
  });

  test('GET /api/workouts/:date - should return scheduled workout', async () => {
    const res = await request(app)
      .get(`/api/workouts/${TODAY}`)
      .set('Authorization', `Bearer ${authToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.length).toBeGreaterThan(0);

    // workoutId may not be set if previous test failed, just check array is not empty
    if (workoutId) {
      const workout = res.body.find(w => w.id === workoutId);
      expect(workout).toBeDefined();
    } else {
      expect(res.body[0]).toHaveProperty('status');
    }
  });

  test('PUT /api/workouts/:id - should mark workout as completed', async () => {
    // If workoutId not set, schedule one first
    if (!workoutId) {
      const scheduleRes = await request(app)
        .post('/api/workouts')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          exercise_id: defaultExerciseId,
          workout_date: TODAY,
          planned_sets: 3,
          planned_reps: 10,
          planned_weight: 50
        });
      workoutId = scheduleRes.body.id;
    }

    const res = await request(app)
      .put(`/api/workouts/${workoutId}`)
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        status: 'completed',
        completed_sets: 3,
        completed_reps: 10,
        completed_weight: 50
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe('completed');
    expect(res.body.completed_sets).toBe(3);
    expect(res.body.completed_at).not.toBeNull();
  });

  test('PUT /api/workouts/:id - should mark workout as skipped', async () => {
    // Schedule another workout to skip
    const scheduleRes = await request(app)
      .post('/api/workouts')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        exercise_id: defaultExerciseId,
        workout_date: TODAY,
        planned_sets: 2,
        planned_reps: 8,
        planned_weight: 30
      });

    const skipId = scheduleRes.body.id;

    const res = await request(app)
      .put(`/api/workouts/${skipId}`)
      .set('Authorization', `Bearer ${authToken}`)
      .send({ status: 'skipped' });

    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe('skipped');
  });

});

// ─── 4. PROGRESS HISTORY TESTS ─────────────────────────────────────────────────
describe('4. Progress Tracking', () => {

  test('GET /api/workouts/history/:exerciseId - should return workout history', async () => {
    const res = await request(app)
      .get(`/api/workouts/history/${defaultExerciseId}`)
      .set('Authorization', `Bearer ${authToken}`);

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  test('GET /api/workouts/history/:exerciseId - should reject without token', async () => {
    const res = await request(app)
      .get(`/api/workouts/history/${defaultExerciseId}`);

    expect(res.statusCode).toBe(401);
  });

});

// ─── 5. SECURITY TESTS ─────────────────────────────────────────────────────────
describe('5. Security & Authorization', () => {

  test('All protected routes should reject expired/invalid token', async () => {
    const fakeToken = 'Bearer invalidtoken123';

    const exerciseRes = await request(app)
      .get('/api/exercises')
      .set('Authorization', fakeToken);
    expect(exerciseRes.statusCode).toBe(403);

    const workoutRes = await request(app)
      .get(`/api/workouts/${TODAY}`)
      .set('Authorization', fakeToken);
    expect(workoutRes.statusCode).toBe(403);
  });

  test('Should not allow deleting another user exercise', async () => {
    // Try to delete a default exercise (user_id is null, not owned by test user)
    const res = await request(app)
      .delete(`/api/exercises/${defaultExerciseId}`)
      .set('Authorization', `Bearer ${authToken}`);

    // Should return 200 but not actually delete (no matching user_id + is_custom)
    expect(res.statusCode).toBe(200);

    // Verify default exercise still exists
    const checkRes = await request(app)
      .get('/api/exercises')
      .set('Authorization', `Bearer ${authToken}`);
    const stillExists = checkRes.body.find(e => e.id === defaultExerciseId);
    expect(stillExists).toBeDefined();
  });

});