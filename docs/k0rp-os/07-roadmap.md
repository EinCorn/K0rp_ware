# K0rp_OS — Roadmap

Verze: 0.3.0 pracovní návrh

## 0. Status dokumentu

Roadmap po dokončených Taskech 020 / PR #29 a 021A / PR #31 zachovává fake-desktop produktovou osu a podřizuje další implementaci canonical core loopu:

```text
raw metrika
→ auditovatelná dávka
→ audit
→ Evidence
→ autorizace nového systému
```

Canonical herní kontrakt je v `20-core-loop.md`.

Aktuální stav:

- Fáze 0–6 mají funkční baseline na `main`;
- Audit 00-A, ClickAudit, společný runtime, lokální persistence, packet queue, repeatable Audit 10-A a Evidence certifikace jsou integrovány;
- `clickaudit.click` je doslovná raw metrika a sama nepřidává spendable resource;
- Task 021A window placement, dynamické form windows, cascade a close/minimize semantics jsou dokončené a mergnuté;
- Task 022 je dokončený a mergnutý v PR #35; aktuálním visual preflightem je Task 022A — canonical icon pack integration, po němž zůstává Task 023 dalším gameplay krokem.

Současné standalone appky ClickAudit, Fidget a Bloom se neruší. Integrace probíhá přes společné module surface, bridge a runtime contracts.

## Fáze 0 — Current consolidation

Status: baseline dokončen.

Cíl: Nezbourat, co už funguje.

- app-specific polish;
- žádný další velký shared-shell refactor bez důvodu;
- zachovat standalone ClickAudit, Fidget a Bloom;
- `main` je source of truth;
- Windows je primary desktop target.

## Fáze 1 — Docs, source index a progression RFC

Status: baseline dokončen, v0.3 core-loop update probíhá.

Výstupy:

- docs `00–20`;
- progression/economy;
- sensory feedback;
- unlocks/memos/system mutations;
- playtest checklist;
- first-cycle balance;
- desktop surface progression;
- research/source index;
- strojově čitelný `packages/korp-progression`.

## Fáze 2 — Existing core and registry baseline

Status: dokončeno.

- `packages/korp-core`;
- `packages/korp-modules`;
- typed events/resources;
- manifest registry;
- testy.

Další práce musí být inkrementální, ne kompletní přepis.

## Fáze 3 — Progression package integration

Status: základ integrován.

- typecheck `packages/korp-progression`;
- validace referencí;
- resource metadata;
- forms, upgrades, memos, certifications, prestige constants;
- surface mutation constants;
- datový source of truth pro Audit 00-A a 10-A.

Strojová data budou ve Fázi 6–9 přebalancována na Evidence model.

## Fáze 4 — Shared runtime and local persistence

Status: dokončeno pro první slice.

- `KorpRuntimeProvider`;
- lifetime stats;
- progression state;
- local save/load;
- bezpečný versioned save envelope;
- module/memo/form unlock state;
- standalone moduly si smějí ponechat local session state.

Packet queue a repeatable audit instances jsou integrovány. Ještě chybí import/export a plný dlouhodobý migration surface.

## Fáze 5 — Canonical desktop vertical slice

Status: dokončeno.

```text
prázdná plocha
→ Audit 00-A jako dokument
→ audit field clicks
→ ClickAudit shortcut
→ první memo v Doručených
→ ClickAudit jako interní asset-backed okno
```

Hotové minimum:

- fake desktop;
- taskbar;
- window manager;
- folders/files;
- fixed canvas;
- wallpaper;
- official fonts;
- globální K0rp_OS click classification;
- lokální privacy-safe persistence.

## Fáze 6 — Metric → Audit → Evidence vertical slice

Status: dokončeno a mergnuto v Tasku 020 / PR #29.

Cíl: Dokázat skutečný ekonomický motor hry v jednom malém oblouku.

```text
Audit 00-A nastaví baseline aktuálního raw počtu
→ první pozdější K0rp_OS klik vytvoří bootstrap packet quantity 1
→ opakovatelný Audit 10-A
→ audit.evidenceCertified
→ Evidence +1
→ další packety po 25 nových kliknutích
```

Požadavky:

- `clickaudit.click` zůstává doslovná raw metrika;
- raw klik nepřidává spendable currency;
- `clickaudit.batchCompleted` vytváří pending packet, ne reward;
- kliky použité pro Audit 00-A jsou mimo packet baseline;
- první post-unlock klik vytvoří právě jeden quantity-1 bootstrap packet;
- po bootstrapu se další packety uzavírají po 25 nových kliknutích;
- packet je persistovaný a certifikovatelný právě jednou;
- Audit 10-A je audit instance navázaná na konkrétní packet;
- technické `notionalWorkUnits` se hráčsky prezentuje jako `Evidence / EV`;
- taskbar ukazuje pouze Evidence a počet pending auditů;
- existující saves nedostanou retroaktivně desítky packetů;
- žádní stážisti, Fidget ani plný upgrade shop v tomto tasku.

Completion gate:

```text
nová hra
→ Audit 00-A
→ ClickAudit unlock
→ jeden pozdější klik
→ právě 1 pending packet
→ submit 10-A
→ právě 1 Evidence
→ refresh zachová stav
→ další audit až po 25 dalších kliknutích
```

## Fáze 7 — Window preflight, Evidence authorization and Fidget

Cíl: Uzavřít první celý loop a přidat druhý druh raw metriky.

Status: Task 021A, Task 021B i Task 022 jsou dokončené a mergnuté. Task 022A je aktuální implementovaný visual preflight; Task 023 je následující gameplay krok.

Pořadí:

1. Task 021A — dokončený first-open window placement a dynamický cascade auditních dokumentů;
2. Task 021B — dokončený Evidence authorization contract z PR #33: Audit 16-C, alokace 1 EV a persistentní Fidget authorization;
3. Task 022 — dokončený sdílený asset-backed Fidget module surface z PR #35;
4. Task 022A — aktuální canonical icon pack ingestion, validace a nasazení do existujících ploch bez změny gameplaye;
5. Task 023 — následující `fidget.sessionSettled` jako první non-click raw metric closure, packet a první skutečný backlog.

Dokončený Task 021A presentation gate:

```text
Audit 00-A submit → baseline + unlock bez forced popupu
→ první pozdější klik → quantity-1 bootstrap 10-A auto-open právě jednou
→ pozdější quantity-25 packet → queue ve Formulářích bez focus steal
→ explicit open z Formulářů → vlastní 10-A okno s cascade od current form anchor
```

Completion gate:

```text
EV 1
→ Audit 16-C se zpřístupní
→ platný submit alokuje právě 1 EV
→ EV 0
→ Fidget je persistentně autorizován
→ desktop ukazuje AUTORIZOVÁNO / NASAZENO
→ explicitní otevření zobrazí skutečné asset-backed Fidget okno
→ stejné FidgetModule používají standalone i window-only preview
→ Fidget zatím nevytváří Evidence; session closure a packet patří do Tasku 023
```

Fidget nesmí být odemčen pouze skrytým thresholdem NWU/AP. Musí být autorizován výsledkem auditního procesu.

Task 022A drží raw icon source oddělený od runtime subsetu:

```text
design/icon-source/k0rp-icons-v2/   canonical raw pack, 32 semantic IDs
src/assets/icons/korp-v2/           pouze aktuálně nasazené PNG64
src/ui/korpIconCatalog.js            generovaný sémantický katalog
npm run build:korp-icons             deterministická regenerace
npm run validate:korp-icons          manifest, asset, atlas a drift gate
```

Aktuálně se nasazují desktopové systémové/module ikony a document-row kategorie. Bloom, další budoucí moduly, pozdější progression folders, native references a neexistující window-control mappings zůstávají pouze katalogizované pro pozdější surface.

## Fáze 8 — Second metric, repeatable audits and backlog

Cíl: Prokázat, že core loop není hardcoded pouze pro ClickAudit.

- Fidget session vytvoří stabilization packet;
- packet dostane vlastní repeatable audit template;
- certifikace vytvoří Evidence;
- Formuláře zobrazí queue a počet čekajících položek;
- Audit Pressure se začne odvozovat z backlogu, stáří a nesrovnalostí;
- hráč musí backlog skutečně pocítit;
- žádná delegace před playtestem tohoto kroku.

Completion gate:

```text
ClickAudit packet i Fidget packet
→ stejný packet/audit framework
→ různé raw metriky
→ společná Evidence
```

## Fáze 9 — Delegation prototype

Cíl: Převést ruční incremental loop do management vrstvy až ve chvíli, kdy existuje problém k delegování.

První stážista:

- generuje `delegated` raw activity, ne manual clicks;
- může předvyplnit audit;
- nemůže finálně certifikovat Evidence;
- vytváří chyby a nesrovnalosti;
- vyžaduje supervision;
- může později školit další jednotku bez získání plné autorizace.

Mechanický motiv:

```text
capability ≠ authorization
operational responsibility ≠ formal ownership
```

Completion gate:

- delegace snižuje rutinní práci;
- současně vytváří alespoň jeden nový typ auditní povinnosti;
- automatizace není pouze `+x/sec` do manuálního counteru.

## Fáze 10 — Current modules connected

Cíl: Připojit současnou trojici beze změny jejich lokální identity.

- Fidget je dokončen ve Fázích 7–8;
- Bloom events + `bloom.waveAdvanced`;
- Bloom packet/audit conversion;
- shortcuts instalované progressionem;
- cross-module modifiers;
- společný save;
- standalone bridge policy.

Bloom je třetí důkaz, že stejný loop unese prostorovou/statusovou činnost, ne jen klik a rotaci.

## Fáze 11 — First-cycle content and prestige

Cíl: Sestavit první uzavíratelný auditní cyklus po ověření core loopu.

- Button Compliance;
- Corner Watch jako screensaver/idle surface;
- certifikace;
- 6–8 mem;
- formulář 42-Z;
- Audit Findings;
- archive/reboot/build mutation;
- post-prestige Bublinková Fólie.

Dřívější target 4–5 hodin je provisional. Nový balance pass vznikne až po Metric → Audit → Evidence a backlog playtestu.

Bubble Wrap je hlavní nový-system reward prvního prestige, ne jen násobitel.

## Fáze 12 — Sensory foundation

Cíl: Společná kvalita tactile feedbacku.

- audio buses;
- material profiles;
- sample variation;
- density management;
- micro/meso/ceremonial reward levels;
- reduce motion;
- sensory intensity;
- quiet mode;
- input accessibility.

Tato fáze musí být hotová před finalizací Bubble Wrap, Newtonovy kolíbky a Surface Compliance.

## Fáze 13 — First expansion

Pořadí podle engine value:

1. Button Compliance — approvals, forms a exceptions.
2. Corner Watch — screensaver, idle/offline reporting.
3. Bublinková Fólie — sensory system a post-prestige new-system reward.

## Fáze 14 — Desk Object / ASMR

- Newtonova Kolíbka;
- Zenová Zahrádka;
- desk-object shelf;
- free mode i procedural mode;
- přirozené closure events.

## Fáze 15 — Care / Cleaning / Alignment

- Surface Compliance;
- Shape Compliance;
- wipe masks;
- drag/rotate/snap;
- material-specific feedback;
- hidden surface files/memos.

## Fáze 16 — Attention Corruption

- Attention Runner;
- companion strip;
- low-input mode;
- nesmí převzít hlavní ekonomiku ani změnit K0rp_OS v běžnou arcade kolekci.

## Fáze 17 — Standalone hardening

Cíl: Moduly opravdu vytrhnutelné z OS.

- stejná module implementation;
- detached windows;
- unlinked local mode;
- linked aggregate bridge;
- portable settings;
- Windows release validation.

## Fáze 18 — Web fallback

- browser fake desktop;
- stejné progression IDs;
- local browser save;
- module cards/download portal jako sekundární vstup;
- jasně popsané native limitations.

## Fáze 19 — Overlay MVP

- Windows-first always-on-top bar;
- K0rp-only mode;
- Privacy Work Blob;
- quick launch;
- žádné raw app names, URL, text, screenshots ani keylogging;
- platform-specific bridge mimo `korp-core`.

## Fáze 20 — Account / sync

Až po stabilním local-first systému.

- voluntary account;
- progress/settings/cosmetics;
- export/delete;
- žádný raw activity sync.

## Fáze 21 — Content expansion

- memo bank;
- knowledge base;
- hallway screens;
- training materials;
- fake incidents;
- procedural announcements;
- nové moduly přes metric/packet/audit/surface contracts.

## Gate pravidla

Každá fáze musí splnit alespoň jedno:

- posílí core/runtime;
- prokáže další raw metric přes stejný audit framework;
- přidá data přes progression package;
- přidá surface mutation;
- integruje jeden modul bez změny ostatních;
- prokazatelně zlepší sensory/accessibility;
- projde playtest gate.

Zakázané pokračování:

- další modul bez vazby na metric/audit/Evidence loop;
- automatizace před vznikem skutečné rutinní bolesti;
- nový player-facing resource jen proto, že pro něj existuje zkratka;
- další přímý `raw action → currency` reward.

> Pokud jen přidává další izolovanou hračku, je to scope creep v reflexní vestě.
