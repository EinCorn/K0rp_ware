# K0rp_OS — Codex Task Pack

Verze: 0.1.3 pracovní návrh

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

Primary platform is **Windows**.
Mac is a secondary dev/test/design environment.

For Codex tasks:

```text
- Pure TypeScript/core/docs tasks can be tested on Mac or Windows.
- Tauri window behavior, transparency, always-on-top, overlay, global activity bridge and installer tasks require Windows testing.
- Do not put platform-specific behavior inside korp-core.
- Use adapters for OS-specific behavior.
- Do not hardcode macOS paths or assumptions.
```

## Task 001 — Add K0rp_OS docs v0.1.3

```text
Create docs/k0rp-os/ and add/update the following markdown files:

00-product-vision.md
01-visual-style.md
02-product-modes.md
03-architecture.md
04-event-model.md
05-privacy-model.md
06-screen-concepts.md
07-roadmap.md
08-codex-tasks.md
09-module-backlog.md
10-language-and-copy.md
11-typography-and-brand.md
12-platform-workflow.md
README.md
CHANGELOG.md

Do not modify app source code.
Do not modify shared UI.
Do not create new branches unless explicitly required.
```

## Task 002 — Create korp-core package

```text
Create packages/korp-core as a TypeScript package.
Add typed models for:
- KorpEvent
- KorpState
- KorpResources
- KorpStats
- KorpUnlocks
- KorpSettings

Add createInitialState().
Add applyKorpEvent(state, event).
Add basic Vitest tests.

Do not touch UI apps yet.
Do not refactor existing desktop apps.
```

## Task 003 — Create korp-modules package

```text
Create packages/korp-modules as a TypeScript package.
Define KorpModuleManifest, KorpModuleCategory, KorpSurface, KorpModuleMaturity, KorpPrivacyProfile.
Add manifests for current modules:
- ClickAudit
- Fidget
- Bloom

Add spec-level manifests for candidate modules:
- Corner Watch
- Bublinková Fólie
- Button Compliance
- Surface Compliance
- Shape Compliance
- Attention Runner
- Zenová Zahrádka
- Newtonova Kolíbka

Do not implement UI.
Do not touch desktop/shared shell.
Add validation tests for required manifest fields.
```

## Task 004 — Add ClickAudit event bridge

```text
Wire ClickAudit to emit clickaudit.click events to korp-core locally.
Keep current visuals unchanged.
Do not modify shared shell CSS except if required for imports.
Add minimal debug output or local state display only if needed.
```

## Task 005 — Add Fidget event bridge

```text
Wire Fidget to emit:
- fidget.spinStarted
- fidget.spinTick
- fidget.spinStopped
- fidget.modeChanged

Keep current visuals unchanged.
Do not redesign spinner.
```

## Task 006 — Add Bloom event bridge

```text
Wire Bloom to emit:
- bloom.tileClicked
- bloom.matchCleared
- bloom.waveAdvanced
- bloom.redStoneSpawned

Keep current board visuals unchanged unless necessary.
```

## Task 007 — Create K0rp_OS shell prototype

```text
Create a prototype K0rp_OS app shell.
It should show:
- fake desktop
- taskbar
- icons for ClickAudit, Fidget, Bloom
- basic status panel
- shared progress from korp-core

Do not implement overlay.
Do not implement cloud sync.
Do not move existing apps unless necessary.
```

## Task 008 — Local save/load

```text
Add local save/load for KorpState.
Default to local-only.
No account.
No cloud.
No telemetry.
Add export/import JSON if simple.
```

## Task 009 — Memo system MVP

```text
Add a simple internal memo system.
Memos unlock based on korp-core thresholds.
Add 5 sample memos in Czech with corporate doublespeak/anglicisms.
Keep them in a separate data file.
No explicit lore dump.
```

## Task 010 — Corner Watch prototype

```text
Implement Corner Watch as a simple module prototype.
Requirements:
- dark pixel/CRT style panel
- KØrp logo bouncing inside bounds
- near miss detection
- corner hit detection
- emit corner.logoBounce, corner.nearMiss, corner.cornerHit
- produce idleFaith resource through korp-core

Do not add cloud.
Do not implement real physics.
Do not redesign existing modules.
```

## Task 011 — Bublinková Fólie prototype

```text
Implement Bublinková Fólie as a module prototype.
Requirements:
- grid of bubbles
- click to pop bubble
- popped visual state
- sheet progress
- emit bubble.popped and bubble.sheetCompleted
- produce reliefUnits and pressureReleased

Use placeholder pixel CSS if final assets are not ready.
No sound unless simple and optional.
```

## Task 012 — Button Compliance prototype

```text
Implement Button Compliance as a module prototype.
Requirements:
- panel with multiple buttons
- button pressed state
- simple generated confirmation text
- optional sequence completion
- emit button.pressed and button.confirmationConfirmed
- produce approvalUnits

Keep the UI in K0rp shell language.
```

## Task 013 — Module launcher from registry

```text
Update the module launcher/control desk to read module cards from korp-modules registry.
Show current modules as available.
Show candidate modules as locked/spec/pending.
Do not hardcode module list in the launcher after this task.
Keep visuals close to current dashboard.
```

## Task 014 — Language copy pack

```text
Create packages/korp-content or equivalent content folder.
Add Czech copy pack for:
- current modules
- candidate modules
- generic status messages
- privacy messages

Copy style:
- Czech primary
- corporate doublespeak
- natural anglicisms
- dry absurd humor

Do not translate everything to English yet.
```

## Task 015 — Newton Cradle spec prototype

```text
Create a non-final Newtonova Kolíbka prototype.
Fake the physics with controlled animation states.
Events:
- cradle.pull
- cradle.release
- cradle.impact
- cradle.cycleCompleted
- cradle.responsibilityTransferred

Do not implement complex physics engine.
Focus on satisfying visual rhythm and event emission.
```

## Task 016 — Zen Garden spec prototype

```text
Create a non-final Zenová Zahrádka prototype.
Use canvas or simple DOM/SVG approach.
Requirements:
- sand area
- rake stroke interaction
- movable stones optional
- emit zen.rakeStroke and zen.patternCompleted

Do not chase perfect drawing quality.
Focus on interaction contract and modular architecture.
```

## Codex anti-patterns

Nepovolit:

```text
- changing shared shell during unrelated task
- moving app folders without migration plan
- adding cloud sync before local state
- replacing TypeScript core with random game engine
- writing English-only UI copy
- adding tracking outside stated privacy modes
- implementing 5 modules in one giant commit
```


## Global guardrail — fonts and logo

Každý Codex task, který sahá na UI, shared shell, module layout, dashboard nebo K0rp_OS screen, musí respektovat:

```text
Use Pixel Operator / Pixel Operator Mono as the UI font direction.
Do not redesign or replace the K0rp/K0rp_ware logo.
Treat the logo as an existing fixed asset.
Do not add font files unless explicitly provided and license-cleared.
```

Acceptance criteria:

- běžné UI texty používají shared font token pro Pixel Operator,
- čísla/status/log/registry používají Pixel Operator Mono token,
- logo asset nebyl změněn,
- nevznikl nový wordmark nebo alternativní logo,
- pokud font není dostupný lokálně, změna má fallback, ale neprodává fallback jako finální design.


## Task 015 — Add platform workflow docs

```text
Add docs/k0rp-os/12-platform-workflow.md.
Document:
- Windows as primary desktop/release platform
- Mac as secondary dev/test/design environment
- Couch Mode vs Desk Mode
- two-clone workflow
- platform labels
- Windows-required testing for overlay/Tauri behavior

Do not modify app source code.
```

## Task 016 — Add platform test checklist

```text
Create a short manual checklist for platform testing.
Include:
- Web build
- Mac smoke test
- Windows desktop start
- Windows transparent window check
- Windows always-on-top check
- Windows overlay hitbox check, when overlay exists
- sync:korp-ui reminder

This can live in docs/k0rp-os/12-platform-workflow.md or a future docs/testing file.
Do not implement test automation yet.
```
