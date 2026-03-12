const express = require('express');
const supabase = require('../config/database');
const authenticateToken = require('../middleware/auth');
const router = express.Router();

// Get all exercises (default + user custom)
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { data: exercises, error } = await supabase
      .from('exercises')
      .select('*')
      .or(`user_id.is.null,user_id.eq.${req.user.userId}`)
      .order('name');

    if (error) {
      return res.status(400).json({ message: error.message });
    }

    res.json(exercises);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Create custom exercise
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { name, muscle_group, image_url, tutorial_url } = req.body;

    const { data: exercise, error } = await supabase
      .from('exercises')
      .insert([
        {
          name,
          muscle_group,
          image_url,
          tutorial_url,
          user_id: req.user.userId,
          is_custom: true
        }
      ])
      .select()
      .single();

    if (error) {
      return res.status(400).json({ message: error.message });
    }

    res.status(201).json(exercise);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Delete custom exercise
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const { error } = await supabase
      .from('exercises')
      .delete()
      .eq('id', id)
      .eq('user_id', req.user.userId)
      .eq('is_custom', true);

    if (error) {
      return res.status(400).json({ message: error.message });
    }

    res.json({ message: 'Exercise deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;