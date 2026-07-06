# K0rp_OS — Architecture

Verze: 0.1.3 pracovní návrh

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

Cílově:

```text
K0rp_ware/
├─ apps/
│  ├─ web/
│  ├─ k0rp-os/
│  ├─ overlay/
│  ├─ click-audit/
│  ├─ fidget/
│  └─ bloom/
│
├─ desktop/
│  └─ current tauri apps during migration
│
├─ packages/
│  ├─ korp-core/
│  ├─ korp-modules/
│  ├─ korp-ui/
│  ├─ korp-assets/
│  ├─ korp-content/
│  ├─ korp-save/
│  └─ korp-api-client/
│
├─ workers/
│  └─ api/
│
├─ docs/
│  └─ k0rp-os/
│
└─ scripts/
```

Toto je cílová struktura, ne první refactor. Nejdřív docs + core package. Potom postupně.

## 4. Packages

### packages/korp-core

Herní logika bez UI.

Obsah:

- event model,
- state model,
- reducer,
- resources,
- stats,
- unlocks,
- achievements/failures,
- module registry interface,
- save/load interface.

Nesmí obsahovat:

- React komponenty,
- CSS,
- Tauri API,
- DOM interakce,
- konkrétní asset importy.

### packages/korp-modules

Registry a manifesty modulů.

Obsah:

- seznam modulů,
- metadata,
- category,
- maturity,
- surfaces,
- events,
- produced resources,
- unlock requirements,
- copy references,
- feature flags.

### packages/korp-ui

Shared UI komponenty.

Obsah:

- app shell,
- window shell,
- buttons,
- panel components,
- cards,
- meters,
- taskbar,
- desktop icon components.

Navazuje na současný shared `desktop/shared/k0rp-ui/`.

### packages/korp-assets

Sdílené assety.

Obsah:

- shell assets,
- icons,
- module icons,
- backgrounds,
- pixel textures,
- sprite sheets,
- concept references.

### packages/korp-content

Texty a in-universe obsah.

Obsah:

- internal memos,
- status messages,
- tooltips,
- knowledge base articles,
- module copy,
- language variants.

Důležité: čeština je canonical. Angličtina později jako lokalizace/adaptace.

### packages/korp-save

Persistence layer.

Obsah:

- local storage adapter,
- Tauri store adapter,
- SQLite adapter později,
- import/export,
- migration system.

### packages/korp-api-client

Pozdější cloud/sync client.

Není MVP. Přidat až po stabilním local-first core.

## 5. Module manifest

Každý modul musí mít manifest.

```ts
export type KorpModuleManifest = {
  id: string;
  slug: string;
  title: string;
  shortTitle?: string;
  versionLabel: string;
  category: KorpModuleCategory;
  maturity: KorpModuleMaturity;
  description: string;
  inUniverseDepartment?: string;
  surfaces: KorpSurface[];
  privacyProfile: KorpPrivacyProfile;
  events: KorpEventType[];
  resourcesProduced: KorpResourceId[];
  resourcesConsumed?: KorpResourceId[];
  unlockRequirement?: KorpUnlockRequirement;
  featureFlags?: string[];
  copyPackId?: string;
  iconAssetId?: string;
};
```

Příklad:

```ts
export const bubbleWrapModule: KorpModuleManifest = {
  id: "bubble-wrap",
  slug: "bublinkova-folie",
  title: "Bublinková Fólie",
  shortTitle: "Fólie",
  versionLabel: "v0.1 dílna",
  category: "stabilization",
  maturity: "spec",
  description: "Certifikovaný povrch pro taktilní úlevu.",
  inUniverseDepartment: "Oddělení Taktilního Uklidnění",
  surfaces: ["webCard", "standaloneWindow", "osWindow", "overlayMini"],
  privacyProfile: "korpOnly",
  events: ["bubble.popped", "bubble.sheetCompleted"],
  resourcesProduced: ["reliefUnits", "pressureReleased"],
  copyPackId: "bubble-wrap.cs-CZ",
  iconAssetId: "module.bubbleWrap"
};
```

## 6. Event flow

```text
UI interaction
→ module event
→ korp-core reducer
→ new state
→ resources / stats / unlocks
→ UI update
→ optional memo / achievement
→ optional local save
```

Příklad:

```text
user pops bubble
→ bubble.popped
→ +1 Relief Unit
→ -0.1 Entropy
→ sheet progress +1
→ if sheet completed: unlock memo
```

## 7. Feature churn jako design requirement

Produkt musí počítat s tím, že nápady se budou měnit.

To znamená:

- nový modul přidat přes manifest,
- resource map rozšiřovat bez přepisování starých save files,
- eventy verzovat,
- content držet odděleně od logiky,
- visuals držet odděleně od core,
- experimentální moduly mohou být `idea` nebo `prototype`, aniž by rozbíjely released modules.

Architektura má unést větu:

> „Hele, ještě mě napadla další appka.“

A nemá kvůli tomu spadnout jak firemní tracker v pondělí v 9:03.

## 8. Storage

MVP:

- lokální state,
- export/import JSON,
- jednoduché migrations.

Později:

- Tauri store,
- SQLite event log,
- optional cloud sync.

Nesyncovat raw citlivou aktivitu.

## 9. Testing

Minimum:

- Vitest pro `korp-core`,
- module manifest validation,
- reducer tests,
- save/load migration tests,
- smoke testy pro web/desktop.

Důvod: Jakmile bude modulů 8+, každá změna eventu bez testu bude malá compliance nehoda.

## 10. Codex workflow

Codex používat na malé tasky:

- vytvoř package,
- přidej manifest,
- napiš reducer test,
- napoj jeden modul,
- neřeš design navíc,
- nesahej na shared shell, pokud task neříká.

Nedávat úkol:

> „Udělej K0rp_OS.“

Dávat úkol:

> „Create packages/korp-modules with manifests for current v0.3 modules and candidate v0.4 modules. Do not touch UI.“

## 11. Důležité pravidlo

> Robustnost tady neznamená enterprise overengineering. Znamená to, že další blbost půjde přidat bez toho, aby se předchozí blbosti začaly tvářit jako incident.
