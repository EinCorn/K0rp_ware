# K0rp_OS — Product Modes

Verze: 0.4.0 pracovní návrh

## 1. Dvě osy, které se nesmějí míchat

### Herní progression

```text
Audit 00-A
→ ClickAudit
→ Evidence
→ Fidget
→ mixed backlog
→ delegation
→ další moduly
→ audit cycle closure
→ pozdější action/management systems
```

### Product surfaces

```text
K0rp_OS desktop
↔ web fallback
↔ standalone modules
→ později Windows overlay
→ volitelně account/sync
```

Standalone release není campaign unlock. Produktový mode určuje, kde modul běží. Progression určuje, zda a jak je modul v konkrétním save autorizovaný.

## 2. Canonical desktop mode

Hlavní produkt a nejsilnější fiction.

Obsah:

- fake desktop;
- taskbar/top rail;
- windows;
- folders/documents;
- module shortcuts;
- packet/audit queue;
- Evidence/authorization;
- surface mutations;
- delegation a později Control Room;
- local save.

Desktop je hlavní hra. Modul není karta v launcheru, ale nainstalovaná procedura na pracovní stanici.

## 3. Web fallback

Účel:

- dostupná browser verze;
- rychlé testování;
- local browser save;
- stejná core/progression IDs;
- žádné native Tauri assumptions.

Omezení:

- žádné true transparent detached windows;
- žádný OS overlay;
- některé platform behavior se simuluje;
- integer logical canvas se stále zachovává;
- action module používá stejné logical coordinates jako desktop.

Web není „lite ekonomika“. Herní význam eventů zůstává stejný.

## 4. Standalone module mode

Každý vhodný modul může existovat jako samostatná appka.

Standalone musí:

- zachovat hlavní tactile/action loop;
- fungovat bez campaign save;
- mít vlastní local settings;
- umět čistě skončit;
- nepředstírat globální Evidence;
- používat stejný module engine jako OS window, pokud to architektura dovoluje.

### Unlinked mode

- žádný campaign reward;
- module-local stats/progress;
- žádný account nutný;
- žádný raw external telemetry.

### Linked mode

- explicitní spojení s K0rp_OS;
- pouze aggregate K0rp events;
- campaign přijímá progression-bearing events jen pro autorizovaný modul;
- manual/delegated/system source se zachová;
- žádný raw pointer stream, screenshot, external app context nebo free text.

## 5. Standalone action prototype mode

Priority Containment a Alignment Rally se nejdřív testují standalone jako greybox.

Důvod:

- ověřit hlavní verb bez podpory Evidence;
- ověřit session length a buildcraft;
- zabránit tomu, aby auditní ekonomika maskovala slabou hru;
- profilovat výkon a logical viewport;
- testovat accessibility/intensity.

Prototype mode:

- nemá OS packet;
- nemá Evidence;
- nemá campaign authorization;
- může mít run-local XP;
- ukládá pouze explicitně definované local settings/results;
- není automaticky public standalone release.

Po accepted gate může stejný module engine získat OS adapter.

## 6. Compact versus action standalone geometry

### Compact modules

Current:

```text
ClickAudit 167×167 content
Fidget    167×167 content
```

Standalone shell/chrome nesmí content zmenšit.

### Action modules

Priority provisional:

```text
320×320 logical viewport
```

Allowed:

- exact 1×;
- exact integer 2× detached presentation;
- větší window family.

Zakázané:

- fractional simulation scaling;
- natlačení do 167×167;
- jiná event semantics jen kvůli větší surface.

## 7. Overlay mode

Pozdější Windows-first companion.

Scope candidate:

- always-on-top strip;
- quick launch;
- privacy status;
- small K0rp-only widgets;
- optional compact modules;
- aggregate events;
- no external activity spying.

High-intensity action module není automaticky overlay-compatible. Priority Containment může být dostupný jako explicitně otevřené větší detached window, ne jako malý overlay strip.

## 8. Account/sync mode

Až po stabilním local-first systému.

Povolené:

- progress;
- settings;
- authorizations;
- cosmetics;
- policy IDs/templates, pokud jsou bezpečné;
- export/delete.

Zakázané:

- raw pointer history;
- external app names;
- URL;
- screenshots;
- free-text claims;
- full action replay;
- povinný login pro single-player/standalone.

## 9. Bridge contract

```text
standalone module
→ local runtime
→ optional explicit bridge
→ aggregate KorpEvent
→ K0rp_OS validates authorization/source
→ core/progression resolver
```

Bridge nesmí:

- změnit raw metric cardinality;
- přidat EV přímo;
- obejít packet/audit;
- vydávat delegated/system output za manual;
- poslat každé physics tick/collision;
- otevřít cloud telemetry zadními vrátky.

## 10. Surface parity

Stejný modul napříč surfaces zachovává:

- module ID;
- raw event semantics;
- natural closure;
- source classification;
- accessibility settings semantics;
- module-local mechanics;
- privacy contract.

Může se lišit:

- chrome;
- placement;
- window size;
- input adapter;
- bridge availability;
- presentation detail;
- campaign authorization status.

## 11. Release order

```text
1. canonical desktop + web fallback
2. current standalone modules hardening
3. local aggregate bridge
4. action standalone greybox prototypes
5. accepted action OS integration
6. Windows overlay
7. optional account/sync
```

Action prototype nemusí čekat na overlay/cloud. Nesmí ale přeskočit vlastní playtest gate.

## 12. Důležité pravidlo

> K0rp_OS je hlavní hra. Standalone modul je legitimní produkt i testovací surface. Nesmí se ale stát lepší hrou, která používá K0rp_OS jen jako nepříjemný účetní formulář mezi runy.
