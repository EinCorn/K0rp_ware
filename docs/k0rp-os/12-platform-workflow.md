# K0rp_OS — Platform & Dev Workflow

Verze: 0.4.0 pracovní návrh

## 1. Platform decision

Primary release/test platform je **Windows**.

Mac je secondary development, design, docs a smoke-test prostředí.

```text
Couch Mode / Mac
- docs, research, copy, assets
- TypeScript core/data
- web preview
- cross-platform smoke tests
- quick prototype thinking

Desk Mode / Windows
- primary desktop UX
- Tauri window behavior
- DPI/fullscreen/multimonitor
- transparent/always-on-top windows
- action-module input/performance
- overlay
- installer/release
```

Co může být čistý TypeScript bez OS znalosti, má být čistý TypeScript bez OS znalosti.

## 2. Source and branch rule

```text
main = project source of truth
feature/docs/agent branch = bounded work surface
PR = review and merge gate
```

Doporučený postup:

```powershell
Set-Location 'C:\Users\danie\Projects\K0rp_ware'
git fetch origin
git checkout main
git pull --ff-only origin main
git checkout -b agent/task-XXX-description
```

Po merge:

```powershell
Set-Location 'C:\Users\danie\Projects\K0rp_ware'
git checkout main
git pull --ff-only origin main
git status
```

Main je pravda. Neznamená to, že se velké tasky mají psát přímo do main bez review.

## 3. Windows toolchain

Pro Tauri/desktop:

- Node/npm;
- Rustup/Cargo;
- Visual Studio Build Tools 2022;
- workload `Desktop development with C++`;
- Windows SDK.

Pokud chybí `link.exe`, použít x64 Native Tools Command Prompt nebo opravit C++ workload.

## 4. Clean dependency install on Windows

Vite/Rolldown může držet native binding otevřený. Typický symptom:

```text
EPERM: operation not permitted, unlink
rolldown-binding.win32-x64-msvc.node
```

Bezpečný clean install:

```powershell
Set-Location 'C:\Users\danie\Projects\K0rp_ware'
Get-Process -Name node -ErrorAction SilentlyContinue | Stop-Process -Force
Start-Sleep -Milliseconds 800

if (Test-Path -LiteralPath '.\node_modules') {
  Remove-Item -LiteralPath '.\node_modules' -Recurse -Force
}

Remove-Item -LiteralPath '.\dist' -Recurse -Force -ErrorAction SilentlyContinue
npm ci

if (-not (Test-Path -LiteralPath '.\node_modules\.bin\vite.cmd')) {
  throw 'Root Vite nebyl po npm ci nainstalován. Nepokračuj v testech.'
}
```

Tento blok se nepouští mechanicky po každé CSS změně. Použije se při branch checkoutu, dependency driftu nebo EPERM/missing-Vite problému.

## 5. Validation matrix

### Docs-only task

- link/path/source review;
- status/task consistency;
- no runtime/data/asset changes;
- optional Markdown lint, pokud existuje;
- PR diff review.

### Core/data task

```powershell
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

### Icon/UI asset task

Přidat relevantní validators:

```powershell
npm run validate:korp-icons
npm run validate:korp-ui-assets
npm run validate:korp-ui-pack-v01
```

Použít pouze scripts, které existují v aktuálním `package.json`.

### Visual/window task

- automated runtime/build tests;
- Windows browser/Tauri smoke test;
- 1× logical canvas screenshot;
- normal viewport a fullscreen;
- active/inactive/minimize/close/drag;
- DPI scaling;
- pixel sharpness;
- content geometry preservation.

### Action-module task

- deterministic/local logic tests;
- pause/resume/exit;
- closure exactly once;
- fixed logical coordinates;
- integer 1×/2× rendering;
- keyboard/controller input;
- peak-density performance;
- reduce motion/screen shake off;
- Windows required before integration acceptance.

## 6. Mandatory Codex output

Každý Codex task musí v závěrečném chatu/PR summary vypsat:

1. branch name;
2. changed files;
3. tests run agentem;
4. přesný PowerShell blok pro Danielův local test;
5. manual test checklist;
6. known limitations;
7. merge recommendation nebo explicitní blokér.

Nestačí napsat „tests pass“. Příkazy musí být copy-paste ready.

## 7. Npm script preference

Preferovat repo scripts:

```text
npm ci
npm run dev
npm run build
npm run test:runtime
npm run validate:korp-progression
npm run validate:korp-icons
npm run validate:korp-ui-assets
```

Nepsat platform-specific jednorázový shell hack, pokud lze přidat deterministický npm script.

Absolutní cesta může být v user-facing PowerShell příkladu. Nesmí se hardcodovat do runtime, package nebo CI.

## 8. Two-clone discipline

Mac a Windows clone:

- vždy fetch/pull před prací;
- nekopírovat `node_modules` mezi stroji;
- negenerovat runtime asset output ručně mimo script;
- kontrolovat `git status -sb`;
- necommitovat lokální garbage files;
- po merge synchronizovat main;
- používat `.gitattributes` a validators pro binary packs.

Při podivném untracked filename používat Git-safe output a literal paths, ne přepis escaped octal sekvence jako normální PowerShell cestu.

## 9. CI and deploy

CI a Cloudflare deploy jsou oddělené gates.

Běžný PR:

- dependency install;
- validators;
- tests/typechecks;
- build;
- žádné Cloudflare secrets;
- žádný automatic production deploy, pokud workflow výslovně neurčuje jinak.

Cloudflare deploy je samostatný manual workflow/explicitní release krok.

## 10. Platform-independent versus sensitive

### Independent

- korp-core;
- module manifests;
- progression data;
- event semantics;
- packet/audit logic;
- module-local deterministic session logic;
- copy;
- most React/web UI.

### Sensitive

- Tauri window config;
- transparency;
- drag regions;
- always-on-top;
- overlay hitboxes;
- global hooks;
- filesystem paths;
- installer;
- DPI/input behavior;
- action performance under actual Windows/browser/GPU stack.

## 11. Action prototype workflow

Priority Containment/Alignment Rally:

```text
1. standalone web greybox
2. local playtest
3. build/pacing refinement
4. sensory/readability pass
5. Windows performance/input gate
6. teprve potom K0rp_OS packet/audit integration
```

Greybox nemá čekat na Tauri overlay. Integration nemá začít dřív, než je greybox dobrý bez Evidence.

## 12. Asset workflow

Raw source:

```text
design/ui-source/
design/icon-source/
```

Generated/curated runtime:

```text
design/ui-runtime/
src/assets/ podle explicitního build contractu
```

Pravidla:

- runtime neimportuje raw snapshot;
- generated output se nevyrábí ručně;
- complete shell reference se neroztahuje;
- tile/nine-slice/three-slice metadata se validují;
- live text zůstává live;
- binary source se mění samostatným asset taskem.

## 13. Issue labels

```text
platform:cross
platform:windows
platform:mac
platform:web
area:tauri
area:overlay
area:core
area:docs
area:assets
area:progression
area:module
area:sensory
area:playtest
```

Každý issue uvádí:

```text
Test target: Cross-platform / Windows required / Web only
Reason: ...
```

## 14. Release gates

- core/runtime tests;
- progression validation;
- asset validation;
- production build;
- Windows desktop start;
- window behavior;
- no obvious privacy leak;
- no hardcoded Mac-only assumption;
- local save/migration;
- action module performance, pokud je součást release;
- accessibility basics;
- Mac/web smoke test podle scope.

## 15. Codex guardrail

```text
Primary platform is Windows.
Mac is secondary dev/design/smoke-test.
Keep TypeScript core platform-independent.
Put OS-specific behavior behind adapters.
Do not declare window/overlay/action performance complete without Windows validation.
Always print exact PowerShell validation commands in the final task response.
Do not change gameplay, data, assets and visual chrome in one task unless the issue explicitly requires all of them.
```

## 16. Důležité pravidlo

> Mac je vývojová pohovka. Windows je hlavní směna. CI je kontrolní brána. A `npm ci` není exorcismus — nejdřív je potřeba přestat držet Rolldown za krk běžícím Vitem.
