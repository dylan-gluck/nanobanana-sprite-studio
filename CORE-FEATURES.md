# Core Features Refactor

## Overview

This document outlines a significant refactor of megabananas from a simple file-based workflow tool to a project-organized, database-backed creative application with sophisticated animation capabilities.

**Current State**: Next.js app with Gemini AI integration, file-system storage only, two standalone workflows (character generation, sprite grid generation).

**Target State**: IDE-style application with project organization, persistent entities with full provenance tracking, and frame-by-frame animation generation with cumulative AI context.

---

## Overall Objective

Transform the application architecture to support:
- **Multi-project organization** — All work contained within discrete projects
- **Asset provenance** — Every generated image tracked with prompts, references, and settings used
- **Hierarchical navigation** — Project → Character → Animation → Frame drill-down
- **Iterative animation workflow** — Individual frame generation with per-frame control and retry

---

## Key Architectural Decisions

| Decision | Rationale |
|----------|-----------|
| PostgreSQL + Prisma | Relational integrity for entity relationships; type-safe queries; migration tooling |
| Asset as unified storage | Single entity for all images (refs, characters, frames) with consistent provenance |
| Project as top-level container | Clean data isolation, multi-project support, project-scoped settings |
| IDE three-column layout | Supports hierarchical navigation + tabbed workspace + contextual actions |
| Sequential frame generation | Cumulative context (prior frames as references) produces more coherent animations |
| Individual frame Assets | Enables per-frame iteration, reordering, substitution vs. monolithic sprite grid |

---

## Feature Tasks

### 1. Prisma ORM Setup
**Objective**: Add database persistence layer

- Install Prisma with PostgreSQL provider
- Configure migrations workflow
- Create shared client singleton
- Add bun scripts for db operations

**Depends on**: Nothing

---

### 2. Data Model & Entities
**Objective**: Define schema for project-based organization with provenance tracking

**Entities**:
- `Project` — Container with settings, thumbnail
- `Asset` — All images with file path, prompts, reference IDs, generation settings
- `Character` — Name, prompt, primary asset, variations
- `Animation` — Sequence description, belongs to character
- `Frame` — Position in sequence, links to asset

**Key patterns**:
- Assets store generation provenance (system prompt, user prompt, reference asset IDs)
- File paths follow convention: `public/assets/[projectId]/[type]/[name]_[id].png`
- Characters can have multiple variation Assets; one marked primary

**Depends on**: Task 1

---

### 3. IDE-Style Layout
**Objective**: Replace dual-workflow UI with project-navigable workspace

**Structure**:
```
┌─────────────┬────────────────────────┬─────────────┐
│ Left        │ Center                 │ Right       │
│ Sidebar     │ Tabbed Workspace       │ Sidebar     │
├─────────────┼────────────────────────┼─────────────┤
│ Project     │ Tab: Project View      │ Context-    │
│ Picker      │ Tab: Character View    │ aware       │
│             │ Tab: Animation View    │ action      │
│ Characters  │                        │ forms       │
│ Animations  │                        │             │
└─────────────┴────────────────────────┴─────────────┘
```

**Views**:
- Project — Metadata, character grid, animation grid
- Character — Primary image, variations gallery, animations list
- Animation — Ordered frames, all generated frames, reordering

**Depends on**: Task 2

---

### 4. Sequential Animation Workflow
**Objective**: Replace sprite-grid generation with frame-by-frame approach

**Generation flow**:
1. User selects character, enters animation name + sequence prompt
2. Optionally adds per-frame instructions
3. API generates frames sequentially:
   - Frame 1: character reference only
   - Frame 2: character + frame 1
   - Frame N: character + all prior frames
4. Each frame saved as individual Asset with full provenance
5. Progress updates as each frame completes

**Benefits over sprite grid**:
- Per-frame iteration and regeneration
- Better visual consistency (AI sees prior frames)
- Frame reordering and substitution
- Retry failed frames without regenerating entire sequence

**Depends on**: Tasks 2, 3

---

## Dependency Graph

```
task-1: Prisma ORM
    │
    ▼
task-2: Data Model
    │
    ▼
task-3: IDE Layout
    │
    ▼
task-4: Animation Workflow
```

---

## File Path Conventions

| Asset Type | Path Pattern |
|------------|--------------|
| Characters | `public/assets/[projectId]/characters/[name]_[assetId].png` |
| Frames | `public/assets/[projectId]/frames/[animationName]/[charName]_[animName]_[frameIdx].png` |
| References | `public/assets/[projectId]/references/[assetId].png` |
