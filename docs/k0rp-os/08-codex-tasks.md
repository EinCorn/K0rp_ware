# K0rp_OS — Implementation Task Pack

Verze: 0.3.0 pracovní plán

## 0. Pravidlo pro implementační tasky

Nedávat Codexu ani jinému agentovi úkol typu „udělej K0rp_OS“.

Každý task musí mít:

- jeden jasný herní nebo technický cíl;
- omezený scope;
- explicitní seznam toho, co nesmí měnit;
- automatické validace;
- ruční Windows test plan;
- očekávaný PR výstup.

Agent je implementační kolega, ne autor světa. Nemá sám rozhodovat, že K0rp potřebuje novou měnu, další modul nebo vysvětlení skryté meta roviny.

Canonical gameplay contract:

```text
docs/k0rp-os/20-core-loop.md
```

Aktuální implementační pořadí:

```text
docs/k0rp-os/07-roadmap.md
```

## 1. Platform guardrail

Primary platform is **Windows**. Mac je secondary dev/test/design prostředí.

```text
- Pure TypeScript/core/docs tasks mohou být testovány na Macu nebo Windows.
- Tauri window behavior, transparency, always-on-top, overlay, global bridge a installer vyžadují Windows test.
- Platform-specific chování nepatří do korp-core.
- Používat adaptéry.
- Nehardcodovat macOS cesty nebo window assumptions.
```

## 2. Aktuální task ledger

### Tasks 001–014 — historical baseline

Status: dokončené nebo překonané pozdější implementací.

Obsahovaly:

- docs/core/module baseline;
- fake desktop prototypy;
- shared shell experimenty;
- ClickAudit bridge;
- module registry;
- Windows-first workflow;
- fixed canvas a typografii.

Staré prompty nejsou aktuální implementační pořadí.

### Task 015 — Shared Korp runtime provider

Status: dokončeno a mergnuto.

- jeden global KorpState;
- presentation/runtime boundary;
- ClickAudit dispatch přes korp-core.

### Task 016 — Progression-backed Audit 00-A / 10-A

Status: dokončeno a mergnuto.

- progression databáze jako source pro formuláře;
- canonical 25-click threshold;
- module/memo/upgrade state.

Poznámka: ekonomický význam tohoto flow bude změněn Taskem 020.

### Task 017 — Versioned local runtime save

Status: dokončeno a mergnuto.

- schemaVersion;
- progressionDataVersion;
- safe load/save/reset;
- corrupt/future save fallback.

### Task 018 — Minimal Audit 00-A and reusable form shell

Status: dokončeno a mergnuto.

- jeden checkbox `Jsem v práci?`;
- oddělení auditu a ClickAudit modulu;
- data-driven audit renderer;
- ClickAudit shortcut po submitu.

### Task 019 — Asset-backed ClickAudit module and OS click tracking

Status: dokončeno a mergnuto.

- skutečný ClickAudit app-window uvnitř K0rp_OS;
- canonical digits/liquid/assets;
- globální K0rp_OS click classification;
- taskbar restore;
- central activity copy;
- raw click counter a persistence.

## 3. Next implementation tasks

## Task 020 — Metric → Audit → Evidence vertical slice

Priorita: **NEXT**

### Cíl

Nahradit starý `raw click → currency` prototyp prvním úplným canonical loopem:

```text
25 raw kliků
→ pending packet
→ Audit 10-A instance
→ certifikace
→ Evidence +1
```

### Scope

- zachovat absolutní ClickAudit raw counter;
- změnit `clickaudit.click`, aby nepřidával spendable currency;
- `clickaudit.batchCompleted` vytvoří právě jeden pending packet;
- přidat persistované `metricPackets`;
- přidat persistované repeatable `auditInstances`;
- Audit 10-A navázat na nejstarší pending ClickAudit packet;
- validní submit emituje `audit.formSubmitted` a právě jeden `audit.evidenceCertified`;
- technický `notionalWorkUnits` prezentovat jako `Evidence / EV`;
- první certifikovaný packet přidá právě 1 Evidence;
- taskbar ukazuje Evidence a počet pending auditů;
- Formuláře zobrazí dostupný packet audit;
- zvýšit save schema/progression data version;
- migrovat starý save bez retroaktivního vytvoření packetů.

### Migration rule

Při načtení starého save:

```text
batch baseline = aktuální počet raw ClickAudit kliků
pending packets = 0
```

Další packet vznikne až z nových kliků po migraci.

### Testy

- klik sám nezvyšuje Evidence;
- 24 nových kliků nevytvoří packet;
- 25. klik vytvoří právě jeden packet;
- 50 nových kliků vytvoří dva packety;
- stejný batch se po refreshi nevytvoří podruhé;
- Audit 10-A certifikuje právě jeden packet;
- repeated submit nepřidá druhou Evidence;
- raw counter zůstává doslovný;
- migration baseline zabrání retroaktivním odměnám.

### Do not

- neintegrovat Fidget;
- nepřidávat stážistu;
- nepřidávat upgrade shop;
- nepřepisovat ClickAudit grafiku;
- nepřidávat nový resource ID `evidence`;
- neimplementovat všechny budoucí packet typy;
- nepřidávat cloud ani overlay.

### Validation

```text
npm ci
npm run test:runtime
npm run test:runtime-save
npm run test:korp-core
npm run typecheck:korp-core
npm run test:korp-modules
npm run typecheck:korp-modules
npm run typecheck:korp-progression
npm run validate:korp-progression
npm run build
```

### Manual Windows gate

```text
Audit 00-A
→ ClickAudit
→ 25 kliků
→ 1 čekající audit
→ Audit 10-A
→ EV 1
→ refresh
→ stejný stav
```

## Task 021 — Evidence authorization contract and Audit 16-C

### Cíl

Použít první Evidence jako autorizaci nového systému, ne jako click multiplier.

### Scope

- Audit 16-C dostupný po získání alespoň 1 Evidence;
- upravit copy a requirements podle `20-core-loop.md`;
- submit Audit 16-C atomicky alokuje/spotřebuje 1 Evidence;
- přidat authorization record pro `fidget`;
- unlocknout modulový shortcut až po úspěšné autorizaci;
- authorization je idempotentní;
- Evidence balance nesmí jít pod nulu;
- UI musí ukázat, že Evidence byla přidělena proceduře.

### Do not

- ještě nepřenášet celý Fidget frontend;
- nepřidávat automatizaci;
- nepřidávat Fidget packet;
- nepřidávat další currency.

### Tests

- Audit 16-C není dostupný bez Evidence;
- je dostupný při EV 1;
- submit spotřebuje právě 1 EV;
- opakovaný submit znovu neutrácí;
- unlock state přežije refresh.

## Task 022 — Shared asset-backed Fidget module surface

### Cíl

Přenést existující hotový Fidget do K0rp_OS stejně věrně jako ClickAudit.

### Scope

- extrahovat skutečný reusable Fidget module content;
- uvnitř OS používat app-window bez standalone shellu;
- standalone preview používá stejný modul;
- zachovat původní spinner, mode a sensory feel;
- napojit module unlock na authorization z Tasku 021;
- lokální session state může zůstat module-local;
- window manager vlastní drag/minimize/taskbar.

### Do not

- nevyrábět béžový placeholder;
- nepřekreslovat spinner CSS aproximací, pokud existuje canonical asset/runtime;
- neměnit ClickAudit;
- ještě negenerovat Evidence přímo ze spinneru.

### Manual Windows gate

- Fidget shortcut se objeví po Audit 16-C;
- embedded app odpovídá standalone vzhledu;
- drag/minimize/restore fungují;
- standalone preview zůstane použitelný.

## Task 023 — Fidget metric packet and first real backlog

### Cíl

Prokázat reusable packet/audit framework na druhém typu raw metriky.

### Scope

- `fidget.sessionSettled` vytvoří raw stabilization record;
- po playtestem určeném počtu sessions vznikne Fidget packet;
- packet používá stejný state machine jako ClickAudit packet;
- přidat repeatable audit template pro stabilization packet;
- certifikace přidá Evidence;
- Formuláře zobrazí ClickAudit i Fidget audity v jedné queue;
- taskbar ukazuje celkový pending count;
- Audit Pressure začít odvozovat z backlogu, stáří a discrepancies;
- přidat lokální debug data pro délku fronty a čas do zpracování.

### Do not

- nepřidávat stážistu před playtestem;
- nedělat generický enterprise workflow engine;
- nepřidávat Bloom v tomto tasku.

### Playtest gate

Hráč musí vnímat, že ruční audity začínají být otravné, ale ještě zvládnutelné. Pokud backlog není cítit, delegace nemá co řešit.

## Task 024 — First-cycle data rebalance and migration

### Cíl

Sjednotit machine-readable progression databázi s novým core loopem.

### Scope

- přebalancovat `resources.json` player-facing label na Evidence/EV;
- upravit `events.json` semantics;
- upravit Audit 10-A a 16-C;
- odstranit přímé click yield assumptions z upgrade dat;
- přepsat `first-cycle.balance.csv`;
- přepsat `first-cycle-phases.json`;
- aktualizovat package `first-cycle-rfc.md`;
- zvýšit progression data version;
- rozšířit reference validation o packet/audit template IDs;
- ponechat pozdější prestige čísla jako provisional, pokud ještě nejsou playtestována.

### Gate

Prose docs, JSON, CSV, TypeScript exports a runtime musí popisovat stejnou hru.

## Task 025 — Audit backlog and delegation prototype

### Prerequisite

Task 023 playtest potvrdil skutečnou potřebu delegace.

### Cíl

Přidat jednoho stážistu jako management systém, ne pasivní `+x/sec` upgrade.

### Scope

- samostatný `delegated` activity source;
- stážista může předvyplnit audit nebo obsloužit autorizovanou rutinu;
- nemůže certifikovat Evidence;
- generuje chyby/nesrovnalosti;
- hráč řeší kontrolní vzorek nebo výjimku;
- manual a delegated metrics jsou oddělené;
- první interní personnel file/memo;
- Acting Lead Paradox pouze mechanicky a v copy náznaku, ne jako vysvětlující lore dump.

### Gate

Delegace musí ubrat rutinní klikání a současně vytvořit nový druh management práce.

## Task 026 — ClickAudit analytics and source attribution

### Cíl

Zobrazit stále sofistikovanější interpretaci stejného raw clicku.

### Scope

- source breakdown podle bezpečných K0rp profilů;
- manual/delegated/system-generated split;
- activity history aggregates;
- žádné souřadnice nebo text;
- source panel jako odemykatelný dashboard;
- milestone copy bez click multiplierů.

## Task 027 — Bloom integration as third raw metric

### Cíl

Připojit Bloom a ověřit prostorovou/statusovou činnost přes stejný packet/audit/Evidence framework.

### Scope

- asset-backed shared Bloom module;
- `bloom.waveAdvanced` raw closure;
- Bloom packet;
- audit template;
- Evidence certification;
- module-local Bloom Integrity zůstává uvnitř modulu.

## Task 028 — First-cycle playtest harness

### Cíl

Měřit lokálně, zda core loop skutečně funguje.

Debug-only panel smí ukazovat:

- session time;
- packet creation timestamps;
- audit completion timestamps;
- Evidence earned/spent;
- pending backlog;
- manual/delegated split;
- unlock sequence;
- save export.

Nesmí odesílat telemetry ani číst aktivitu mimo K0rp.

## Task 029 — Sensory foundation

- audio categories;
- material profile IDs;
- density limit API;
- feedback intensity;
- reduce motion;
- quiet mode;
- input accessibility.

Neimplementovat finální audio banku naráz.

## Task 030 — Standalone aggregate bridge contract

- standalone zůstává použitelný unlinked;
- linked mode předává pouze agregované K0rp events;
- žádný raw pointer stream;
- žádné app names, URL, text nebo screenshots;
- campaign rewards jen pro autorizované moduly;
- žádný cloud ani overlay implementation.

## 4. Global implementation guardrails

```text
- Canonical core loop je Metric → Audit → Evidence.
- Raw action nesmí přímo generovat spendable currency.
- Jeden fyzický klik zůstává jedním manuálním klikem.
- Batch je auditní povinnost, ne reward chest.
- Evidence používá pro první migraci technický ID notionalWorkUnits; nepřidávat duplicitní resource.
- Manual, delegated a system-generated activity se nesmí slévat.
- Delegaci neimplementovat před potvrzeným backlog pain pointem.
- Neotáčet canonical desktop zpět na card catalog.
- Nevysvětlovat skrytou meta rovinu publiku.
- Nepřidávat daily streaks, energii, offline penalties nebo FOMO requirements.
- Nepřidávat cloud před stabilním local save.
- Nečíst app names, URL, window text, screenshots nebo keys mimo K0rp.
- Zachovat Windows-first validaci pro Tauri/window tasky.
- Po intentional shared UI změnách spustit npm run sync:korp-ui.
```
