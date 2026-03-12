// Global variables
let currentUser = null;
let currentWorkouts = [];
let exercises = [];
let timerInterval = null;
let timerSeconds = 0;
let isTimerRunning = false;

// Initialize app
document.addEventListener('DOMContentLoaded', function() {
    // Check if user is logged in
    const token = localStorage.getItem('token');
    if (token) {
        currentUser = JSON.parse(localStorage.getItem('user'));
        showMainApp();
        loadExercises();
        setTodayDate();
        loadWorkouts();
    }

    // Set up form event listeners
    document.getElementById('login-form').addEventListener('submit', handleLogin);
    document.getElementById('register-form').addEventListener('submit', handleRegister);
});

// Authentication functions
function showLogin() {
    document.getElementById('auth-title').textContent = 'Login to Visual Gym Tracker Pro';
    document.getElementById('login-form').style.display = 'flex';
    document.getElementById('register-form').style.display = 'none';
}

function showRegister() {
    document.getElementById('auth-title').textContent = 'Register for Visual Gym Tracker Pro';
    document.getElementById('login-form').style.display = 'none';
    document.getElementById('register-form').style.display = 'flex';
}

async function handleLogin(e) {
    e.preventDefault();
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;

    try {
        const response = await fetch('/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();
        
        if (response.ok) {
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));
            currentUser = data.user;
            showMainApp();
            loadExercises();
            setTodayDate();
            loadWorkouts();
        } else {
            alert(data.message);
        }
    } catch (error) {
        alert('Login failed. Please try again.');
    }
}

async function handleRegister(e) {
    e.preventDefault();
    const username = document.getElementById('register-username').value;
    const email = document.getElementById('register-email').value;
    const password = document.getElementById('register-password').value;

    try {
        const response = await fetch('/api/auth/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, email, password })
        });

        const data = await response.json();
        
        if (response.ok) {
            alert(data.message || 'Registration successful! Please login with your credentials.');
            // Clear form
            document.getElementById('register-username').value = '';
            document.getElementById('register-email').value = '';
            document.getElementById('register-password').value = '';
            // Switch to login form
            showLogin();
            // Pre-fill email for convenience
            document.getElementById('login-email').value = email;
        } else {
            alert(data.message);
        }
    } catch (error) {
        alert('Registration failed. Please try again.');
    }
}

function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    currentUser = null;
    document.getElementById('auth-section').style.display = 'flex';
    document.getElementById('main-app').style.display = 'none';
    document.getElementById('navbar').style.display = 'none';
    showLogin();
}

function showMainApp() {
    document.getElementById('auth-section').style.display = 'none';
    document.getElementById('main-app').style.display = 'block';
    document.getElementById('navbar').style.display = 'block';
    showDashboard();
}

// Navigation functions
function showDashboard() {
    hideAllSections();
    document.getElementById('dashboard').style.display = 'block';
}

function showExercises() {
    hideAllSections();
    document.getElementById('exercises').style.display = 'block';
    loadExercisesGrid();
}

function showProgress() {
    hideAllSections();
    document.getElementById('progress').style.display = 'block';
    loadProgressExercises();
}

function hideAllSections() {
    document.getElementById('dashboard').style.display = 'none';
    document.getElementById('exercises').style.display = 'none';
    document.getElementById('progress').style.display = 'none';
}

// Utility functions
function setTodayDate() {
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('workout-date').value = today;
}

function getAuthHeaders() {
    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
    };
}

// Exercise functions
async function loadExercises() {
    try {
        const response = await fetch('/api/exercises', {
            headers: getAuthHeaders()
        });

        if (response.ok) {
            exercises = await response.json();
            populateExerciseSelect();
        }
    } catch (error) {
        console.error('Failed to load exercises:', error);
    }
}

function populateExerciseSelect() {
    const select = document.getElementById('exercise-select');
    const progressSelect = document.getElementById('progress-exercise-select');
    
    select.innerHTML = '<option value="">Select an exercise...</option>';
    progressSelect.innerHTML = '<option value="">Select exercise to view progress...</option>';
    
    exercises.forEach(exercise => {
        const option = document.createElement('option');
        option.value = exercise.id;
        option.textContent = `${exercise.name} (${exercise.muscle_group})`;
        select.appendChild(option);
        
        const progressOption = option.cloneNode(true);
        progressSelect.appendChild(progressOption);
    });
}

async function loadExercisesGrid() {
    const grid = document.getElementById('exercises-grid');
    grid.innerHTML = '';

    exercises.forEach(exercise => {
        const card = document.createElement('div');
        card.className = 'exercise-card';
        
        card.innerHTML = `
            <img src="${exercise.image_url || 'https://via.placeholder.com/300x150?text=Exercise'}" 
                 alt="${exercise.name}" class="exercise-image" 
                 onerror="this.src='https://via.placeholder.com/300x150?text=Exercise'">
            <h3>${exercise.name}</h3>
            <p class="muscle-group">${exercise.muscle_group}</p>
            <div class="exercise-actions">
                ${exercise.tutorial_url ? `<button class="btn-tutorial" onclick="window.open('${exercise.tutorial_url}', '_blank')">Tutorial</button>` : ''}
                ${exercise.is_custom ? `<button class="btn-delete" onclick="deleteExercise(${exercise.id})">Delete</button>` : ''}
            </div>
        `;
        
        grid.appendChild(card);
    });
}

function showAddExerciseForm() {
    document.getElementById('add-exercise-form').style.display = 'block';
}

function hideAddExerciseForm() {
    document.getElementById('add-exercise-form').style.display = 'none';
    // Clear form
    document.getElementById('exercise-name').value = '';
    document.getElementById('muscle-group').value = '';
    document.getElementById('image-url').value = '';
    document.getElementById('tutorial-url').value = '';
}

async function addCustomExercise() {
    const name = document.getElementById('exercise-name').value;
    const muscle_group = document.getElementById('muscle-group').value;
    const image_url = document.getElementById('image-url').value;
    const tutorial_url = document.getElementById('tutorial-url').value;

    if (!name || !muscle_group) {
        alert('Please fill in exercise name and muscle group');
        return;
    }

    try {
        const response = await fetch('/api/exercises', {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify({ name, muscle_group, image_url, tutorial_url })
        });

        if (response.ok) {
            hideAddExerciseForm();
            loadExercises();
            loadExercisesGrid();
        } else {
            const data = await response.json();
            alert(data.message);
        }
    } catch (error) {
        alert('Failed to add exercise');
    }
}

async function deleteExercise(exerciseId) {
    if (!confirm('Are you sure you want to delete this exercise?')) {
        return;
    }

    try {
        const response = await fetch(`/api/exercises/${exerciseId}`, {
            method: 'DELETE',
            headers: getAuthHeaders()
        });

        if (response.ok) {
            loadExercises();
            loadExercisesGrid();
        } else {
            const data = await response.json();
            alert(data.message);
        }
    } catch (error) {
        alert('Failed to delete exercise');
    }
}

// Workout functions
async function loadWorkouts() {
    const date = document.getElementById('workout-date').value;
    if (!date) return;

    try {
        const response = await fetch(`/api/workouts/${date}`, {
            headers: getAuthHeaders()
        });

        if (response.ok) {
            currentWorkouts = await response.json();
            displayWorkouts();
        }
    } catch (error) {
        console.error('Failed to load workouts:', error);
    }
}

function displayWorkouts() {
    const container = document.getElementById('workout-list');
    container.innerHTML = '';

    if (currentWorkouts.length === 0) {
        container.innerHTML = '<p>No workouts scheduled for this date. Add exercises above to get started!</p>';
        return;
    }

    currentWorkouts.forEach(workout => {
        const item = document.createElement('div');
        item.className = 'workout-item';
        
        item.innerHTML = `
            <div class="workout-info">
                <h4>${workout.exercises.name}</h4>
                <div class="workout-details">
                    <span>Planned: ${workout.planned_sets} sets × ${workout.planned_reps} reps @ ${workout.planned_weight}lbs</span>
                    ${workout.status === 'completed' ? 
                        `<span>Completed: ${workout.completed_sets} sets × ${workout.completed_reps} reps @ ${workout.completed_weight}lbs</span>` : 
                        ''}
                </div>
            </div>
            <div class="workout-actions">
                <button class="status-btn status-${workout.status}" onclick="updateWorkoutStatus('${workout.id}', '${workout.status}')">${workout.status.toUpperCase()}</button>
                <button onclick="showTimer('${workout.id}', '${workout.exercises.name}', ${workout.planned_sets})">Timer</button>
            </div>
        `;
        
        container.appendChild(item);
    });
}

async function addExerciseToWorkout() {
    const exerciseId = document.getElementById('exercise-select').value;
    const plannedSets = document.getElementById('planned-sets').value;
    const plannedReps = document.getElementById('planned-reps').value;
    const plannedWeight = document.getElementById('planned-weight').value;
    const workoutDate = document.getElementById('workout-date').value;

    if (!exerciseId || !plannedSets || !plannedReps || !plannedWeight) {
        alert('Please fill in all fields');
        return;
    }

    try {
        const response = await fetch('/api/workouts', {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify({
                exercise_id: exerciseId,
                workout_date: workoutDate,
                planned_sets: parseInt(plannedSets),
                planned_reps: parseInt(plannedReps),
                planned_weight: parseFloat(plannedWeight)
            })
        });

        if (response.ok) {
            // Clear form
            document.getElementById('exercise-select').value = '';
            document.getElementById('planned-sets').value = '';
            document.getElementById('planned-reps').value = '';
            document.getElementById('planned-weight').value = '';
            
            loadWorkouts();
        } else {
            const data = await response.json();
            alert(data.message);
        }
    } catch (error) {
        alert('Failed to add exercise to workout');
    }
}

async function updateWorkoutStatus(workoutId, currentStatus) {
    let newStatus;
    let completedSets, completedReps, completedWeight;

    if (currentStatus === 'pending') {
        const action = prompt('Mark as:\n1. Completed\n2. Skipped\nEnter 1 or 2:');
        if (action === '1') {
            newStatus = 'completed';
            completedSets = prompt('How many sets did you complete?');
            completedReps = prompt('How many reps per set?');
            completedWeight = prompt('What weight did you use?');
            
            if (!completedSets || !completedReps || !completedWeight) {
                alert('Please provide all completion details');
                return;
            }
        } else if (action === '2') {
            newStatus = 'skipped';
        } else {
            return;
        }
    } else {
        newStatus = 'pending';
    }

    try {
        const response = await fetch(`/api/workouts/${workoutId}`, {
            method: 'PUT',
            headers: getAuthHeaders(),
            body: JSON.stringify({
                status: newStatus,
                completed_sets: completedSets ? parseInt(completedSets) : null,
                completed_reps: completedReps ? parseInt(completedReps) : null,
                completed_weight: completedWeight ? parseFloat(completedWeight) : null
            })
        });

        if (response.ok) {
            loadWorkouts();
        } else {
            const data = await response.json();
            alert(data.message);
        }
    } catch (error) {
        alert('Failed to update workout status');
    }
}

// Timer functions
let currentWorkoutId = null;
let currentExerciseName = '';
let currentSet = 1;
let totalSets = 0;

function showTimer(workoutId, exerciseName, sets) {
    currentWorkoutId = workoutId;
    currentExerciseName = exerciseName;
    currentSet = 1;
    totalSets = sets;
    
    // Find the workout to get exercise details
    const workout = currentWorkouts.find(w => w.id === workoutId);
    if (!workout) return;
    
    const exercise = workout.exercises;
    
    // Calculate recommended rest time - 30 seconds between sets
    const restTime = 30; // 30 seconds default rest
    timerSeconds = restTime;
    
    // Set exercise info
    document.getElementById('timer-exercise-name').textContent = exercise.name;
    document.getElementById('timer-muscle-group').textContent = exercise.muscle_group;
    
    // Load video if tutorial URL exists
    const videoContainer = document.getElementById('timer-video-container');
    const videoIframe = document.getElementById('timer-video');
    
    if (exercise.tutorial_url) {
        // Convert YouTube URL to embed format
        let embedUrl = exercise.tutorial_url;
        
        // Handle different YouTube URL formats
        if (embedUrl.includes('youtube.com/watch?v=')) {
            const videoId = embedUrl.split('v=')[1].split('&')[0];
            embedUrl = `https://www.youtube.com/embed/${videoId}`;
        } else if (embedUrl.includes('youtu.be/')) {
            const videoId = embedUrl.split('youtu.be/')[1].split('?')[0];
            embedUrl = `https://www.youtube.com/embed/${videoId}`;
        }
        
        videoIframe.src = embedUrl;
        videoContainer.style.display = 'block';
    } else {
        // Show placeholder if no video
        videoContainer.innerHTML = '<div style="display: flex; align-items: center; justify-content: center; height: 100%; background: #f0f0f0; color: #666;">No tutorial video available</div>';
    }
    
    // Update timer display
    document.getElementById('timer-modal').style.display = 'flex';
    document.getElementById('timer-set-title').textContent = `${exerciseName} - Set ${currentSet}/${totalSets}`;
    document.querySelector('.timer-info').textContent = `Rest time: ${restTime}s between sets`;
    updateTimerDisplay();
}

function closeTimer() {
    document.getElementById('timer-modal').style.display = 'none';
    
    // Stop video playback
    const videoIframe = document.getElementById('timer-video');
    videoIframe.src = '';
    
    if (isTimerRunning) {
        pauseTimer();
    }
    resetTimer();
}

function startTimer() {
    if (!isTimerRunning) {
        isTimerRunning = true;
        document.getElementById('start-timer').style.display = 'none';
        document.getElementById('pause-timer').style.display = 'inline-block';
        
        timerInterval = setInterval(() => {
            timerSeconds--;
            updateTimerDisplay();
            
            // Alert when timer reaches zero
            if (timerSeconds <= 0) {
                pauseTimer();
                playTimerAlert();
                
                // Move to next set
                if (currentSet < totalSets) {
                    currentSet++;
                    document.getElementById('timer-set-title').textContent = `${currentExerciseName} - Set ${currentSet}/${totalSets}`;
                    timerSeconds = 30; // Reset for next set (30 seconds)
                    updateTimerDisplay();
                    
                    // Show notification
                    alert(`Set ${currentSet - 1} complete! Ready for set ${currentSet}/${totalSets}. Click Start Rest when done.`);
                } else {
                    // All sets completed - mark workout as complete automatically
                    completeWorkoutFromTimer();
                }
            }
        }, 1000);
    }
}

async function completeWorkoutFromTimer() {
    if (!currentWorkoutId) return;
    
    // Find the workout to get planned values
    const workout = currentWorkouts.find(w => w.id === currentWorkoutId);
    if (!workout) return;
    
    try {
        const response = await fetch(`/api/workouts/${currentWorkoutId}`, {
            method: 'PUT',
            headers: getAuthHeaders(),
            body: JSON.stringify({
                status: 'completed',
                completed_sets: workout.planned_sets,
                completed_reps: workout.planned_reps,
                completed_weight: workout.planned_weight
            })
        });

        if (response.ok) {
            alert('Workout completed! Great job! 💪');
            closeTimer();
            loadWorkouts(); // Refresh the workout list
        } else {
            const data = await response.json();
            alert(data.message);
        }
    } catch (error) {
        alert('Failed to update workout status');
    }
}

function pauseTimer() {
    if (isTimerRunning) {
        isTimerRunning = false;
        clearInterval(timerInterval);
        document.getElementById('start-timer').style.display = 'inline-block';
        document.getElementById('pause-timer').style.display = 'none';
    }
}

function resetTimer() {
    pauseTimer();
    timerSeconds = 30; // Reset to 30 seconds rest time
    updateTimerDisplay();
    // Keep currentSet as is - don't reset to 1
    // This only resets the timer for the current set
}

function updateTimerDisplay() {
    const minutes = Math.floor(Math.abs(timerSeconds) / 60);
    const seconds = Math.abs(timerSeconds) % 60;
    const sign = timerSeconds < 0 ? '-' : '';
    document.getElementById('timer-display').textContent = 
        `${sign}${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    
    // Change color when time is up
    const display = document.getElementById('timer-display');
    if (timerSeconds <= 0) {
        display.style.color = '#dc3545';
    } else if (timerSeconds <= 10) {
        display.style.color = '#ffc107';
    } else {
        display.style.color = '#667eea';
    }
}

function playTimerAlert() {
    // Simple audio alert using Web Audio API
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.value = 800;
    oscillator.type = 'sine';
    
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.5);
}

// Progress tracking functions
function loadProgressExercises() {
    populateExerciseSelect();
}

async function loadProgressChart() {
    const exerciseId = document.getElementById('progress-exercise-select').value;
    if (!exerciseId) return;

    try {
        const response = await fetch(`/api/workouts/history/${exerciseId}`, {
            headers: getAuthHeaders()
        });

        if (response.ok) {
            const history = await response.json();
            displayProgressChart(history);
        }
    } catch (error) {
        console.error('Failed to load progress data:', error);
    }
}

function displayProgressChart(history) {
    const ctx = document.getElementById('progress-chart').getContext('2d');
    
    // Destroy existing chart if it exists
    if (window.progressChart) {
        window.progressChart.destroy();
    }

    const labels = history.map(item => new Date(item.workout_date).toLocaleDateString());
    const weights = history.map(item => item.completed_weight);

    window.progressChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Weight (lbs)',
                data: weights,
                borderColor: '#667eea',
                backgroundColor: 'rgba(102, 126, 234, 0.1)',
                tension: 0.1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: false
                }
            }
        }
    });
}