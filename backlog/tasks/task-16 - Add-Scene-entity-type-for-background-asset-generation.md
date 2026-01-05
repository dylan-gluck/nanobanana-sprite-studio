---
id: task-16
title: Add Scene entity type for background asset generation
status: To Do
assignee: []
created_date: '2026-01-05 05:29'
labels:
  - scene
  - entity
  - backend
  - frontend
dependencies: []
priority: medium
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Introduce a new Scene entity type that belongs to Projects for organizing background assets. Scenes store metadata about artistic style and will serve as parent containers for background-related asset types (backgrounds, maps, tilesets, tiles). This ticket covers the data model, UI integration (sidebar listing, project homepage grid), and CRUD routes—not the asset generation workflows.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 Scene model exists in Prisma schema with relations to Project and Asset (including primaryAsset)
- [ ] #2 scene added to AssetType enum in schema
- [ ] #3 Scene CRUD API routes functional at /api/scenes and /api/scenes/[id]
- [ ] #4 Project GET endpoint includes scenes in response
- [ ] #5 Scenes collapsible section in left sidebar lists project scenes with New button
- [ ] #6 Scenes grid section on project homepage displays SceneCard components
- [ ] #7 NewSceneForm allows creating scenes with name, description, artStyle, mood, timeOfDay, environment, styleNotes
- [ ] #8 EditSceneForm allows updating scene metadata and shows primaryAsset preview
- [ ] #9 Scenes can be deleted from project view
- [ ] #10 Scene types (Scene, SceneWithAssets) added to store.ts
- [ ] #11 ActionContext supports new-scene and edit-scene cases
- [ ] #12 scene-presets.ts config created with styles, moods, timeOfDay, environments, and buildSceneSystemPrompt function
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
### Step 1: Prisma Schema Updates
**File: /Users/dylan/Workspace/vibe/megabananas/prisma/schema.prisma**

1.1 Add `scene` to AssetType enum (line 13-18)
1.2 Add Scene model (after line 161) with fields: id, projectId, name, description, createdAt, updatedAt, artStyle, mood, colorPalette, styleNotes, primaryAssetId, primaryAsset relation, project relation, assets relation
1.3 Update Project model (lines 35-39) - add scenes relation
1.4 Update Asset model (lines 59-73) - add scene relations (sceneId, scene, primaryForScene) and index

### Step 2: Store Updates
**File: /Users/dylan/Workspace/vibe/megabananas/lib/store.ts**

2.1 Add "scene" to TabType (lines 5-11)
2.2 Add Scene interface (after SpriteSheet ~line 99)
2.3 Add SceneWithAssets interface (after SpriteSheetWithAsset ~line 121)
2.4 Update Asset interface - add sceneId field
2.5 Update ProjectWithRelations - add scenes array
2.6 Add ActionContext cases: new-scene, edit-scene

### Step 3: API Routes

3.1 Create /app/api/scenes/route.ts - POST handler for creating scenes with validation
3.2 Create /app/api/scenes/[id]/route.ts - GET, PATCH, DELETE handlers
3.3 Update /app/api/projects/[id]/route.ts (lines 13-39) - add scenes to include block

### Step 4: Scene Presets Configuration
**File: /Users/dylan/Workspace/vibe/megabananas/lib/config/scene-presets.ts (new file)**

Create presets for: styles (pixel-art, anime, cartoon, realistic, watercolor, flat), moods (peaceful, dark, vibrant, mysterious, epic, cozy), timeOfDay (day, sunset, night, dawn), environments (forest, dungeon, city, castle, cave, ocean, mountains, sky). Include buildSceneSystemPrompt function.

### Step 5: UI Components

5.1 Update Left Sidebar (components/ide/left-sidebar.tsx):
- Add scenesOpen state
- Add handleSceneClick and handleNewScene handlers
- Add Scenes collapsible section (after Characters section, line 449)
- Add Mountain icon import, SceneWithAssets type import

5.2 Update Project View (components/ide/views/project-view.tsx):
- Add Mountain icon import
- Add SceneWithAssets type import
- Add Scenes grid section (after Characters section ~line 265)
- Add SceneCard component (after CharacterCard ~line 452)

5.3 Create New Scene Form (components/ide/forms/new-scene-form.tsx):
Form with fields: name, description, artStyle, mood, timeOfDay, environment, styleNotes

5.4 Create Edit Scene Form (components/ide/forms/edit-scene-form.tsx):
Form with fields: name, description, artStyle, mood, styleNotes, preview of primaryAsset

5.5 Update Right Sidebar (components/ide/right-sidebar.tsx):
- Add Mountain icon import
- Import NewSceneForm and EditSceneForm
- Add cases for new-scene/edit-scene in ActionContextIcon, ActionContextTitle, ActionContextContent

### Step 6: Post-Schema Changes
Run: bun run db:generate then bun run db:push

## Implementation Order
1. Schema first - Prisma schema updates
2. Run db commands - Generate client and push schema
3. Store types - Add Scene interfaces and ActionContext
4. API routes - Create scenes CRUD, update project GET
5. Presets config - Create scene-presets.ts
6. Forms - new-scene-form.tsx, edit-scene-form.tsx
7. Right sidebar - Wire up forms
8. Left sidebar - Add Scenes section
9. Project view - Add Scenes grid section
10. Test - Verify CRUD operations work end-to-end
<!-- SECTION:PLAN:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
Key files:
- prisma/schema.prisma: Add Scene model and update Asset/Project relations
- lib/store.ts: Add Scene types and ActionContext cases
- lib/config/scene-presets.ts: New file for style/mood/environment presets
- components/ide/left-sidebar.tsx: Add Scenes collapsible section
- components/ide/views/project-view.tsx: Add Scenes grid and SceneCard
- components/ide/forms/new-scene-form.tsx: New file
- components/ide/forms/edit-scene-form.tsx: New file
- components/ide/right-sidebar.tsx: Wire up scene forms
- app/api/scenes/route.ts: New CRUD route
- app/api/scenes/[id]/route.ts: New CRUD route
- app/api/projects/[id]/route.ts: Update to include scenes

Pattern reference: Follow existing Character entity implementation for consistency
Dependencies: None (self-contained feature)
<!-- SECTION:NOTES:END -->
