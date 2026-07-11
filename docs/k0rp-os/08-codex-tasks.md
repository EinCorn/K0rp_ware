# K0rp_OS — Codex Task Pack

Verze: 0.2.0 pracovní návrh

## Pravidlo pro Codex

Nedávat Codexu úkol typu „udělej K0rp_OS“.  
Dávat malé úkoly s jasnými hranicemi.

Každý task musí mít:

- cíl,
- scope,
- co nesmí měnit,
- testovací příkazy,
- očekávaný výstup.

Codex je implementační kolega, ne autor světa. Nemá rozhodovat, co je K0rp a co už je obyčejná webová hračka v tmavém skinu.

## Platform guardrail

Primary platform is **Windows**. Mac is a secondary dev/test/design environment.

```text
- Pure TypeScript/core/docs tasks can be tested on Mac or Windows.
- Tauri window behavior, transparency, always-on-top, overlay, global activity bridge and installer tasks require Windows testing.
- Do not put platform-specific behavior inside korp-core.
- Use adapters for OS-specific behavior.
- Do not hardcode macOS paths or assumptions.
```

## Existing task baseline

Tasks 001–016 cover docs, `korp-core`, `korp-modules`, current module bridges, shell prototype, save/load, memo MVP and first candidate module prototypes. Tyto tasky zůstávají historickým plánem; aktuální implementační pořadí určuje `07-roadmap.md`.

## Task 017 — Add progression package without runtime integration

```text
Add packages/korp-progression from the reviewed design database.

Scope:
- package.json
- tsconfig.json
- src/progression.types.ts
- src/progression.database.ts
- src/surface-progression.database.ts
- src/progression.validation.ts
- src/index.ts
- data/*.json
- data/*.csv
- package docs

Do not modify existing application behavior.
Do not connect the package to KorpOsShell yet.
Add a root typecheck script and CI step.
```

## Task 018 — Add Audit 00-A model

```text
Implement the first audit form as data/UI behind a feature flag.

Requirements:
- opens as a document window on an almost-empty K0rp_OS desktop
- every intentional field interaction emits at most one clickaudit.click with audit-form tag
- pointer movement and render frames do not count
- submit emits audit.formSubmitted
- privacy explanation uses plain language
- current standalone ClickAudit behavior remains unchanged
```

## Task 019 — Create shared runtime provider

```text
Create a KorpRuntimeProvider for K0rp_OS.

Include:
- one global KorpState
- lifetime stats
- dispatch
- unlock queue
- memo queue
- surface mutation queue
- local save/load interface

Do not remove local standalone module state.
Do not implement cloud sync.
```

## Task 020 — Fake desktop vertical slice

```text
Replace the temporary catalog-like K0rp_OS game surface behind a feature flag with:
- empty employee desktop
- taskbar
- Compliance Bin
- Audit 00-A document window
- basic window manager
- ClickAudit shortcut spawned after form submit
- Inbox folder with first memo

Do not redesign standalone app shells.
Do not implement all future modules.
```

## Task 021 — Progression resolver v1

```text
Add a small resolver pipeline:
base event
→ owned upgrade modifiers
→ cross-module modifiers
→ meter caps
→ lifetime stats
→ unlocks
→ memos
→ surface mutations

Implement only the first audit/ClickAudit slice.
Do not create a generic enterprise rules engine.
```

## Task 022 — Sensory foundation

```text
Create shared sensory contracts and settings:
- audio categories
- material profile IDs
- density limit API
- feedback intensity levels
- reduce motion
- quiet mode

Do not add final audio assets.
Do not change existing module visuals unless required for hooks.
```

## Task 023 — First-cycle playtest harness

```text
Add a local-only debug/playtest panel behind a development flag.

It may show:
- session time
- milestone timestamps
- event counts
- current/lifetime resources
- unlock sequence
- save export

It must not send telemetry or read activity outside K0rp.
```

## Task 024 — Standalone aggregate bridge contract

```text
Define, but do not yet fully implement, the contract for a detached module to forward aggregate K0rp events into a running K0rp_OS runtime.

Rules:
- standalone remains usable unlinked
- no raw pointer/activity stream
- campaign rewards only for modules authorized in the save
- no cloud
- no overlay implementation
```

## Task 025 — Docs/reference validation

```text
Add a lightweight validation step that checks:
- progression IDs are unique
- referenced resource/event/form/upgrade/memo IDs exist
- documentation index lists files 00–19
- package TypeScript typecheck passes

Do not rewrite source documents automatically.
```

## Global implementation guardrails

```text
- Do not change current ClickAudit, Fidget or Bloom gameplay unless the task explicitly names that module.
- Do not turn the canonical desktop into a card catalog.
- Do not expose the hidden meta layer through lore explanation.
- Do not add daily streaks, energy, offline penalties or FOMO requirements.
- Do not add cloud sync before stable local save.
- Do not read app names, URLs, window text, screenshots or keys outside K0rp.
- Do not redesign the K0rp logo.
- Use Pixel Operator / Pixel Operator Mono direction through shared tokens; do not add unlicensed font files.
- Run npm run sync:korp-ui after intentional shared UI changes.
```
