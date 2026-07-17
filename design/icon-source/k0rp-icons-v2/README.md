# K0rp_OS Icon Set v0.2

Kompletní pracovní sada 32 konzistentních pixel-art ikon pro K0rp_OS.

## Co sada řeší

- `ClickAudit` má vlastní logickou identitu: mechanické počítadlo se čtyřmi číslicemi.
- Clipboard s políčky je oddělen jako obecná ikona `audit-generic`.
- `Corner Watch` je obrazovka/screensaver, nikoli bezpečnostní kamera.
- `Surface Compliance` je přímo čištěný povrch se stěrkou.
- `Bloom` spojuje květinu se stavovými kameny.
- všechny plánované moduly z module registry mají vlastní ikonu;
- core loop má samostatné ikony pro audit, packet a Evidence;
- desktop progression má vlastní folders, artifacts, archive a Compliance Bin;
- generická zavřená a otevřená složka sdílejí stejnou konstrukci.

## Struktura

```text
png/64/              produkční pixel source
png/256/             nearest-neighbor preview / launcher size
ico/                 více velikostí pro Windows
atlases/             transparentní sprite sheets + atlas.json
previews/            kontaktní listy
manifest.json        význam, skupina a repo inspirace
manifest.csv         tabulková verze manifestu
```

## Vizuální pravidla

- source canvas: `64 × 64 px`;
- žádný antialiasing;
- světlo zleva nahoře;
- tmavý blokový stín doprava dolů;
- omezená paleta odvozená z přiložených K0rp_OS referencí;
- jeden dominantní význam na ikonu;
- text uvnitř ikon jen tam, kde je součástí objektu (`1239`, `EV`, `01`);
- meta rovina zůstává pouze v atmosféře a drobných nesouladech.

## Repo podklady

Návrh vychází zejména z:

- `docs/k0rp-os/00-product-vision.md`
- `docs/k0rp-os/01-visual-style.md`
- `docs/k0rp-os/09-module-backlog.md`
- `docs/k0rp-os/18-desktop-surface-progression.md`
- `docs/k0rp-os/20-core-loop.md`
- `packages/korp-modules/src/registry.ts`
- `packages/korp-progression/data/surface-progression.json`

Fontové soubory nejsou součástí balíčku.
