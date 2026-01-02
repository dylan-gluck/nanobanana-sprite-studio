---
id: task-3
title: Implement IDE-Style Layout with Project Navigation
status: To Do
assignee: []
created_date: '2026-01-02 00:18'
updated_date: '2026-01-02 00:18'
labels:
  - ui
  - layout
  - frontend
dependencies:
  - task-2
priority: high
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
## Objective

Replace the current 2-workflow layout with an IDE-style interface supporting project-based organization, tabbed workspaces, and contextual action sidebars. This enables the new data model's hierarchical structure to be navigated and manipulated effectively.

## Context

Current layout has a fixed sidebar with Character/Sprite workflow toggle and a single content area. The new layout must support:
- Multiple projects
- Drill-down navigation (Project → Characters → Animations)
- Multiple open views (tabs)
- Context-sensitive action panels

## Key Decisions

**Three-column IDE pattern**: 
- Left sidebar: Navigation and entity tree
- Center: Tabbed workspace for detail views
- Right sidebar: Contextual actions and forms

**Left sidebar structure**:
- Project picker dropdown (defaults to most recent)
- Collapsible sections for Characters and Animations
- Tree-style navigation showing entity hierarchy
- Quick-add buttons for new characters/animations

**Tabbed workspace**: 
- Tabs represent open views (Project, Character, Animation details)
- Support multiple simultaneous tabs
- Tab state persisted during session
- Close/reorder tabs

**Right sidebar as action panel**:
- Content changes based on context (selected tab, user action)
- Forms for creating/editing entities
- Generation controls and settings
- Slides in/out or always visible based on context

**Responsive considerations**: 
- Collapsible sidebars for smaller screens
- Mobile view may stack panels vertically

## Requirements

### Layout Shell
- Three-column resizable layout (left sidebar, center workspace, right sidebar)
- Use `react-resizable-panels` (already installed) for panel management
- Persistent panel sizes across sessions (localStorage)
- Collapsible left and right sidebars

### Left Sidebar - Navigation
- Project picker dropdown at top
  - Shows current project name and thumbnail
  - Dropdown lists all projects (sorted by recent)
  - "New Project" option in dropdown
- Entity tree below picker
  - Characters section (collapsible)
    - List character thumbnails + names
    - Click to open Character view tab
    - Hover shows animation count
  - Animations section (collapsible)
    - Grouped by character or flat list
    - Shows thumbnail, name, frame count
    - Click to open Animation view tab
- Bottom actions (settings, etc.)

### Center - Tabbed Workspace
- Tab bar at top of content area
- Tab component showing view type icon + entity name
- Close button on tabs
- Click to switch active tab
- Empty state when no tabs open
- Tab content renders appropriate view component

### Project View (Tab Content)
- Project metadata display/edit (name, description, tags)
- Project thumbnail selection
- Characters grid with thumbnails, names, animation counts
- Animations grid with thumbnails, names, frame counts
- Quick actions to create new character/animation

### Character View (Tab Content)
- Character metadata (name, tags, user prompt, settings)
- Primary image display (large)
- Variations gallery (all generated assets for this character)
- Animations list for this character
- Edit/regenerate actions

### Animation View (Tab Content)
- Animation metadata (name, character, prompt, settings)
- Selected frames display (ordered sequence)
- All frames gallery (including unused variations)
- Frame reordering capability
- Per-frame details on selection

### Right Sidebar - Action Panel
- Context-aware content based on current state
- New Character form (when "new character" action triggered)
- New Animation form (when "new animation" action triggered)
- Edit forms for selected entities
- Generation progress/status display
- Empty/collapsed when no action in progress

### State Management
- Consider adding lightweight state management (Zustand or React Context) for:
  - Current project
  - Open tabs and active tab
  - Right sidebar state
- Keep component-level state for form inputs
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 Three-column resizable layout renders correctly with all panels
- [ ] #2 Project picker dropdown shows projects and allows switching
- [ ] #3 Left sidebar displays characters and animations for selected project
- [ ] #4 Clicking entities opens corresponding view in tabbed workspace
- [ ] #5 Multiple tabs can be open simultaneously with proper switching
- [ ] #6 Right sidebar updates contextually when actions are triggered
- [ ] #7 Project, Character, and Animation detail views display correct entity data
- [ ] #8 Layout is responsive - sidebars collapse appropriately on smaller screens
<!-- AC:END -->
