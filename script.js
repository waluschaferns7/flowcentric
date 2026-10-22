// Requires storage.js to be loaded first (Store, KEYS, dateKey, todayKey)

// ---------- Greeting and date ----------
function setGreeting() {
  const now = new Date();
  const hour = now.getHours();

  let greeting = "Good evening";
  if (hour < 12) greeting = "Good morning";
  else if (hour < 17) greeting = "Good afternoon";

  const name = Store.get(KEYS.username, "there");

  const greetingEl = document.querySelector(".greeting");
  greetingEl.textContent = "";
  greetingEl.append(`${greeting}, `);

  const nameSpan = document.createElement("span");
  nameSpan.id = "user-name";
  nameSpan.textContent = name;
  greetingEl.append(nameSpan, " ");

  document.getElementById("current-date").textContent =
    now.toLocaleDateString("en-IN", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });
}

// ---------- Tasks ----------
let tasks = Store.get(KEYS.tasks, []);
let editingId = null;
let currentFilter = "all";
let currentSort = "newest";

const taskForm = document.getElementById("task-form");
const taskInput = document.getElementById("task-input");
const taskPriority = document.getElementById("task-priority");
const taskDate = document.getElementById("task-date");
const taskList = document.getElementById("task-list");
const taskSubmit = document.getElementById("task-submit");
const taskCancel = document.getElementById("task-cancel");
const taskSort = document.getElementById("task-sort");
const filterBtns = document.querySelectorAll(".filter-btn");

const PRIORITY_ORDER = { high: 0, medium: 1, low: 2 };

function addTask(text, priority, date) {
  tasks.push({
    id: Date.now(),
    text: text,
    priority: priority,
    date: date,
    completed: false,
    completedAt: null,
  });
  saveTasks();
}

function updateTask(id, text, priority, date) {
  const task = tasks.find((t) => t.id === id);
  if (!task) return;
  task.text = text;
  task.priority = priority;
  task.date = date;
  saveTasks();
}

function toggleTask(id) {
  const task = tasks.find((t) => t.id === id);
  if (!task) return;

  task.completed = !task.completed;
  task.completedAt = task.completed ? todayKey() : null;
  saveTasks();
}

function deleteTask(id) {
  tasks = tasks.filter((t) => t.id !== id);
  if (editingId === id) stopEditing();
  saveTasks();
}

function saveTasks() {
  Store.set(KEYS.tasks, tasks);
  renderTasks();
  updateStats();
}

// ---------- Editing ----------
function startEditing(id) {
  const task = tasks.find((t) => t.id === id);
  if (!task) return;

  editingId = id;
  taskInput.value = task.text;
  taskPriority.value = task.priority;
  taskDate.value = task.date || "";
  taskSubmit.textContent = "Update Task";
  taskCancel.hidden = false;
  taskForm.scrollIntoView({ behavior: "smooth", block: "center" });
  taskInput.focus();
  renderTasks();
}

function stopEditing() {
  editingId = null;
  taskForm.reset();
  taskPriority.value = "medium";
  taskSubmit.textContent = "Add Task";
  taskCancel.hidden = true;
  renderTasks();
}

// ---------- Filter and sort ----------
function getVisibleTasks() {
  let list = tasks.filter((t) => {
    if (currentFilter === "active") return !t.completed;
    if (currentFilter === "done") return t.completed;
    return true;
  });

  list = [...list]; // copy so the saved order isn't changed

  if (currentSort === "priority") {
    list.sort((a, b) =>
      PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority] || b.id - a.id
    );
  } else if (currentSort === "due") {
    list.sort((a, b) => {
      if (!a.date && !b.date) return b.id - a.id;
      if (!a.date) return 1;   // no due date goes last
      if (!b.date) return -1;
      return a.date.localeCompare(b.date);
    });
  } else {
    list.sort((a, b) => b.id - a.id); // newest first
  }

  return list;
}

// ---------- Render ----------
function renderTasks() {
  taskList.innerHTML = "";
  const visible = getVisibleTasks();

  if (visible.length === 0) {
    const empty = document.createElement("li");
    empty.className = "empty-state";
    empty.textContent = tasks.length === 0
      ? "No tasks yet. Add your first one above."
      : "No tasks match this filter.";
    taskList.appendChild(empty);
    return;
  }

  const today = todayKey();

  visible.forEach((task) => {
    const li = document.createElement("li");
    li.className =
      "task-item" +
      (task.completed ? " completed" : "") +
      (task.id === editingId ? " editing" : "");

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = task.completed;
    checkbox.addEventListener("change", () => toggleTask(task.id));

    const text = document.createElement("span");
    text.className = "task-text";
    text.textContent = task.text;

    const badge = document.createElement("span");
    badge.className = "priority-badge " + task.priority;
    badge.textContent = task.priority;

    li.append(checkbox, text, badge);

    if (task.date) {
      const due = document.createElement("span");
      const overdue = !task.completed && task.date < today;
      due.className = "task-due" + (overdue ? " overdue" : "");
      due.textContent = new Date(task.date).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
      });
      li.append(due);
    }

    const edit = document.createElement("button");
    edit.className = "task-edit";
    edit.textContent = "Edit";
    edit.setAttribute("aria-label", "Edit task");
    edit.addEventListener("click", () => startEditing(task.id));

    const del = document.createElement("button");
    del.className = "task-delete";
    del.textContent = "✕";
    del.setAttribute("aria-label", "Delete task");
    del.addEventListener("click", () => deleteTask(task.id));

    li.append(edit, del);
    taskList.appendChild(li);
  });
}

// ---------- Events ----------
taskForm.addEventListener("submit", (e) => {
  e.preventDefault();

  const text = taskInput.value.trim();
  if (!text) return;

  if (editingId) {
    updateTask(editingId, text, taskPriority.value, taskDate.value);
    stopEditing();
  } else {
    addTask(text, taskPriority.value, taskDate.value);
    taskForm.reset();
    taskPriority.value = "medium";
  }
  taskInput.focus();
});

taskCancel.addEventListener("click", stopEditing);

filterBtns.forEach((btn) => {
  btn.addEventListener("click", () => {
    filterBtns.forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    currentFilter = btn.dataset.filter;
    renderTasks();
  });
});

taskSort.addEventListener("change", () => {
  currentSort = taskSort.value;
  renderTasks();
});

// ---------- Productivity score ----------
const FOCUS_GOAL_MINUTES = 120; // focus time that counts as a full score
const TASK_WEIGHT = 60;         // % of the score from tasks
const FOCUS_WEIGHT = 40;        // % of the score from focus time

function calculateScore(done, total, focusMinutes) {
  const taskRatio = total > 0 ? done / total : 0;
  const focusRatio = Math.min(focusMinutes / FOCUS_GOAL_MINUTES, 1);

  return Math.round(taskRatio * TASK_WEIGHT + focusRatio * FOCUS_WEIGHT);
}

// ---------- Focus time ----------
function getTodayFocusMinutes() {
  const log = Store.get(KEYS.focusLog, {});
  return log[todayKey()] || 0;
}

function formatFocusTime(minutes) {
  if (minutes < 60) return `${minutes} min`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m === 0 ? `${h} h` : `${h} h ${m} min`;
}

// ---------- Focus streak ----------
const MIN_STREAK_MINUTES = 1; // minutes needed in a day to count

function calculateStreak() {
  const log = Store.get(KEYS.focusLog, {});
  const day = new Date();

  // Today doesn't break the streak until the day is over,
  // so if nothing is logged yet, start counting from yesterday
  if ((log[dateKey(day)] || 0) < MIN_STREAK_MINUTES) {
    day.setDate(day.getDate() - 1);
  }

  let streak = 0;
  while ((log[dateKey(day)] || 0) >= MIN_STREAK_MINUTES) {
    streak++;
    day.setDate(day.getDate() - 1);
  }
  return streak;
}

function formatStreak(days) {
  return days === 1 ? "1 day" : `${days} days`;
}

// ---------- Daily overview stats ----------
function updateStats() {
  const today = todayKey();

  // Tasks finished today, plus anything still open
  const relevant = tasks.filter((t) => !t.completed || t.completedAt === today);
  const done = relevant.filter((t) => t.completed).length;
  const total = relevant.length;

  const focusMinutes = getTodayFocusMinutes();
  const streak = calculateStreak();

  document.getElementById("stat-score").textContent =
    `${calculateScore(done, total, focusMinutes)}%`;
  document.getElementById("stat-tasks").textContent = `${done} / ${total}`;
  document.getElementById("stat-focus").textContent = formatFocusTime(focusMinutes);
  document.getElementById("stat-streak").textContent = formatStreak(streak);
}

// ---------- Init ----------
setGreeting();
renderTasks();
updateStats();