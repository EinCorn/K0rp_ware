# K0rp_OS Docs Pack

Verze: 0.3.0  
Status: pracovní RFC pack s canonical core-loop kontraktem

Pracovní dokumentace pro rozšíření K0rp_ware do K0rp_OS.

## Canonical product statement

K0rp_OS je falešná pracovní plocha zaměstnance K0rpu. Začíná téměř prázdná, první interakcí je Audit 00-A a postupně se zaplňuje aplikacemi, složkami, soubory, memy, certifikacemi, screensaverem a stopami předchozích auditních cyklů.

Herní páteř:

```text
Appka vytvoří metriku.
Audit z metriky vytvoří skutečnost.
Evidence dovolí systému vytvořit další metriku.
```

Současné prokrastinační moduly zůstávají samostatnými appkami. Desktop, web, standalone a budoucí overlay sdílejí core a event semantics, ale mají různé presentation surfaces.

## Obsah

- `00-product-vision.md` — produktová identita a canonical desktop.
- `01-visual-style.md` — pixelart, 50s comics, corporate liminal horror.
- `02-product-modes.md` — desktop, web, standalone, overlay a bridge rules.
- `03-architecture.md` — core/modules/progression/surface/UI vrstvy.
- `04-event-model.md` — events, raw metriky, packets a certifikace.
- `05-privacy-model.md` — local-first privacy.
- `06-screen-concepts.md` — okna, plocha, folders/files, screensaver.
- `07-roadmap.md` — aktuální implementační pořadí.
- `08-codex-tasks.md` — dokončené a budoucí ohraničené tasky.
- `09-module-backlog.md` — moduly a jejich surface/sensory contracts.
- `10-language-and-copy.md` — canonical čeština a doublespeak.
- `11-typography-and-brand.md` — fonty a logo lock.
- `12-platform-workflow.md` — Windows-first workflow.
- `13-progression-and-economy.md` — ekonomika, Evidence, pacing a prestige.
- `14-sensory-feedback.md` — tactile/audio/visual systém.
- `15-unlocks-memos-and-system-mutations.md` — artifacts a mutations.
- `16-playtest-checklist.md` — gates a balance test.
- `17-first-cycle-balance.md` — první vertical slice a provisional first-cycle balance.
- `18-desktop-surface-progression.md` — postupně se plnící plocha.
- `19-research-basis-and-source-index.md` — výzkum, inspirace a source map.
- `20-core-loop.md` — canonical Metric → Audit → Evidence kontrakt.
- `CHANGELOG.md` — změny docs packu.

## Machine-readable design database

Viz:

```text
packages/korp-progression/
```

Obsahuje TypeScript constants, JSON, CSV, validaci a integrační poznámky.

Strojová data na `main` po Tasku 019 stále částečně popisují v0.2 model `raw action → currency`. Tasks 020–024 je budou migrovat na canonical `metric → audit → Evidence` model. Nové feature se nesmějí dál opírat o starou přímou konverzi.

## Source-of-truth pořadí uvnitř repa

1. `docs/k0rp-os/20-core-loop.md` pro herní ekonomiku a core loop.
2. `docs/k0rp-os/07-roadmap.md` pro pořadí implementace.
3. `docs/k0rp-os/08-codex-tasks.md` pro scope konkrétních tasků.
4. Ostatní docs `00–19` pro produktové, vizuální, privacy a obsahové kontrakty.
5. `packages/korp-progression/docs` pro data migration mapu.
6. `packages/korp-progression/data` a `src` po migraci příslušným taskem.
7. Implementace po malých vertical slices.

Pokud se strojová data a prose rozcházejí, změna se nesmí tiše domyslet. Musí být popsána jako známý migration gap a sjednocena v konkrétním docs/data/runtime tasku.

## Důležité pravidlo

> K0rp_OS má být robustní systém pro postupné přidávání nesmyslů, ne další nesmysl přidaný bez systému.
