# K0rp_OS UI Asset Kit V3

Kompletní produkční sada samostatných K0rp_OS UI assetů. Nejde o automaticky rozřezané boardy: každý asset má ručně určený zdrojový výřez, účel, rozměry a případný content slot.

## Struktura

- `assets/native/` — 1× PNG assety v původním pixelovém měřítku
- `assets/2x/` — nearest-neighbor 2× PNG
- `assets/webp/` — lossless WebP
- `nine_slice/` — samostatné 9-slice díly
- `atlases/` — atlasy controls, digits, lamps a taskbar states
- `icons/k0rp_icons_v2/` — schválené ikony beze změny
- `manifest.json` / `manifest.csv` — kompletní inventory
- `docs/window-metrics.json` — přesné outer size a content rect každého okna
- `tokens.json` — barvy, fontový směr a runtime pravidla

## Okna

Každá hlavní rodina okna má:

1. `*.composite_blank` — okamžitě použitelný prázdný celek;
2. `*.frame` — rám s průhledným content slotem;
3. `*.content` — přesně rozměrově odpovídající čistou vnitřní plochu.

Pro dynamický runtime skládejte `content → runtime obsah → frame`.

## Dokumenty

Audit 00-A, Audit 10-A, Audit 16-C, obecný formulář, interní memo a Evidence jsou samostatné transparentní šablony. Zcela volné listy jsou v `documents/paper`.

## Blank vs. reference

- `production_status=production` je přímo použitelný stavební asset;
- `production_status=reference` může mít zapečený příklad textu a slouží jako vizuální kontrakt.

Fontové soubory nejsou součástí balíku.
