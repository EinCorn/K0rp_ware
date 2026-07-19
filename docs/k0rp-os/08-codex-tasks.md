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
- původní 25-click threshold, později nahrazený bootstrap flow z Tasku 020;
- module/memo/upgrade state.

Poznámka: ekonomický význam tohoto flow změnil Task 020 na canonical Metric → Audit → Evidence loop.

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

## 3. Aktuální a navazující implementation tasks

## Task 020 — Metric → Audit → Evidence vertical slice

Status: dokončeno a mergnuto v PR #29.

### Cíl

Nahradit starý `raw click → currency` prototyp prvním úplným canonical loopem:

```text
Audit 00-A nastaví baseline aktuálního raw počtu
→ první pozdější K0rp_OS klik
→ bootstrap pending packet quantity 1
→ Audit 10-A instance
→ certifikace
→ Evidence +1
→ pozdější packety po 25 dalších kliknutích
```

### Scope

- zachovat absolutní ClickAudit raw counter;
- změnit `clickaudit.click`, aby nepřidával spendable currency;
- Audit 00-A nastaví baseline a explicitně armuje jeden bootstrap packet;
- první post-unlock klik vytvoří právě jeden quantity-1 pending packet;
- po bootstrap range vytváří `clickaudit.batchCompleted` packety po 25 dalších kliknutích;
- přidat persistované `metricPackets`;
- přidat persistované repeatable `auditInstances`;
- každou Audit 10-A instanci navázat na její konkrétní pending ClickAudit packet;
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
bootstrap = armnout pouze pokud je ClickAudit odemčený a chybí validní certifikovaná Evidence
```

Další packet vznikne až z nových kliků po migraci. Draft-v2 backlog s EV 0 se zahodí; platná certifikovaná Evidence se znovu neuděluje.

### Testy

- klik sám nezvyšuje Evidence;
- pre-unlock kliky nevytvoří packet;
- submit 00-A zachytí baseline a armuje bootstrap;
- první post-unlock klik vytvoří právě jeden quantity-1 packet;
- další 24 kliků nevytvoří normální packet;
- 25. další klik vytvoří právě jeden quantity-25 packet;
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
→ ClickAudit unlock
→ jeden pozdější klik
→ 1 čekající audit
→ Audit 10-A
→ EV 1
→ refresh
→ stejný stav
→ další audit až po 25 dalších kliknutích
```

## Task 021A — Window placement and form cascade preflight

Status: dokončeno a mergnuto v PR #31.

### Cíl

Oddělit placement oken od runtime progression state a umožnit více auditních dokumentů současně.

### Scope

- neformulářová okna při prvním otevření centrovat v usable workspace;
- visible activation a taskbar restore ponechají poslední `x/y`;
- stabilní ID `form:audit-00-a` a `form:<audit-instance-id>`;
- každá repeatable Audit 10-A instance má vlastní okno, taskbar stav a položku ve Formulářích;
- nové dokumenty kaskádovat od aktuální pozice naposledy fokusovaného formuláře o integer `+18/+14`;
- při lower/right overflow deterministicky wrapnout k base pozici a pokračovat bez edge pilingu;
- OS-rendered document/folder windows mají oddělený minimize a close; close skryje okno i jeho taskbar položku bez smazání dokumentu;
- submit Audit 00-A pouze zachytí baseline a odemkne surfaces; nesmí vynutit otevření žádného nového okna, včetně ClickAuditu nebo Audit 10-A;
- quantity-1 bootstrap Audit 10-A auto-openout právě jednou;
- pozdější quantity-25 Audit 10-A instance pouze zařadit do queue ve Formulářích bez auto-openu a bez focus steal;
- explicitní otevření pozdější instance z Formulářů vytvoří/obnoví její vlastní okno a teprve tehdy použije cascade od current form anchor;
- certifikovaný dokument ponechat samostatně dostupný;
- window placement a minimize/focus stav nepersistovat do runtime save.

### Tests

- first-open center, visible activation a minimized restore;
- close je odlišný od minimize a explicitní reopen obnoví stejné window ID a session position;
- stabilní unikátní form IDs a idempotentní reopen;
- moved anchor mění další cascade origin;
- integer `+18/+14`, deterministic boundary wrap a clamp;
- submit 00-A nezpůsobí forced popup;
- bootstrap 10-A se auto-openne právě jednou;
- pozdější quantity-25 instance zůstane ve Formulářích až do explicitního otevření;
- dvě 10-A instance zůstávají nezávislé a taskbar je obnovuje samostatně.

### Do not

- neimplementovat Audit 16-C ani Evidence spending;
- nepřenášet Fidget;
- nepřidávat resize ani persisted window positions;
- neměnit Task 020 packet/Evidence semantiku;
- nepřidávat cloud, overlay ani Tauri-specific změny.

### Explicit visual-control exception

Asset-backed ClickAudit close control je mimo scope Tasku 021A. Může dočasně zachovat existující minimize chování i close vizuál; sjednocení assetu, accessible labelu a close/minimize semantiky patří do samostatného pozdějšího visual-controls tasku.

### Manual Windows gate

```text
Audit 00-A submit → baseline + unlock, žádný forced popup
→ explicit first open ClickAuditu → centered
→ tentýž první pozdější klik vytvoří bootstrap 10-A → auto-open právě jednou +18/+14 od current form anchor
→ Formuláře / Doručené explicit first open → centered
→ move + minimize + taskbar restore → stejné x/y
→ close standardního OS okna → zmizí z desktopu i taskbaru; explicit reopen → stejné ID a session x/y
→ move + certify
→ 25 dalších kliků → druhé 10-A pouze v queue Formulářů, bez popupu a focus steal
→ explicit open z Formulářů → druhé samostatné 10-A +18/+14 od current form anchor
→ obě okna independent drag/minimize/restore a bez clippingu
```

## Task 021B — Evidence authorization contract and Audit 16-C

Status: dokončeno a mergnuto v PR #33.

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

### Manual Windows gate

Použít čistý nebo známý Task 020 save:

```text
1. Získat EV 1 certifikací Audit 10-A.
2. Audit 16-C se objeví a právě jednou auto-openne jako cascaded form.
3. Zavřít jej; znovu otevřít z Formulářů; stejné ID a session position.
4. Ověřit, že oba povinné checkboxy jsou viditelné bez scrollování.
5. Submitnout s EV 1.
6. Taskbar se změní EV 1 → EV 0.
7. Dokončený 16-C uvede, že autorizace byla udělena a EV alokována.
8. Fidget desktop item se objeví jako AUTORIZOVÁNO / NASAZENÍ ČEKÁ a neotevře placeholder.
9. Doručené zpřístupní autorizační memo.
10. Refresh zachová submitted 16-C, EV 0, autorizaci, Fidget item a memo.
11. Dokončený 16-C lze znovu otevřít, přestože je EV nyní 0.
12. Opakované kliky ani submit nemohou utratit další EV.
```

## Task 022 — Shared asset-backed Fidget module surface

Status: **DONE / MERGED** — sdílený asset-backed Fidget surface je na `main` v PR #35.

### Cíl

Přenést existující hotový Fidget do K0rp_OS stejně věrně jako ClickAudit.

### Scope

- extrahovat skutečný reusable Fidget module content;
- `FidgetModule` vlastní spinner DOM, motion, modes, effects a accessibility bez Tauri nebo runtime progression vazby;
- `FidgetEmbeddedWindow` používá uvnitř OS pouze skutečný 181×181 `app-window.png`, real mode/close controls a OS drag/minimize adapter;
- `FidgetStandaloneShell` používá skutečný 230×230 `app-shell.png` a stejný modul;
- `FidgetPage` volí `?app=fidget` nebo app-window-only `?app=fidget&surface=window`;
- zachovat původní spinner, mode a sensory feel;
- napojit module unlock na authorization z Tasku 021B;
- stabilní window ID `fidget`, taskbar label `FIDGET`, first-open center a žádný authorization auto-open;
- přesně jeden actionable desktop shortcut `AUTORIZOVÁNO / NASAZENO`;
- lokální session state může zůstat module-local;
- window manager vlastní drag/minimize/taskbar;
- ClickAudit zůstává centralizovaný v K0rp_OS capture vrstvě a jeden Fidget pointer intent se nezapisuje podruhé.

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

## Task 022A — Canonical icon pack integration

Status: **DONE / MERGED** — canonical source, runtime subset, sémantický katalog a současné K0rp_OS icon surface jsou na `main` v PR #37.

### Source a runtime contract

- raw source zůstává beze změny v `design/icon-source/k0rp-icons-v2/`;
- `manifest.json` je jediná sémantická autorita; README/CSV odchylky jsou pouze zdokumentované;
- `src/assets/icons/k0rp-v2/` obsahuje jen PNG64 pro současné viditelné surface;
- `src/ui/korpIconCatalog.js` katalogizuje všech 32 ID, ale runtime URL má jen nasazený subset;
- `npm run build:korp-icons` deterministicky kopíruje subset a generuje katalog;
- `npm run validate:korp-icons` kontroluje schema, ID, path safety, soubory, rozměry, ICO profily, atlasy, required mappings a generated drift;
- CI spouští icon validation před ostatními build gates.

### Nasazeno nyní

- desktop: Compliance Bin, Doručené, Formuláře, ClickAudit, Fidget, locked Corner Watch a Bublinková Fólie;
- dokumenty: obecný audit 00-A/16-C, Audit 10-A packet, memo, startup document a Evidence archive;
- CSS `K`, folder/bin konstrukce a pseudo-labely `TXT`, `10-A`, `00-A`, `MEM` byly odstraněny z canonical current paths;
- locked stav zachovává vlastní module icon a používá jen opacity/saturation.

### Rezervováno

- Bloom nemá v současném shellu shortcut a jeho source/native reference se proto nezobrazuje ani nebundluje jako runtime asset;
- další module/progression/system ikony zůstávají v raw katalogu do vzniku odpovídajících surface;
- pack nedeklaruje close/minimize ani app-specific controls, takže existující OS a ClickAudit/Fidget controls zůstávají beze změny;
- manifest neurčuje Tauri/native targety, proto se native icon directories v tomto tasku nemění.

### Do not

- neměnit gameplay, authorization, packet ani Evidence semantics;
- nepřidávat Bloom shortcut, nové unlocky ani Task 023 events;
- neimportovat raw source pack do Vite graphu;
- nevymýšlet state/control mapping, který manifest neobsahuje;
- nekopírovat pack do jednotlivých desktop apps.

## Task 022A(2.1) — K0rp_OS UI assets V3 source ingestion and validator

Status: **DONE / INFRASTRUCTURE** — exact raw snapshot, normalizovaný inventory, offline validator a pilot allowlist jsou připravené bez player-visible změny.

### Source a validační hranice

- canonical raw snapshot je `design/ui-source/k0rp-os-ui-assets-v3/`;
- `design/ui-runtime/k0rp-v3/inventory.json` je deterministicky generovaný machine-readable inventory;
- `design/ui-runtime/k0rp-v3/runtime-allowlist.json` je explicitní 45-ID boundary pouze pro 022A(2.2);
- `npm run build:korp-ui-assets` přegeneruje pouze inventory mimo raw root;
- `npm run validate:korp-ui-assets` offline kontroluje JSON, ID/path uniqueness, path safety, PNG/WebP dimensions, content rectangles, cap insets, materializované nine-slice families, atlasy, window metrics, checksums, allowlist, generated drift a zákaz raw importů i byte-identical kopií do runtime source.

### Canonical snapshot

- 1 494 souborů / 16 733 914 bajtů;
- 493 semantic assets: 436 production a 57 reference;
- 493 native PNG + 493 nearest-neighbour `@2x` PNG + 493 lossless WebP;
- 109 cap-inset declarations, ale pouze 11 explicitně materializovaných nine-slice families / 99 pieces;
- 4 atlas sheets / 48 frames a 8 konzistentních window families;
- žádné duplicate ID/path, chybějící production assety, dimension mismatch, unsafe path ani orphaned payloady.

### Známé non-blocking source vady

- checksums obsahují 106 stale cest k záměrně nepřítomnému nested icon snapshotu; autoritou zůstává `design/icon-source/k0rp-icons-v2`;
- checksums obsahují šest stale auxiliary QA sheet cest;
- README uvádí top-level `nine_slice/`, zatímco skutečné pieces jsou pod `assets/{native,2x,webp}/nine_slice`;
- README a `tokens.json` tvrdí, že nested icon snapshot je součástí kitu, ale canonical icons jsou vedené odděleně.

### Do not

- neimportovat raw V3 source do React/CSS ani jej nekopírovat do `src/assets`, `public` nebo desktop runtime folders;
- neměnit raw pixely nebo metadata kvůli umlčení warningů;
- negenerovat druhý icon catalog;
- neměnit současný rendering, gameplay, persistence, window manager ani ClickAudit/Fidget surface.

## Task 022A(2.2) — Audit 00-A + Formuláře window-chrome pilot

Status: **DEFERRED / CLOSED UNMERGED** — PR #43 byl po vizuálním review uzavřen bez merge. Tasky 022A(2.2–2.5) čekají na curated/redrawn asset revision; současný pilot se nestal canonical runtime chrome.

Původní pilot byl omezený na Audit/Folder frame a content families, jejich explicitní nine-slice pieces, active/inactive titlebar, close/minimize states, blank Audit checkbox/radio/button states a blank folder row. Infrastruktura 022A(2.1) zůstává platná, ale další window chrome, top rail/taskbar a controls/status práce nepokračuje bez nové asset revize. Windows visual gate tohoto pilotu není evidován jako splněný.

## Task 023 — Fidget metric packet and first real backlog

Status: **ACTIVE** — Fidget session closure, packet a první skutečný smíšený backlog.

### Cíl

Prokázat reusable packet/audit framework na druhém typu raw metriky.

### Scope

- `fidget.sessionSettled` vytvoří právě jeden raw stabilization record pouze pro smysluplně a přirozeně ukončenou session;
- fixed provisional/playtestable packet size je `3` nové settled sessions;
- každý dokončený rozsah vytvoří právě jeden packet `fidget-sessions-<rangeStart>-<rangeEnd>` a neúplný zbytek se zachová pro další session;
- packet používá stejný state machine jako ClickAudit packet;
- packet vytvoří repeatable Audit `18-S`;
- certifikace Audit 18-S přidá `EV +1` právě jednou; raw Fidget event ani packet creation Evidence přímo nepřidávají;
- vytvoření packetu nikdy samo neotevře auditní okno ani nepřevezme focus;
- Formuláře zobrazí ClickAudit i Fidget audity v jedné queue;
- taskbar ukazuje celkový pending count;
- přidat debug-only provisional pressure `clamp(0, 100, pendingCount * 10 + floor(oldestPendingAgeMinutes / 10) + discrepancyCount * 20)`;
- tento pressure je odvozený debug readout a nesmí se persistovat do `korpState.resources.auditPressure`;
- schema 4 → 5 migration nastaví Fidget baseline na aktuální settled-session count a vytvoří nula retroaktivních Fidget packetů;
- zachovat ClickAudit progression, authorization, unlocky a ostatní runtime chování beze změny.

### Machine-readable boundary

Stávající `events.json` stále obsahuje staré přímé yieldy pro `fidget.sessionSettled`, včetně `notionalWorkUnits: 1.5`. Task 023 tento rozpor neopravuje v datech a runtime jej nesmí použít k přímému udělení Evidence. Machine-readable reconciliation zůstává Tasku 024.

### Do not

- nepřidávat stážistu před playtestem;
- nedělat generický enterprise workflow engine;
- nepřidávat Bloom v tomto tasku;
- neměnit runtime chrome ani pokračovat v 022A(2.2–2.5).

### Playtest gate

Hráč musí vnímat, že ruční audity začínají být otravné, ale ještě zvládnutelné. Pokud backlog není cítit, delegace nemá co řešit.

## Task 024 — First-cycle data rebalance and migration

### Cíl

Sjednotit machine-readable progression databázi s novým core loopem.

### Scope

- přebalancovat `resources.json` player-facing label na Evidence/EV;
- upravit `events.json` semantics, včetně odstranění starých přímých yieldů `fidget.sessionSettled` a sjednocení s certifikačním Evidence flow;
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

Task 023 playtest musí nejprve potvrdit skutečnou potřebu delegace; tento gate zatím není evidován jako splněný.

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
