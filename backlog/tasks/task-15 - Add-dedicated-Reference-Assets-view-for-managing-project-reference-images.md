---
id: task-15
title: Add dedicated Reference Assets view for managing project reference images
status: To Do
assignee: []
created_date: '2026-01-05 05:22'
labels:
  - ui
  - reference-assets
  - view
dependencies: []
priority: medium
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Add a dedicated view for managing project reference assets. This provides a centralized location to view, upload, and delete reference images that can be used across the project for AI generation context.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 Reference Assets link appears in left sidebar under Project Home button (only visible when project selected)
- [ ] #2 Clicking Reference Assets link opens/focuses a reference-assets tab for current project
- [ ] #3 View displays existing reference assets in grid using AssetThumbnail component
- [ ] #4 View has upload dropbox supporting drag-drop and click-to-upload
- [ ] #5 Can delete references via AssetThumbnail context menu
- [ ] #6 Tab shows correct icon (ImagePlus from lucide-react)
- [ ] #7 TypeScript compiles without errors (bun run typecheck passes)
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
Implementation sequence (order matters for dependencies):

1. Update TabType in lib/store.ts (lines 5-10)
   - Add "reference-assets" to TabType union

2. Create components/ide/views/reference-assets-view.tsx (NEW FILE)
   - Header with title and project name
   - Upload dropzone (drag/drop or click-to-upload)
   - Grid of AssetThumbnail components for existing references
   - Delete functionality via AssetThumbnail onDelete prop
   - Uses existing APIs:
     - GET /api/projects/[id]/assets?type=reference
     - POST /api/projects/[id]/references
     - DELETE /api/projects/[id]/references?assetId=X
   - Pattern follows project-view.tsx (lines 72-136) and image-upload.tsx for dropzone

3. Register view in components/ide/workspace.tsx
   - Import ReferenceAssetsView
   - Add ImagePlus to lucide imports
   - Add "reference-assets": ImagePlus to tabIcons object (lines 14-20)
   - Add case in TabContent switch (lines 130-143):
     case "reference-assets":
       return <ReferenceAssetsView projectId={tab.entityId} />;

4. Add button to components/ide/left-sidebar.tsx
   - Add ImagePlus import from lucide-react
   - Add handler function handleReferenceAssetsClick:
     const handleReferenceAssetsClick = () => {
       if (currentProject) {
         openTab("reference-assets", currentProject.id, "Reference Assets");
       }
     };
   - Add Reference Assets button after Project Home button (after line 378-379):
     <Button variant="ghost" size="sm" className="w-full justify-start text-muted-foreground hover:text-foreground" onClick={handleReferenceAssetsClick}>
       <ImagePlus className="h-4 w-4 mr-2" />
       Reference Assets
     </Button>
<!-- SECTION:PLAN:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
Key files to reference:
- lib/store.ts: TabType union definition (lines 5-10)
- components/ide/views/project-view.tsx: Pattern for view component (lines 72-136)
- components/ide/workspace.tsx: Tab registration and icon mapping (lines 14-20, 130-143)
- components/ide/left-sidebar.tsx: Project Home button location (lines 378-379)
- components/ui/image-upload.tsx: Dropzone implementation pattern
- components/ide/views/asset-thumbnail.tsx: Existing thumbnail component with context menu

Existing APIs (already implemented):
- GET /api/projects/[id]/assets?type=reference - Fetch reference assets
- POST /api/projects/[id]/references - Upload new reference
- DELETE /api/projects/[id]/references?assetId=X - Delete reference
<!-- SECTION:NOTES:END -->
