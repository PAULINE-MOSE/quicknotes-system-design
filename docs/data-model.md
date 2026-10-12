# QuickNotes Data Model

## Entities

**users**: `id` BIGINT **PK**, `email` VARCHAR(255) unique, `name` VARCHAR(100), `created_at` TIMESTAMP

**notes**: `id` BIGINT **PK**, `user_id` BIGINT **FK** to users.id, `title` VARCHAR(100), `body` TEXT, `created_at` TIMESTAMP

**tags**: `id` BIGINT **PK**, `name` VARCHAR(50) unique

**note_tags**: `note_id` BIGINT **FK** to notes.id, `tag_id` BIGINT **FK** to tags.id, composite **PK** (note_id, tag_id)

## Relationships

- **One-to-many:** one user has many notes; each note belongs to one user (`notes.user_id`).
- **Many-to-many:** a note can have many tags and a tag can be on many notes, so the join table `note_tags` links them.

## CREATE TABLE (PostgreSQL)

```sql
CREATE TABLE users (
  id         BIGSERIAL PRIMARY KEY,
  email      VARCHAR(255) NOT NULL UNIQUE,
  name       VARCHAR(100) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE notes (
  id         BIGSERIAL PRIMARY KEY,
  user_id    BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title      VARCHAR(100) NOT NULL,
  body       TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE tags (
  id   BIGSERIAL PRIMARY KEY,
  name VARCHAR(50) NOT NULL UNIQUE
);

CREATE TABLE note_tags (
  note_id BIGINT NOT NULL REFERENCES notes(id) ON DELETE CASCADE,
  tag_id  BIGINT NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
  PRIMARY KEY (note_id, tag_id)
);
```

## Example queries

```sql
-- 1. A user's 10 newest notes
SELECT id, title, body FROM notes
WHERE user_id = 1 ORDER BY created_at DESC LIMIT 10;

-- 2. JOIN: a user's notes with their tag names
SELECT n.id, n.title, t.name AS tag
FROM notes n
JOIN note_tags nt ON nt.note_id = n.id
JOIN tags t ON t.id = nt.tag_id
WHERE n.user_id = 1;

-- 3. Delete one of a user's notes
DELETE FROM notes WHERE id = 101 AND user_id = 1;
```

## Index

```sql
CREATE INDEX idx_notes_user_created ON notes (user_id, created_at DESC);
```

**Reason:** `GET /notes` always filters by user and sorts newest first, so this index avoids scanning every note in the table.

## SQL or NoSQL?

I choose **SQL** (PostgreSQL). QuickNotes data is structured and relational (users, notes and tags with a many-to-many link), and we need joins, foreign keys and reliable transactions. At about 73 GB of new data a year, one primary database with a read replica is enough, so we do not need NoSQL's horizontal write scaling.
