const express = require('express');
const supabase = require('../config/database');
const authenticateToken = require('../middleware/auth');
const router = express.Router();

// Get workouts for a specific date
router.get('/:date', authenticateToken, async (req, res) => {
  try {
    const { date } = req.params;

    const { data: workouts, error } = await supabase
      .from('workouts')
      .select(`
        *,
        exercises (
          id,
          name,
          muscle_group,
          image_url,
          tutorial_url
        )
      `)
      .eq('user_id', req.user.userId)
      .eq('workout_date', date)
      .order('created_at');

    if (error) {
      return res.status(400).json({ message: error.message });
    }

    res.json(workouts);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Schedule workout
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { exercise_id, workout_date, planned_sets, planned_reps, planned_weight } = req.body;

    const { data: workout, error } = await supabase
      .from('workouts')
      .insert([
        {
          user_id: req.user.userId,
          exercise_id,
          workout_date,
          planned_sets,
          planned_reps,
          planned_weight,
          status: 'pending'
        }
      ])
      .select(`
        *,
        exercises (
          id,
          name,
          muscle_group,
          image_url,
          tutorial_url
        )
      `)
      .single();

    if (error) {
      return res.status(400).json({ message: error.message });
    }

    res.status(201).json(workout);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update workout status and log sets
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { status, completed_sets, completed_reps, completed_weight } = req.body;

    const { data: workout, error } = await supabase
      .from('workouts')
      .update({
        status,
        completed_sets,
        completed_reps,
        completed_weight,
        completed_at: status === 'completed' ? new Date().toISOString() : null
      })
      .eq('id', id)
      .eq('user_id', req.user.userId)
      .select(`
        *,
        exercises (
          id,
          name,
          muscle_group,
          image_url,
          tutorial_url
        )
      `)
      .single();

    if (error) {
      return res.status(400).json({ message: error.message });
    }

    res.json(workout);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get workout history for progress tracking
router.get('/history/:exerciseId', authenticateToken, async (req, res) => {
  try {
    const { exerciseId } = req.params;

    const { data: history, error } = await supabase
      .from('workouts')
      .select('workout_date, completed_weight, completed_reps, completed_sets')
      .eq('user_id', req.user.userId)
      .eq('exercise_id', exerciseId)
      .eq('status', 'completed')
      .order('workout_date');

    if (error) {
      return res.status(400).json({ message: error.message });
    }

    res.json(history);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;