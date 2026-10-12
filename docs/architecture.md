# QuickNotes Architecture

## Requirements

**Functional:** create, list, edit and delete notes; tag notes; log in securely.

**Non-functional:** about 99.9% availability; list responses under 300 ms; notes must not be lost; scales to 1 million users.

## Load estimate (1 million users)

Assumptions: 10% active daily (100,000); each views their notes 20 times and creates 2 notes per day; a note is about 1 KB; peak = 5x average.

- **Reads:** 100,000 x 20 = 2,000,000/day / 86,400 = **23.1 reads/s** (peak about 116/s)
- **Writes:** 100,000 x 2 = 200,000/day / 86,400 = **2.3 writes/s** (peak about 12/s)
- **Storage:** 200,000 x 1 KB = 200 MB/day x 365 = **about 73 GB/year**

It is read-heavy (about 10 reads per write).

## Diagram

```text
 Client
   |
   v
  DNS ----> CDN (static files)
   |
   v
 Load Balancer
   |
 +-+------------+
 |              |
App Server 1  App Server 2
 |              |
 +-----+--------+-----------+
       |        |           |
    [Cache] [Primary DB]  [Queue]
                |           |
                v           v
         [Read Replica]  [Worker]
```

## Components (one sentence each)

- **DNS:** solves finding the service by turning the name into the right IP address.
- **CDN:** solves slow page loads by serving static files from servers near the user.
- **Load balancer:** solves overload and failures by spreading requests across healthy app servers.
- **App servers (2+):** solve running the API logic and let us scale by adding more copies.
- **Cache:** solves repeated database reads by keeping recent note lists in fast memory.
- **Primary database:** solves safe storage by holding all notes and handling every write.
- **Read replica:** solves read overload by answering list queries from a copy of the data.
- **Queue:** solves traffic bursts by holding background jobs until a worker is free.
- **Worker:** solves slow side tasks (search indexing, reminder emails) by doing them outside the request.

## Request flows

**GET /notes**
1. Client resolves the name through DNS and sends the request to the load balancer.
2. The load balancer picks an app server, which checks the token.
3. The app server looks in the cache; on a hit it returns the list.
4. On a miss it reads from the read replica, stores the result in the cache and returns it.

**POST /notes**
1. The request reaches an app server, which validates the token and title (required, max 100 characters).
2. The app server writes the note to the primary database.
3. It clears that user's cached list and adds a job to the queue.
4. It returns `201 Created` with the new note; the worker later indexes it and the replica copies it.

## Trade-offs

1. **Cache vs fresh data:** the cache makes lists fast and cuts database load, but may briefly show stale notes, so we clear it on every write.
2. **Read replica vs consistency:** the replica takes read load off the primary, but replication lag can hide a just-created note, so reads right after a write can use the primary.
3. **Queue vs instant results:** background jobs keep requests fast, but side effects like search updates happen a moment later.

## Avoiding single points of failure

- Two or more app servers behind a load balancer (and the load balancer itself runs as a redundant pair).
- The read replica can be promoted to primary if the primary fails.
- The cache and queue run as replicated clusters; the database has daily backups.
- DNS and the CDN are managed services with many servers worldwide.
