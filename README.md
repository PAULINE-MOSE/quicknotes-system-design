# QuickNotes System Design

A project with two parts: a small browser client that talks to the JSONPlaceholder practice API (load, create and delete notes), and design documents for a real QuickNotes backend serving 1 million users.

## How to run the API client

1. Clone or download this repository.
2. Open the folder in VS Code and click **Go Live** (Live Server), or just open `index.html` in a browser.
3. Click **Load notes** to fetch 10 notes, add a note with the form, and use **Delete** on any note.

Note: JSONPlaceholder does not really save changes, so created and deleted notes reset when you reload.

## Documents

- [API design](docs/api-design.md)
- [Data model](docs/data-model.md)
- [Architecture](docs/architecture.md)

## What I learned

- How to use `fetch` with `async/await`, check `response.ok`, and handle errors with `try / catch / finally`.
- How to show loading, success, error and empty states, and disable buttons during requests.
- Why `textContent` is safer than `innerHTML` for user text.
- How to design a REST API, a SQL data model with a many-to-many link, and an architecture with a cache, a read replica and a queue.
