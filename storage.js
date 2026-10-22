// Every localStorage key in one place
const KEYS = {
  tasks: "flowcentric_tasks",
  notes: "flowcentric_notes",
  focusLog: "flowcentric_focus_log",
  timerSettings: "flowcentric_timer_settings",
  username: "flowcentric_username",
};

const Store = {
  get(key, fallback) {
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : fallback;
    } catch {
      return fallback;
    }
  },

  set(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch {
      return false; // storage full or blocked
    }
  },

  remove(key) {
    try {
      localStorage.removeItem(key);
    } catch {}
  },
};

// Local date as YYYY-MM-DD
function dateKey(date) {
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${date.getFullYear()}-${month}-${day}`;
}

function todayKey() {
  return dateKey(new Date());
}