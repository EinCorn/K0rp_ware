# K0rp_OS Docs Pack

Verze: 0.1.3  
Status: pracovní RFC pack

Pracovní dokumentace pro rozšíření K0rp_ware do K0rp_OS.

## Obsah

- `00-product-vision.md` — co K0rp_OS je a není, čeština jako primary language, modular-first směr.
- `01-visual-style.md` — pixelart + 50s comics + corporate liminal horror styl.
- `02-product-modes.md` — web, standalone appky, desktop hra, overlay, sync, module surfaces.
- `03-architecture.md` — TypeScript-first engine, packages, module manifest, robustní modularita.
- `04-event-model.md` — eventy, resources, progression včetně nových module candidates.
- `05-privacy-model.md` — bezpečnostní a privacy zásady.
- `06-screen-concepts.md` — návrhy obrazovek včetně nových modulů.
- `07-roadmap.md` — postup fází a release grouping.
- `08-codex-tasks.md` — malé implementační tasky pro Codex.
- `09-module-backlog.md` — current + candidate modules, resource map, naming bank.
- `10-language-and-copy.md` — čeština, doublespeak, anglicismy, copy rules.
- `11-typography-and-brand.md` — Pixel Operator / Pixel Operator Mono, logo lock, font implementace.
- `12-platform-workflow.md` — Windows-first platform strategy, Mac Couch Mode, two-clone workflow.
- `CHANGELOG.md` — změny mezi verzemi docs.
- `assets/concept-board-v0.1.png` — konceptový board / vizuální reference.

## v0.1.3 hlavní změny

- Zamčena platform strategy:
  - Windows = primary desktop/release/testing target,
  - Mac = secondary dev/test/design environment,
  - Web = shared cross-platform surface.
- Přidán `12-platform-workflow.md`.
- Doplněn Couch Mode / Desk Mode workflow.
- Doplněno pravidlo pro dva clony repa: Mac + Windows, oba přes `main` jako source of truth.
- Doplněn Codex guardrail pro platform-specific změny.
- Zachován v0.1.2 obsah: Pixel Operator / Pixel Operator Mono, logo lock, module backlog, language guide, TypeScript-first modular engine.

## Doporučené umístění v repu

```bash
cd ~/Projects/K0rp_ware
mkdir -p docs
cp -R k0rp_os_docs_v0_1_3 docs/k0rp-os
```

Nebo pokud chceš čisté názvy bez verze složky:

```bash
cd ~/Projects/K0rp_ware
mkdir -p docs/k0rp-os
cp -R k0rp_os_docs_v0_1_3/* docs/k0rp-os/
git add docs/k0rp-os
git commit -m "Add K0rp_OS docs v0.1.3"
```

## Důležité pravidlo

> K0rp_OS má být robustní systém pro postupné přidávání nesmyslů, ne další nesmysl přidaný bez systému.
