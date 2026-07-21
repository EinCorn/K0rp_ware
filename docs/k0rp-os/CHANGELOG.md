# K0rp_OS Docs — Changelog

## v0.4.0

Datum: 2026-07-21

### Přidáno

- `21-activity-spectrum-and-arcade-modules.md` jako strategický RFC pro activity spectrum.
- Priority Containment — Zadržování priorit jako první schválený future high-intensity standalone greybox.
- Alignment Rally — Argument Routing jako navazující fyzikální/argumentační experiment.
- čtyřvrstvý module model: okamžitý pocit → session/build → OS/audit → automation/management.
- run-local XP jako dočasný session pacing, explicitně oddělený od Evidence.
- capability versus authorization versus proficiency.
- desetibodový povinný module contract.
- action-window family s content-driven geometrií a provisional 320×320 viewportem.
- future task track 031–038 pro greybox, buildcraft, sensory pass, OS integration a policy automation.
- academic/source index pro competence/autonomy, challenge/flow, game feel, visual juiciness, audio, haptics a ASMR-adjacent design.
- official inspiration index pro Vampire Survivors, Brotato, Deep Rock Galactic: Survivor, Balatro, BALL x PIT, Lethal League Blaze a Peglin.

### Změněno

- product vision nyní explicitně definuje K0rp_OS jako activity-spectrum incremental management hru, ne launcher miniher.
- architecture přidává module-local SessionEngine, action surfaces, local high-frequency state a aggregate RuntimeBridge.
- event model rozlišuje transient state, raw activation, natural closure, packet, certification, authorization a discrepancy.
- privacy model přidává action-session aggregate limits, zákaz full replay/free-text telemetry a policy/delegation boundaries.
- screen concepts přidávají compact, portrait a action window families.
- roadmap opravuje Task 023 na DONE / PR #45, Task 024 jako next data reconciliation a Task 024A na DONE / PR #47.
- roadmap odděluje gameplay/data, curated visual a future module R&D workstreams.
- Codex task pack nahrazuje odložený V3 chrome track curated 024A–024D trackem a vyžaduje PowerShell validation block u každého tasku.
- module backlog používá raw metric/packet/Evidence contracts a přidává Priority Containment/Alignment Rally.
- language guide přidává operational/alignment copy a zakazuje fantasy/gamer slang v player-facing UI.
- progression/economy zavádí čtyři hodnotové vrstvy: raw metric, run XP, Evidence, authorization/proficiency.
- sensory feedback přidává music, haptics, density management, action readability, wave-break contrast a comparison playtest.
- unlock docs přidávají capability groups, policy artifacts a pravidlo, že ne každý upgrade potřebuje formulář.
- playtest checklist přidává backlog-pain gate, launcher-risk test a samostatné greybox/sensory/integration gates.
- first-cycle balance je sjednocen s quantity-1 bootstrapem a Fidget packetem po třech settled sessions; action modules jsou z Tasku 024 výslovně vyloučené.
- desktop progression přidává pozdější operational/alignment artifacts a Control Room, ale neodhaluje je na first bootu.
- typography contract mění Pixel Operator z absolutního věčného locku na current runtime baseline; logo zůstává zamčené a jiný font vyžaduje samostatný readability/license gate.
- progression package RFC a integration map nyní odpovídají post-Task-023 runtime a drží action candidate IDs mimo Task 024.

### Neimplementováno tímto docs updatem

- Priority Containment runtime;
- Alignment Rally runtime;
- action module events/data;
- run-local XP v core resources;
- Audit 27-P nebo Audit 31-R;
- action capability groups;
- delegated policy engine;
- Task 024 data reconciliation;
- Task 024B–024D player-visible window rollout;
- jakýkoliv nový asset, font file, audio nebo haptic runtime;
- cloud, overlay nebo external telemetry.

Tento update je pouze docs/progression-package-docs RFC. Nemění React, runtime, save schema, JSON/CSV progression data ani asset catalogs.

## v0.3.0

Datum: 2026-07-16

### Přidáno

- `20-core-loop.md` jako canonical Metric → Audit → Evidence gameplay contract.
- raw metric, metric packet, audit instance, Evidence a backlog terminologie.
- pravidla pro manual/delegated/system-generated activity.
- Acting Lead Paradox jako budoucí mechanický motiv delegace, ne explicitní lore dump.
- `audit.evidenceCertified` jako plánovaný milestone event.
- packet/audit instance save a migration contract.

### Změněno

- `notionalWorkUnits` zůstává technický resource ID, ale player-facing význam se mění na `Evidence / EV`.
- raw klik nebo module action už není canonical spendable currency faucet.
- `clickaudit.batchCompleted` je auditní packet boundary, ne automatický reward.
- Audit 10-A se plánuje jako repeatable packet audit.
- Audit 16-C autorizuje Fidget pomocí Evidence.
- roadmapa přidává samostatné fáze pro druhou metriku, backlog a delegaci.
- task pack nyní odpovídá reálné historii Tasks 015–019 a plánuje Tasks 020–030.
- first-cycle balance je označen jako migration RFC; starý 4–5hodinový balance zůstává provisional.
- playtest gate se soustředí nejdřív na oblouk činnost → audit → Evidence → Fidget.
- progression package docs popisují plánovanou data/runtime migraci.

### Neimplementováno tímto docs updatem

- runtime packet queue;
- repeatable audit instances;
- Evidence certification reducer;
- Audit 10-A/16-C data migration;
- Fidget integration;
- delegation;
- first-cycle CSV/JSON rebalance.

Tyto změny jsou rozdělené do Tasks 020–025. Runtime na `main` po Tasku 019 může dočasně obsahovat starší v0.2 resource effects, ale nové feature je nesmějí dále rozšiřovat.

## v0.2.0

Datum: 2026-07-11

### Přidáno

- `13-progression-and-economy.md`.
- `14-sensory-feedback.md`.
- `15-unlocks-memos-and-system-mutations.md`.
- `16-playtest-checklist.md`.
- `17-first-cycle-balance.md`.
- `18-desktop-surface-progression.md`.
- `19-research-basis-and-source-index.md`.
- strojově čitelný package `packages/korp-progression`.
- audit-first onboarding: Audit 00-A generuje ClickAudit stopu.
- první 4–5hodinový auditní cyklus a první prestige.
- desktop artifact/surface mutation model.
- research source index a guardrails proti pseudovědě.

### Změněno

- canonical full game je falešná plocha zaměstnance, ne katalog modulů.
- roadmapa řadí fake desktop vertical slice před dlouhou progression implementaci.
- moduly se odemykají jako nainstalované appky, folders, settings nebo screensaver.
- Corner Watch je primárně skutečný screensaver.
- prestige je reprezentováno archivací, desktop cleanupem, rebootem a novým buildem.
- product modes jsou oddělené od player progression.
- architecture doplněna o progression/surface vrstvy.
- event model doplněn o transient/gameplay/milestone úrovně.
- Codex task pack doplněn o tasks 017–025.

### Nezměněno

- logika tehdejších ClickAudit, Fidget a Bloom appek;
- local-first privacy;
- Windows-first desktop strategie;
- TypeScript-first modularita;
- K0rp canonical tón a skrytá meta rovina;
- samostatná použitelnost prokrastinačních modulů.

## v0.1.3

- typography/brand lock;
- Pixel Operator / Pixel Operator Mono;
- Windows-first platform workflow;
- module registry/core baseline.

## v0.1.1

- module backlog;
- language guide;
- candidate modules;
- resource/event draft.

## v0.1

První RFC pack.
