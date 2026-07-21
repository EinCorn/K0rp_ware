# K0rp_OS — Typography & Brand Contract

Verze: 0.4.0 pracovní návrh  
Status: logo lock je závazný; fonty jsou current runtime baseline s explicitním future readability gate

## 1. Účel

Tento dokument odděluje dvě věci, které dřív byly zamčené jednou větou:

1. **logo `KØrp` / `K0rp_ware` je hotový asset a nemá se redesignovat**;
2. **Pixel Operator / Pixel Operator Mono jsou současný runtime standard, ale nejsou zákazem samostatného budoucího fontového experimentu**.

To chrání identitu a současně připouští realitu: malý text musí být čitelný. Stylizace, která při normálním rozlišení vypadá rozmazaně nebo mikroskopicky, není vítězství značky.

## 2. Current runtime font baseline

```text
Pixel Operator
Pixel Operator Mono
```

### Pixel Operator

Current použití:

- module/window titles;
- buttons;
- běžné labels;
- tooltips;
- krátké system messages;
- memo headings;
- menu rows;
- taskbar text.

### Pixel Operator Mono

Current použití:

- numbers;
- resource/readout values;
- event logs;
- registries;
- terminal-like text;
- employee ID;
- build/version labels;
- packet/audit IDs.

## 3. Co je skutečně zamčené

### Logo lock

Zakázané bez explicitního zadání:

- redesign loga;
- nahrazení `Ø`;
- změna wordmark proportions;
- generování nového loga;
- převod loga do běžného fontu;
- „modernizace“ značky.

Povolené:

- použití existujícího assetu;
- export ve vhodné velikosti;
- lossless/technická optimalizace;
- schválená barevná varianta;
- integer-size placement.

### Typography token contract

UI má používat semantic font tokens. Komponenty nesmějí hardcodovat náhodné font family řetězce.

```css
:root {
  --korp-font-ui: "Pixel Operator", monospace;
  --korp-font-mono: "Pixel Operator Mono", "Pixel Operator", monospace;
}
```

Pokud se future font změní, mění se token/catalog, ne stovky izolovaných komponent.

## 4. Future font-readability experiment

Font se smí změnit pouze samostatným taskem s comparison gate.

Candidate může být:

- OCR A Extended nebo podobný industrial/terminal face;
- jiná bitmap/pixel family;
- custom pixel treatment;
- kombinace display font + čitelnější body font.

Candidate není canonical jen proto, že v Malování vypadá správně rozpixelovaně.

## 5. Povinný font gate

Porovnat current a candidate minimálně na:

- 1600×900 logical canvas;
- reálném browser viewportu;
- Windows Chrome/Edge;
- fullscreen i běžném okně;
- 100 % a relevantním OS scaling;
- active/inactive titlebars;
- small metadata;
- body memo copy;
- audit fields;
- buttons;
- taskbar;
- EV/PENDING readouts;
- Czech diacritics;
- Latin uppercase/lowercase;
- digits/IDs;
- action-module moving HUD.

Kritéria:

- small body text je čitelnější nebo nejméně stejně čitelný;
- title fit se nezhorší;
- pixel edges zůstávají sharp;
- line-height/kerning nepůsobí rozpadle;
- česká diakritika je kompletní;
- font funguje jako live DOM text;
- nevyžaduje baked button labels;
- licence dovoluje plánovanou distribuci.

## 6. Rasterization and pixel clarity

Font může být vektorový, pokud se při cílové velikosti vykresluje dobře. „Pixel look“ neznamená, že text musí být bitmapový asset.

Pravidla:

- integer font sizes tam, kde to sedí layoutu;
- žádný fractional transform scale na text layer;
- žádný blur/filter/CRT overlay přes body text;
- text zůstává live;
- browser font smoothing nelze vždy úplně vypnout — design se testuje v reálném runtime;
- nekompenzovat slabý font extrémně malou velikostí;
- metadata raději zkrátit než zmenšit pod čitelnost;
- action HUD musí být čitelný za pohybu, ne jen na screenshotu.

## 7. Role-based typography

Dlouhodobě může systém používat více rolí:

```text
BRAND / LOGO
→ fixed asset

DISPLAY / TITLE
→ výrazný industrial/pixel face

BODY / FORM
→ čitelný UI face

MONO / DATA
→ čísla, IDs, registry
```

Jedna rodina pro vše je výhoda pouze tehdy, když vše zůstává čitelné.

## 8. Live text and assets

- button background je asset nebo CSS composition;
- button label je live text;
- hover/pressed state smí měnit background asset i text color;
- titlebar je three-slice asset + live label;
- folder row je background/icon + live metadata;
- žádný lokalizovatelný nebo dynamický text se bakeuje do runtime PNG bez explicitního důvodu.

## 9. Licence a distribuce

Docs pack nepřikládá font files.

Před release:

- ověřit licenci;
- dokumentovat source/license;
- rozhodnout bundling/local loading;
- nepřidávat font file bez explicitního license clearance;
- neexportovat proprietary font jen proto, že byl lokálně nainstalovaný.

## 10. Codex / AI guardrail

Current task prompt:

```text
Preserve the current Pixel Operator / Pixel Operator Mono runtime tokens unless the task is explicitly a typography readability experiment. Do not redesign or replace the K0rp/K0rp_ware logo. Keep labels as live text. Do not add font files unless explicitly provided and license-cleared.
```

Font experiment prompt musí navíc požadovat screenshot comparison a nesmí současně měnit window chrome, layout, content density a font — jinak nebude jasné, co čitelnost zlepšilo nebo zhoršilo.

## 11. Acceptance

Běžná UI změna je přijatelná, pokud:

- používá current semantic tokens;
- logo zůstalo beze změny;
- fallback není final visible state;
- text je čitelný v runtime velikostech;
- nedochází k fractional scalingu;
- live text zůstává oddělený od assets.

Font change je přijatelný pouze po samostatném comparison/readability/license gate.

## 12. Důležité pravidlo

> Logo je zamčené. Font není posvátná relikvie. Je to pracovní nástroj identity a čitelnosti — a pokud neunese malý formulář ani pohyblivý HUD, systém potřebuje lepší nástroj, ne menší text.
