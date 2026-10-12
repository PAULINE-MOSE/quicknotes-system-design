# QuickNotes API Design

Base URL: `https://api.quicknotes.example/v1`. All bodies are JSON. Requests after login send `Authorization: Bearer <token>`.

## Endpoints

| Method | Path | Description | Success |
|--------|------|-------------|---------|
| POST | /auth/login | Log in and receive a token | 200 OK |
| GET | /notes | List the user's notes (`?limit=10&page=1&tag=work`) | 200 OK |
| GET | /notes/{id} | Get one note | 200 OK |
| POST | /notes | Create a note | 201 Created |
| PUT | /notes/{id} | Replace a note's title/body | 200 OK |
| DELETE | /notes/{id} | Delete a note | 204 No Content |
| GET | /tags | List all tags | 200 OK |
| POST | /notes/{id}/tags | Add a tag to a note | 201 Created |

## Create a note

`POST /notes`

```json
{ "title": "Buy milk", "body": "2 litres", "tags": ["home"] }
```

Response `201 Created`:

```json
{
  "id": 101,
  "title": "Buy milk",
  "body": "2 litres",
  "tags": ["home"],
  "userId": 1,
  "createdAt": "2026-10-12T09:30:00Z"
}
```

## List notes

`GET /notes?limit=2&page=1`

Response `200 OK`:

```json
{
  "page": 1,
  "limit": 2,
  "total": 57,
  "notes": [
    { "id": 101, "title": "Buy milk", "body": "2 litres", "tags": ["home"] },
    { "id": 100, "title": "Call Sam", "body": "", "tags": [] }
  ]
}
```

## Error codes

| Status | When it is returned |
|--------|---------------------|
| 400 Bad Request | Invalid input, e.g. title missing or longer than 100 characters |
| 401 Unauthorized | Missing, expired or invalid token |
| 403 Forbidden | Logged in, but the note belongs to another user |
| 404 Not Found | The note or tag does not exist |
| 500 Internal Server Error | Unexpected server failure |

Example error body (`400 Bad Request`):

```json
{
  "error": {
    "code": 400,
    "message": "Title is required and must be at most 100 characters."
  }
}
```
