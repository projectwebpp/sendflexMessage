---
phase: 02
slug: frontend-foundation
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-05-24
---

# Phase 02 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | vitest + @testing-library/react |
| **Config file** | frontend/vite.config.js |
| **Quick run command** | `cd frontend && npm run build` |
| **Full suite command** | `cd frontend && npm run build && npx vite --version` |
| **Estimated runtime** | ~15 seconds |

---

## Sampling Rate

- **After every task commit:** Run `cd frontend && npm run build`
- **After every plan wave:** Run full suite command
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 30 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 02-01-01 | 01-01 | 1 | scaffold | — | N/A | build | `cd frontend && npm run build` | ✅ | ⬜ pending |
| 02-01-02 | 01-01 | 1 | tailwind | — | N/A | build | `cd frontend && npm run build` | ✅ | ⬜ pending |
| 02-01-03 | 01-01 | 1 | stores | — | N/A | build | `cd frontend && npm run build` | ✅ | ⬜ pending |
| 02-01-04 | 01-01 | 1 | layout | — | N/A | visual | `cd frontend && npm run build` | ✅ | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- Existing infrastructure covers all phase requirements — build tool (Vite) is the test harness for this scaffold phase.

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Dark/light toggle persists across page reload | theme persistence | localStorage state requires browser | Open app, toggle theme, reload page, verify theme matches |
| Mobile hamburger opens/closes drawer | mobile nav | requires viewport resize | Set viewport to 375px, click hamburger, verify drawer slides in |
| Backdrop click closes drawer | mobile UX | requires interaction | Open drawer, click backdrop, verify drawer closes |
| Inter font renders correctly | font | visual check | Open app, inspect font in DevTools |
| Glassmorphism effect visible on sidebar | design | visual check | Open app in dark mode, verify blur + transparency effect |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 30s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
