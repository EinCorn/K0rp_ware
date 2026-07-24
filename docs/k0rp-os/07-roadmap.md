# K0rp_OS — Roadmap

Verze: 0.4.0 pracovní návrh

## 0. Status dokumentu

Roadmap drží tři oddělené osy:

```text
GAMEPLAY / DATA
→ Metric → Audit → Evidence → backlog → delegation

VISUAL / WINDOW SYSTEM
→ curated assets → reusable chrome → portrait documents → controls/bars

FUTURE MODULE R&D
→ greybox → playtest → sensory pass → teprve potom OS integration
```

Tyto osy se smějí vyvíjet paralelně. Nesmějí si ale tiše přepisovat scope ani task čísla.

Canonical sources:

1. `20-core-loop.md` — ekonomika a invarianty;
2. `21-activity-spectrum-and-arcade-modules.md` — activity spectrum a budoucí action modules;
3. tento dokument — pořadí implementace;
4. `08-codex-tasks.md` — scope konkrétních tasků.

## 1. Aktuální stav na main

Na `main` jsou dokončené:

- fake desktop baseline;
- Audit 00-A;
- globální ClickAudit tracking;
- versioned local persistence;
- ClickAudit metric packets;
- repeatable Audit 10-A;
- Evidence certification;
- Audit 16-C a Fidget authorization;
- asset-backed Fidget module;
- canonical icon pack;
- window placement, cascade, minimize/close/taskbar semantics;
- Task 023 / PR #45: Fidget packet po třech settled sessions, repeatable Audit 18-S a mixed ClickAudit + Fidget backlog;
- Task 022A(2.1): V3 raw asset inventory/validator infrastruktura;
- Task 024A / PR #47: curated UI asset pack v01 ingestion a reusable window-shell contract bez player-visible runtime změny.

Odložené:

- V3 runtime chrome pilot PR #43 byl uzavřen bez merge;
- Tasky 022A(2.2–2.5) nejsou canonical runtime standard;
- jejich účel nahrazuje curated v01 visual track 024A–024D.

Aktuální bezprostřední gameplay krok:

```text
Task 024 — first-cycle data rebalance and machine-readable reconciliation
```

Aktuální bezprostřední visual candidate:

```text
Task 024B — ClickAudit + Fidget module-window chrome pilot nad v01 contractem
```

Task 024B je samostatný vizuální task. Nesmí blokovat Task 024 gameplay/data práci.

## Fáze 0 — Current consolidation

Status: dokončeno a průběžně chráněno.

- `main` je source of truth;
- standalone ClickAudit, Fidget a Bloom se zachovávají;
- žádný velký shared-shell refactor bez jasného gate;
- Windows je primary desktop target;
- nové feature se přidávají jako bounded vertical slices.

## Fáze 1 — Docs, research and progression RFC

Status: baseline dokončen, v0.4 activity-spectrum update připraven.

Výstupy:

- produktová vize;
- architecture/event/privacy contracts;
- progression/economy;
- sensory feedback;
- unlocks/surface mutations;
- playtest checklist;
- first-cycle balance;
- research/source index;
- canonical core loop;
- activity-spectrum a action-module RFC;
- strojově čitelný `packages/korp-progression`.

## Fáze 2 — Core and registry baseline

Status: dokončeno.

- `packages/korp-core`;
- `packages/korp-modules`;
- typed events/resources;
- manifests;
- reducer a registry testy.

Další práce je inkrementální, ne úplný přepis.

## Fáze 3 — Progression package baseline

Status: základ integrován.

- resources;
- forms;
- upgrades;
- memos;
- certifications;
- prestige/surface constants;
- TypeScript/JSON/CSV validation.

Machine-readable parity s v0.3 runtime se dokončuje v Tasku 024.

## Fáze 4 — Shared runtime and persistence

Status: dokončeno pro první dva metric sources.

- `KorpRuntimeProvider`;
- global state a lifetime stats;
- local save/load/reset;
- versioned envelope;
- packet/audit instances;
- authorization state;
- zero-retro migrations;
- mixed pending queue.

Později chybí import/export, policy/delegation save a dlouhodobý migration surface.

## Fáze 5 — Canonical desktop vertical slice

Status: dokončeno.

```text
prázdná plocha
→ Audit 00-A jako dokument
→ ClickAudit unlock
→ Doručené / Formuláře
→ asset-backed module windows
```

Hotové minimum:

- fake desktop;
- taskbar;
- window manager;
- folders/files;
- fixed logical canvas;
- wallpaper a font baseline;
- K0rp-only click classification;
- privacy-safe local persistence.

## Fáze 6 — Metric → Audit → Evidence

Status: dokončeno v Tasku 020 / PR #29.

```text
Audit 00-A nastaví raw baseline
→ první pozdější klik vytvoří bootstrap packet quantity 1
→ Audit 10-A
→ Evidence +1
→ další packety po 25 nových kliknutích
```

Invarianty:

- jeden fyzický klik = jeden manual click;
- raw klik nevyrábí Evidence;
- packet je povinnost, ne reward chest;
- audit certifikuje packet právě jednou;
- Evidence používá technický resource ID `notionalWorkUnits` do dokončení plné migrace.

## Fáze 7 — Authorization and Fidget surface

Status: dokončeno.

Obsah:

- Task 021A — placement, form cascade a close/minimize semantics;
- Task 021B — Audit 16-C a atomická alokace EV;
- Task 022 — reusable asset-backed Fidget;
- Task 022A — canonical icon pack.

Gate:

```text
EV 1
→ Audit 16-C
→ EV 1 alokována
→ Fidget authorized
→ shortcut/surface mutation
```

Fidget není odemčen hidden thresholdem. Je autorizován výsledkem auditního procesu.

## Fáze 8 — Second metric and first real backlog

Status: dokončeno v Tasku 023 / PR #45.

```text
3 nové fidget.sessionSettled
→ Fidget packet
→ repeatable Audit 18-S
→ shared pending queue
→ Evidence +1 po certifikaci
```

Hotové invarianty:

- raw settle nepřidává Evidence;
- packet creation neotevírá okno a nebere focus;
- ClickAudit a Fidget sdílejí packet/audit framework;
- mixed pending count je player-facing;
- debug Audit Pressure je odvozený, ne persistentní resource;
- schema migration nevytvoří retroaktivní Fidget packets.

Playtest backlogu zůstává produktový gate před delegací, i když technický Task 023 je hotový.

## Fáze 9 — First-cycle data reconciliation

Status: následující gameplay/data krok.

### Task 024

Cíl:

- sjednotit prose docs, JSON, CSV, TypeScript exports a runtime;
- odstranit staré direct-yield assumptions;
- player-facing metadata Evidence/EV;
- doplnit packet/audit template references;
- přepsat first-cycle phase/balance data;
- zachovat pozdější prestige hodnoty jako provisional tam, kde chybí playtest.

Gate:

```text
raw action
≠ spendable reward

audit.evidenceCertified
= jediný early Evidence grant path
```

Priority Containment ani Alignment Rally se do Tasku 024 nepřidávají. Nemají ještě schválený greybox ani packet balance.

## Paralelní visual track — Curated window system

### Historical V3 track

- Task 022A(2.1) zůstává validní jako raw inventory/validator infrastruktura;
- PR #43 nebyl mergnut;
- V3 chrome není runtime standard.

### Task 024A — v01 ingestion and shell contract

Status: dokončeno / PR #47.

- immutable raw source pack;
- generated catalog/runtime subset;
- module/audit/folder geometry contract;
- nine-slice frame;
- three-slice header;
- tiled material surfaces;
- live text;
- integer rendering;
- compact 167×167 content preservation;
- žádná player-visible změna.

### Task 024B — Compact module chrome pilot

Navržený další visual task:

- ClickAudit a Fidget pouze;
- zachovat jejich 167×167 content beze změny;
- v01 frame/header/pin/minimize/close;
- active/inactive title state;
- žádný resize feature ještě není nutný;
- žádná gameplay, packet, audit nebo save změna;
- comparison gate proti současnému ClickAudit/Fidget vzhledu.

### Task 024C — Portrait audit and folder pilot

Až po přijetí 024B compositional quality:

- Audit 00-A a jeden repeatable audit;
- Formuláře folder;
- portrait geometry;
- live controls, rows a text;
- žádné baked labels;
- žádné stretched paper/texture.

### Task 024D — Bars, controls and status language

Až po přijetí window families:

- top rail;
- taskbar;
- taskbar window states;
- evidence/pending readouts;
- status lamps;
- accessibility/contrast gate.

Visual track nesmí změnit pořadí gameplay unlocků.

## Fáze 10 — Delegation prototype

### Task 025

Prerequisite:

- technický mixed backlog existuje;
- playtest potvrdí, že hráč chce pomoc dřív, než ji dostane.

První stážista:

- generuje `delegated` raw activity;
- může předvyplnit audit;
- nemůže finálně certifikovat Evidence;
- vytváří discrepancies;
- vyžaduje supervision;
- může prakticky vykonávat funkci bez její formální authorization.

Gate:

```text
delegace ubere rutinu
→ vytvoří nový management problém
```

## Fáze 11 — Consolidation tasks 026–030

### Task 026 — ClickAudit analytics

- safe source breakdown;
- manual/delegated/system split;
- aggregate history;
- žádné coordinates/text/external app data;
- interpretace stejného raw clicku bez multiplieru.

### Task 027 — Bloom integration

- shared Bloom module;
- `bloom.waveAdvanced` closure;
- packet/audit/Evidence;
- třetí odlišný metric source.

### Task 028 — First-cycle playtest harness

- local-only milestone timestamps;
- packet/certification times;
- Evidence earned/spent;
- pending backlog;
- unlock order;
- export;
- žádná cloud telemetry.

### Task 029 — Sensory foundation

- audio buses;
- material profiles;
- density management;
- reduce motion;
- quiet mode;
- sensory intensity;
- input accessibility;
- hudba jako plánovaná vrstva, ne release-afterthought.

### Task 030 — Standalone aggregate bridge

- unlinked local mode;
- linked aggregate events;
- authorized campaign rewards;
- žádný raw pointer stream;
- žádný cloud/overlay implementation.

## Fáze 12 — First-cycle content and closure

Cíl: sestavit první uzavíratelný auditní cyklus až po ověření core, backlogu a datové parity.

Kandidáti:

- Button Compliance;
- Corner Watch jako screensaver;
- 6–8 mem;
- certifikace;
- Audit Findings;
- formulář 42-Z;
- archive/reboot/build mutation;
- post-prestige Bublinková Fólie.

Původní target 4–5 hodin zůstává provisional do reálného playtestu.

## Fáze 13 — Desk Object / ASMR-adjacent expansion

- Newtonova Kolíbka;
- Zenová Zahrádka;
- Surface Compliance;
- Shape Compliance;
- desk-object shelf;
- natural closures;
- sensory foundation prerequisite.

## Fáze 14 — Attention companion

- Attention Runner;
- low-input companion strip;
- nesmí převzít ekonomiku ani udělat z desktopu arcade catalog.

## Fáze 15 — Activity-spectrum R&D

Tato fáze není bezprostřední implementační fronta. Je strategický vývojový track pro nové typy činnosti.

### Gate před action prototype

Musí zůstat splněné:

- current core loop funguje;
- Task 024 data parity je hotová nebo není action prototypem dotčena;
- action module je izolovaný standalone greybox;
- žádný nový global resource;
- žádný přímý raw action → Evidence reward;
- žádný engine rewrite jen kvůli prototypu.

### Task 031 — Action-module contract and prototype harness

- module session boundary;
- run-local XP definition;
- 320×320 logical action viewport;
- local-only summary;
- no OS packet integration.

### Task 032 — Priority Containment greybox

- movement;
- autofire;
- Triage Pulse;
- 3 basic archetypes;
- 1 elite;
- 1 boss;
- 5 waves;
- 12 upgrades max;
- 4–6 minute closure.

### Task 033 — Priority buildcraft and local summary

- alespoň tři čitelné build archetypy;
- closure outcomes;
- local aggregate metrics;
- no Evidence.

### Task 034 — Priority sensory/readability pass

Až po greybox gate:

- audio/material stack;
- music layers;
- density management;
- reduce motion;
- quiet mode;
- integer scaling;
- readability under peak density.

### Task 035 — Priority OS integration

Až po potvrzeném prototype:

- authorization;
- surface mutation;
- privacy-safe raw closure;
- packet definition;
- Audit 27-P;
- exactly-once Evidence certification.

### Task 036 — Priority delegated policy prototype

- loadout template;
- target weights;
- risk tolerance;
- supervision;
- discrepancies;
- manual/delegated split.

### Task 037 — Alignment Rally greybox

- 1 claim;
- 1 paddle;
- 4 response zones;
- stakeholder rules;
- closure outcomes;
- 8 upgrades max;
- 2–3 minute session.

### Task 038 — Alignment OS integration

Až po samostatném gate:

- aggregate closure event;
- Audit 31-R;
- packet/Evidence;
- future automation discrepancies.

## Fáze 16 — Standalone hardening

- shared implementation;
- detached windows;
- unlinked local mode;
- linked aggregate bridge;
- portable settings;
- Windows release validation;
- action modules pouze pokud jejich standalone prototype skutečně funguje.

## Fáze 17 — Web fallback

- browser fake desktop;
- stejné progression IDs;
- local browser save;
- native limitation copy;
- action viewport musí zachovat logical coordinates a integer scale.

## Fáze 18 — Overlay MVP

- Windows-first always-on-top bar;
- K0rp-only mode;
- Privacy Work Blob;
- quick launch;
- žádné app names, URL, text, screenshots ani keylogging;
- high-intensity action modules nejsou automaticky overlay-compatible.

## Fáze 19 — Account / sync

Až po stabilním local-first systému.

- voluntary account;
- progress/settings/cosmetics;
- export/delete;
- žádný raw activity sync;
- žádný custom claim text nebo action replay sync.

## Fáze 20 — Control room and orchestration

Až existuje více delegovaných/automatizovaných procesů:

- module policies;
- operators;
- loadout templates;
- confidence;
- intervention thresholds;
- discrepancies;
- incident summaries;
- audit of orchestration.

Control Room není early launcher. Je důsledkem management vrstvy.

## Fáze 21 — Content expansion

- memo bank;
- Knowledge Base;
- hallway screens;
- training materials;
- fake incidents;
- procedural announcements;
- nové moduly pouze přes module contract a playtest gate.

## Gate pravidla

Každá implementační fáze musí splnit alespoň jedno:

- posílí core/runtime;
- prokáže další raw metric přes stejný audit framework;
- sjednotí data/prose/runtime;
- přidá surface mutation;
- integruje jeden modul bez změny ostatních;
- zlepší sensory/accessibility;
- projde konkrétním playtest gate.

Zakázané pokračování:

- další modul bez metric/audit/Evidence vazby nebo explicitního prototype-only scope;
- automatizace před zkušeností, kterou má řešit;
- nový player-facing resource jen proto, že pro něj existuje zkratka;
- přímý `raw action → currency` reward;
- akční modul natlačený do nečitelného viewportu;
- visual asset roztažený místo správného nine-slice/tile composition;
- launcher plný lepších her, ze kterého se K0rp desktop stal nepovinným formulářem.

> Pokud task jen přidává izolovanou hračku, je to scope creep v reflexní vestě. Pokud přidává hordu bez closure, auditu a budoucí chyby automatizace, je to scope creep s municí.
