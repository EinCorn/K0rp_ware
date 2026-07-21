# K0rp_OS — Desktop Surface Progression

Verze: `0.4.0 pracovní RFC`

## 0. Účel

Tento dokument popisuje, jak se herní postup projeví na pracovní ploše zaměstnance.

```text
progression data
= proč a kdy se něco odemkne

surface progression
= jak se to projeví v OS

module implementation
= co se děje uvnitř appky

product mode
= kde může stejná logika běžet
```

Tyto vrstvy se nesmějí slít do jednoho reduceru.

## 1. Canonical fantasy

K0rp_OS desktop je hlavní hra.

Po přidělení identity hráč nevidí katalog zamčených karet. Vidí téměř prázdnou pracovní stanici:

- dark K0rp wallpaper;
- top rail a taskbar;
- Employee ID;
- clock;
- jasný privacy status;
- Compliance Bin;
- otevřený Audit 00-A.

Audit je document spuštěný startup procedurou. Teprve jeho dokončení zpřístupní první skutečnou aplikaci: ClickAudit.

## 2. Aktuální canonical surface flow

### Start

Viditelné:

- Audit 00-A;
- Compliance Bin;
- shell/status basics.

Neviditelné:

- full module catalog;
- KPI board;
- locked app wall;
- všechny resources;
- Control Room.

### Po Audit 00-A

Přibude:

- ClickAudit shortcut;
- Doručené;
- první memo;
- uložený completed Audit 00-A;
- raw ClickAudit counter uvnitř module window.

Samotný submit nevynutí otevření ClickAuditu ani dalšího auditu.

### Bootstrap packet

První pozdější K0rp_OS click:

- vytvoří quantity-1 packet;
- auto-openne právě jednu Audit 10-A instance;
- používá current document cascade;
- nepůsobí jako reward popup.

### Pozdější ClickAudit packets

Každých dalších 25 clicks:

- vytvoří další audit instance;
- přidá row ve Formulářích;
- neotevře automaticky nové okno;
- neukradne focus;
- explicitní open použije vlastní stable window ID a cascade.

### První Evidence

Přibude nebo se odhalí:

- EV readout;
- Audit 16-C;
- authorization memo/document trail.

### Fidget authorization

Po Audit 16-C:

- EV je alokována;
- Fidget shortcut se nainstaluje;
- Fidget se neotevře bez hráčovy explicitní akce;
- authorization přežije refresh.

### Fidget metric packets

Po třech nových settled sessions:

- vznikne Audit 18-S row ve Formulářích;
- mixed pending count se změní;
- packet creation neotevře okno;
- ClickAudit a Fidget rows používají jednu queue.

## 3. Pacing není surface contract

Starší dokumenty používaly přesná okna typu `0–12 minut`, `35–65 minut` a podobně. Tyto hodnoty jsou historické/provisional balance assumptions.

Surface contract určuje pořadí a význam, ne fixní minutu:

```text
presence
→ raw ClickAudit
→ Evidence
→ Fidget authorization
→ mixed backlog
→ delegation
→ další moduly
```

Přesný pacing se aktualizuje po Tasku 024 a playtest harnessu.

## 4. First-cycle surface expansion

Po ověření current loopu:

### Delegation

Přibude:

- Personnel/Intern artifact;
- assignment document;
- training status;
- delegated source indicator;
- control sample/discrepancy row;
- později samostatná personnel folder nebo panel.

Stážista není anonymní multiplier v taskbaru. Má viditelnou provozní stopu.

### Bloom

Přibude:

- Bloom shortcut;
- Care & Alignment folder;
- Bloom-generated files;
- vlastní packet/audit rows;
- případně module-local integrity readout uvnitř appky.

### Corner Watch

Primárně:

- Settings / Screen Saver page;
- idle report file;
- volitelný user-pinned shortcut;
- žádná povinná nová desktop icon.

### Button Compliance

Přibude:

- shortcut;
- Čekající potvrzení;
- approval/exception documents;
- relevantní late readout až tehdy, kdy má player-facing význam.

### Certifications and closure

Přibude:

- Certifikace;
- Knowledge Base;
- Archiv;
- pending 42-Z;
- cycle reports;
- více temporary forms.

Desktop je zaplněný stopami konkrétních procesů, ne náhodným lootem.

## 5. First audit-cycle closure

Uzavření se projeví jako:

- archivace cycle-scoped files;
- vznik `Audit Cycle 01`;
- odstranění nebo přesun temporary forms;
- zachování permanentních mem/certification artifacts;
- částečný desktop cleanup;
- wallpaper/build mutation;
- krátký reboot;
- instalace nového interaction systemu, provisional Bubble Wrap.

Prestige je reorganizace pracovní stanice, ne pouze reset čísla.

## 6. Window families

### Compact module windows

Current preserved module contents:

```text
ClickAudit 167×167
Fidget    167×167
```

Chrome nesmí content zmenšit, cropnout nebo rescalovat.

### Portrait document windows

Audity, mema, reports a certifications používají portrait-oriented live documents.

- minimize;
- close;
- form cascade;
- live fields/text;
- short forms bez zbytečného inner scrollu;
- dlouhé content scrolluje uvnitř document surface.

### Portrait folder windows

Folder je live list:

- Doručené;
- Formuláře;
- Wellbeing;
- Care & Alignment;
- Čekající potvrzení;
- Certifikace;
- Archiv;
- Knowledge Base;
- later Personnel/Policy/Incidents.

Rows a scrollbars nejsou baked assets.

### Action module windows

Priority Containment a Alignment Rally používají větší content-driven geometry.

Priority provisional:

```text
320×320 logical gameplay viewport
```

Action window:

- se při first open centruje;
- má module controls;
- zachová integer logical coordinates;
- nesmí být natlačen do compact family;
- detached mode může použít přesné integer 2×;
- resize/chrome nesmí měnit game simulation coordinates.

## 7. Curated window-shell progression

Task 024A vytvořil v01 composition contract bez visible runtime změny.

Před player-facing rolloutem:

1. 024B — compact ClickAudit/Fidget pilot;
2. 024C — portrait Audit/Formuláře pilot;
3. 024D — top rail/taskbar/status controls.

V3 pilot PR #43 nebyl přijat. Jeho visuals nejsou surface history ani progression reward.

Asset rules:

- frame nine-slice;
- header three-slice;
- materials tiled native resolution;
- complete shells reference-only;
- live text;
- integer rendering;
- no blur/fractional scale.

## 8. Later operational-response surface

Priority Containment se na desktopu objeví až po:

- standalone greybox gate;
- authorization design;
- accepted action-window contract;
- OS integration task.

Surface candidate:

```text
Operational authorization memo
→ Operational Response folder/procedure
→ Priority Containment shortcut
→ larger action window
→ session closure reports
→ Audit 27-P rows
```

Nesmí se objevit jako náhodná odemčená hra jen proto, že hráč dosáhl vysokého EV.

## 9. Later alignment surface

Alignment Rally vzniká až po vlastní prototype gate.

Candidate:

```text
disputed closure nebo alignment requirement
→ authorization
→ Alignment Rally shortcut
→ argument template files
→ Audit 31-R
→ Alignment Templates capability groups
```

Template claim text je fictional content. Nesmí být external telemetry.

## 10. Control Room progression

Control Room není module launcher.

Odemkne se až ve chvíli, kdy existuje:

- více autorizovaných modulů;
- alespoň jeden delegated operator;
- policy;
- discrepancies;
- potřeba intervention.

Obsah:

- operator assignments;
- loadout templates;
- target weights;
- risk tolerance;
- supervision cadence;
- open discrepancies;
- recent incident summaries;
- module status.

Control Room je důsledek managementu, ne jeho maketa od první minuty.

## 11. Taskbar progression

Early:

```text
EV
PENDING
privacy
clock
open windows
```

Later, pouze pokud odemknuto:

- source split indicator;
- delegation warning;
- discrepancy count;
- policy intervention;
- cycle status.

Raw clicks, spin count, run XP, wave score a claim rally zůstávají v module windows.

Taskbar nemá skončit jako cockpit rozbitého logistického centra dřív, než hráč ví, co čísla znamenají.

## 12. Standalone, web and overlay

### Desktop

- canonical campaign;
- full surface progression;
- shared save/core;
- strongest fiction.

### Web

- fake desktop fallback;
- local browser save;
- stejné IDs/events;
- žádné native window/overlay assumptions;
- action viewport zachová logical scale.

### Standalone modules

- fungují bez campaign save;
- zachovávají tactile/action loop;
- unlinked progress je module-local;
- linked mode posílá aggregate events;
- campaign přijímá pouze authorized module events.

### Overlay

- pozdější companion surface;
- není first-cycle requirement;
- K0rp-only aggregate events;
- privacy status viditelný;
- high-intensity action module není automaticky overlay-compatible.

## 13. Architecture source

```text
korp-core          = ekonomika a význam eventů
korp-progression   = thresholds, forms, authorizations, prestige
korp-surface       = artifacts, windows, folders, mutations
korp-modules       = module/session contracts
korp-ui            = OS/window rendering
```

Surface vrstva poslouchá progression IDs. Nedubluje balance.

## 14. Závěr

> Nový modul se neobjeví jako odemčená karta. Je autorizován, nainstalován a jeho shortcut se fyzicky objeví na ploše zaměstnance.

> Pozdější horda priorit nesmí pohltit plochu. Musí na ní zanechat report, audit, policy a problém, který bude potřeba přidělit někomu dalšímu.

## 15. Machine-readable source

- `packages/korp-progression/data/surface-progression.json`;
- `packages/korp-progression/src/surface-progression.database.ts`;
- future action-module surface IDs až po Tasks 035/038.
