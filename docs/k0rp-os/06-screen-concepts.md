# K0rp_OS — Screen Concepts

Verze: 0.4.0 pracovní návrh

## 1. Identity Assignment / Login

První kontakt s K0rp_OS není klasický login, ale přiřazení identity.

- logo KØrp_OS;
- employee id generovaný lokálně;
- hláška `IDENTITA PŘIŘAZENA. OSOBA VOLITELNÁ.`;
- tlačítko `PŘIJMOUT PŘÍTOMNOST`;
- normální, neironické privacy vysvětlení.

## 2. K0rp_OS Desktop

Canonical full-game surface není launcher plný modulů.

První spuštění:

- tmavý wallpaper;
- top rail a taskbar podle aktuálního shell contractu;
- Employee ID;
- clock;
- privacy indicator;
- Compliance Bin;
- otevřený dokument Audit 00-A.

Po odeslání auditu se objeví ClickAudit shortcut, Doručené a první vykázané stopy procesu.

## 3. Module Launcher / Control Desk

Launcher nebo katalog smí existovat jako:

- web portal;
- debug surface;
- pozdější administrativní registry;
- control-room obrazovka po rozvinutí management vrstvy.

Nesmí být první obrazovkou campaign a nesmí předem ukázat celý zamčený module catalog.

## 4. Window family contract

Task 024A zavedl curated UI asset pack v01 a machine-readable shell contract. Důležité principy:

- frame je nine-slice;
- header je horizontal three-slice;
- surface texture se tiluje v native resolution;
- complete shell asset je reference-only a nesmí se roztahovat;
- runtime text zůstává live DOM;
- integer coordinates a integer scaling;
- žádný blur, smoothing ani fractional transform scale.

### Compact module family

Použití:

- ClickAudit;
- Fidget;
- případně další desk objects se stejnou geometrií.

Current preserved content:

```text
167×167 logical px
```

Chrome obsahuje:

- pin/unpin;
- minimize;
- close.

### Portrait document family

Použití:

- Audit 00-A;
- Audit 10-A;
- Audit 16-C;
- Audit 18-S;
- budoucí packet audits;
- mema, certifikace a reporty podle jejich document subtype.

Audity a Formuláře se mají dlouhodobě chovat jako portrait documents, ne široké dashboard cards.

### Portrait folder family

Použití:

- Doručené;
- Formuláře;
- Wellbeing;
- Care & Alignment;
- Čekající potvrzení;
- Certifikace;
- Archiv.

Folder row a scrollbar zůstávají live UI, ne baked asset.

### Action module family

Použití:

- Priority Containment;
- Alignment Rally;
- případné pozdější incident modules.

Provisional content viewport:

```text
Priority Containment: 320×320 logical px
Alignment Rally: nejdřív prototype-determined, očekávaně 320×220 až 320×320
```

Action module nesmí být zmenšen do compact 167×167 boxu jen proto, že existující shell je menší. Použije stejný compositional language, ale větší content-driven outer size.

Detached 2× mode smí renderovat přesné integer 2×. Fractional scaling je zakázán.

## 5. Window behavior

Všechna skutečná okna podporují podle family:

- open;
- close;
- minimize;
- taskbar state;
- bring to front;
- drag;
- remembered session position;
- volitelný pin u module windows.

První open ne-document module se centruje v usable workspace. Document windows používají form cascade. Action modules se při prvním open centrují a nesmějí automaticky přebírat focus pouze vznikem packetu.

## 6. ClickAudit Window

- preserved 167×167 content;
- flip digits;
- liquid progress;
- source/profile readout;
- milestone feedback;
- pin/minimize/close;
- analytics až jako pozdější unlock, ne výchozí cockpit.

## 7. Fidget Window

- preserved 167×167 content;
- spinner;
- režimy KLIK / RUČNÍ;
- spin-up, resonance, coast-down a natural settle;
- pin/minimize/close;
- session closure neotvírá automaticky auditní okno.

## 8. Bloom Window

- 5×5 board;
- green/yellow/red stones;
- score a vlna;
- material-specific feedback;
- burst při clearu;
- module-local state;
- pozdější packet closure přes waveAdvanced.

## 9. Priority Containment Window

První high-intensity operational-response module.

### Layout

- square 320×320 gameplay viewport;
- briefing strip nebo overlay;
- in-world capacity/status indicators;
- žádná permanentní globální currency lišta uvnitř arény;
- upgrade choice jako krátké klidné intermezzo;
- session summary jako lokální report před případným OS packetem.

### Readability

Musí být čitelné:

- avatar/capacity position;
- priority archetype;
- projectile nebo processing trajectory;
- meeting zones;
- pickup/closure objects;
- active build effects;
- safe space.

### Controls

- movement;
- jedna active ability;
- pause;
- sensory intensity;
- reduce motion;
- optional aim assist/manual aim až po prototype gate.

### Closure

Konec session nesmí být jen `YOU DIED`.

```text
RELACE UZAVŘENA
nebo
RELACE UZAVŘENA S VÝHRADOU
```

Summary ukáže aggregate raw outcomes a případné budoucí audit risk, ne Evidence reward.

## 10. Alignment Rally Window

Fyzikální argumentační module.

### Layout

- claim/state panel;
- rally field;
- response paddle s viditelnými zones `EVIDENCE / SCOPE / OWNER / DEPENDENCY`;
- closure outcome panel;
- krátký upgrade choice mezi sequences.

Claim text je template content. Globální event log ukládá jen template ID a aggregate outcome, ne volný text hráče.

### Closure outcomes

- ACCEPTED;
- REJECTED;
- DEFERRED;
- OWNER ASSIGNED;
- SENT OFFLINE;
- MEETING REQUIRED;
- NO DECISION RECORDED.

## 11. Corner Watch

Primárně idle/screensaver module.

- odrážející se logo;
- near-miss cue;
- corner hit ceremony;
- `ROHOVÉ POKUSY`;
- Settings / Screen Saver integration;
- hit není povinný rare gate hlavní progression.

## 12. Bublinková Fólie

- grid bublinek;
- full / pressed / popped / defective / rare;
- press-and-drag;
- sheet completion;
- sample variance a density limit;
- post-prestige new-system reward candidate.

## 13. Button Compliance

- fyzický panel;
- kontrolky;
- sequence closure;
- pending confirmations;
- false-positive bez reflexní trestající sirény;
- vazba na exceptions a authorization.

## 14. Surface Compliance

- špinavý panel / sklo / formulář;
- wipe mask;
- percentage cleaned;
- material-specific sound;
- hidden residue/files;
- přirozené surface closure.

## 15. Shape Compliance

- drag / rotate / snap;
- closure meter;
- přesná snap tolerance;
- keyboard alternative;
- color-independent states.

## 16. Attention Runner

- companion strip;
- low-input endless runner;
- nesmí převzít hlavní ekonomiku;
- nesmí změnit desktop v arcade launcher.

## 17. Zenová Zahrádka

- písečný box;
- rake strokes;
- movable stones;
- free a procedural mode;
- natural pattern closure.

## 18. Newtonova Kolíbka

- controlled/fake physics;
- pull/release;
- impact/cycle counter;
- přirozený motion-ended closure;
- odpovědnost se přenáší vizuálně, ne lore dumpem.

## 19. Internal Memo

Memo je soubor v Doručených, ne běžný blocking popup.

Modal se používá pouze pro identity assignment, zásadní authorization, prestige a skutečně systémové operace.

## 20. Knowledge Base

- vyhledávání;
- kategorie podle oddělení/modulů;
- comics/training vizuály;
- help i in-universe obsah;
- žádný explicitní lore dump.

## 21. KPI / Notional Work Board

Odemknutelná analytická obrazovka.

- pouze odhalené metriky;
- current vs lifetime;
- manual/delegated/system split;
- packet a discrepancy summaries;
- žádný výchozí cockpit s osmi čísly.

## 22. Policy / Control Room

Pozdější management surface.

Obsahuje:

- autorizované moduly;
- operators/stážisty;
- loadout templates;
- policy rules;
- intervention thresholds;
- supervision cadence;
- open discrepancies;
- recent incident summaries.

Control Room není early launcher. Odemkne se až ve chvíli, kdy hráč skutečně řídí více automatizovaných procesů.

## 23. Desktop artifact progression

Přibližné prezentační pořadí:

1. Audit 00-A, ClickAudit, Doručené.
2. Formuláře a repeatable audits.
3. Fidget, Wellbeing a mixed backlog.
4. Delegation/personnel artifacts.
5. Bloom a Care & Alignment.
6. Corner Watch v Settings.
7. Button Compliance a Čekající potvrzení.
8. Certifikace, Knowledge Base a Archiv.
9. První auditní cyklus a nový interaction system.
10. Pozdější operational-response module a policy/control-room surfaces.

Každý objekt je stopou konkrétního procesu. Náhodný clutter není progression.

## 24. Prestige presentation

Uzavření auditního cyklu:

- archivuje cycle files;
- odstraní nebo přesune pending cycle-scoped forms;
- zachová permanentní documents;
- uklidí plochu;
- změní wallpaper/build;
- krátce rebootuje;
- nainstaluje nový systém.

## 25. Závazné vizuální guardrails

- netahat malé textury přes velké plochy;
- tilovat material surfaces v native resolution;
- používat nine-slice/three-slice pro resize;
- complete shells jsou reference-only;
- live text se nesmí bakeovat do button assets;
- hover/pressed state smí měnit background asset i live text color;
- compact content se nesmí zmenšit kvůli novému chrome;
- portrait documents se nesmějí vrátit do širokých card layouts;
- action viewport se nesmí obětovat uniformitě oken.
