# K0rp_OS — Implementation Task Pack

Verze: 0.4.0 pracovní plán

## 0. Pravidlo pro implementační tasky

Nedávat Codexu ani jinému agentovi úkol typu „udělej K0rp_OS“.

Každý task musí mít:

- jeden jasný herní nebo technický cíl;
- omezený scope;
- explicitní seznam toho, co nesmí měnit;
- automatické validace;
- ruční Windows test plan;
- očekávaný PR výstup;
- seznam změněných files/surfaces;
- migration note, pokud se mění save nebo progression data;
- závěrečný PowerShell blok s příkazy, které má Daniel lokálně spustit.

Codex je implementační kolega, ne autor světa. Nemá sám rozhodovat, že K0rp potřebuje:

- novou měnu;
- nový modul;
- jiný packet threshold;
- další explicitní lore;
- přepsání skryté meta roviny do UI;
- engine rewrite;
- nový visual standard bez review.

Canonical sources:

```text
docs/k0rp-os/20-core-loop.md
docs/k0rp-os/21-activity-spectrum-and-arcade-modules.md
docs/k0rp-os/07-roadmap.md
```

## 1. Platform guardrail

Primary platform je Windows. Mac je secondary dev/design/smoke-test prostředí.

- Pure TypeScript, docs a data tasks mohou být ověřené na Macu nebo Windows.
- Tauri window behavior, transparency, always-on-top, overlay a installer vyžadují Windows gate.
- Platform-specific chování nepatří do `korp-core`.
- Nehardcodovat lokální cesty.
- Každý task musí vypsat terminálové příkazy v závěrečném komentáři/PR summary.
- Před `npm ci` na Windows ukončit běžící Node/Vite proces, pokud drží Rolldown native binding.

Doporučený čistý start:

```powershell
Set-Location 'C:\Users\danie\Projects\K0rp_ware'
Get-Process -Name node -ErrorAction SilentlyContinue | Stop-Process -Force
Start-Sleep -Milliseconds 800
if (Test-Path -LiteralPath '.\node_modules') { Remove-Item -LiteralPath '.\node_modules' -Recurse -Force }
Remove-Item -LiteralPath '.\dist' -Recurse -Force -ErrorAction SilentlyContinue
npm ci
```

Task smí tento blok zkrátit, pokud dependency reinstall není potřeba. Nesmí ale zatajit, jak build ověřit.

## 2. Task ledger

### Tasks 001–014 — historical baseline

Status: dokončené nebo překonané pozdější implementací.

Obsah:

- docs/core/module baseline;
- fake desktop experiments;
- shared shell;
- ClickAudit bridge;
- module registry;
- Windows workflow;
- fixed canvas a typography.

Staré prompty nejsou aktuální implementační pořadí.

### Task 015 — Shared Korp runtime provider

Status: DONE / MERGED.

- jeden global state;
- runtime/presentation boundary;
- ClickAudit dispatch přes core.

### Task 016 — Progression-backed Audit 00-A / 10-A

Status: DONE / MERGED.

- progression data jako form source;
- module/memo/upgrade state;
- původní flow později nahrazeno canonical packet bootstrapem.

### Task 017 — Versioned local runtime save

Status: DONE / MERGED.

- schemaVersion;
- progressionDataVersion;
- safe save/load/reset;
- corrupt/future fallback.

### Task 018 — Minimal Audit 00-A and reusable form shell

Status: DONE / MERGED.

- `Jsem v práci?`;
- oddělení auditu od ClickAuditu;
- data-driven form renderer.

### Task 019 — Asset-backed ClickAudit and OS click tracking

Status: DONE / MERGED.

- skutečný ClickAudit module window;
- canonical digit/liquid assets;
- central K0rp_OS click classification;
- taskbar restore;
- raw click persistence.

### Task 020 — Metric → Audit → Evidence

Status: DONE / MERGED / PR #29.

```text
Audit 00-A baseline
→ first post-unlock click bootstrap packet
→ repeatable Audit 10-A
→ Evidence +1
→ další packet po 25 nových kliknutích
```

Guardrails:

- raw click není currency;
- packet je persistentní povinnost;
- audit certifikuje právě jednou;
- Evidence používá technický ID `notionalWorkUnits`;
- zero-retro save migration.

### Task 021A — Window placement and form cascade

Status: DONE / MERGED / PR #31.

- centered first open pro non-form windows;
- stable window IDs;
- form cascade `+18/+14`;
- close vs minimize;
- quantity-1 audit auto-open once;
- pozdější packet audits pouze queue bez focus steal.

### Task 021B — Evidence authorization and Audit 16-C

Status: DONE / MERGED / PR #33.

- EV gate;
- atomická alokace právě 1 EV;
- persistent Fidget authorization;
- idempotentní submit;
- surface mutation po autorizaci.

### Task 022 — Shared asset-backed Fidget

Status: DONE / MERGED / PR #35.

- reusable Fidget module content;
- standalone i OS window používají stejnou implementation;
- authorization-backed shortcut;
- žádný přímý Evidence reward.

### Task 022A — Canonical icon pack

Status: DONE / MERGED / PR #37.

- immutable raw icon source;
- generated runtime subset;
- semantic catalog;
- validators;
- current desktop/document mappings;
- žádné CSS fallback letters.

### Task 022A(2.1) — V3 source ingestion and validator

Status: DONE / INFRASTRUCTURE.

- exact raw snapshot;
- generated inventory;
- offline validation;
- runtime boundary;
- žádná player-visible změna.

### Task 022A(2.2) — Historical V3 chrome pilot

Status: CLOSED / UNMERGED / PR #43.

Důvod:

- visual quality neodpovídala ClickAudit/Fidget baseline;
- frame, titlebar, paper a controls nepůsobily jako jeden systém;
- stretching/scale vedly k rozmazání a nečitelnosti;
- pilot není canonical runtime standard.

Následné 022A(2.2–2.5) se neobnovují pod stejným asset assumptions. Curated replacement track je 024A–024D.

### Task 023 — Fidget metric packet and mixed backlog

Status: DONE / MERGED / PR #45.

```text
3 nové fidget.sessionSettled
→ packet fidget-sessions-<start>-<end>
→ repeatable Audit 18-S
→ mixed queue
→ Evidence +1 po certifikaci
```

Dokončené contracts:

- settled session exactly once;
- raw closure bez direct reward;
- packet bez auto-open/focus steal;
- ClickAudit + Fidget mixed pending count;
- debug-only derived pressure;
- schema 4 → 5 zero-retro migration.

Produktový backlog-pain gate před Taskem 025 se stále musí ručně vyhodnotit.

## 3. Bezprostřední gameplay/data task

## Task 024 — First-cycle data rebalance and migration

Status: NEXT GAMEPLAY / DATA.

### Cíl

Sjednotit machine-readable progression databázi s již implementovaným Metric → Audit → Evidence runtime.

### Scope

- `resources.json`: player-facing Evidence / EV metadata;
- `events.json`: odstranit early direct Evidence/NWU yields z raw actions;
- sjednotit `fidget.sessionSettled` s pravidlem „raw closure nevydělává“;
- doplnit/validovat `audit.evidenceCertified` semantics;
- Audit 10-A, 16-C a 18-S parity;
- packet/audit template reference validation;
- přepsat first-cycle phases a balance CSV podle v0.3 flow;
- aktualizovat package RFC a integration map;
- zvýšit progression data version;
- zachovat saves deterministickou migrací;
- pozdější prestige math ponechat provisional, pokud není playtestované.

### Do not

- nepřidávat Priority Containment nebo Alignment Rally data;
- nepřidávat jejich event IDs, packet definitions ani audit templates;
- nepřidávat stážistu;
- neměnit runtime window chrome;
- nepřidávat nový resource ID `evidence`;
- nefinalizovat 4–5h prestige target bez dat;
- neměnit raw click cardinality.

### Tests

- žádný early raw event neposkytuje spendable EV;
- pouze certifikace packetu udělí EV;
- packet/audit IDs existují a jsou unique;
- one-time/repeatable forms jsou rozlišené;
- CSV/JSON/TS parity;
- progression version migration;
- current save flow zůstává funkční.

### Validation

```powershell
npm run validate:korp-progression
npm run test:runtime
npm run test:runtime-save
npm run test:korp-core
npm run typecheck:korp-core
npm run test:korp-modules
npm run typecheck:korp-modules
npm run typecheck:korp-progression
npm run build
```

## 4. Paralelní curated visual track

## Task 024A — UI asset pack v01 ingestion and window-shell contract

Status: DONE / MERGED / PR #47.

### Dokončeno

- immutable raw source `design/ui-source/k0rp-ui-asset-pack-v01/`;
- generated runtime catalog/subset `design/ui-runtime/k0rp-ui-v01/`;
- allowlist;
- validator/build scripts;
- nine-slice frame contract;
- three-slice header contract;
- tiled material surface;
- fixed control states;
- live DOM text;
- integer coordinates/scaling;
- ClickAudit/Fidget intrinsic gameplay sizing preservation; finální embedded aperture je měřený v Tasku 024B;
- portrait audit/folder geometry definitions;
- žádná runtime visual změna.

## Task 024B — ClickAudit + Fidget module-window chrome pilot

Status: ACTIVE / PILOT CONTRACT / DRAFT PR #49 — implementace je hotová, finální Windows Chrome 100%/150% visual gate čeká na Danielovo potvrzení.

### Cíl

Použít jeden curated v01 module-family chrome contract pro ClickAudit a Fidget bez změny gameplaye, progression nebo save semantics.

### Implementovaný contract

- pouze ClickAudit a Fidget OS windows;
- fixed authored `183×223` shells rendered at 1:1: `window.module.compact.active` / `window.module.compact.inactive`, přepínané jako celek podle focus state;
- exact live viewport `{ x: 5, y: 28, width: 173, height: 173 }`, shodný s authored transparent aperture;
- background-only opaque/textured underlay `{ x: 4, y: 27, width: 175, height: 175 }`, který shell maskuje pod rails jako ochranu proti device-pixel phase seam při browser zoomu 150%;
- layer ownership `backing → tiled dark-panel → live content → authored shell → interactive chrome`;
- app content may not modify the outer family chrome;
- pin/unpin, minimize a close ve čtyřech stavech;
- live title text přesně `ClickAudit` / `Fidget`;
- authored Fidget rotation control `14×13` ve stavech normal/hover/pressed/disabled na shell rectu `{ x: 6, y: 205, width: 14, height: 13 }`;
- stejné intrinsic spinner, digits a liquid sizing jako před taskem;
- first-open/drag/minimize/close/taskbar semantics beze změny;
- standalone `230×230` shells beze změny;
- old module nine-slice a separate header pieces zůstávají mimo runtime pilot; resizable composition je deferred.

### Do not

- nezmenšovat nebo rescalovat ClickAudit/Fidget content;
- neměnit spinner, digits, liquid ani gameplay;
- nepřidávat resize behavior;
- nepoužívat complete 320×220 reference shell jako stretched background;
- neimportovat raw source pack;
- neměnit Audit/Formuláře;
- neměnit packets, Evidence ani save.

### Visual gate

- authored aperture je flush bez pohyblivé edge gap při Chrome 100% i fullscreen 150%;
- active/inactive shell geometry je identická;
- ClickAudit a Fidget používají stejný shell/content placement;
- frame, titlebar a footer jsou pixel-sharp;
- title controls i Fidget rotation control mají správné hitboxy a všechny authored states;
- žádný blur/fractional transform;
- current module gameplay art je stejně velký jako před taskem.

### Validation

```powershell
npm.cmd run validate:korp-ui-pack-v01
npm.cmd run validate:korp-ui-assets
npm.cmd run validate:korp-icons
npm.cmd run test:runtime
npm.cmd run test:runtime-save
npm.cmd run test:korp-core
npm.cmd run typecheck:korp-core
npm.cmd run test:korp-modules
npm.cmd run typecheck:korp-modules
npm.cmd run typecheck:korp-progression
npm.cmd run validate:korp-progression
npm.cmd run build
npm.cmd run dev -- --host=127.0.0.1 --port=5173 --strictPort
```

## Task 024C — Portrait audit and folder chrome pilot

Status: BLOCKED BY 024B VISUAL ACCEPTANCE.

### Scope

- Audit 00-A;
- jeden repeatable audit instance;
- Formuláře folder;
- portrait family geometry;
- live rows/fields/scrollbar/text;
- audit/folder frames a headers z curated v01 catalogu;
- no baked labels;
- no stretched paper or panel texture.

### Gate

- readability minimálně na úrovni současného UI;
- form fields bez nechtěného scrollu u krátkých audits;
- folder list může scrollovat uvnitř portrait content;
- cascade a placement zůstávají správné;
- visual family působí jednotně s 024B.

## Task 024D — Top rail, taskbar and status controls

Status: BLOCKED BY 024B/024C ACCEPTANCE.

- top rail composition;
- taskbar composition;
- window button states;
- EV/PENDING readouts;
- live labels;
- contrast/accessibility;
- žádné gameplay změny.

## 5. Near-term gameplay tasks

## Task 025 — Audit backlog and delegation prototype

### Prerequisite

Task 023 technicky dokončen. Ruční playtest musí potvrdit, že hráč chce delegaci dřív, než ji hra nabídne.

### Cíl

Přidat jednoho stážistu jako management systém, ne pasivní `+x/sec`.

### Scope

- `delegated` source;
- předvyplnění jednoho typu auditu nebo obsluha jedné autorizované rutiny;
- žádná finální Evidence certifikace;
- error/discrepancy;
- player supervision;
- personnel artifact/memo;
- manual/delegated stats oddělené;
- Acting Lead Paradox pouze mechanicky a v náznaku copy.

### Gate

```text
delegace ubere rutinu
→ přidá rozhodování, kontrolu nebo výjimku
```

## Task 026 — ClickAudit analytics and source attribution

- safe K0rp profile breakdown;
- manual/delegated/system split;
- aggregate history;
- no coordinates/text/external context;
- nový interpretační dashboard;
- žádný click multiplier.

## Task 027 — Bloom as third raw metric

- reusable asset-backed Bloom;
- `bloom.waveAdvanced` closure;
- packet;
- audit template;
- Evidence certification;
- module-local Bloom Integrity zůstává uvnitř modulu.

## Task 028 — First-cycle playtest harness

Debug/local-only:

- session time;
- packet/certification timestamps;
- Evidence earned/spent;
- pending backlog;
- source split;
- unlock sequence;
- save export.

Nesmí odesílat cloud telemetry ani číst aktivitu mimo K0rp.

## Task 029 — Sensory foundation

- audio buses;
- material profiles;
- density limit API;
- feedback intensity;
- reduce motion;
- quiet mode;
- high-frequency reduction;
- input accessibility;
- music layer contract;
- neimplementovat celou audio banku v jednom tasku.

## Task 030 — Standalone aggregate bridge contract

- standalone funguje unlinked;
- linked mode předává aggregate events;
- campaign rewards pouze pro authorized modules;
- no raw pointer stream;
- no app names/URL/text/screenshots;
- no cloud/overlay implementation.

## 6. Future activity-spectrum tasks

Tyto tasks jsou strategicky schválené, ale nejsou okamžitá fronta. Priority Containment ani Alignment Rally nesmějí přeskočit greybox/playtest gate.

## Task 031 — Action-module session and viewport contract

### Cíl

Připravit nejmenší technický harness pro standalone high-intensity prototype.

### Scope

- module-local session state;
- pause/close/closure exactly once;
- run-local XP, které nikdy nevstupuje do global resources;
- content geometry `action-square 320×320`;
- integer 1×/2× mapping;
- local summary interface;
- no packet, audit, Evidence nebo OS shortcut.

### Do not

- nedělat generic game engine;
- nepřidávat action events do progression data;
- nepřepisovat current desktop;
- nepřidávat automation.

## Task 032 — Priority Containment standalone greybox

### Scope limit

```text
1 arena
1 player/capacity object
movement
autofire
Triage Pulse
3 basic archetypes
1 elite
1 boss
5 waves
12 upgrades maximum
4–6 minute closure
```

### Do not

- žádný OS packet;
- žádný Evidence;
- žádný finished art/audio bank;
- žádná druhá mapa;
- žádné stovky items;
- žádná delegace.

### Playtest gate

- verb pochopen bez textového tutorialu;
- první power spike do 60–90 sekund;
- nejméně tři čitelné build archetypy;
- fail/closure je vysvětlitelný;
- hráč chce zkusit jiný build;
- session lze legitimně ukončit.

## Task 033 — Priority buildcraft and local report

- routing/control/throughput build identity;
- deterministic upgrade pool rules;
- local run summary;
- aggregate raw candidate metrics;
- closure states `closed` / `closed-with-reservation`;
- no global rewards.

## Task 034 — Priority sensory and readability pass

Blocked by Task 032/033 playtest.

- material-consistent impacts;
- audio density management;
- music escalation and wave-break silence;
- reduce motion;
- quiet mode;
- screen shake off;
- integer-scale rendering;
- peak-density readability.

## Task 035 — Priority Containment OS integration

Blocked by accepted standalone prototype.

- module manifest/surface;
- authorization path;
- shortcut/surface mutation;
- privacy-safe closure event;
- packet definition based on playtest;
- Audit 27-P;
- exactly-once certification;
- no direct EV for kills/deflections.

## Task 036 — Priority delegated policy prototype

Blocked by Task 025 delegation contract and Task 035 integration.

- loadout template;
- target weights;
- risk tolerance;
- allowed exceptions;
- supervision cadence;
- intervention request;
- delegated outcome/confidence;
- discrepancy generation.

## Task 037 — Alignment Rally standalone greybox

Blocked by Priority prototype lessons; není nutné čekat na plnou OS integraci, ale sdílí action harness.

```text
1 claim
1 paddle
4 response zones
3 stakeholder rules
8 upgrades maximum
4 closure outcomes
2–3 minute session
```

No packet, Evidence, free-text telemetry or automation.

## Task 038 — Alignment Rally OS integration

Blocked by samostatný Alignment playtest gate.

- aggregate/template-safe event semantics;
- packet threshold podle playtestu;
- Audit 31-R;
- authorization/capability group;
- exactly-once Evidence;
- future automation discrepancy hooks.

## 7. Global implementation guardrails

```text
- Canonical loop je Metric → Audit → Evidence.
- Raw action ani run-local XP nesmí přímo generovat spendable currency.
- Jeden fyzický klik zůstává jedním manual clickem.
- Batch je auditní povinnost, ne reward chest.
- Evidence používá technical ID notionalWorkUnits do schválené migrace.
- Manual, delegated a system-generated activity se nesmí slít.
- Capability není authorization.
- Ne každý upgrade potřebuje vlastní formulář; autorizují se smysluplné groups.
- Delegaci neimplementovat bez pocítěné rutiny, kterou řeší.
- Action module nejdřív standalone greybox, potom sensory, potom OS integration.
- Compact 167×167 content se nesmí zmenšit kvůli chrome.
- Action viewport se nesmí natlačit do compact geometry.
- Complete window shell asset se nesmí roztahovat; použít nine-slice/three-slice/tile.
- Neotáčet desktop zpět na card catalog nebo launcher lepších her.
- Nevysvětlovat skrytou meta rovinu publiku.
- Nepřidávat daily streaks, energii, offline penalties, hidden odds nebo FOMO requirements.
- Nepřidávat cloud před stabilním local save.
- Nečíst app names, URL, window text, screenshots nebo keys mimo K0rp.
- Zachovat Windows-first validation pro Tauri/window tasks.
- Po shared UI změnách spustit příslušný build/validator a vypsat přesné PowerShell příkazy.
```
