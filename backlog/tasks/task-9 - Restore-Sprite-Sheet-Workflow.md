---
id: task-9
title: Restore Sprite-Sheet Workflow
status: Done
assignee: []
created_date: '2026-01-03 20:41'
updated_date: '2026-01-04 21:06'
labels: []
dependencies: []
priority: high
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Add a new SpriteSheet asset type with dedicated backend route and UI, restoring the original v0 spritesheet generation workflow. This generates a single sprite sheet with all animation frames in a grid (vs. the current frame-by-frame Animation workflow). Leave existing Animation workflow intact.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 New AssetType 'spritesheet' added to Prisma schema with SpriteSheet model
- [ ] #2 Left sidebar displays project sprite sheets in new collapsible section
- [ ] #3 SpriteSheet detail view shows generated sprite grid with metadata
- [ ] #4 Right sidebar form for creating/generating sprite sheets with character selection, angle preset, and sequence definitions
- [ ] #5 New API route POST /api/gen-spritesheet generates sprite grid using editImage with v0 prompt logic
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
1. Schema Updates (prisma/schema.prisma)
   - Add spritesheet to AssetType enum
   - Add SpriteSheet model with: id, projectId, characterId, name, description, assetId (references Asset), generationSettings (JSON), createdAt, updatedAt
   - Add spritesheets relation to Project model
   - Run db:generate and db:push

2. Store Updates (lib/store.ts)
   - Add TabType "spritesheet"
   - Add SpriteSheet and SpriteSheetWithAsset interfaces
   - Add spriteSheets to ProjectWithRelations
   - Add ActionContext for new-spritesheet

3. API Routes
   - Create app/api/spritesheets/route.ts (POST create, GET list)
   - Create app/api/spritesheets/[id]/route.ts (GET, PATCH, DELETE)
   - Modify app/api/gen-sprite/route.ts to use project-based asset storage and create SpriteSheet+Asset records (reference original v0 prompt logic)

4. Left Sidebar (components/ide/left-sidebar.tsx)
   - Add spriteSheetsOpen state
   - Add Sprite Sheets collapsible section (similar to Animations)
   - Wire handleSpriteSheetClick and handleNewSpriteSheet actions

5. Right Sidebar Form (components/ide/forms/new-spritesheet-form.tsx)
   - Character selector dropdown
   - Character asset picker (reference image)
   - Angle preset selector
   - Animation sequences list (name, description, frames per sequence)
   - Generate button that POSTs to /api/gen-spritesheet

6. Detail View (components/ide/views/spritesheet-view.tsx)
   - Header with name, character link, project link
   - Large sprite grid image display
   - Metadata sidebar showing sequences, total frames, generation settings
   - Download and delete actions

7. Workspace Integration (components/ide/workspace.tsx)
   - Add case for TabType "spritesheet" rendering SpriteSheetView

8. Right Sidebar (components/ide/right-sidebar.tsx)
   - Add case for ActionContext "new-spritesheet" rendering NewSpriteSheetForm
<!-- SECTION:PLAN:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
Key Files:
- prisma/schema.prisma: Data model
- lib/store.ts: Zustand state types and actions
- app/api/gen-sprite/route.ts: Existing gen-sprite logic (keep as base)
- components/sprite-workflow.tsx: Original v0 UI for reference
- components/ide/forms/new-animation-form.tsx: Reference for form structure
- components/ide/views/animation-view.tsx: Reference for view structure
- components/ide/left-sidebar.tsx: Lines 406-464 for Animations section pattern
- lib/config/character-presets.ts: anglePresets for dropdown

Original v0 Sprite Generation Prompt (from app/api/gen-sprite/route.ts):
- Uses editImage with source character
- Prompt includes sequence descriptions and grid layout requirements
- Uses aspectRatio: "1:1", resolution: "2K"
<!-- SECTION:NOTES:END -->
