# K0rp_OS — Roadmap

Verze: 0.2.0 pracovní návrh

## 0. Status dokumentu

Roadmap zachovává původní produktovou osu, ale upravuje implementační pořadí podle:

- incremental/idle design research,
- první progression databáze,
- audit-first onboarding flow,
- canonical fake-desktop fantasy,
- požadavku na standalone/web/overlay surfaces,
- současného stavu repa.

Současné appky ClickAudit, Fidget a Bloom se tímto dokumentem nerefundují ani nemění jejich lokální gameplay. Integrace probíhá přes bridge a společný runtime.

## Fáze 0 — Current consolidation

Cíl: Nezbourat, co už funguje.

- dokončit app-specific polish;
- nevracet se k velkému shared-shell refactoru;
- zachovat standalone ClickAudit, Fidget a Bloom;
- main je source of truth;
- Windows je primary desktop target.

## Fáze 1 — Docs, source index a progression RFC

Cíl: Pojmenovat systém před dalším runtime vývojem.

Výstupy:

- docs `00–19`;
- progression/economy;
- sensory feedback;
- unlocks/memos/system mutations;
- playtest checklist;
- first-cycle balance;
- desktop surface progression;
- research/source index;
- strojově čitelný `packages/korp-progression`.

## Fáze 2 — Existing core and registry baseline

Status: základ existuje.

- `packages/korp-core`;
- `packages/korp-modules`;
- typed events/resources;
- manifest registry;
- ClickAudit bridge;
- testy.

Další práce musí být inkrementální, ne kompletní přepis.

## Fáze 3 — Progression package integration

Cíl: Přidat datový source of truth bez změny současných appek.

- typecheck `packages/korp-progression`;
- validace referencí;
- resource metadata;
- forms, upgrades, memos, certifications, prestige constants;
- surface mutation constants;
- žádné UI změny v tomto kroku.

## Fáze 4 — Shared runtime and local persistence

Cíl: Jeden global KorpState pro K0rp_OS.

- `KorpRuntimeProvider`;
- lifetime stats;
- local save/load;
- save migrations;
- unlock/memo/surface queues;
- import/export JSON;
- standalone moduly si smějí ponechat local session state.

## Fáze 5 — Canonical desktop vertical slice

Cíl: Definovat celou hru v malém.

```text
Identity Assignment
→ prázdná plocha
→ Audit 00-A jako dokument
→ audit field clicks
→ ClickAudit shortcut
→ první memo v Doručených
→ ClickAudit jako interní okno
```

Požadavky:

- fake desktop od prvního hratelného buildu;
- taskbar;
- basic window manager;
- folders/files;
- žádný launcher plný všech modulů;
- privacy status viditelný.

## Fáze 6 — First audit loop

Cíl: Prvních 20–35 minut.

- `clickaudit.batchCompleted`;
- formulář 10-A;
- první procedure upgrade;
- anti-spam click yield;
- Forms folder;
- první system mutation;
- první shift closure bez prestige.

## Fáze 7 — Current modules connected

Cíl: Připojit současnou trojici beze změny jejich lokální identity.

- Fidget events + `fidget.sessionSettled`;
- Bloom events + `bloom.waveAdvanced`;
- shortcuts instalované progressionem;
- cross-module modifiers;
- společný save;
- standalone bridge policy.

## Fáze 8 — First-cycle content and prestige

Cíl: 4–5 hodin do prvního `UZAVŘENÍ AUDITNÍHO CYKLU`.

- Button Compliance jako první nový administrativní modul;
- Corner Watch jako screensaver/idle surface;
- certifikace;
- 6–8 mem;
- formulář 42-Z;
- Audit Findings;
- archive/reboot/build mutation;
- post-prestige Bublinková Fólie.

Bubble Wrap je hlavní nový-system reward prvního prestige, ne jen násobitel.

## Fáze 9 — Sensory foundation

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

## Fáze 10 — First expansion v0.4

Pořadí podle engine value:

1. Button Compliance — testuje approvals, forms a exceptions.
2. Corner Watch — testuje screensaver, idle/offline reporting.
3. Bublinková Fólie — testuje sensory system a post-prestige new-system reward.

## Fáze 11 — Desk Object / ASMR v0.5

- Newtonova Kolíbka;
- Zenová Zahrádka;
- desk-object shelf;
- free mode i procedural mode;
- přirozené closure events.

## Fáze 12 — Care / Cleaning / Alignment v0.6

- Surface Compliance;
- Shape Compliance;
- wipe masks;
- drag/rotate/snap;
- material-specific feedback;
- hidden surface files/memos.

## Fáze 13 — Attention Corruption v0.7

- Attention Runner;
- companion strip;
- low-input mode;
- nesmí převzít hlavní ekonomiku ani změnit K0rp_OS v běžnou arcade kolekci.

## Fáze 14 — Standalone hardening

Cíl: Moduly opravdu vytrhnutelné z OS.

- stejné module implementation;
- detached windows;
- unlinked local mode;
- linked aggregate bridge;
- portable settings;
- Windows release validation.

## Fáze 15 — Web fallback

- browser fake desktop;
- stejné progression IDs;
- local browser save;
- module cards/download portal jako sekundární vstup;
- jasně popsané native limitations.

## Fáze 16 — Overlay MVP

- Windows-first always-on-top bar;
- K0rp-only mode;
- Privacy Work Blob;
- quick launch;
- žádné raw app names, URL, text, screenshots ani keylogging;
- platform-specific bridge mimo `korp-core`.

## Fáze 17 — Account / sync

Až po stabilním local-first systému.

- voluntary account;
- progress/settings/cosmetics;
- export/delete;
- žádný raw activity sync.

## Fáze 18 — Content expansion

- memo bank;
- knowledge base;
- hallway screens;
- training materials;
- fake incidents;
- procedural announcements;
- nové moduly přes core/progression/surface contracts.

## Gate pravidla

Každá fáze musí splnit alespoň jedno:

- posílí core/runtime;
- přidá data přes progression package;
- přidá surface mutation;
- integruje jeden modul bez změny ostatních;
- prokazatelně zlepší sensory/accessibility;
- projde playtest gate.

> Pokud jen přidává další izolovanou hračku, je to scope creep v reflexní vestě.
