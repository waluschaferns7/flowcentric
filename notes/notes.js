// Requires ../storage.js to be loaded first (Store, KEYS)

const form = document.getElementById("note-form");
const titleInput = document.getElementById("note-title");
const contentInput = document.getElementById("note-content");
const saveBtn = document.getElementById("note-save");
const cancelBtn = document.getElementById("note-cancel");
const searchInput = document.getElementById("note-search");
const grid = document.getElementById("notes-grid");
const countEl = document.getElementById("notes-count");

// ---------- Storage ----------
function loadNotes() {
  const data = Store.get(KEYS.notes, []);
  return Array.isArray(data) ? data : [];
}

let notes = loadNotes();
let editingId = null;

function saveNotes() {
  Store.set(KEYS.notes, notes);
  renderNotes();
}

// ---------- Add / update / delete ----------
function addNote(title, content) {
  notes.unshift({
    id: Date.now(),
    title: title,
    content: content,
    updated: new Date().toISOString(),
  });
  saveNotes();
}

function updateNote(id, title, content) {
  const note = notes.find((n) => n.id === id);
  if (!note) return;
  note.title = title;
  note.content = content;
  note.updated = new Date().toISOString();
  saveNotes();
}

function deleteNote(id) {
  if (!confirm("Delete this note?")) return;
  notes = notes.filter((n) => n.id !== id);
  if (editingId === id) stopEditing();
  saveNotes();
}

// ---------- Editing ----------
function startEditing(id) {
  const note = notes.find((n) => n.id === id);
  if (!note) return;

  editingId = id;
  titleInput.value = note.title;
  contentInput.value = note.content;
  saveBtn.textContent = "Update Note";
  cancelBtn.hidden = false;
  titleInput.focus();
  window.scrollTo({ top: 0, behavior: "smooth" });
  renderNotes();
}

function stopEditing() {
  editingId = null;
  form.reset();
  saveBtn.textContent = "Save Note";
  cancelBtn.hidden = true;
  renderNotes();
}

// ---------- Render ----------
function formatDate(iso) {
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function renderNotes() {
  const query = searchInput.value.trim().toLowerCase();

  const visible = notes
    .filter((n) => (n.title + " " + n.content).toLowerCase().includes(query))
    .sort((a, b) => new Date(b.updated) - new Date(a.updated));

  countEl.textContent = notes.length;
  grid.innerHTML = "";

  if (visible.length === 0) {
    const empty = document.createElement("div");
    empty.className = "empty-state";
    empty.textContent = notes.length === 0
      ? "No notes yet. Write your first one above."
      : "No notes match your search.";
    grid.appendChild(empty);
    return;
  }

  visible.forEach((note) => {
    const card = document.createElement("article");
    card.className = "note-card" + (note.id === editingId ? " editing" : "");

    const title = document.createElement("h4");
    title.className = "note-card-title";
    title.textContent = note.title || "Untitled";

    const content = document.createElement("p");
    content.className = "note-card-content";
    content.textContent = note.content;

    const footer = document.createElement("div");
    footer.className = "note-card-footer";

    const date = document.createElement("span");
    date.className = "note-date";
    date.textContent = formatDate(note.updated);

    const actions = document.createElement("div");
    actions.className = "note-actions";

    const editBtn = document.createElement("button");
    editBtn.className = "note-action";
    editBtn.textContent = "Edit";
    editBtn.addEventListener("click", () => startEditing(note.id));

    const delBtn = document.createElement("button");
    delBtn.className = "note-action";
    delBtn.textContent = "Delete";
    delBtn.addEventListener("click", () => deleteNote(note.id));

    actions.append(editBtn, delBtn);
    footer.append(date, actions);
    card.append(title, content, footer);
    grid.appendChild(card);
  });
}

// ---------- Events ----------
form.addEventListener("submit", (e) => {
  e.preventDefault();

  const title = titleInput.value.trim();
  const content = contentInput.value.trim();
  if (!title && !content) return;

  if (editingId) {
    updateNote(editingId, title, content);
    stopEditing();
  } else {
    addNote(title, content);
    form.reset();
  }
  titleInput.focus();
});

cancelBtn.addEventListener("click", stopEditing);
searchInput.addEventListener("input", renderNotes);

// ---------- Init ----------
renderNotes();