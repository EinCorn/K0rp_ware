# K0rp_OS — Architecture

Verze: 0.2.0 pracovní návrh

## 1. Základní rozhodnutí

K0rp_OS má být **web-native, TypeScript-first, modular-first systém**.

Nedělat teď klasickou hru v Unity/Godotu. K0rp_OS není primárně fyzikální 2D hra. Je to falešný operační systém, launcher, sada widgetů, overlay, incremental engine a UI simulátor. Proto dává větší smysl stavět vlastní lehký engine nad webovým stackem.

Doporučený stack:

- TypeScript jako hlavní jazyk,
- Vite / současný frontend stack,
- Tauri 2 pro desktop,
- Rust jen pro tenkou Tauri/OS vrstvu,
- Cloudflare Workers později pro API,
- local-first save/load,
- testy pro core logiku.

## 1.1 Platform strategy

Primární platforma pro desktop release a seriózní UX testování je **Windows**.

Mac je sekundární vývojové/testovací/design prostředí. Je důležitý, protože umožňuje pohodlné domácí workflow, Apple ecosystem file handoff, grafiku na tabletu, docs, core logiku a web preview. Nesmí ale určovat finální rozhodnutí u věcí, které jsou OS-sensitive.

```text
Windows = primary release / desktop / overlay target
Mac     = secondary dev / design / smoke-test environment
Web     = shared cross-platform surface
```

Architektura proto musí držet ostrou hranici:

```text
korp-core       = platform-independent TypeScript
korp-modules    = platform-independent manifests
korp-ui         = mostly platform-independent UI
Tauri adapters  = platform-specific window/OS behavior
overlay bridge  = platform-sensitive, Windows-first testing
```

Více viz `12-platform-workflow.md`.

## 2. Architektonický princip

Nejdůležitější věta:

> K0rp_OS nesmí být sbírka hardcoded appek. Musí být engine, do kterého se appky registrují jako moduly.

To znamená:

- appka nesmí být jediným místem, kde existuje její význam,
- progress nesmí být zamčený v jednom UI komponentu,
- modul musí deklarovat, jaké eventy emituje,
- modul musí deklarovat, jaké resources produkuje,
- modul musí deklarovat, kde může běžet,
- K0rp_OS musí umět zobrazit / zamknout / odemknout modul z manifestu.

## 3. Cílová struktura repa

```text
K0rp_ware/
├─ apps/
│  ├─ web/
│  ├─ k0rp-os/
│  ├─ overlay/
│  ├─ click-audit/
│  ├─ fidget/
│  └─ bloom/
├─ desktop/
│  └─ current tauri apps during migration
├─ packages/
│  ├─ korp-core/
│  ├─ korp-modules/
│  ├─ korp-progression/
│  ├─ korp-ui/
│  ├─ korp-assets/
│  ├─ korp-content/
│  ├─ korp-save/
│  └─ korp-api-client/
├─ workers/
│  └─ api/
├─ docs/
│  └─ k0rp-os/
└─ scripts/
```

Toto je cílová struktura, ne první refactor.

## 4. Packages

### packages/korp-core

Herní logika bez UI: event model, state, reducer, resources, stats a základní save interface. Nesmí obsahovat React, CSS, DOM ani Tauri API.

### packages/korp-modules

Registry a manifesty modulů: metadata, category, maturity, surfaces, events, resources, privacy profile a feature flags.

### packages/korp-progression

Datový source of truth pro:

- resource metadata;
- audit forms;
- upgrades/procedures;
- memos;
- certifications;
- cross-module interactions;
- first-cycle balance;
- prestige directives;
- desktop artifacts a surface mutations.

Package je čistý TypeScript/JSON/CSV a sám nemění runtime appek.

### packages/korp-ui

Shared UI: app/window shell, taskbar, desktop icons, folders, documents, meters a interní controls.

### packages/korp-assets

Sdílené shell/module assets, backgrounds, textures a sprite sheets.

### packages/korp-content

Canonical české texty: mema, status messages, tooltips, knowledge base a localization packs.

### packages/korp-save

Local storage/Tauri adapters, import/export a migrations.

### packages/korp-api-client

Pozdější optional cloud/sync client. Není MVP.

## 5. Module manifest

Každý modul musí mít manifest a zachovat stejné ID/event semantics napříč webem, standalone oknem, K0rp_OS oknem a overlay surface.

## 6. Event flow

```text
UI interaction
→ module event
→ korp-core base effect
→ progression modifiers
→ stats / unlocks / memos
→ surface mutation
→ UI update
→ optional local save
```

## 7. Feature churn jako design requirement

- nový modul přidat přes manifest;
- resource map rozšiřovat bez přepisování starých save files;
- eventy verzovat;
- content držet odděleně od logiky;
- visuals držet odděleně od core;
- experimentální moduly mohou být `idea` nebo `prototype`.

> „Hele, ještě mě napadla další appka.“

Architektura kvůli tomu nesmí spadnout jak firemní tracker v pondělí v 9:03.

## 8. Storage

MVP:

- lokální state;
- export/import JSON;
- jednoduché migrations;
- save ukládá ID a stav, ne celé definice databáze.

Později Tauri store, SQLite event log a optional cloud sync. Nesyncovat raw citlivou aktivitu.

## 9. Testing

Minimum:

- Vitest pro `korp-core`;
- manifest validation;
- progression typecheck/reference validation;
- reducer tests;
- save/load migration tests;
- smoke testy web/desktop;
- Windows test pro native window/overlay behavior.

## 10. Codex workflow

Codex používat na malé tasky. Nesahej na shared shell nebo lokální gameplay modulu, pokud to task výslovně neříká.

## 11. Důležité pravidlo

> Robustnost tady neznamená enterprise overengineering. Znamená to, že další blbost půjde přidat bez toho, aby se předchozí blbosti začaly tvářit jako incident.

## 12. Vrstvy progression a surface

```text
korp-core         = význam eventů, state, základní reducer a stats
korp-progression  = thresholds, forms, upgrades, memos, certifications, prestige
korp-surface      = desktop artifacts, folders, files, windows a system mutations
korp-modules      = module contracts a registry
korp-ui           = vykreslení desktopu, oken a interních komponent
```

`korp-surface` může být zpočátku datově součástí `korp-progression`, ale jeho model zůstává oddělený. Surface databáze nesmí duplikovat ceny ani balance; poslouchá progression ID.

## 13. Runtime provider

```text
KorpRuntimeProvider
├─ state
├─ lifetimeStats
├─ dispatch(event)
├─ submitAuditForm(formId, values)
├─ purchaseUpgrade(upgradeId)
├─ acknowledgeMemo(memoId)
├─ unlockQueue
├─ memoQueue
├─ desktopMutationQueue
├─ save/load
└─ closeAuditCycle()
```

Standalone modul může mít vlastní local/session state. Pokud běží uvnitř K0rp_OS nebo je připojený, globální eventy směřují do jediného runtime.

## 14. Event effect pipeline

```text
base event effect
→ click profile
→ permanent prestige directives
→ cycle upgrades
→ cross-module modifiers
→ meter caps / derived values
→ lifetime stats
→ certifications
→ unlocks
→ memos
→ surface mutations
→ local save
```

Nemá vzniknout univerzální enterprise rules engine. Cílem je zabránit tomu, aby každá nová procedura přidala další hardcoded větev do jednoho reduceru.

## 15. Desktop architecture

```text
KorpOsShell
├─ DesktopSurface
├─ WindowManager
├─ Taskbar
├─ StartMenu
├─ ArtifactRegistry
├─ ModuleHost
├─ DocumentHost
├─ FolderHost
├─ ScreensaverHost
└─ SystemNotificationQueue
```

Modulové okno není dashboard card. Document windows obsluhují audity, mema, reporty a certifikace. Folder windows zobrazují viditelné stopy progression.

## 16. Audit interaction bridge

První formulář `00-A` je součástí plochy. Každá úmyslná field activation:

```text
field interaction
→ maximálně jeden clickaudit.click(profile: audit-form)
→ změna local form state
```

Pointer move, animační frame, fyzikální tick ani každý pixel dragu nesmí vytvářet auditovaný click.

## 17. Source of truth

- design: `docs/k0rp-os/13-*` až `19-*`;
- machine data: `packages/korp-progression/data/`;
- TypeScript constants: `packages/korp-progression/src/`;
- runtime prototyp se nepřepisuje jedním velkým refactorem;
- integrace probíhá po vertical slices a testech.
