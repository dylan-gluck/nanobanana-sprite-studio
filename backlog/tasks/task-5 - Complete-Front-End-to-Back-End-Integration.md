---
id: task-5
title: Complete Front-End to Back-End Integration
status: Done
assignee: []
created_date: '2026-01-02 01:50'
updated_date: '2026-01-02 02:21'
labels:
  - frontend
  - backend
  - integration
dependencies:
  - task-2
  - task-3
priority: high
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
The IDE layout (task-3) is structurally complete but the UI is non-functional. Forms show placeholder toasts instead of calling APIs. Critical CRUD operations are missing handlers. API routes for creating entities don't exist. This task connects all UI components to their backend endpoints and ensures data mutations properly refresh the UI state.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 Can create new project via UI
- [ ] #2 Can create new character via form (calls API, persists to DB)
- [ ] #3 Can create new animation via form (calls API, persists to DB)
- [ ] #4 Sidebar refreshes after creating entities
- [ ] #5 Project view refreshes after creating entities
- [ ] #6 Edit/delete handlers show confirmation and call appropriate APIs
- [ ] #7 Set primary asset works for character variations
- [ ] #8 All mutations provide user feedback (loading states, success/error toasts)
<!-- AC:END -->
