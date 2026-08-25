# PRD — Personal DSA Learning Workspace

**Version:** 1.0 **Status:** Locked for Development **Product Type:** Personal **PWA** **Primary User:** Single learner **Development Approach:** Simple, focused **MVP**

---

## 1. Product Overview

A personal ****DSA** learning workspace** that connects a GitHub repository with Supabase and a React **PWA**.

The user writes and maintains **DSA** solutions locally, pushes them to GitHub, and GitHub Actions automatically synchronizes the relevant code and metadata into Supabase.

The **PWA** then provides a mobile-friendly interface for:

- Reviewing problems and solutions
- Viewing code history
- Revising through flashcards
- Tracking **DSA** progress
- Asking Gemini questions about specific code/concepts

The application is designed primarily as a **learning and revision tool**, not as a replacement for competitive-programming judges such as **TUF**.

---

# 2. Problem Statement

When practicing **DSA**, solutions are often scattered across:

- **TUF**/problem platforms
- Local files
- GitHub repositories
- Notes
- ChatGPT/Gemini conversations

This makes revision inconvenient, especially from a phone.

The product solves this by creating a single interface where the learner can access their **DSA** learning material from both desktop and mobile.

---

# 3. Product Goal

Create a lightweight personal **DSA** platform where the user can:

> **Write code locally → push to GitHub → automatically sync → review and learn from it anywhere.**

The application should make it easy to understand **how and why a solution works**, rather than simply storing completed answers.

---

# 4. Target User

### Primary

A student actively learning **DSA** with Python.

The initial application is optimized for **one personal user**, rather than a public multi-user platform.

### User Environment

- Desktop/laptop for coding
- Phone for revision
- GitHub for code storage
- Supabase for application data
- Gemini for AI assistance

---

# 5. Core User Flow

### Coding

```text
Write solution locally
        ↓
Test locally
        ↓
git push
        ↓
GitHub Actions
        ↓
Sync code to Supabase
```

### Revision

```text Open **PWA** ↓ Select topic/problem ↓ View solution ↓ Review history ↓ Study flashcards ↓ Ask Gemini questions ```

---

# 6. MVP Features

## 6.1 Problem Library

Display the user's **DSA** problems organized by topic.

Example:

```text **DSA** ├── Patterns ├── Arrays ├── Strings ├── Sorting ├── Searching ├── Recursion ├── Linked List ├── Stack ├── Queue ├── Trees └── Graphs ```

Each problem should contain:

- Problem title
- Topic
- Difficulty
- Problem description
- Solution status
- Available solution(s)

---

## 6.2 Code Viewer

The user can open a problem and view its solution.

Required:

- Syntax highlighting
- Language indicator
- Copy code
- Responsive/mobile viewing
- Problem → solution relationship

Initial language:

**Python**

Other languages can be added later.

---

## 6.3 GitHub Synchronization

GitHub is the source of truth for solution code.

When the user pushes code:

```text git push ↓ GitHub Action ↓ Detect changed files ↓ Parse metadata/code ↓ Synchronize with Supabase ```

The system must support:

- New solution
- Updated solution
- New revision
- Deleted solution
- Multiple solution files
- Failed synchronization handling

The synchronization process should be **idempotent** to prevent duplicate database records.

---

## 6.4 Code History

The application should show previous versions of a solution.

Example:

```text Pattern 1

Current ├── Revision 4 — Final solution ├── Revision 3 — Fixed inner loop ├── Revision 2 — Fixed output └── Revision 1 — First attempt ```

Each revision should contain:

- Code
- Commit **SHA**
- Timestamp
- GitHub commit reference

The user should be able to compare or view previous versions.

---

## 6.5 Flashcards

The application should provide flashcards for **DSA** revision.

Example:

**Question**

> Why does the inner loop run `i + 1` times?

**Answer**

> Because the pattern requires the current row to contain one more element than the previous row.

Flashcards should support:

- Question
- Answer
- Problem/topic association
- Review status
- Next review date

A basic spaced-repetition mechanism is sufficient for **MVP**.

We do **not** need to implement a complex Anki-style algorithm initially.

---

## 6.6 Gemini AI Tutor

The user can ask Gemini questions about their code.

Example:

```text Selected code:

for i in range(n):
    for j in range(i + 1):
    print(***, end="")
```

User:

> Why does the inner loop use i + 1?

Gemini should receive relevant context such as:

- Problem
- User's code
- Selected code/line where possible
- Topic
- Previous conversation

Possible actions:

- Explain this code
- Explain this loop
- Explain this line
- Find my mistake
- Give me a hint
- Explain the time complexity
- Quiz me
- Ask a custom question

The AI should prioritize **teaching and hints** rather than immediately dumping complete solutions.

---

## 6.7 Progress Tracking

Track basic learning progress.

Examples:

```text Patterns ████████░░ 80%

Arrays ████░░░░░░ 40%

Strings ██░░░░░░░░ 20% ```

Track:

- Problems attempted
- Problems solved
- Topics completed
- Flashcards reviewed
- Recent activity

Keep this simple.

---

## 6.8 PWA

The application should work well on:

- Desktop
- Tablet
- Mobile

The **PWA** should provide:

- Responsive UI
- Installability
- Fast loading
- Mobile-friendly code viewing
- Offline-friendly static/application shell where practical

Full offline database synchronization is **not required for **MVP****.

---

# 7. Authentication

Because this is initially a personal application:

### MVP

Use **Supabase Authentication**.

The application should restrict private user data through Supabase Row Level Security.

No public user profiles are required.

No social login requirements beyond whatever authentication method is simplest to implement.

---

# 8. Data Ownership

### GitHub

Owns:

- Solution source code
- Git history
- Commit history

### Supabase

Owns:

- Problem metadata
- Synced solution metadata
- Flashcards
- Notes
- Progress
- AI conversation history
- User/application state

The application should avoid treating Supabase as the primary source of the actual source-code history.

---

# 9. Non-Goals

The **MVP** will **not** attempt to build:

- A competitive programming judge
- A **TUF** replacement
- A public coding platform
- A social network
- Leaderboards
- Code execution infrastructure
- Online compiler
- Multi-language support initially
- Advanced collaborative coding
- Complex gamification
- Full Anki replacement
- Complex AI agent architecture
- Advanced analytics

These can be considered later if genuinely useful.

---

# 10. Success Criteria

The **MVP** is successful when the user can:

## Create/update a DSA solution locally.

## Push it to GitHub. ## Have GitHub Actions automatically synchronize it to Supabase. ## Open the PWA on a phone. ## Find the problem and solution. ## View previous code revisions. ## Review flashcards. ## Ask Gemini why a specific piece of code works. ## Track basic DSA progress.

The complete flow should work without manually inserting solution code into Supabase.

---

# 11. MVP Definition

The project is considered ****MVP**-complete** when this flow works reliably:

```text
Python file
    ↓
Git push
    ↓
GitHub Actions
    ↓
Supabase
    ↓
React **PWA**
    ↓
Problem + Code + History
    ↓
Flashcards
    ↓
### Gemini Tutor
```

Anything outside this flow is secondary.

---

# 12. Product Principle

> **Build the smallest useful **DSA** learning system, not the biggest one.**

The application should remain simple, fast, mobile-friendly, and focused on helping the user **understand and revise **DSA** solutions**.