# Secretary Backend

Golang backend service for the Secretary baby care tracker application.

## Features

- RESTful API for managing baby care events
- File-based event persistence
- CORS support for React Native frontend
- Date range filtering for events
- Health check endpoint

## Building

```bash
make build
```

## Running

```bash
make run
```

Or run in development mode:

```bash
make run-dev
```

## Configuration

The server can be configured via environment variables:

- `PORT`: Port to listen on (default: `8080`)
- `STORAGE_PATH`: Path to events storage file (default: `events.json`)

Example:

```bash
PORT=3000 STORAGE_PATH=/data/events.json make run
```

## API Endpoints

### Health Check

```
GET /health
```

Returns server health status.

### Get All Events

```
GET /api/events
```

Returns all events. Optional query parameters:
- `start`: ISO 8601 datetime string (RFC3339 format)
- `end`: ISO 8601 datetime string (RFC3339 format)

Example:
```
GET /api/events?start=2026-03-01T00:00:00Z&end=2026-03-31T23:59:59Z
```

### Get Event by ID

```
GET /api/events/:id
```

Returns a specific event by ID.

### Create Event

```
POST /api/events
Content-Type: application/json

{
  "type": "feeding",
  "timestamp": "2026-03-20T10:00:00Z",
  "duration": 15,
  "feedingSide": "left",
  "amount": 120,
  "notes": "Good feeding"
}
```

Available event types:
- `feeding` - Feeding event
- `bath` - Bath time
- `poop` - Diaper poop
- `pee` - Diaper pee
- `diaperChange` - Diaper change
- `sleep` - Sleep time
- `medication` - Medication given
- `note` - General note

### Update Event

```
PUT /api/events/:id
Content-Type: application/json

{
  "duration": 20,
  "notes": "Updated notes"
}
```

All fields are optional.

### Delete Event

```
DELETE /api/events/:id
```

Deletes a specific event.

### Clear All Events

```
DELETE /api/events
```

Deletes all events.

## Development

Run tests:

```bash
make test
```

Format code:

```bash
make fmt
```

Tidy dependencies:

```bash
make tidy
```

Clean build artifacts:

```bash
make clean
```
