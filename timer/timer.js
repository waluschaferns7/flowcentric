// Requires ../storage.js to be loaded first (Store, KEYS, todayKey)

const display = document.getElementById("timer-display");
const statusEl = document.getElementById("timer-status");
const startBtn = document.getElementById("timer-start");
const pauseBtn = document.getElementById("timer-pause");
const resetBtn = document.getElementById("timer-reset");
const modeBtns = document.querySelectorAll(".mode-btn");
const presetBtns = document.querySelectorAll(".preset-btn");
const dots = document.querySelectorAll(".dot");

const inputs = {
  focus: document.getElementById("set-focus"),
  short: document.getElementById("set-short"),
  long: document.getElementById("set-long"),
};

const SESSIONS_BEFORE_LONG = 4;
const LIMITS = { focus: 180, short: 60, long: 60 };

// ---------- Settings (saved) ----------
let settings = { focus: 25, short: 5, long: 15, ...Store.get(KEYS.timerSettings, {}) };

// ---------- State ----------
let mode = "focus";
let completed = 0;     // focus sessions finished
let remaining = settings.focus * 60;
let endTime = null;
let timerId = null;

// ---------- Display ----------
function updateDisplay() {
  const m = String(Math.floor(remaining / 60)).padStart(2, "0");
  const s = String(remaining % 60).padStart(2, "0");
  display.textContent = `${m}:${s}`;
  document.title = timerId
    ? `${m}:${s} | FlowCentric`
    : "Focus Timer | FlowCentric";
}

function updateDots() {
  const filled = mode === "long" ? SESSIONS_BEFORE_LONG : completed % SESSIONS_BEFORE_LONG;
  dots.forEach((dot, i) => dot.classList.toggle("filled", i < filled));
}

function updateInputs() {
  inputs.focus.value = settings.focus;
  inputs.short.value = settings.short;
  inputs.long.value = settings.long;
}

// ---------- Timer controls ----------
function startTimer() {
  if (timerId || remaining === 0) return;

  endTime = Date.now() + remaining * 1000;
  timerId = setInterval(tick, 250);
  statusEl.textContent = mode === "focus" ? "Stay focused..." : "Take a break...";
}

function tick() {
  remaining = Math.max(0, Math.round((endTime - Date.now()) / 1000));
  updateDisplay();
  if (remaining === 0) completeSession();
}

function pauseTimer() {
  if (!timerId) return;
  clearInterval(timerId);
  timerId = null;
  statusEl.textContent = "Paused";
  updateDisplay();
}

function resetTimer() {
  clearInterval(timerId);
  timerId = null;
  remaining = settings[mode] * 60;
  statusEl.textContent = mode === "focus" ? "Ready to focus" : "Ready for a break";
  updateDisplay();
  updateDots();
}

function setMode(newMode) {
  mode = newMode;
  modeBtns.forEach((b) => b.classList.toggle("active", b.dataset.mode === mode));
  resetTimer();
}

// ---------- Pomodoro cycle ----------
function completeSession() {
  clearInterval(timerId);
  timerId = null;

  if (mode === "focus") {
    saveFocusMinutes(settings.focus);
    completed++;

    const isLongBreak = completed % SESSIONS_BEFORE_LONG === 0;
    setMode(isLongBreak ? "long" : "short");
    statusEl.textContent = isLongBreak
      ? "Great work! Time for a long break."
      : "Session complete! Time for a short break.";
  } else {
    setMode("focus");
    statusEl.textContent = "Break over. Ready for the next session?";
  }
}

// ---------- Save focus time for the dashboard ----------
function saveFocusMinutes(minutes) {
  const log = Store.get(KEYS.focusLog, {});
  const today = todayKey();
  log[today] = (log[today] || 0) + minutes;
  Store.set(KEYS.focusLog, log);
}

// ---------- Settings ----------
function applySetting(key, value) {
  let minutes = Math.round(Number(value));
  if (!minutes || minutes < 1) minutes = 1;
  if (minutes > LIMITS[key]) minutes = LIMITS[key];

  settings[key] = minutes;
  Store.set(KEYS.timerSettings, settings);
  updateInputs();

  // Apply right away unless a session is running
  if (!timerId && key === mode) resetTimer();
}

Object.keys(inputs).forEach((key) => {
  inputs[key].addEventListener("change", () => applySetting(key, inputs[key].value));
});

presetBtns.forEach((btn) => {
  btn.addEventListener("click", () => applySetting("focus", btn.dataset.minutes));
});

// ---------- Events ----------
modeBtns.forEach((btn) => {
  btn.addEventListener("click", () => setMode(btn.dataset.mode));
});

startBtn.addEventListener("click", startTimer);
pauseBtn.addEventListener("click", pauseTimer);
resetBtn.addEventListener("click", resetTimer);

// ---------- Init ----------
updateInputs();
resetTimer();