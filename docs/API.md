# API Reference

All routes are served under the `/api` prefix. Authentication uses Supabase session cookies (set by signin/signup) or demo cookies for local development.

---

## Authentication

### `POST /api/auth/signup`

Create a new account.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "role": "candidate",
  "fullName": "Jane Doe"
}
```

**Response (success — auto-confirmed via service role):**
```json
{
  "user": { "id": "uuid", "email": "user@example.com" },
  "role": "candidate",
  "message": "Account created and ready. You can now sign in."
}
```

**Response (success — email confirmation required):**
```json
{
  "user": { "id": "uuid", "email": "user@example.com" },
  "role": "candidate",
  "requiresEmailConfirmation": true,
  "message": "Account created. Check your email to confirm before signing in."
}
```

**Response (error):**
```json
{
  "error": "An account with this email already exists.",
  "issues": { ... }
}
```

| Status | Condition |
|--------|-----------|
| 200 | Account created |
| 400 | Invalid payload (validation error) |
| 401 | Supabase signUp failed |
| 409 | Email already exists |
| 500 | Supabase not configured |

---

### `POST /api/auth/signin`

Sign in to an existing account.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "role": "candidate"
}
```

**Response (success):**
```json
{
  "user": { "id": "uuid", "email": "user@example.com", ... },
  "role": "candidate",
  "message": "Session established."
}
```

**Response (error):**
```json
{
  "error": "This account requires email confirmation. Please check your inbox for a confirmation link."
}
```

| Status | Condition |
|--------|-----------|
| 200 | Signed in, session cookie set |
| 400 | Invalid payload |
| 401 | Invalid credentials or email not confirmed |
| 500 | Supabase not configured |

---

### `POST /api/auth/reset-password`

Send a password reset email.

**Request:**
```json
{
  "email": "user@example.com"
}
```

**Response:**
```json
{
  "message": "If an account with that email exists, a password reset link has been sent."
}
```

| Status | Condition |
|--------|-----------|
| 200 | Email sent (or would have been sent) |
| 400 | Missing email or Supabase error |
| 500 | Supabase not configured |

---

### `POST /api/auth/logout`

Clear the session and redirect to home.

**Request:** (empty body)

**Response:** 302 redirect to `/` with cleared cookies.

---

## Jobs

### `GET /api/jobs`

List job openings.

**Query Parameters:**
| Param | Type | Description |
|-------|------|-------------|
| `page` | number | Page number (default: 1) |
| `limit` | number | Items per page (default: 20) |
| `search` | string | Search title, company, description |
| `skill` | string | Filter by skill |
| `mode` | string | Filter by mode: Remote, Hybrid, Onsite |

**Response:**
```json
{
  "data": [
    {
      "id": "uuid",
      "employerId": "uuid",
      "title": "Senior Frontend Engineer",
      "company": "Acme Corp",
      "location": "San Francisco, CA",
      "mode": "Remote",
      "salary": "$150k-$200k",
      "description": "We are looking for...",
      "skills": ["React", "TypeScript"],
      "seniority": "Senior",
      "status": "open"
    }
  ],
  "total": 25,
  "source": "supabase"
}
```

| Status | Condition |
|--------|-----------|
| 200 | Success (may contain empty array) |

---

## Candidates

### `GET /api/candidates`

List candidates. Requires recruiter authentication.

**Query Parameters:**
| Param | Type | Description |
|-------|------|-------------|
| `page` | number | Page number (default: 1) |
| `limit` | number | Items per page (default: 20) |
| `search` | string | Search title, location |
| `skill` | string | Filter by skill |

**Response:**
```json
{
  "data": [
    {
      "id": "uuid",
      "name": "Jane Doe",
      "title": "Frontend Engineer",
      "location": "San Francisco, CA",
      "avatar": "JD",
      "skills": ["React", "TypeScript"],
      "experienceYears": 5,
      "videoUrl": "https://...",
      "resumeUrl": "https://...",
      "summary": "Experienced frontend engineer...",
      "confidence": 85,
      "communication": 90,
      "relevance": 78
    }
  ],
  "total": 15,
  "source": "supabase"
}
```

| Status | Condition |
|--------|-----------|
| 200 | Success |
| 401 | Not authenticated or not a recruiter |

---

## Applications

### `POST /api/applications`

Apply to a job. Requires candidate authentication.

**Request:**
```json
{
  "candidateId": "uuid",
  "jobId": "uuid",
  "matchScore": 85
}
```

**Response:**
```json
{
  "application": {
    "id": "uuid",
    "candidateId": "uuid",
    "jobId": "uuid",
    "stage": "applied",
    "matchScore": 85,
    "createdAt": "2026-05-29T12:00:00Z"
  },
  "source": "supabase"
}
```

| Status | Condition |
|--------|-----------|
| 200 | Application created |
| 400 | Invalid payload |

### `PATCH /api/applications`

Update application stage (pipeline drag-and-drop). Requires recruiter authentication.

**Request:**
```json
{
  "id": "uuid",
  "stage": "screening"
}
```

**Response:**
```json
{
  "application": { ... },
  "source": "supabase"
}
```

---

## AI Scoring

### `POST /api/ai/score`

Score a candidate against a job. Returns cached result if available.

**Request:**
```json
{
  "candidateId": "uuid",
  "jobId": "uuid"
}
```

**Response:**
```json
{
  "matchBreakdown": {
    "score": 78,
    "skillScore": 82,
    "experienceScore": 75,
    "signalScore": 70,
    "matchedSkills": ["React", "TypeScript"],
    "missingSkills": ["GraphQL", "AWS"],
    "strengths": ["Strong skill overlap in frontend technologies", "5+ years relevant experience"],
    "weaknesses": ["Missing critical skill: GraphQL", "Missing critical skill: AWS"],
    "confidence": 85,
    "summary": "Jane has strong frontend skills with a match score of 78/100."
  },
  "cached": false
}
```

| Status | Condition |
|--------|-----------|
| 200 | Score computed or retrieved |
| 401 | Not authenticated |
| 400 | Missing candidateId or jobId |

---

## AI Summary

### `POST /api/ai/summary`

Generate a Gemini-powered candidate summary.

**Request:**
```json
{
  "candidateId": "uuid"
}
```

**Response:**
```json
{
  "summary": "Jane Doe is a Senior Frontend Engineer with 5+ years...",
  "source": "gemini"
}
```

| Status | Condition |
|--------|-----------|
| 200 | Summary generated |
| 401 | Not authenticated |

---

## Analytics

### `GET /api/analytics/recruiter`

Recruiter dashboard data. Requires recruiter authentication.

**Response:**
```json
{
  "analytics": {
    "totalCandidates": 15,
    "applicationsByStage": {
      "applied": 10,
      "screening": 6,
      "shortlisted": 3,
      "interview": 2,
      "offer": 1
    },
    "averageMatchScore": 72,
    "topSkills": [
      { "skill": "React", "count": 8 },
      { "skill": "TypeScript", "count": 6 }
    ],
    "applicationsOverTime": [
      { "date": "2026-05-20", "count": 3 },
      { "date": "2026-05-22", "count": 5 }
    ],
    "averageTimeInPipeline": 12,
    "pipelineConversion": [
      { "from": "applied", "to": "screening", "rate": 60 },
      { "from": "screening", "to": "shortlisted", "rate": 50 },
      { "from": "shortlisted", "to": "interview", "rate": 67 },
      { "from": "interview", "to": "offer", "rate": 50 }
    ],
    "recruiterActivity": [
      { "action": "update_stage", "count": 12 },
      { "action": "create_note", "count": 8 }
    ]
  }
}
```

### `GET /api/analytics/candidate`

Candidate dashboard data. Requires candidate authentication.

**Response:**
```json
{
  "analytics": {
    "totalApplications": 5,
    "applicationsByStage": {
      "applied": 3,
      "screening": 2
    },
    "profileCompleteness": 67,
    "recentActivity": [
      { "id": "uuid", "action": "application_submitted", "createdAt": "..." }
    ]
  }
}
```

---

## Recruiter Notes

### `GET /api/recruiter/notes?candidateId=...`

List notes for a candidate.

**Response:**
```json
{
  "notes": [
    {
      "id": "uuid",
      "candidateId": "uuid",
      "recruiterId": "uuid",
      "note": "Strong technical background...",
      "createdAt": "2026-05-29T12:00:00Z"
    }
  ]
}
```

### `POST /api/recruiter/notes`

Create a note.

**Request:**
```json
{
  "candidateId": "uuid",
  "note": "Great communication skills, recommend for interview stage"
}
```

**Response:**
```json
{
  "source": "supabase"
}
```

---

## Storage

### `POST /api/storage/upload`

Generate a signed URL for uploading a file.

**Request:**
```json
{
  "fileName": "resume.pdf",
  "contentType": "application/pdf",
  "size": 123456,
  "kind": "resume",
  "bucket": "resumes"
}
```

**Response:**
```json
{
  "signedUrl": "https://...",
  "storagePath": "userId/file-uuid.pdf",
  "publicUrl": "https://..."
}
```

### `POST /api/storage/upload/cleanup`

Delete a storage object.

**Request:**
```json
{
  "bucket": "resumes",
  "path": "userId/file-uuid.pdf"
}
```

**Response:**
```json
{ "ok": true }
```

---

## Health

### `GET /api/health`

System health check.

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2026-05-29T12:00:00Z",
  "env": { "node": "v20.0.0", "platform": "linux" },
  "checks": {
    "supabase_config": "ok",
    "service_role": "ok",
    "ai_api_key": "ok",
    "database": "ok"
  }
}
```

### `GET /api/health/worker`

Background worker health check.

**Response:**
```json
{
  "status": "healthy",
  "worker": {
    "status": "running",
    "uptime": 3600000,
    "processed": 42,
    "failed": 1,
    "lastHeartbeat": "2026-05-29T12:00:00Z"
  },
  "queue": {
    "pending": 0,
    "running": 0,
    "completed": 40,
    "failed": 1,
    "deadLetter": 0
  },
  "timestamp": "2026-05-29T12:00:00Z"
}
```

---

## Activity

### `GET /api/activity`

List activity log entries for the authenticated user.

**Query Parameters:**
| Param | Type | Description |
|-------|------|-------------|
| `page` | number | Page number (default: 1) |
| `limit` | number | Items per page (default: 20) |

**Response:**
```json
{
  "data": [
    {
      "id": "uuid",
      "action": "application_submitted",
      "entityType": "application",
      "entityId": "uuid",
      "metadata": { "jobTitle": "Senior Frontend Engineer" },
      "createdAt": "2026-05-29T12:00:00Z"
    }
  ]
}
```

---

## Common Error Responses

| Status | Meaning |
|--------|---------|
| 400 | Invalid payload (zod validation failure) |
| 401 | Not authenticated or wrong role |
| 404 | Resource not found |
| 409 | Resource already exists |
| 429 | Rate limited |
| 500 | Server error or Supabase not configured |

```json
{
  "error": "Human-readable error message",
  "issues": {
    "fieldErrors": { "email": ["Invalid email"] },
    "formErrors": []
  }
}
```
