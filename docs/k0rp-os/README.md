# K0rp_OS Docs Pack

Verze: 0.2.0  
Status: pracovní RFC pack

Pracovní dokumentace pro rozšíření K0rp_ware do K0rp_OS.

## Canonical product statement

K0rp_OS je falešná pracovní plocha zaměstnance K0rpu. Začíná téměř prázdná, první interakcí je Audit 00-A a postupně se zaplňuje aplikacemi, složkami, soubory, memy, certifikacemi, screensaverem a stopami předchozích auditních cyklů.

Současné prokrastinační moduly zůstávají samostatnými appkami. Desktop, web, standalone a budoucí overlay sdílejí core a event semantics, ale mají různé presentation surfaces.

## Obsah

- `00-product-vision.md` — produktová identita a canonical desktop.
- `01-visual-style.md` — pixelart, 50s comics, corporate liminal horror.
- `02-product-modes.md` — desktop, web, standalone, overlay a bridge rules.
- `03-architecture.md` — core/modules/progression/surface/UI vrstvy.
- `04-event-model.md` — events, persistence levels a audit clicks.
- `05-privacy-model.md` — local-first privacy.
- `06-screen-concepts.md` — okna, plocha, folders/files, screensaver.
- `07-roadmap.md` — aktualizované implementační pořadí.
- `08-codex-tasks.md` — malé ohraničené tasky.
- `09-module-backlog.md` — moduly a jejich surface/sensory contracts.
- `10-language-and-copy.md` — canonical čeština a doublespeak.
- `11-typography-and-brand.md` — fonty a logo lock.
- `12-platform-workflow.md` — Windows-first workflow.
- `13-progression-and-economy.md` — ekonomika, pacing a prestige.
- `14-sensory-feedback.md` — tactile/audio/visual systém.
- `15-unlocks-memos-and-system-mutations.md` — artifacts a mutations.
- `16-playtest-checklist.md` — gates a balance test.
- `17-first-cycle-balance.md` — první 4–5hodinový auditní cyklus.
- `18-desktop-surface-progression.md` — postupně se plnící plocha.
- `19-research-basis-and-source-index.md` — výzkum, inspirace a source map.
- `CHANGELOG.md` — změny docs packu.

## Machine-readable design database

Viz:

```text
packages/korp-progression/
```

Obsahuje TypeScript constants, JSON, CSV, validaci a integrační poznámky.

## Source-of-truth pořadí

1. Repo `main`.
2. Docs `00–19`.
3. `packages/korp-progression/data`.
4. `packages/korp-progression/src`.
5. Implementace po malých vertical slices.

Pokud se strojová data a prose rozcházejí, změna se nesmí tiše domyslet. Musí být sjednocena v samostatném docs/data commitu.

## Důležité pravidlo

> K0rp_OS má být robustní systém pro postupné přidávání nesmyslů, ne další nesmysl přidaný bez systému.
