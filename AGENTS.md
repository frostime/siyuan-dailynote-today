This is a SiYuan's plugin.

When Update Version: `package.json` + `plugin.json`.

Write Changelog `CHANGELOG.md`.

Build: `vite.config.ts`.

Plugin Publish: Based on `.github/workflows/deploy.yml`, triggered by git tag `v*` pushed onto main branch.

**Agent Document**:

Read `.sspec/project.md` before project-specific work on cold start.

Read `.dev/docs/` for project-wise development document.

**Change Based Development**:

Place change dir under `.dev/changes/<slug>` if user instruct.

