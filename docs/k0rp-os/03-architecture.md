# K0rp_OS — Architecture

Verze: 0.4.0 pracovní návrh

## 1. Základní rozhodnutí

K0rp_OS zůstává **web-native, TypeScript-first a modular-first systém**.

Přidání Priority Containment nebo Alignment Rally samo o sobě není důvod přepsat produkt do Unity nebo Godotu. Action modules jsou ohraničené runtime surfaces uvnitř stejného systému, ne nová hra přilepená vedle něj.

Doporučený stack:

- TypeScript jako hlavní jazyk;
- Vite / současný frontend stack;
- React pro desktop, documents, folders a shell;
- DOM, Canvas 2D nebo jejich řízený hybrid podle potřeb konkrétního modulu;
- Tauri 2 pro desktop;
- Rust pouze pro tenkou Tauri/OS vrstvu;
- local-first save/load;
- testy pro core, packet/audit flow, module contracts a migrations;
- Cloudflare Workers až pro pozdější volitelný sync/API.

## 2. Platform strategy

```text
Windows = primary release / desktop / overlay target
Mac     = secondary dev / design / smoke-test environment
Web     = shared cross-platform surface
```

Hranice:

```text
korp-core       = platform-independent semantics
korp-modules    = manifests a module contracts
korp-progression= forms, packets, authorizations, balance
korp-ui         = desktop/documents/window composition
module runtime  = local gameplay/session state
Tauri adapters  = platform-specific window/OS behavior
overlay bridge  = Windows-first a privacy-sensitive
```

Action module nesmí zatáhnout platform-specific input, window nebo telemetry kód do `korp-core`.

## 3. Nejdůležitější princip

> K0rp_OS nesmí být sbírka hardcoded appek. Musí být engine, do kterého se appky registrují jako moduly.

To znamená:

- modul nemá význam pouze ve své React komponentě;
- progress není zamčený v UI;
- modul deklaruje ID, surfaces, raw metriky, closures, privacy a capability groups;
- high-frequency local loop se nepropaguje frame po framu do globálního reduceru;
- K0rp_OS umí modul autorizovat, nainstalovat, otevřít, zavřít, delegovat a auditovat přes společné contracts.

## 4. Cílová struktura repa

```text
K0rp_ware/
├─ apps/
│  ├─ web/
│  ├─ k0rp-os/
│  ├─ overlay/
│  ├─ click-audit/
│  ├─ fidget/
│  ├─ bloom/
│  └─ future module apps/
├─ desktop/
│  └─ current Tauri apps during migration
├─ packages/
│  ├─ korp-core/
│  ├─ korp-modules/
│  ├─ korp-progression/
│  ├─ korp-ui/
│  ├─ korp-assets/
│  ├─ korp-content/
│  ├─ korp-save/
│  └─ korp-api-client/
├─ design/
│  ├─ icon-source/
│  ├─ ui-source/
│  └─ ui-runtime/
├─ docs/
│  └─ k0rp-os/
└─ scripts/
```

Toto je cílová organizace, ne příkaz k okamžitému monorepo refactoru.

## 5. Package responsibilities

### `packages/korp-core`

Herní význam bez UI:

- event validation;
- global resources/stats;
- reducer;
- manual/delegated/system-generated source distinction;
- Evidence grant/spend primitives;
- authorization records;
- základní save interface.

Nesmí obsahovat React, DOM, Canvas, CSS ani Tauri API.

### `packages/korp-modules`

Registry a manifests:

- module metadata;
- category a activity intensity;
- maturity;
- supported surfaces;
- raw events a natural closures;
- privacy profile;
- content geometry class;
- capability groups;
- feature flags.

### `packages/korp-progression`

Datový source of truth pro:

- resources;
- audit templates;
- metric packet definitions;
- authorizations;
- procedures/upgrades;
- memos/certifications;
- cross-module interactions;
- first-cycle balance;
- prestige;
- desktop artifacts a mutations.

Action-module candidate IDs se do tohoto package nepřidávají před greybox a integration gate.

### `packages/korp-ui`

- desktop shell;
- window manager;
- taskbar;
- folders/documents;
- shared window composition;
- meters a controls;
- accessibility presentation.

### `packages/korp-assets`

- curated runtime assets;
- generated catalogs;
- material textures;
- sprite sheets;
- audio metadata;
- žádné přímé importy z raw design snapshots.

### `packages/korp-content`

Canonical texty, template copy, mema, tooltips, audit prose a localization.

### `packages/korp-save`

Local storage/Tauri adapters, import/export a migrations.

## 6. Module architecture

Každý interaktivní modul se dělí na čtyři vrstvy:

```text
ModuleDefinition
├─ manifest a static IDs
├─ SessionEngine
│  ├─ local state
│  ├─ input interpretation
│  ├─ update/physics loop
│  ├─ run-local XP/build
│  └─ natural closure
├─ ModuleView
│  ├─ DOM/Canvas rendering
│  ├─ sensory feedback
│  └─ accessibility
└─ RuntimeBridge
   ├─ privacy-safe raw events
   ├─ aggregate closure
   └─ packet/audit integration
```

### 6.1 SessionEngine

Session engine je module-local. Smí používat:

- high-frequency ticks;
- physics state;
- collision data;
- temporary run XP;
- transient particles;
- local upgrade selections.

Nesmí při každém frame dispatchovat do globálního core.

### 6.2 RuntimeBridge

Bridge emituje pouze player-meaningful a privacy-safe records:

```text
raw activation
aggregate milestone
natural closure
session outcome
```

Priority Containment může lokálně zpracovat stovky collisions, ale globálně emitovat pouze relevantní raw aggregates a právě jeden `priority.sessionClosed` za closure.

### 6.3 Surface adapters

Stejný module engine může běžet jako:

- `osWindow`;
- `standaloneWindow`;
- `webCard` nebo web module page;
- později omezený `overlayMini`, pokud to gameplay dovoluje.

Surface mění chrome, placement a velikost. Nesmí přepisovat event semantics.

## 7. Content geometry classes

Manifest má dlouhodobě deklarovat geometrii místo univerzálního rozměru:

```ts
type KorpContentGeometry =
  | { kind: "compact-square"; width: 167; height: 167 }
  | { kind: "portrait-document"; minWidth: number; minHeight: number }
  | { kind: "portrait-folder"; minWidth: number; minHeight: number }
  | { kind: "action-square"; width: 320; height: 320 }
  | { kind: "custom"; width: number; height: number };
```

Čísla jsou současné/provisional contracts, ne obecná engine konstanta.

## 8. UI asset and window-shell boundary

Task 024A zavedl curated source pack a runtime contract:

```text
design/ui-source/k0rp-ui-asset-pack-v01/
design/ui-runtime/k0rp-ui-v01/
```

Závazné principy:

- frame = nine-slice;
- header = horizontal three-slice;
- material surface = native-resolution tile;
- complete shell = reference-only;
- controls = fixed assets;
- labels = live DOM text;
- integer coordinates/scaling;
- compact 167×167 ClickAudit/Fidget content se nesmí zmenšit, cropnout ani rescalovat.

Action windows používají stejný compositional language, ale content-driven větší outer size.

## 9. Event flow

```text
intentional input
→ module-local update
→ optional run-local XP/build change
→ privacy-safe raw event nebo natural closure
→ packet detector
→ audit availability
→ audit submit
→ evidence certification
→ authorization/progression
→ surface mutation
→ save
```

`run-local XP` se nikdy nezařazuje mezi packet a Evidence. Je to pouze pacing uvnitř session.

## 10. Automation architecture

Automatizace není boolean `auto = true` nad module counterem.

```text
manual session
→ reusable loadout template
→ delegated operator
→ policy configuration
→ autonomous execution
→ confidence/outcome summary
→ discrepancy/intervention
```

Minimální policy shape může později obsahovat:

```ts
type ModulePolicy = {
  id: string;
  moduleId: string;
  loadoutTemplateId?: string;
  targetWeights?: Record<string, number>;
  riskTolerance: "low" | "standard" | "high";
  supervisionInterval?: number;
  allowedExceptionIds: string[];
};
```

Toto je návrhová hranice, ne povolení stavět generic BPMN engine.

## 11. Persistence

Globální save ukládá:

- resources/stats;
- packet a audit instances;
- authorizations;
- unlocks/memos;
- capability/proficiency flags;
- policy a delegated state až po příslušném tasku;
- stable IDs, ne celé definitions.

Module session save je oddělený kontrakt. Krátký action run se v prvním prototype nemusí ukládat uprostřed. Tato volba musí být explicitní a testovaná, ne náhodný důsledek komponent lifecycle.

## 12. Testing

Minimum:

- core reducer tests;
- packet/audit idempotency;
- save migrations;
- manifest validation;
- progression reference validation;
- module-local deterministic tests tam, kde to dává smysl;
- input-to-event cardinality;
- no-per-frame-global-dispatch test/profiling guard;
- window geometry tests;
- accessibility smoke tests;
- Windows desktop gate.

Action prototype navíc:

- fixed-step nebo bounded delta behavior;
- pause/resume;
- closure exactly once;
- resize neovlivní logical gameplay coordinates;
- 1× a integer 2× render mapping;
- performance při nejhustší plánované vlně.

## 13. Desktop architecture

```text
KorpOsShell
├─ DesktopSurface
├─ WindowManager
├─ Taskbar
├─ ArtifactRegistry
├─ ModuleHost
│  ├─ CompactModuleHost
│  └─ ActionModuleHost
├─ DocumentHost
├─ FolderHost
├─ ScreensaverHost
├─ PolicyControlRoom (later)
└─ SystemNotificationQueue
```

Module window není dashboard card. Document window obsluhuje audit, memo, report a certifikaci. Action host poskytuje větší logical viewport, ale nepřebírá vlastnictví progression.

## 14. Feature churn jako requirement

- nový modul přes manifest;
- nový session engine bez změny core semantics;
- nový raw metric source přes packet/audit contract;
- visuals oddělené od logic;
- content oddělený od reduceru;
- experimental maturity `idea/spec/prototype`;
- žádný modul se nestane canonical jen proto, že má hezký mockup.

> „Hele, ještě mě napadla další appka.“

Architektura kvůli tomu nesmí spadnout jako firemní tracker v pondělí v 9:03.

## 15. Codex workflow

Codex dostává ohraničené tasks.

- Greybox action module je samostatný prototype task.
- OS packet integration přijde až po playtest gate.
- Agent nesmí sám přidat globální currency, packet threshold ani vysvětlit skrytou meta rovinu.
- Každý task musí vypsat Windows PowerShell test/build postup.

## 16. Source of truth

1. `20-core-loop.md` — ekonomika a invarianty.
2. `21-activity-spectrum-and-arcade-modules.md` — module spectrum a action prototype contracts.
3. `07-roadmap.md` — pořadí.
4. `08-codex-tasks.md` — task scope.
5. `packages/korp-progression` — machine-readable data po schválené migraci.
6. Runtime — implementace po vertical slices.

## 17. Důležité pravidlo

> Robustnost neznamená enterprise overengineering. Znamená, že další blbost půjde přidat bez toho, aby předchozí blbosti začaly vypadat jako incident — a bez toho, aby se každá nová horda stala důvodem přepsat celý operační systém.
