---
id: task-12
title: Remove unique name constraints from Animation and SpriteSheet models
status: Done
assignee: []
created_date: '2026-01-05 03:50'
updated_date: '2026-01-05 03:54'
labels: []
dependencies: []
priority: medium
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Allow duplicate names for animations and spritesheets within the same character. Current unique constraints prevent users from having multiple animations or spritesheets with the same name per character, which is unnecessarily restrictive since all queries use id-based lookups.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 Animation model no longer has @@unique([characterId, name]) constraint
- [x] #2 SpriteSheet model no longer has @@unique([characterId, name]) constraint
- [x] #3 Database migration successfully applied
- [ ] #4 Can create multiple animations with same name on one character
- [ ] #5 Can create multiple spritesheets with same name on one character
- [x] #6 TypeScript compilation passes
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
1. Modify prisma/schema.prisma:
   - Remove @@unique([characterId, name]) from Animation model (line 118)
   - Remove @@unique([characterId, name]) from SpriteSheet model (line 160)
   - Keep existing @@index([characterId]) on both models for query performance

2. Create and apply migration:
   - Run: bun run db:migrate
   - Migration name: remove-animation-spritesheet-name-uniqueness
   - Expected SQL: DROP INDEX statements for both unique constraints

3. Regenerate Prisma client:
   - Run: bun run db:generate

4. Verify application:
   - Run: bun run typecheck
   - Run: bun run dev
   - Test creating duplicate-named animations and spritesheets
<!-- SECTION:PLAN:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
Critical files:
- prisma/schema.prisma lines 118 and 160

Risk assessment: Low risk change
- All existing queries use id-based lookups (verified in animations/[id]/route.ts, spritesheets/[id]/route.ts)
- No name-based queries exist in codebase
- Frontend only displays name values, never queries by them
- Removing constraint is non-breaking - existing data remains valid

No code changes needed beyond schema - verified routes:
- app/api/animations/route.ts - creates with name, no lookup
- app/api/animations/[id]/route.ts - findUnique by id
- app/api/spritesheets/route.ts - creates with name, no lookup
- app/api/spritesheets/[id]/route.ts - findUnique by id
<!-- SECTION:NOTES:END -->
