# K0rp_OS Docs — Changelog

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
