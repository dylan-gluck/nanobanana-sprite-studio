---
id: task-13
title: >-
  SpriteSheet to Animation Workflow - Extract frames from spritesheet using
  Gemini
status: To Do
assignee: []
created_date: '2026-01-05 04:31'
labels: []
dependencies: []
priority: high
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Add workflow to create an animation sequence of individual frames from a spritesheet asset using the Gemini model to extract each frame sequentially. Uses AI-based extraction (not programmatic splitting) because spritesheet grids are not always perfectly aligned. Follows the existing gen-animation SSE streaming pattern.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 Prompt builder (lib/config/sprite-extraction-prompts.ts) exports buildExtractionPrompt function with support for first-frame (sprite only) and subsequent-frame (sprite + previous) reference modes
- [ ] #2 SSE endpoint (/api/extract-frames-from-sprite) extracts frames sequentially, emitting frame_start, frame_complete, and error events
- [ ] #3 Each extracted frame creates an Asset record with referenceAssetIds pointing to source spritesheet
- [ ] #4 Spritesheet view displays 'Create Animation' button that creates Animation record and opens animation tab
- [ ] #5 Animation view detects sourceType: 'spritesheet' in generationSettings and calls extract-frames-from-sprite endpoint
- [ ] #6 Extracted frames maintain consistent character position and scale across the sequence
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
1. Create lib/config/sprite-extraction-prompts.ts (NEW)
   - Export BuildExtractionPromptParams interface with frameIndex, totalFrames, characterName, animationName, anglePreset, referenceMode, gridInfo
   - Export buildExtractionPrompt() function
   - First frame (index 0): sprite-only reference with grid position instructions
   - Subsequent frames: sprite + previous frame reference for position/scale consistency
   - Emphasize extraction language, grid layout metadata, consistent positioning

2. Create app/api/extract-frames-from-sprite/route.ts (NEW)
   - Based on gen-animation/route.ts pattern (lines 1-275)
   - Request: { animationId, spriteSheetId }
   - SSE events: start, frame_start, frame_complete, frame_error, complete, error
   - Load spritesheet image as base64
   - Extract frameCount, cols, rows, anglePreset from spriteSheet.generationSettings
   - Loop through frames:
     * Frame 0: spritesheet only as reference
     * Frame 1+: spritesheet + previous extracted frame
     * Call generateImage() with extraction prompt
     * Save to public/assets/[projectId]/frames/[animSlug]/
     * Create Asset record with type: "frame", referenceAssetIds: [spriteSheet.assetId]
     * Create Frame record linked to Animation

3. Update components/ide/views/spritesheet-view.tsx (MODIFY)
   - Add Film icon import from lucide-react
   - Add isCreatingAnimation state
   - Add handleCreateAnimation handler:
     * POST to /api/animations with sourceType: "spritesheet", spriteSheetId, spriteSheetAssetId in generationConfig
     * Call refreshCurrentProject()
     * Call openTab("animation", animation.id, animation.name)
   - Add "Create Animation" button in header button group

4. Update components/ide/views/animation-view.tsx (MODIFY)
   - Extend AnimationWithDetails.generationSettings interface with sourceType, spriteSheetId, spriteSheetAssetId
   - Modify startGeneration() to check sourceType:
     * If "spritesheet": call /api/extract-frames-from-sprite with animationId, spriteSheetId
     * Else: existing /api/gen-animation call
   - SSE handling remains unchanged (same event types)
<!-- SECTION:PLAN:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
Key reference files:
- app/api/gen-animation/route.ts - SSE streaming pattern, file saving, Asset/Frame record creation
- lib/config/animation-prompts.ts - Prompt builder structure with reference modes
- components/ide/views/spritesheet-view.tsx - Add "Create Animation" button here
- components/ide/views/animation-view.tsx - SSE handling and auto-generation logic
- lib/gemini.ts - generateImage() function for AI extraction
- prisma/schema.prisma - SpriteSheet, Animation, Frame, Asset models

File path conventions:
- Frames: public/assets/[projectId]/frames/[animationSlug]/[charSlug]_[animSlug]_[frameIdx]_[timestamp].png

Prompt engineering notes:
- First frame: "Extract frame 1 of N from spritesheet. Grid is CxR. Isolate leftmost/first cell, center character, maintain style."
- Subsequent: "Extract frame N. Reference previous frame for position/scale. Same center position and scale."
- Emphasize: frame isolation, consistent positioning, scale preservation, grid reference, clean extraction

Dependency order:
- Step 1 (prompt builder) before Step 2 (API route)
- Steps 1-2 (backend) before Step 4 (animation-view integration)
- Step 3 can run parallel after backend ready
<!-- SECTION:NOTES:END -->
