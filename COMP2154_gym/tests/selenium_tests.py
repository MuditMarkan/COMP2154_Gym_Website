"""
Visual Gym Tracker Pro - Selenium UI Tests
Tests the complete user flow from login to logout in the browser.

Run with: py tests/selenium_tests.py
(Server will start automatically)
"""

import time
import sys
import subprocess
import os
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait, Select
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.chrome.service import Service
from webdriver_manager.chrome import ChromeDriverManager

# ─── Config ───────────────────────────────────────────────────────────────────
BASE_URL = "http://localhost:3000"
TEST_EMAIL = f"selenium_{int(time.time())}@gymtracker.com"
TEST_PASSWORD = "SeleniumTest123!"
TEST_USERNAME = "SeleniumUser"

PASS = "✅ PASS"
FAIL = "❌ FAIL"
results = []
server_process = None

# ─── Server Setup ─────────────────────────────────────────────────────────────
def start_server():
    global server_process
    print("  Starting server...")
    project_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    server_process = subprocess.Popen(
        ["node", "server.js"],
        cwd=project_dir,
        stdout=subprocess.DEVNULL,
        stderr=subprocess.DEVNULL
    )
    time.sleep(3)  # Wait for server to start
    print("  Server started on port 3000\n")

def stop_server():
    global server_process
    if server_process:
        server_process.terminate()
        server_process = None
        print("\n  Server stopped.")

# ─── Setup ────────────────────────────────────────────────────────────────────
def setup_driver():
    options = webdriver.ChromeOptions()
    options.add_argument("--start-maximized")
    driver = webdriver.Chrome(
        service=Service(ChromeDriverManager().install()),
        options=options
    )
    driver.implicitly_wait(5)
    return driver

def log(name, passed, detail=""):
    status = PASS if passed else FAIL
    msg = f"{status} | {name}"
    if detail:
        msg += f" → {detail}"
    print(msg)
    results.append((name, passed))

# ─── Tests ────────────────────────────────────────────────────────────────────

def test_page_loads(driver):
    """Test 1: Page loads and shows login form"""
    try:
        driver.get(BASE_URL)
        time.sleep(1)
        login_form = driver.find_element(By.ID, "login-form")
        assert login_form.is_displayed()
        log("Page loads and shows login form", True)
    except Exception as e:
        log("Page loads and shows login form", False, str(e))

def test_register_link(driver):
    """Test 2: Register link switches to register form"""
    try:
        driver.get(BASE_URL)
        time.sleep(1)
        driver.find_element(By.LINK_TEXT, "Register here").click()
        time.sleep(0.5)
        register_form = driver.find_element(By.ID, "register-form")
        assert register_form.is_displayed()
        log("Register link shows registration form", True)
    except Exception as e:
        log("Register link shows registration form", False, str(e))

def test_register_new_user(driver):
    """Test 3: Register a new user"""
    try:
        driver.get(BASE_URL)
        time.sleep(1)
        driver.find_element(By.LINK_TEXT, "Register here").click()
        time.sleep(0.5)

        driver.find_element(By.ID, "register-username").send_keys(TEST_USERNAME)
        driver.find_element(By.ID, "register-email").send_keys(TEST_EMAIL)
        driver.find_element(By.ID, "register-password").send_keys(TEST_PASSWORD)
        driver.find_element(By.CSS_SELECTOR, "#register-form button[type='submit']").click()

        # Wait for alert
        WebDriverWait(driver, 5).until(EC.alert_is_present())
        alert = driver.switch_to.alert
        alert_text = alert.text
        alert.accept()

        assert "successful" in alert_text.lower() or "Registration" in alert_text
        log("Register new user", True, f"Alert: {alert_text}")
    except Exception as e:
        log("Register new user", False, str(e))

def test_login_wrong_password(driver):
    """Test 4: Login with wrong password shows error"""
    try:
        driver.get(BASE_URL)
        time.sleep(1)
        driver.find_element(By.ID, "login-email").send_keys(TEST_EMAIL)
        driver.find_element(By.ID, "login-password").send_keys("WrongPassword!")
        driver.find_element(By.CSS_SELECTOR, "#login-form button[type='submit']").click()

        WebDriverWait(driver, 5).until(EC.alert_is_present())
        alert = driver.switch_to.alert
        alert_text = alert.text
        alert.accept()

        assert "invalid" in alert_text.lower() or "credentials" in alert_text.lower()
        log("Login with wrong password shows error", True, f"Alert: {alert_text}")
    except Exception as e:
        log("Login with wrong password shows error", False, str(e))

def test_login_success(driver):
    """Test 5: Login with correct credentials"""
    try:
        driver.get(BASE_URL)
        time.sleep(1)

        driver.find_element(By.ID, "login-email").clear()
        driver.find_element(By.ID, "login-email").send_keys(TEST_EMAIL)
        driver.find_element(By.ID, "login-password").clear()
        driver.find_element(By.ID, "login-password").send_keys(TEST_PASSWORD)
        driver.find_element(By.CSS_SELECTOR, "#login-form button[type='submit']").click()

        # Wait for dashboard to appear
        WebDriverWait(driver, 10).until(
            EC.visibility_of_element_located((By.ID, "dashboard"))
        )
        assert driver.find_element(By.ID, "dashboard").is_displayed()
        log("Login with correct credentials", True)
    except Exception as e:
        log("Login with correct credentials", False, str(e))

def test_dashboard_loads(driver):
    """Test 6: Dashboard shows workout date and exercise select"""
    try:
        date_input = driver.find_element(By.ID, "workout-date")
        exercise_select = driver.find_element(By.ID, "exercise-select")
        assert date_input.is_displayed()
        assert exercise_select.is_displayed()
        log("Dashboard shows date input and exercise select", True)
    except Exception as e:
        log("Dashboard shows date input and exercise select", False, str(e))

def test_exercise_select_populated(driver):
    """Test 7: Exercise dropdown has at least 15 options"""
    try:
        select = Select(driver.find_element(By.ID, "exercise-select"))
        # Subtract 1 for the default "Select an exercise..." option
        count = len(select.options) - 1
        assert count >= 15, f"Only {count} exercises found"
        log("Exercise dropdown has 15+ exercises", True, f"{count} exercises loaded")
    except Exception as e:
        log("Exercise dropdown has 15+ exercises", False, str(e))

def test_add_exercise_to_workout(driver):
    """Test 8: Add an exercise to today's workout"""
    try:
        select = Select(driver.find_element(By.ID, "exercise-select"))
        select.select_by_index(1)  # Select first exercise

        driver.find_element(By.ID, "planned-sets").clear()
        driver.find_element(By.ID, "planned-sets").send_keys("3")
        driver.find_element(By.ID, "planned-reps").clear()
        driver.find_element(By.ID, "planned-reps").send_keys("10")
        driver.find_element(By.ID, "planned-weight").clear()
        driver.find_element(By.ID, "planned-weight").send_keys("50")

        driver.find_element(By.XPATH, "//button[text()='Add to Workout']").click()
        time.sleep(1)

        workout_list = driver.find_element(By.ID, "workout-list")
        assert "sets" in workout_list.text.lower() or "planned" in workout_list.text.lower()
        log("Add exercise to workout", True)
    except Exception as e:
        log("Add exercise to workout", False, str(e))

def test_timer_opens(driver):
    """Test 9: Timer modal opens when clicking Timer button"""
    try:
        timer_btn = WebDriverWait(driver, 5).until(
            EC.element_to_be_clickable((By.XPATH, "//button[text()='Timer']"))
        )
        timer_btn.click()
        time.sleep(1)

        modal = driver.find_element(By.ID, "timer-modal")
        assert modal.is_displayed()
        log("Timer modal opens", True)
    except Exception as e:
        log("Timer modal opens", False, str(e))

def test_timer_starts(driver):
    """Test 10: Timer starts counting down"""
    try:
        initial_time = driver.find_element(By.ID, "timer-display").text
        driver.find_element(By.ID, "start-timer").click()
        time.sleep(3)
        current_time = driver.find_element(By.ID, "timer-display").text
        assert initial_time != current_time
        log("Timer counts down", True, f"{initial_time} → {current_time}")
    except Exception as e:
        log("Timer counts down", False, str(e))

def test_timer_pause(driver):
    """Test 11: Timer pauses correctly"""
    try:
        driver.find_element(By.ID, "pause-timer").click()
        time.sleep(0.5)
        paused_time = driver.find_element(By.ID, "timer-display").text
        time.sleep(2)
        after_pause_time = driver.find_element(By.ID, "timer-display").text
        assert paused_time == after_pause_time
        log("Timer pauses correctly", True)
    except Exception as e:
        log("Timer pauses correctly", False, str(e))

def test_timer_reset(driver):
    """Test 12: Timer resets to 00:30"""
    try:
        driver.find_element(By.ID, "reset-timer").click()
        time.sleep(0.5)
        reset_time = driver.find_element(By.ID, "timer-display").text
        assert reset_time == "00:30"
        log("Timer resets to 00:30", True)
    except Exception as e:
        log("Timer resets to 00:30", False, str(e))

def test_timer_closes(driver):
    """Test 13: Timer modal closes"""
    try:
        driver.find_element(By.CLASS_NAME, "modal-close-btn").click()
        time.sleep(0.5)
        modal = driver.find_element(By.ID, "timer-modal")
        assert not modal.is_displayed()
        log("Timer modal closes", True)
    except Exception as e:
        log("Timer modal closes", False, str(e))

def test_navigate_to_exercises(driver):
    """Test 14: Navigate to Exercise Library"""
    try:
        driver.find_element(By.XPATH, "//button[text()='Exercises']").click()
        time.sleep(1)
        exercises_section = driver.find_element(By.ID, "exercises")
        assert exercises_section.is_displayed()
        log("Navigate to Exercise Library", True)
    except Exception as e:
        log("Navigate to Exercise Library", False, str(e))

def test_exercises_grid_loads(driver):
    """Test 15: Exercise cards load in grid"""
    try:
        WebDriverWait(driver, 5).until(
            EC.presence_of_element_located((By.CLASS_NAME, "exercise-card"))
        )
        cards = driver.find_elements(By.CLASS_NAME, "exercise-card")
        assert len(cards) >= 15
        log("Exercise grid loads with 15+ cards", True, f"{len(cards)} cards found")
    except Exception as e:
        log("Exercise grid loads with 15+ cards", False, str(e))

def test_add_custom_exercise(driver):
    """Test 16: Add a custom exercise"""
    try:
        driver.find_element(By.XPATH, "//button[text()='Add Custom Exercise']").click()
        time.sleep(0.5)

        driver.find_element(By.ID, "exercise-name").send_keys("Selenium Test Exercise")
        driver.find_element(By.ID, "muscle-group").send_keys("Test Muscle")
        driver.find_element(By.XPATH, "//button[text()='Add Exercise']").click()
        time.sleep(1)

        cards = driver.find_elements(By.CLASS_NAME, "exercise-card")
        card_texts = [c.text for c in cards]
        assert any("Selenium Test Exercise" in t for t in card_texts)
        log("Add custom exercise", True)
    except Exception as e:
        log("Add custom exercise", False, str(e))

def test_navigate_to_progress(driver):
    """Test 17: Navigate to Progress section"""
    try:
        driver.find_element(By.XPATH, "//button[text()='Progress']").click()
        time.sleep(1)
        progress_section = driver.find_element(By.ID, "progress")
        assert progress_section.is_displayed()
        log("Navigate to Progress section", True)
    except Exception as e:
        log("Navigate to Progress section", False, str(e))

def test_progress_select_populated(driver):
    """Test 18: Progress exercise dropdown is populated"""
    try:
        select = Select(driver.find_element(By.ID, "progress-exercise-select"))
        count = len(select.options) - 1
        assert count >= 15
        log("Progress exercise dropdown populated", True, f"{count} options")
    except Exception as e:
        log("Progress exercise dropdown populated", False, str(e))

def test_logout(driver):
    """Test 19: Logout returns to login page"""
    try:
        driver.find_element(By.XPATH, "//button[text()='Logout']").click()
        time.sleep(1)
        auth_section = driver.find_element(By.ID, "auth-section")
        assert auth_section.is_displayed()
        log("Logout returns to login page", True)
    except Exception as e:
        log("Logout returns to login page", False, str(e))

def test_protected_after_logout(driver):
    """Test 20: Dashboard not visible after logout"""
    try:
        dashboard = driver.find_element(By.ID, "main-app")
        assert not dashboard.is_displayed()
        log("Dashboard hidden after logout", True)
    except Exception as e:
        log("Dashboard hidden after logout", False, str(e))


# ─── Main Runner ──────────────────────────────────────────────────────────────
if __name__ == "__main__":
    print("\n" + "="*60)
    print("  Visual Gym Tracker Pro - Selenium UI Tests")
    print("="*60)
    print(f"  URL: {BASE_URL}")
    print(f"  Test User: {TEST_EMAIL}")
    print("="*60 + "\n")

    start_server()
    driver = setup_driver()

    try:
        # Run all tests in order
        test_page_loads(driver)
        test_register_link(driver)
        test_register_new_user(driver)
        test_login_wrong_password(driver)
        test_login_success(driver)
        test_dashboard_loads(driver)
        test_exercise_select_populated(driver)
        test_add_exercise_to_workout(driver)
        test_timer_opens(driver)
        test_timer_starts(driver)
        test_timer_pause(driver)
        test_timer_reset(driver)
        test_timer_closes(driver)
        test_navigate_to_exercises(driver)
        test_exercises_grid_loads(driver)
        test_add_custom_exercise(driver)
        test_navigate_to_progress(driver)
        test_progress_select_populated(driver)
        test_logout(driver)
        test_protected_after_logout(driver)

    finally:
        driver.quit()
        stop_server()

    # ─── Summary ──────────────────────────────────────────────────────────────
    passed = sum(1 for _, p in results if p)
    failed = sum(1 for _, p in results if not p)
    total = len(results)

    print("\n" + "="*60)
    print(f"  RESULTS: {passed}/{total} tests passed")
    if failed > 0:
        print(f"  FAILED:  {failed} tests")
        print("\n  Failed Tests:")
        for name, p in results:
            if not p:
                print(f"    ❌ {name}")
    print("="*60 + "\n")

    sys.exit(0 if failed == 0 else 1)
