const API_URL = "https://jsonplaceholder.typicode.com/posts";

const loadBtn = document.getElementById("load-btn");
const statusEl = document.getElementById("status");
const form = document.getElementById("note-form");
const titleInput = document.getElementById("title-input");
const bodyInput = document.getElementById("body-input");
const submitBtn = document.getElementById("submit-btn");
const list = document.getElementById("notes-list");

// Show a message; the CSS class (loading / success / error) sets its style.
function setStatus(message, type) {
  statusEl.textContent = message;
  statusEl.className = type;
}

// Disable every button while a request is running.
function setBusy(busy) {
  loadBtn.disabled = busy;
  submitBtn.disabled = busy;
  list.querySelectorAll("button").forEach((b) => (b.disabled = busy));
}

// Reusable request helper: calls fetch, checks response.ok, throws on errors.
async function request(url, options) {
  const response = await fetch(url, options);
  if (!response.ok) {
    throw new Error("Request failed with status " + response.status);
  }
  return { status: response.status, data: await response.json() };
}

// Empty state. textContent only, so user text is never parsed as HTML.
function showEmpty() {
  const li = document.createElement("li");
  li.className = "empty";
  li.textContent = "No notes yet.";
  list.replaceChildren(li);
}

function renderNote(note) {
  const li = document.createElement("li");
  const title = document.createElement("strong");
  title.textContent = note.title;
  const body = document.createElement("p");
  body.textContent = note.body || "";
  const del = document.createElement("button");
  del.type = "button";
  del.textContent = "Delete";
  del.addEventListener("click", () => deleteNote(note.id, li));
  li.append(title, body, del);
  return li;
}

// GET: load 10 notes.
async function loadNotes() {
  setBusy(true);
  setStatus("Loading notes...", "loading");
  try {
    const { data } = await request(API_URL + "?_limit=10");
    list.replaceChildren();
    if (data.length === 0) {
      showEmpty();
      setStatus("No notes found.", "success");
    } else {
      data.forEach((note) => list.append(renderNote(note)));
      setStatus("Loaded " + data.length + " notes from the server.", "success");
    }
  } catch (err) {
    console.error(err);
    setStatus("Sorry, we could not load your notes. Please try again.", "error");
  } finally {
    setBusy(false);
  }
}

// POST: create a note.
async function createNote(title, body) {
  setBusy(true);
  setStatus("Saving note...", "loading");
  try {
    const { status, data } = await request(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, body, userId: 1 }),
    });
    const empty = list.querySelector(".empty");
    if (empty) empty.remove();
    list.prepend(renderNote({ ...data, title, body }));
    form.reset();
    setStatus("Note created (status " + status + ", id " + data.id + ").", "success");
  } catch (err) {
    console.error(err);
    setStatus("Sorry, the note could not be saved. Please try again.", "error");
  } finally {
    setBusy(false);
  }
}

// Validation: title required, max 100 characters; body optional.
function handleSubmit(event) {
  event.preventDefault();
  const title = titleInput.value.trim();
  if (!title) {
    setStatus("Please enter a title.", "error");
    return;
  }
  if (title.length > 100) {
    setStatus("Title must be 100 characters or fewer.", "error");
    return;
  }
  createNote(title, bodyInput.value.trim());
}

// DELETE: remove a note.
// JSONPlaceholder does not really store anything: it answers "OK" to POST and
// DELETE but its data never changes. So we trust a successful (2xx) response
// and remove the note from the page ourselves. Reloading brings the original
// 10 notes back, and notes we created (like id 101) disappear. A real backend
// would save these changes permanently.
async function deleteNote(id, li) {
  setBusy(true);
  setStatus("Deleting note...", "loading");
  try {
    await request(API_URL + "/" + id, { method: "DELETE" });
    li.remove();
    if (list.children.length === 0) showEmpty();
    setStatus("Note deleted.", "success");
  } catch (err) {
    console.error(err);
    setStatus("Sorry, the note could not be deleted. Please try again.", "error");
  } finally {
    setBusy(false);
  }
}

loadBtn.addEventListener("click", loadNotes);
form.addEventListener("submit", handleSubmit);
