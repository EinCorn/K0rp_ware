# K0rp_OS UI Assets V3 — Historical Source and Validation Contract

Verze: `0.4.0 historical infrastructure note`  
Status: Task 022A(2.1) source-validation infrastructure zůstává platná; V3 player-visible chrome pilot byl uzavřen bez merge a není runtime standard

## 1. Co tento track skutečně dokončil

Task 022A(2.1) vytvořil důvěryhodnou hranici pro exact V3 source snapshot:

```text
design/ui-source/k0rp-os-ui-assets-v3/       immutable raw source snapshot
design/ui-runtime/k0rp-v3/inventory.json     generated normalized inventory
design/ui-runtime/k0rp-v3/runtime-allowlist.json historical pilot metadata
src/assets/                                  tímto taskem nezměněno
```

Příkazy:

```text
npm run build:korp-ui-assets
npm run validate:korp-ui-assets
```

Validátor a inventory zůstávají užitečné pro:

- ověření integrity raw packu;
- kontrolu dimensions, paths, hashes, atlases a nine-slice metadata;
- ochranu proti přímému runtime importu raw snapshotu;
- archivní dohledatelnost assetů;
- porovnání budoucích curated packů se starší produkční sadou.

Task 022A(2.1) nikdy neměl měnit player-visible React/CSS rendering.

## 2. Historical snapshot facts

Committed V3 snapshot obsahuje:

| Inventory item | Hodnota |
|---|---:|
| Total files | 1,494 |
| Total bytes | 16,733,914 |
| Semantic assets | 493 |
| Production assets | 436 |
| Reference-only assets | 57 |
| Native PNG | 493 |
| Nearest-neighbour `@2x` PNG | 493 |
| Lossless WebP | 493 |
| Atlas PNG sheets | 4 |
| Materialized nine-slice families | 11 |
| Materialized nine-slice pieces | 99 semantic / 297 format files |
| Window metric families | 8 |
| Atlas frames | 48 |

Tyto hodnoty popisují historický raw source snapshot. Neznamenají, že všech 493 assetů je schválených pro runtime použití.

## 3. Co se nepovedlo jako runtime směr

Následný Audit 00-A + Formuláře V3 chrome pilot vznikl v PR #43 a byl uzavřen bez merge.

Hlavní zjištění:

- frame/titlebar/paper/controls nepůsobily jako jeden koherentní systém;
- některé materiály byly při runtime composition roztažené nebo opticky rozmazané;
- okna byla kvůli asset geometry zmenšena do nečitelné podoby;
- compact module baseline ClickAudit/Fidget působila pixelově čistěji než nový chrome;
- V3 assets nešly bezpečně aplikovat jedna ku jedné na živé React documents a folders;
- budoucí resize by problém zvětšil, pokud by se používaly whole-shell bitmapy místo správné composition.

Tento výsledek není selhání source ingestion. Je to zamítnutý player-visible visual hypothesis.

## 4. Canonical rozhodnutí po uzavření pilotu

```text
V3 raw snapshot + validator
= zachovat jako historickou source/inventory infrastrukturu

V3 runtime chrome pilot
= nepokračovat jako canonical visual track

curated UI asset pack v01
= nový runtime candidate pro reusable window composition
```

Nová curated hranice:

```text
design/ui-source/k0rp-ui-asset-pack-v01/
design/ui-runtime/k0rp-ui-v01/
```

Task 024A / PR #47 vytvořil:

- immutable curated source;
- generated catalog/runtime subset;
- module/audit/folder geometry contract;
- nine-slice frame composition;
- horizontal three-slice headers;
- native-resolution tiled material surfaces;
- fixed pin/unpin/minimize/close states;
- live DOM text;
- integer coordinates/scaling;
- preserved `167×167` ClickAudit/Fidget content.

Player-visible rollout se řeší oddělenými Tasks 024B–024D podle `07-roadmap.md` a `08-codex-tasks.md`.

## 5. Status původního V3 allowlistu

`design/ui-runtime/k0rp-v3/runtime-allowlist.json` zůstává:

- historický záznam pilot boundary;
- vstup pro V3 validator;
- důkaz tehdejšího omezeného výběru.

Není:

- aktivní runtime import list;
- source pro Task 024B;
- canonical window family contract;
- povolení kopírovat V3 assety do `src/assets`;
- důvod obnovit Tasks 022A(2.2–2.5) pod původním visual assumptions.

Pokud bude některý jednotlivý V3 asset někdy znovu použit, musí projít novým explicitním curated allowlistem, semantic ownership review a visual gate. Nesmí se přenést pouze proto, že je označený `production` ve starém manifestu.

## 6. Runtime boundary zůstává závazná

V3 validator dál musí failnout pro:

- přímý runtime import z raw V3 rootu;
- byte-identical raw copy do runtime roots;
- unsafe/case-colliding paths;
- malformed dimensions/content rectangles/cap insets;
- incomplete materialized nine-slice family;
- invalid atlas/window references;
- generated inventory drift;
- symlink escape.

Tato ochrana je užitečná i tehdy, když se pack momentálně nepoužívá pro rendering.

## 7. Known non-blocking source warnings

Historical source stále obsahuje čtyři známé non-blocking warnings:

1. stale checksum paths pro absent nested icon snapshot;
2. absent optional QA overview sheets;
3. README location mismatch pro nine-slice pieces;
4. source docs tvrdící, že nested icon pack je součástí snapshotu.

Canonical icons zůstávají v:

```text
design/icon-source/k0rp-icons-v2/
```

Warnings se nemají tiše „opravovat“ mutací exact raw snapshotu.

## 8. Co používat pro další práci

### Source integrity / historical inspection

```text
design/ui-source/k0rp-os-ui-assets-v3/
design/ui-runtime/k0rp-v3/
npm run validate:korp-ui-assets
```

### Current curated window implementation candidate

```text
design/ui-source/k0rp-ui-asset-pack-v01/
design/ui-runtime/k0rp-ui-v01/
npm run validate:korp-ui-pack-v01
```

### Canonical icons

```text
design/icon-source/k0rp-icons-v2/
src/assets/icons/korp-v2/
npm run validate:korp-icons
```

Tyto tři hranice jsou samostatné. Nemají se smíchat do jednoho asset rootu ani přepsat navzájem.

## 9. Důležité pravidlo

> Exact source snapshot může být hodnotný, i když se jeho první runtime použití nepovedlo. Archivujeme materiál i důvod zamítnutí; runtime stavíme z curated části, která respektuje živý layout, resize, pixel clarity a čitelnost.
