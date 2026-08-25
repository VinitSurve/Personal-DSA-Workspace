# TRD — Personal DSA Learning Workspace

**Version:** 1.0 **Status:** Locked for Development **Architecture:** React **PWA** + Supabase + GitHub Actions + Gemini **API** **Initial Language:** Python **Primary Deployment:** Web/**PWA**

---

# 1. Technical Overview

The application consists of four primary layers:

```text
┌─────────────────────────────────────────────┐
│                 React **PWA**                   │
│  Problems • Code • History • Flashcards     │
│  Progress • Gemini Tutor                    │
└──────────────────────┬──────────────────────┘
    │
    ▼
┌─────────────────────────────────────────────┐
│                  Supabase                   │
│        PostgreSQL • Auth • **RLS**              │
│             Edge Functions                  │
└──────────────────────┬──────────────────────┘
    ▲
    │
    Synchronization
    │
┌──────────────────────┴──────────────────────┐
│               GitHub Actions                │
│        Repository → Supabase sync            │
└──────────────────────▲──────────────────────┘
    │
    │ git push
┌──────────────────────┴──────────────────────┐
│                  GitHub                     │
│          **DSA** repository / source code       │
└─────────────────────────────────────────────┘

    Gemini
    ▲
    │
    Secure **API** call
    │
    Supabase Function
```

---

# 2. Technology Stack

## Frontend

- React
- Vite
- JavaScript/TypeScript
- **CSS**
- React Router
- Code syntax highlighting
- **PWA** support

**No Tailwind requirement.** Normal **CSS** is sufficient.

---

## Backend

Use **Supabase** for:

- PostgreSQL database
- Authentication
- Row Level Security
- Edge Functions where required
- Database APIs

---

## Source Control

**GitHub**

Repository contains:

```text problems/ solutions/ ```

GitHub remains the source of truth for code.

---

## CI/CD

**GitHub Actions**

Used for:

- Detecting changed solution files
- Parsing solution metadata
- Synchronizing changes to Supabase
- Handling additions/updates/deletions

---

## AI

**Google Gemini **API****

Gemini is used as a **DSA** tutor.

AI requests should go through a secure backend/Edge Function rather than exposing the Gemini **API** key in the browser.

---

# 3. Repository Structure

Recommended repository:

```text dsa-workspace/ │ ├── solutions/ │   ├── patterns/ │   │   ├── pattern-01.py │   │   ├── pattern-02.py │   │   └── pattern-03.py │   │ │   ├── arrays/ │   ├── strings/ │   ├── recursion/ │   └── sorting/ │ ├── problems/ │   ├── patterns/ │   ├── arrays/ │   └── strings/ │ ├── .github/ │   └── workflows/ │       └── sync.yml │ └── **README**.md ```

The exact structure can be simplified if the synchronization logic benefits from a different convention.

---

# 4. Database Design

Supabase PostgreSQL will contain the following core tables.

## 4.1 `problems`

```text id slug title description topic difficulty source created_at updated_at ```

### Constraints

- `slug` must be unique.
- `difficulty` should use controlled values.
- `topic` should be indexed.

---

## 4.2 `solutions`

```text id problem_id user_id language github_path current_code latest_commit_sha created_at updated_at ```

### Constraints

```text (problem_id, user_id, language) ```

should uniquely identify the current solution.

---

## 4.3 `solution_revisions`

```text id solution_id commit_sha code commit_message created_at ```

`commit_sha` should be unique for a given solution.

---

## 4.4 `flashcards`

```text id problem_id user_id question answer next_review_at review_count created_at updated_at ```

Basic review state is sufficient initially.

---

## 4.5 `notes`

```text id problem_id user_id content created_at updated_at ```

Notes are optional but should be supported by the schema.

---

## 4.6 `ai_conversations`

```text id user_id problem_id title created_at updated_at ```

---

## 4.7 `ai_messages`

```text id conversation_id role content created_at ```

`role`:

```text user assistant ```

---

## 4.8 `user_progress`

```text id user_id problem_id status attempts solved_at updated_at ```

Possible status:

```text not_started attempted solved review ```

---

# 5. Database Security

Supabase **Row Level Security must be enabled** for user-owned tables.

A user should only be able to access their own:

- Solutions
- Revisions
- Flashcards
- Notes
- Progress
- AI conversations
- AI messages

Problem metadata can be public/readable depending on the final architecture.

The frontend must never bypass **RLS** using privileged credentials.

---

# 6. GitHub Synchronization

This is the most important backend workflow.

## Trigger

GitHub Action runs on pushes to the configured branch.

```yaml
on:
    push:
    branches:
    - main
```

The workflow should identify changed files rather than synchronizing the entire repository every time.

---

# 7. Synchronization Flow

```text
GitHub Push
     ↓
GitHub Actions
     ↓
Determine changed files
     ↓
Validate file
     ↓
Extract metadata
     ↓
Call Supabase ingestion endpoint
     ↓
Find existing solution
     ↓
Create/update solution
     ↓
Create revision
```

---

# 8. Synchronization API

Prefer a controlled Supabase Edge Function such as:

```text **POST** /functions/v1/sync-solution ```

Payload:

```json
{
    *path*: *solutions/patterns/pattern-01.py*,
    *code*: *....*,
    *commit_sha*: *abc123*,
    *commit_message*: *Fix pattern 1*,
    *language*: *python*
}
```

The function validates the request and performs the database operation.

This is preferable to putting raw database credentials and **SQL** logic inside the GitHub workflow.

---

# 9. Idempotency

The synchronization system **must be idempotent**.

If the same GitHub Action runs twice for the same commit, it must not create duplicate records.

Example:

```text commit_sha = abc123 ```

already exists:

```text → don't create another revision ```

If the solution exists but the commit is new:

```text → update solutions.current_code → insert solution_revisions ```

---

# 10. Handling File Changes

### New file

```text **INSERT** solution **INSERT** revision ```

### Modified file

```text **UPDATE** solution **INSERT** revision ```

### Deleted file

Do not immediately destroy historical revisions.

Instead, mark the solution as deleted/archived.

Recommended field:

```text is_active ```

This preserves learning history.

---

# 11. Frontend Architecture

Recommended structure:

```text src/ ├── components/ │   ├── CodeViewer/ │   ├── ProblemCard/ │   ├── Flashcard/ │   ├── ProgressCard/ │   └── AIChat/ │ ├── pages/ │   ├── Login/ │   ├── Dashboard/ │   ├── Problems/ │   ├── Problem/ │   ├── Flashcards/ │   └── History/ │ ├── lib/ │   ├── supabase.js │   └── api.js │ ├── hooks/ ├── services/ ├── styles/ └── App.jsx ```

Keep the component architecture simple.

Avoid unnecessary state-management libraries unless they become necessary.

---

# 12. Main Frontend Screens

## Dashboard

Show:

- Problems solved
- Current topics
- Flashcards due
- Recent solutions
- Recent activity

---

## Problems

List/filter:

- Topic
- Difficulty
- Status

---

## Problem Detail

```text Problem ────────────── Description

Solution ────────────── Python code

[History] [AI Tutor]

Flashcards ──────────────

Notes ────────────── ```

---

## Code History

Display revisions:

```text Latest ↓ Commit 4 Commit 3 Commit 2 Commit 1 ```

Allow viewing older code.

---

## Flashcards

Basic flow:

```text Question ↓ ### Reveal Answer ↓ Again / Good / Easy ↓ Schedule next review ```

A lightweight spaced-repetition implementation is sufficient.

---

# 13. Gemini Integration

Gemini should be accessed through a server-side function.

```text React ↓ ### Supabase Edge Function ↓ Gemini **API** ↓ Response ↓ React ```

The Gemini **API** key must remain server-side.

---

# 14. Gemini Context

For a question about a problem, the backend should construct context containing:

```text Problem title Problem description Topic Current solution Selected code Relevant conversation history ```

Example prompt concept:

```text You are a **DSA** tutor.

Explain the user's code clearly. Do not assume the user already understands the concept.

Problem: {problem}

Code: {code}

Selected code: {selection}

Question: {question} ```

The exact prompt should be refined during implementation.

---

# 15. AI Features

**MVP** actions:

### Explain

Explain the selected code.

### Why?

Explain why a specific line/loop works.

### Hint

Give a hint without immediately revealing the solution.

### Debug

Identify the likely logical problem.

### Complexity

Explain time and space complexity.

### Quiz

Ask questions based on the current problem/code.

### Custom Chat

Allow normal conversation about the problem.

---

# 16. API Key Security

Never place:

```text GEMINI_API_KEY ```

inside React/Vite client-side environment variables that are exposed to the browser.

Use:

```text
### Supabase Edge Function
        ↓
Gemini **API**
```

with the key stored as a server-side secret.

GitHub credentials and Supabase privileged credentials must also be stored as **GitHub Actions Secrets**, never committed to the repository.

---

# 17. Authentication Flow

```text User ↓ ### Supabase Auth ↓ Session ↓ React ↓ Authenticated Supabase queries ```

The frontend uses the public Supabase client key.

**RLS** determines what the authenticated user can access.

---

# 18. PWA Requirements

The **PWA** should include:

- Web manifest
- Service worker
- Installable application
- Responsive layout
- Mobile navigation
- Cached application shell

Do not attempt complete offline database synchronization in v1.

---

# 19. Performance Requirements

The application should:

- Load the dashboard quickly.
- Avoid downloading every solution at once.
- Fetch solution code when required.
- Paginate long problem/history lists.
- Avoid unnecessary Gemini requests.
- Cache appropriate static resources.

Code history should be fetched only when the user opens history.

---

# 20. Error Handling

The application should clearly handle:

### GitHub sync failure

```text Sync failed Commit: abc123 Reason: ... ```

### Gemini failure

```text Unable to contact Gemini. Try again. ```

### Supabase failure

Display a useful error rather than silently failing.

### Missing solution

Show:

```text No solution has been synced yet. ```

---

# 21. GitHub Action Failure Handling

A failed synchronization should:

## Fail the Action.

## Show a meaningful error in GitHub Actions. ## Avoid partially corrupting the database. ## Be safely retryable.

The sync operation should use transactional database operations where appropriate.

---

# 22. Deployment

### Frontend

Deploy React **PWA** to:

**Vercel**

### Backend

Use:

**Supabase**

### Source

**GitHub**

### CI

**GitHub Actions**

---

# 23. Environment Variables

Frontend:

```text VITE_SUPABASE_URL VITE_SUPABASE_ANON_KEY ```

Server-side:

```text SUPABASE_SERVICE_ROLE_KEY GEMINI_API_KEY ```

GitHub Actions secrets should contain only the credentials actually required by the workflow.

---

# 24. Development Phases

## Phase 1 — Foundation

- React/Vite setup
- Supabase project
- Authentication
- Database schema
- Basic **PWA**

## Phase 2 — GitHub Sync

- Repository structure
- GitHub Action
- Changed-file detection
- Supabase ingestion function
- Idempotent synchronization
- Revision storage

## Phase 3 — Learning Interface

- Dashboard
- Problem list
- Problem detail
- Code viewer
- History

## Phase 4 — Learning Tools

- Flashcards
- Basic spaced repetition
- Progress tracking
- Notes

## Phase 5 — Gemini

- Gemini Edge Function
- Context-aware questions
- Explain/hint/debug/complexity actions
- Conversation history

## Phase 6 — Polish

- Mobile UI
- **PWA** installation
- Error handling
- Performance
- Deployment
- End-to-end testing

---

# 25. Technical Constraints

The project should remain intentionally simple.

### Avoid initially

- Redux
- Microservices
- Separate backend server
- Docker
- Kubernetes
- Complex event architecture
- Multiple databases
- Custom authentication
- Custom code execution engine
- Over-engineered AI agents

The stack should remain:

```text
React
- Supabase
- GitHub Actions
- Gemini
```

---

# 26. Definition of Done

The **TRD** is considered implemented when:

```text
Local Python solution
        ↓
git push
        ↓
GitHub Action succeeds
        ↓
Supabase contains solution
        ↓
**PWA** displays solution
        ↓
Revision appears in history
        ↓
Flashcard can be reviewed
        ↓
Gemini can explain the code
        ↓
Same information works on mobile
```

That is the **technical target for v1**. Anything beyond this should be treated as a future enhancement rather than a requirement.