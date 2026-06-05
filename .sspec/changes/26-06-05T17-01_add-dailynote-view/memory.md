# Memory: add-dailynote-view

**Updated**: 2026-06-05T17:56+08:00

## Git Baseline (Immutable)
<!-- Captured during `sspec change new` before any change files are written.
This section records the change starting point in git and MUST NOT be edited or refreshed later. -->

- Captured: before change file creation
- Repository: `H:/SrcCode/开源项目/siyuan-dailynote-today`
- Branch: `feat/dn-view`
- HEAD: `f61675352aa5917e0bc44f32f95ba7899b215f11`
- Worktree: `dirty`
- Status Snapshot: raw `git status --short --branch` output

```text
## feat/dn-view
M  .gitignore
A  .sspec/requests/26-06-04T18-02_add-dailynote-view.md
```

## State
<!-- Where we are and what's next — one to three lines.
This is the resume entry point; the first section an agent reads on cold start. -->

Implementation is in progress. Phases 1-5 are complete and `pnpm build` passes; next: run/manual SiYuan acceptance for direct-open behavior, Daily Note View presets, create-missing-DN, duplicate display, then finish Phase 6 and move to Review.

## Key Files
<!-- Files critical to understanding/continuing this change.
- `path/file` — what it contains, why it matters -->

- `H:/SrcCode/SiYuanDevelopment/siyuan-plugin-kits/src/dailynote.ts` — latest plugin-kit daily-note helper source; verifies arbitrary-date create/search/list APIs targeted by this design.
- `H:/SrcCode/开源项目/sy-docs-flow/src/display.ts` — working example of SiYuan `addTab` + `openTab({ custom })` custom tab registration.
- `H:/SrcCode/开源项目/sy-docs-flow/src/components/docs-flow/protyle.svelte` — working example of mounting/destroying `new Protyle(...)` inside a Svelte component.

## Knowledge
<!-- MUST apply write-gate: "If this item were lost, would the next agent make a wrong decision?"
Yes → write it. No → skip.

Target reader: a cold-starting agent that can only see spec + design + tasks + this Knowledge.
Exclude: anything already covered by spec/design/tasks (no restating).
Include: rejected approaches with reasons, implicit constraints, user preferences, API/env traps, insights that shaped design choices.

Project-level discoveries → ALSO append to project.md Notes.
Obsolete items → mark [obsolete: timestamp], never silently delete. -->

- [2026-06-05T17:02+08:00] [Gotcha] The published dependency installed in this repo is `@frostime/siyuan-plugin-kits@1.5.3`; the arbitrary-date daily-note API was verified in local source version `1.6.0` under `H:/SrcCode/SiYuanDevelopment/siyuan-plugin-kits/src/dailynote.ts`.
- [2026-06-05T17:02+08:00] [Constraint] User explicitly wants the Design phase to include a visible UI/UX artifact before implementation, not just textual behavior specs.

## Milestones
<!-- MUST append one line per session. Pure facts; new entries appended at the end.
CLI treats the last valid bullet as the latest milestone.
- [ISO timestamp] one-sentence summary -->

- [2026-06-05T17:02+08:00] Design: Created change, drafted spec/design, and added static Daily Note View prototype for alignment.
- [2026-06-05T17:03+08:00] Design gate: User requested design revision before Plan.
- [2026-06-05T17:04+08:00] Design revision: Calendar and note lanes must be mutually exclusive body modes in UI/prototype.
- [2026-06-05T17:40+08:00] Commit: design artifacts committed as `d51e952 📝 docs(sspec): design daily note view`.
- [2026-06-05T17:56+08:00] Implement: Phases 1-5 complete; dependency bumped, custom tab/UI/resolver implemented, and `pnpm build` passes.
