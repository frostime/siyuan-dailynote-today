# Project Context

<!-- This file is the stable identity layer for agents working on this project.
Read it first every session. Update Conventions + Notes via @memory. -->

**Name**: siyuan-dailynote-today
**Description**: SiYuan plugin for Daily Note workflows: auto/open today's daily note, reservation blocks, duplicate daily-note handling, and moving blocks/docs into today's daily note.
**Repo**: https://github.com/frostime/siyuan-dailynote-today

## Tech Stack
- TypeScript
- Svelte 4
- Vite 5 library build
- SiYuan Plugin API
- YAML-based i18n via custom Vite plugin
- pnpm / Node.js scripts

## Key Paths
<!-- MUST keep ≤10 entries. Most important directories/files for quick navigation.
Agent uses this to orient in the codebase. -->

| Path | Purpose |
|------|---------|
| `src/index.ts` | Plugin entrypoint and lifecycle wiring |
| `src/global-status.ts` | Settings manager and persisted setting defaults |
| `src/global-notebooks.ts` | Runtime notebook registry and default notebook selection |
| `src/serverApi.ts` | Thin wrappers around SiYuan kernel APIs |
| `src/func/dailynote/` | Daily-note path/status/open/create/duplicate handling |
| `src/func/reserve/` | Reservation date parsing, attributes, retrieval insertion |
| `src/func/move.ts` | Move block/document into today's daily note |
| `src/components/` | Svelte/DOM UI for settings, toolbar, gutter, dock |
| `src/i18n/*.yaml` | Source i18n dictionaries |
| `vite.config.ts` | Build, dev output, static copy, zip packaging |

## Conventions
<!-- MUST be one-liners. Coding rules that apply across ALL work in this project.
If a convention needs multi-paragraph explanation → write a spec-doc.
Examples: "snake_case for Python, camelCase for JS", "All API routes: /api/v1/*",
"Never commit .env files", "Prefer composition over inheritance" -->

- Use `@/` alias for imports from `src/`.
- Treat `src/i18n/*.yaml` as source; generated JSON belongs in build output.
- Persist plugin settings through `settings` in `src/global-status.ts`.
- Access SiYuan kernel APIs through `src/serverApi.ts`.
- Daily-note identity uses `custom-dailynote-YYYYMMDD`.
- Reservation identity uses `custom-reservation=YYYYMMDD`.
- Default notebook is configured by notebook ID; empty means first open non-guide notebook returned by SiYuan.
- Build outputs are `dev/`, `dist/`, and `package.zip`; do not treat them as source.

## Spec-Docs Index
<!-- Quick reference to spec-docs in `.sspec/spec-docs/`.
Spec-docs capture knowledge that code alone cannot adequately convey:
  A) In code, but scattered or hard to reconstruct (cross-module architecture, UX requirements, design norms, trade-offs)
  B) Outside code entirely (platform rules, API quirks, business constraints, deployment assumptions)
NOT a restating of code behavior — if readable from code+comments, it doesn't belong here.
MUST keep entries in sync with actual spec-doc files.
Format: `- [name](spec-docs/<file>) — one-line summary` -->

- [Glossary](spec-docs/glossary.md) — Chinese-English terminology map for project-specific daily-note, notebook, reservation, duplicate-handling, and build terms.
- [Daily-note lifecycle and duplicate handling](spec-docs/daily-note-lifecycle-and-duplicate-handling.md) — Daily-note startup/open/status flows, notebook state, custom attributes, sync duplicate detection, and duplicate handling methods.
- [Reservation subsystem](spec-docs/reservation-subsystem.md) — Reservation block contracts, date parsing, retrieval insertion, settings, and Dock behavior.

## Notes
<!-- Project-level memory. Append-only log of learnings, gotchas, preferences.
Agent appends here during @memory when a discovery is project-wide (not change-specific).
Format each entry as: `- YYYY-MM-DD: <learning>`
Prune entries that become outdated or graduate to Conventions/spec-docs. -->
