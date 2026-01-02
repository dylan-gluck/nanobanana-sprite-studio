---
description: Refine a task, find all relevant context and add to the backlog
argument-hint: [task-description]
allowed-tools: Bash(codebase-map:*), Bash(backlog:*), Bash(git:*)
---

Refine the task described below.

## Task

$ARGUMENTS

## Codebase Indexed

!`codebase-map scan`

## Workflow

### 1. Understand

Read the task carefully. Think step-by-step about the objective and requirements.

### 2. Explore

Use `codebase-map` cli to visualize the index and find relevant context:

- `codebase-map format -f tree` — directory structure
- `codebase-map format -f markdown` — files with functions/constants
- `codebase-map format -f dsl` — compact signatures with dependencies
- `codebase-map format -f graph` — dependency graph + signatures
- `codebase-map list --deps` — files with most dependencies
- `codebase-map list --entries` — entry points (no dependents)
- `codebase-map list --leaves` — leaf files (no dependencies)

Use `--include` or `--exclude` patterns to filter results (e.g., `--include "components/**"`).

Use Task tool with `subagent_type=Explore` for deeper investigation of specific files or patterns.

### 3. Create Backlog Item

Use `backlog` cli to create or search tasks:

**Create task:**
```
backlog task create "<title>" \
  -d "<description>" \
  --ac "<acceptance criterion>" \
  --priority <high|medium|low> \
  --plan "<implementation plan>" \
  --notes "<technical context>"
```

Options:
- `-d, --description` — task description (use `$'line1\nline2'` for multiline)
- `--ac` — acceptance criteria (repeat for multiple)
- `--priority` — high, medium, or low
- `--plan` — implementation plan
- `--notes` — technical context (file paths, types, functions)
- `--dep <taskIds>` — dependencies (comma-separated)
- `-p, --parent <taskId>` — parent task
- `--draft` — create as draft instead of task

**Other useful commands:**
- `backlog task list --status <status>` — list tasks by status
- `backlog search "<query>"` — search existing tasks/docs
- `backlog board` — kanban view

Keep tasks concise—no code snippets or overly detailed explanations.
