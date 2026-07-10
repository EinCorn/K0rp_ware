# K0rp_OS — Roadmap

Verze: 0.1.3 pracovní návrh

## Fáze 0 — Current consolidation

Cíl: Nezbourat, co už funguje.

Tasks:

- zkontrolovat `main`,
- dokončit Fázi 3 app-specific polish,
- ClickAudit: liquid, digits, star/confetti polish,
- Bloom: score/vlna, stones, burst,
- Fidget: jen opatrný polish,
- neřešit znovu shared shell, pokud není nutné.

Výstup:

- tři moduly vypadají jako součást jednoho systému.

## Fáze 1 — Docs / RFC v0.1.1

Cíl: Pojmenovat produkt před velkým vývojem.

Tasks:

- product vision,
- visual style,
- product modes,
- architecture,
- event model,
- privacy model,
- screen concepts,
- roadmap,
- codex tasks,
- module backlog,
- language/copy guide.

Výstup:

- jasné zadání pro sebe/Foxy/Codex,
- první modular-first definice,
- čeština jako canonical product language,
- backlog nových modulů.

## Fáze 2 — korp-core MVP

Cíl: Oddělit herní logiku od UI.

Tasks:

- vytvořit `packages/korp-core`,
- definovat typy eventů,
- definovat initial state,
- napsat reducer,
- napsat resources,
- napsat unlock model,
- přidat Vitest testy.

Výstup:

- lokální herní jádro bez UI.

## Fáze 3 — korp-modules registry

Cíl: Udělat z modulů first-class citizens.

Tasks:

- vytvořit `packages/korp-modules`,
- definovat `KorpModuleManifest`,
- přidat manifesty pro ClickAudit, Fidget, Bloom,
- přidat spec manifesty pro candidate modules,
- validovat category/maturity/surfaces,
- vytvořit registry export.

Výstup:

- nové appky lze přidávat manifestem, ne hardcoded seznamem.

## Fáze 4 — Napojení současných modulů

Cíl: ClickAudit, Fidget a Bloom generují společné eventy.

Tasks:

- ClickAudit emit `clickaudit.click`,
- Fidget emit `fidget.spinTick`,
- Bloom emit `bloom.matchCleared`,
- společný progress panel ve webu,
- lokální state,
- žádná cloud telemetrie.

Výstup:

- první pocit propojeného systému.

## Fáze 5 — First Expansion v0.4

Cíl: Přidat první jednoduché škálovatelné moduly.

Priorita:

1. **Corner Watch**
2. **Bublinková Fólie**
3. **Button Compliance**

Proč:

- Corner Watch je jednoduchý, ikonický idle modul.
- Bublinková Fólie je okamžitě pochopitelná taktilní fidgetovina.
- Button Compliance rozšiřuje korporátní confirmation/audit vrstvu.

Tasks:

- přidat manifesty,
- přidat základní UI prototypes,
- emitovat eventy,
- napojit resources,
- přidat 3–5 interních hlášek.

Výstup:

- K0rp_OS už není jen původní trojice.

## Fáze 6 — K0rp_OS Desktop Shell

Cíl: Hlavní falešná pracovní plocha.

Tasks:

- vytvořit app shell,
- fake desktop,
- taskbar,
- ikony modulů,
- launchable internal windows,
- shared progress,
- internal memo window,
- local save/load.

Výstup:

- první hratelný K0rp_OS MVP.

## Fáze 7 — Progression loop

Cíl: Udělat z toho hru.

Tasks:

- ranky,
- resource thresholds,
- unlocky,
- memo odměny,
- fake departments,
- daily absurdity,
- achievements/failures,
- cross-module unlocky.

Výstup:

- uživatel má důvod pokračovat, i když důvod je podezřelý.

## Fáze 8 — Desk Object / ASMR Expansion v0.5

Cíl: Rozšířit uklidňovací a manažerské desk-object moduly.

Moduly:

- **Newtonova Kolíbka**,
- **Zenová Zahrádka**.

Tasks:

- fake physics / animation pro Newtonovu kolíbku,
- canvas/sprite interakce pro písek,
- resources `momentum`, `transferredResponsibility`, `proceduralCalm`,
- desk-object category v launcheru,
- sample memos.

Výstup:

- K0rp_OS začne mít svůj „manažerský stůl“.

## Fáze 9 — Care / Cleaning / Alignment v0.6

Cíl: Přidat tactile ASMR moduly s vyšší interakční kvalitou.

Moduly:

- **Surface Compliance**,
- **Shape Compliance**.

Tasks:

- wipe/clean mask systém,
- drag/snap/rotate tvarů,
- satisfying effects,
- sound hooks,
- progression resources.

Výstup:

- K0rp_OS má silnější calming/ADHD wing.

## Fáze 10 — Attention Corruption v0.7

Cíl: Přidat modul, který simuluje druhou pozornostní vrstvu.

Modul:

- **Attention Runner**.

Tasks:

- jednoduchý endless runner,
- low cognitive load controls,
- napojení na `attentionResidue`,
- možnost běhu vedle memo / knowledge base.

Výstup:

- K0rp_OS umí být sám sobě doprovodným Subway Surferem, ale samozřejmě compliance-friendly.

## Fáze 11 — Overlay MVP

Cíl: K0rp nad skutečnou prací.

Tasks:

- malá always-on-top lišta,
- privacy mode indicator,
- K0rp-only mode,
- Privacy Work Blob mode,
- otevřít hlavní K0rp_OS,
- žádný raw tracking.

Výstup:

- čtvrtá zeď praská, ale bezpečně.

## Fáze 12 — Account / Sync

Cíl: Volitelná synchronizace.

Tasks:

- account model,
- Cloudflare Worker API,
- progress sync,
- settings sync,
- cosmetics/unlocks,
- export/import.

Výstup:

- uživatel může přenášet K0rp identitu mezi zařízeními.

## Fáze 13 — Content expansion

Cíl: Větší svět bez vysvětlování světa.

Tasks:

- nové moduly,
- knowledge base,
- interní memo bank,
- hallway screens,
- audio snippets,
- department pages,
- training screens,
- fake incidents,
- procedural announcements.

Výstup:

- K0rp_OS začne působit jako produkt z místa, které existuje příliš přesvědčivě.

## Důležité pravidlo roadmapy

> Každá fáze musí buď posílit core, nebo přidat modul přes core. Pokud jen přidává další izolovanou hračku, je to scope creep v reflexní vestě.
