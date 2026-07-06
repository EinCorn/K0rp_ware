# K0rp_OS — Platform & Dev Workflow

Verze: 0.1.3 pracovní návrh

## 1. Platform decision

Primární release/test platforma pro K0rp_OS je **Windows**.

Mac je důležité sekundární vývojové a testovací prostředí, ale není primární target. Mac existuje hlavně proto, že Daniel doma často sedí s MacBookem na klíně, používá Apple ekosystém, snadno přenáší soubory, dělá grafiku na tabletu a může tak pokračovat v práci bez toho, aby musel fyzicky přejít ke stolu a zapnout „seriózní vývojářský režim“.

To není slabina workflow. To je realita workflow.

K0rp_OS proto musí být navržen tak, aby šel rozvíjet ve dvou režimech:

```text
Couch Mode / Mac
- pohodlné psaní docs
- design, assety, nápady, review
- web/dev preview
- základní cross-platform smoke test
- práce na TypeScript core logice

Desk Mode / Windows
- primární desktop testing
- Tauri desktop behavior
- overlay behavior
- window transparency / always-on-top
- installer/build behavior
- final UX feel pro hlavní platformu
```

## 2. Why Windows first

Windows je primary target, protože:

- většina reálného „pracovního desktop“ feelingu u cílového použití bude Windows,
- K0rp_OS má působit jako falešný pracovní systém / corporate desktop / overlay,
- overlay režim, always-on-top lišty, malé desktop widgety a chování oken je potřeba ladit hlavně tam,
- Windows verze má být první, která se bude brát jako skutečný release candidate.

Mac build má existovat a měl by být použitelný, ale nemá určovat finální UX rozhodnutí, pokud se chování Windows a macOS liší.

## 3. Cross-platform principle

K0rp_OS je **TypeScript-first / web-native** systém, takže většina logiky má být platform-independent:

```text
Platform independent:
- korp-core
- korp-modules
- event model
- resource economy
- unlock logic
- copy/content packs
- most React/web UI
- web mode

Platform sensitive:
- Tauri window config
- transparency
- drag regions
- always-on-top behavior
- overlay hitbox
- global click/activity bridge
- installers
- OS permissions
- filesystem paths
```

Pravidlo:

> Co může být napsané jako čistý TypeScript bez OS znalosti, musí být napsané jako čistý TypeScript bez OS znalosti.

OS-specific věci patří do úzké vrstvy adaptérů, ne do herního core.

## 4. Two-clone workflow

Repo bude existovat minimálně na dvou strojích:

```text
Mac clone
- aktuální pohodlný dev/design clone
- rychlé změny docs/core/ui
- test webu a běžných app shell věcí

Windows clone
- primary platform clone
- desktop/Tauri test
- overlay test
- release/build test
```

Oba clony musí pracovat s `main` jako source of truth, pokud Daniel explicitně neřekne jinak.

Doporučený začátek práce na libovolném stroji:

```bash
cd ~/Projects/K0rp_ware   # Mac example
# nebo Windows cesta podle lokálního umístění
git checkout main
git pull --ff-only origin main
npm install
npm run sync:korp-ui
```

Po práci:

```bash
git status
npm run build   # pokud dává smysl pro daný typ změny
git add .
git commit -m "..."
git push origin main
```

Na druhém stroji vždy nejdřív:

```bash
git checkout main
git pull --ff-only origin main
npm install
npm run sync:korp-ui
```

## 5. Couch Mode vs Desk Mode

### Couch Mode / Mac

Používat pro:

- docs a product vision,
- module backlog,
- screen concepts,
- copywriting,
- pixelart / asset přípravu,
- Figma/design review,
- TypeScript modely,
- `korp-core`, `korp-modules`, testy,
- web preview,
- rychlé „je to vůbec dobrý nápad?“ iterace.

Neuzavírat v Couch Mode:

- že overlay funguje správně,
- že window behavior je finální,
- že transparency/hitbox je ready,
- že Windows installer/release je ok,
- že desktop appka má finální pocit.

### Desk Mode / Windows

Používat pro:

- primární UX test,
- Tauri desktop appky,
- overlay lištu,
- always-on-top a transparentní okna,
- reálné rozměry a DPI,
- fullscreen/multimonitor edge cases,
- release build,
- final sanity check před tag/release.

Desk Mode je „seriózní směna“. Couch Mode je „vývojové rozjímání pod dekou“. Obě jsou legitimní, jen nesmí předstírat, že jsou totéž.

## 6. Platform labels for issues/tasks

Pro budoucí issues/tickets používat jednoduché labely:

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
```

Každý task by měl říct, kde se má testovat:

```text
Test target:
- Mac ok
- Windows required
- Web only
- Cross-platform
```

Příklad:

```text
Task: Add korp-core resource reducer
Test target: Cross-platform / Mac ok
Reason: pure TypeScript, no OS behavior.
```

```text
Task: Tune overlay hitbox
Test target: Windows required
Reason: primary release platform and OS-specific window behavior.
```

## 7. Path and script conventions

Docs nesmí předpokládat jen jednu absolutní cestu. Uvádět raději:

```text
repo root
```

než konkrétní Mac/Windows path, pokud není potřeba.

Když je potřeba příklad:

```bash
# macOS example
cd ~/Projects/K0rp_ware
```

```powershell
# Windows example
cd $HOME\Projects\K0rp_ware
```

Scripts by měly fungovat přes npm package scripts, ne přes platform-specific shell hacky, pokud to jde.

Preferovat:

```bash
npm run dev
npm run build
npm run test
npm run sync:korp-ui
```

Až později můžeme doplnit `dev:windows`, `dev:mac`, `build:windows`, `build:mac`, pokud bude potřeba.

## 8. Release policy

První veřejně míněný desktop release má být Windows-first.

Doporučené release gates:

```text
Web build passes
Core tests pass
Windows desktop app starts
Windows overlay/window behavior manually checked
No obvious privacy leak
No hardcoded Mac-only assumptions
Mac smoke test optional but useful
```

Mac release může následovat, ale nemá brzdit Windows MVP, pokud není problém ve sdíleném core/UI.

## 9. Codex guardrail

Codex / AI implementační tasky musí respektovat:

```text
Primary platform is Windows.
Mac is a secondary development/test/design environment.
Do not implement Mac-only assumptions as default behavior.
Keep TypeScript core platform-independent.
Put OS-specific behavior behind adapters.
Mark any Tauri/window/overlay change as requiring Windows testing.
```

Zakázané defaulty:

```text
- hardcodovat macOS path jako jedinou možnost,
- považovat macOS window behavior za finální,
- ladit overlay pouze podle Macu,
- přidávat OS-specific logiku do korp-core,
- měnit primary target na Mac jen proto, že se zrovna pohodlně testuje na MacBooku.
```

## 10. Summary

K0rp_OS je web-native a modular-first, ale jeho primární tělo je Windows desktop.

Mac je vývojová pohovka, designový stolek a druhé zrcadlo. Windows je hlavní směna.
