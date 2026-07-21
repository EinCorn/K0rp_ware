# K0rp_OS — Visual Style Guide

Verze: 0.4.0 pracovní návrh  
Status: interní vizuální směr

## 1. Základní estetika

Cíl:

> **Pixelart s nádechem komiksů 50. let, starého interního softwaru, špinavých průmyslových panelů a liminální kancelářské tísně.**

K0rp_OS nemá působit jako čistý moderní produkt. Má vypadat jako rozhraní původně navržené pro něco velmi nudného, ve kterém se postupně usadila osobnost, provozní historie a příliš mnoho procedur.

Klíčová slova:

- pixelart;
- 8–16bit feeling;
- CRT/terminal patina;
- špinavý kancelářský hardware;
- retro industrial panel;
- golden-age comics linka;
- 50s corporate optimism po lobotomii;
- liminální chodby;
- signage;
- formuláře, štítky, razítka a varování;
- manažerské desk objects;
- uklidňující zařízení, která systém začal měřit;
- operational chaos přeložený do přehledných procedur.

## 2. Vizuální vrstvy produktu

K0rp_OS kombinuje několik materiálových jazyků, které musí působit jako jedna instituce:

```text
OS SHELL
→ top rail, taskbar, wallpaper, system status

WINDOW CHROME
→ frame, header, controls, focus state

DOCUMENTS
→ paper, forms, folders, memos, reports

MODULE DEVICES
→ ClickAudit, Fidget, Bloom, desk objects

ACTION SYSTEMS
→ Priority Containment, Alignment Rally

MANAGEMENT
→ policy, personnel, discrepancies, control room
```

Jednotu nedělá stejný rozměr každého okna. Dělá ji materiál, typografie, state language, controls a způsob, jak systém věci autorizuje.

## 3. Current visual anchors

### Hallway desktop

- liminální kancelářská chodba;
- tmavé okraje a centrální provozní prostor;
- levý sloupec artifactů;
- top rail/taskbar;
- okna jako fyzické objekty položené na scéně.

### ClickAudit

- mechanické flip digits;
- liquid jako interní pixelová hmota;
- přehnaně formální/slavnostní milestone;
- kompaktní `167×167` content;
- vysoká pixel clarity.

### Fidget

- fyzický spinner;
- hmotnost, stín a natural settle;
- klidnější feedback než action module;
- kompaktní `167×167` content.

### Bloom

- stones/status sedimenty;
- green/yellow/red jako stav, ne pouhá good/bad barva;
- dry procedural clear;
- board jako pracovní zahrádka.

Tyto moduly nejsou povinností všech budoucích oken vypadat stejně velké. Jsou quality baseline pro pixel sharpness a materiálovou soudržnost.

## 4. Curated window-shell contract

Task 024A zavedl curated pack v01.

Závazné:

- frame se skládá nine-slice;
- header horizontal three-slice;
- material surface se tiluje v native resolution;
- complete shell asset je reference-only;
- controls jsou fixed-size assets;
- labels jsou live DOM text;
- integer logical coordinates;
- integer scaling;
- nearest-neighbor pouze při nutném integer scale;
- žádný fractional transform, smoothing, blur nebo filter;
- compact content se nesmí zmenšit kvůli chrome.

Window family:

```text
compact module
portrait audit/document
portrait folder
action module
system modal/toast
```

Action window používá stejný jazyk, ale větší content-driven geometry.

## 5. Pixel clarity

Pixelart nesmí být výmluva pro rozmazání.

Zakázané:

- roztahování malého frame assetu přes celé okno;
- roztahování 32×32 material texture na velkou plochu;
- fractional `transform: scale(...)` uvnitř logical canvas;
- browser filtering;
- blurred pseudo-CRT na textu;
- změna content scale jen proto, aby se vešel nový titlebar;
- baked text v tlačítku, pokud má být dynamický.

Používat:

- native tiles;
- nine-slice/three-slice;
- integer layout;
- explicit content insets;
- nearest-neighbor při integer 2×;
- oddělenou live text layer;
- screenshot comparison na cílovém rozlišení.

## 6. Window families

### Compact module

- ClickAudit a Fidget preserved content `167×167`;
- pin/unpin, minimize, close;
- active/inactive header;
- dark panel tile;
- žádné zmenšení content.

### Portrait documents

- Audit 00-A, packet audits, mema, certifications;
- text a fields čitelné;
- krátký audit bez zbytečného scrollu;
- dlouhý content scrolluje uvnitř;
- paper/material není roztažený jeden bitmapový obrázek.

### Portrait folders

- live rows;
- live scrollbar;
- document icons;
- vertically oriented list;
- status/metadata nejsou bakeované do row assetu.

### Action modules

Priority Containment provisional:

```text
320×320 logical viewport
```

Alignment Rally: prototype-determined `320×220` až `320×320`.

Pravidla:

- gameplay readability má přednost před uniformní velikostí;
- frame/chrome se skládá stejným systémem;
- HUD má působit jako interní operational surface;
- žádný moderní esports overlay;
- detached mode může použít přesné 2×;
- resize nesmí změnit logical coordinates.

## 7. Barevný systém

### Primární materiály

- uhlová černá;
- špinavá grafitová;
- tmavý kov;
- starý beton;
- zažloutlá šedá;
- kancelářská béžová;
- unavený papír;
- tmavý plast.

### Akcenty

- červená: audit, chyba, urgent state;
- žlutá: pozornost, warning, nestabilní pomoc;
- zelená: compliance, closure, falešná bezpečnost;
- modrá: informace, system, Evidence/utility podle surface;
- oranžová: care/cleaning/procedural maintenance;
- fialová/tmavá duha: rare, toxicky uklidňující nebo interpretive state;
- šedobílá: labels, data, prach.

Barva nikdy není jediný nositel state.

## 8. Action-module visual language

### Priority Containment

Objekty nejsou fantasy monstra. Jsou procesní artefakty:

- Quick Ask — malý, rychlý, papírový/plastový;
- Meeting Invite — zóna/panel blokující prostor;
- Ownerless Blocker — těžký objekt s prázdným ownership slotem;
- Duplicate Ticket — rozdělující se dokument;
- P0 Escalation — urgent state čitelný tvarem/zvukem, ne jen červenou;
- Executive Priority — objekt měnící pravidla arény.

Processing effects:

- return to sender;
- routing line;
- department slot;
- archive extraction;
- duplicate merge;
- follow-up trail.

Nechceme:

- krev;
- zbraně jako vojenské fantasy;
- bullet-hell neon;
- sci-fi HUD nesouvisející s OS;
- particle cloud zakrývající prostor.

### Alignment Rally

Claim je fyzický dokument/objekt se stavem.

Response zones:

```text
EVIDENCE / SCOPE / OWNER / DEPENDENCY
```

Každá zone má:

- live label;
- distinct shape/pattern;
- consistent color family;
- impact cue;
- čitelnou změnu claim state.

Rally escalation může měnit:

- motion lines;
- header/status pressure;
- stakeholder markers;
- field geometry;
- pace.

Nesmí skončit jako čistý Pong skin s textem nalepeným nahoře.

## 9. Visual intensity spectrum

### Low intensity

- menší amplituda;
- pomalé návraty;
- detail materiálu;
- více negativního prostoru;
- tlumená ceremony.

### Medium intensity

- jasný chain/state change;
- omezené particles;
- rytmus;
- čitelné anticipation.

### High intensity

- hierarchy hráč → hrozba → safe space → elite → decorations;
- density budgets;
- aggregate effects;
- wave break/de-escalation;
- screen shake optional/off;
- žádný permanentní climax.

### Management

- diagrams, rows, policies a incident cards;
- stále fyzický/industrial look;
- ne moderní analytics SaaS;
- information density odemykaná postupně.

## 10. Typografie

### Current runtime baseline

```text
Pixel Operator
Pixel Operator Mono
```

Použití:

- Pixel Operator: labels, titles, buttons, short copy;
- Pixel Operator Mono: numbers, registry, event log, IDs, status.

Toto je současný runtime standard, ne zákaz budoucího testu jiné čitelné bitmap/pixel treatment.

Případná změna OS fontu:

- samostatný design/readability task;
- porovnání na 1× logical canvas;
- česká diakritika;
- small body readability;
- button/title fit;
- active/inactive contrast;
- žádná změna jako vedlejší efekt asset tasku.

OCR A Extended nebo jiný font může být candidate pouze po license/readability/pixel-rendering gate. Nemá se bakeovat do assetů jako náhrada live textu.

### Čitelnost

- krátké labels velké a kontrastní;
- body copy dostatečný line-height;
- žádný subpixelově malý text;
- status metadata zkracovat, ne mikroskopicky zmenšovat;
- high-intensity HUD musí být čitelný během pohybu;
- readable-text accessibility mode je legitimní.

## 11. Logo

`KØrp` / `K0rp_ware` značka se nemění v běžném UI polish tasku.

```text
Logo = asset.
UI copy = live text.
```

## 12. UI materials

Používat:

- kovové rámy;
- šrouby;
- rýhy;
- starý plast;
- štítky;
- papírky;
- jemné scanlines mimo body text;
- patinu;
- prach;
- mřížku;
- mechanické hinges;
- liquid;
- sand;
- bubble sheet;
- ticket paper;
- relay lights.

Omezit:

- clean glassmorphism;
- moderní gradients bez patiny;
- neumorphism;
- neon cyberpunk;
- sterilní mobile-game UI;
- generické fantasy particles;
- stock office iconography bez K0rp treatment.

## 13. Komiks 50. let

Ne superhrdina v plášti.

Používat:

- omezené palety;
- silnější ink line;
- halftone feeling;
- přepálené instruktážní pózy;
- optimistický layout s depresivním obsahem;
- fake training posters;
- procedurální cutaways;
- objects with labels and arrows.

Hodí se pro:

- Knowledge Base;
- authorization/training;
- operator instruction;
- discrepancy explanation;
- loading/briefing screen;
- Hlas z chodby adjacent artifacts.

## 14. Desktop rules

Canonical desktop:

- tmavý hallway wallpaper;
- left artifact column;
- top rail;
- bottom taskbar;
- employee/status/privacy;
- windows jako fyzické panely;
- žádný předem vystavený katalog locked modules.

Locked capabilities se projevují nepřímo:

- chybějícím artifactem;
- request formem;
- memo;
- unavailable procedure;
- empty folder slot až po kontextovém odhalení.

## 15. Accessibility

- color-independent status shapes/patterns;
- reduce motion;
- flash off;
- screen shake off;
- sensory intensity;
- high-frequency reduction;
- readable text mode;
- keyboard alternatives;
- remappable action input;
- larger snap tolerance;
- pause;
- action assist podle modulu;
- anomaly/random visual toggle.

## 16. Asset production rules

Každý runtime asset deklaruje:

- semantic ID;
- source pack;
- classification: tile/nine-slice/three-slice/fixed/reference-only;
- authored dimensions;
- content/cap insets;
- allowed states;
- runtime import path;
- whether live text overlays it.

Raw design snapshot není runtime import root.

## 17. Review gates

Visual task není hotový pouze proto, že používá nový asset.

Kontrolovat:

- pixel sharpness;
- family coherence;
- titlebar/frame integration;
- text readability;
- content size preservation;
- active/inactive state;
- hover/pressed state;
- browser scale;
- Windows rendering;
- comparison s accepted ClickAudit/Fidget baseline;
- action peak-density readability;
- no stretched materials.

## 18. Důležité pravidlo

> K0rp_OS má vypadat jako jeden operační systém, ne jako sada stejných obdélníků. Jednota vzniká z materiálu, typografie, procesu a state language — ne z toho, že každé okno násilím nacpeme do stejné velikosti.
