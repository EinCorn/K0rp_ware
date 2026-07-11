# K0rp_OS — desktop surface progression audit

Verze: `0.1.1-draft`

## Výsledek kontroly

Původní progression flow je kompatibilní s vizí falešného operačního systému. Ekonomiku, pořadí modulů, první audit ani první prestige není nutné měnit.

V původním packu ale byla vizuální a desktopová progrese převážně implicitní. Tento addendum ji zapisuje jako samostatnou prezentační vrstvu.

```text
progression database = proč a kdy se něco odemkne
surface database     = jak se to projeví na ploše zaměstnance
module implementation = co se děje uvnitř konkrétní appky
product mode          = kde může stejná logika běžet
```

Tyto čtyři vrstvy se nesmějí slít do jednoho reduceru.

## 1. Canonical fantasy

K0rp_OS desktop je hlavní hra.

Hráč po přidělení identity nevidí launcher plný karet. Vidí skoro prázdnou pracovní plochu:

- tmavý K0rp wallpaper,
- spodní taskbar,
- Employee ID,
- hodiny,
- čitelný privacy status,
- Compliance Bin,
- automaticky otevřené okno auditu 00-A.

Audit je dokument otevřený startup procedurou. Teprve jeho dokončením se na ploše objeví první skutečná aplikace: ClickAudit.

## 2. Jak se plocha zaplňuje

### 0–12 minut

Viditelné:

- Compliance Bin,
- taskbar,
- Audit 00-A.

Po dokončení:

- ClickAudit shortcut,
- Doručené,
- NWU counter,
- uložený schválený audit.

### 12–35 minut

Přibude:

- složka Formuláře,
- soubor 10-A,
- první auditní záznamy,
- procedurální část Start menu.

### 35–65 minut

Přibude:

- Fidget,
- složka Wellbeing,
- Stabilization widget.

Fidget se otevře jako normální interní application window. Není to karta na dashboardu.

### 65–110 minut

Přibude:

- Bloom,
- složka Care & Alignment,
- první soubory, jejichž obsah vzniká hraním modulů.

V této fázi má plocha poprvé působit jako skutečná pracovní stanice s více nástroji.

### 110–145 minut

Corner Watch se primárně instaluje jako:

- screensaver,
- položka v Settings,
- idle surface.

Nemusí okamžitě zabrat další desktop ikonu. Hráč si shortcut může později připnout sám.

### 145–195 minut

Přibude:

- Button Compliance,
- složka Čekající potvrzení,
- Approval Units v taskbaru.

Moduly začnou vytvářet úkoly a soubory jeden pro druhý.

### 195–250 minut

Přibude:

- Certifikace,
- Knowledge Base,
- Archiv,
- pending 42-Z,
- větší množství dočasných formulářů a reportů.

Desktop je zaplněný, ale ne náhodným lootem. Každý objekt je stopa konkrétního procesu.

### 250–275 minut

Uzavření auditního cyklu se projeví jako:

- archivace cycle-scoped souborů,
- vznik složky `Audit Cycle 01`,
- vyčištění části plochy,
- změna wallpaperu,
- zvýšení build number K0rp_OS,
- krátký reboot,
- instalace Bublinkové Fólie.

Prestige je tedy reorganizace pracovní stanice. Ekonomický reset zůstává stejný.

## 3. Window model

### Module windows

ClickAudit, Fidget, Bloom a další moduly běží jako skutečná okna na fiktivní ploše.

Potřebují:

- open/close,
- minimize,
- taskbar state,
- bring-to-front,
- drag,
- uložení poslední pozice,
- volitelný pin.

### Document windows

Audity, mema, reporty, certifikace a knowledge base se otevírají jako dokumenty.

### Folder windows

Složky nejsou dekorace. Jsou čitelný stav hry:

- Doručené,
- Formuláře,
- Wellbeing,
- Care & Alignment,
- Čekající potvrzení,
- Certifikace,
- Archiv,
- Knowledge Base.

## 4. Standalone, web a overlay

Tyto režimy nejsou další stupně první herní kampaně. Jsou to produktové surfaces.

### Desktop

- canonical full game,
- nejsilnější fiction,
- plná desktopová progrese,
- společný save a core.

### Web

- fallback full game v browseru,
- může simulovat stejnou plochu,
- local browser save,
- stejné eventy a unlocky,
- bez skutečného overlay a OS-native window behavior.

### Standalone appky

- jednotlivé moduly fungují samostatně bez K0rp_OS,
- zachovávají původní prokrastinační smyčku,
- bez napojení vedou jen module-local progress,
- při připojení ke K0rp_OS posílají aggregate events,
- global campaign přijímá eventy jen z modulů autorizovaných v daném save.

To brání tomu, aby volně dostupný standalone executable přeskočil herní unlock, ale zároveň zůstává samostatně použitelnou hračkou.

### Overlay

- pozdější companion surface,
- není podmínkou prvního prestige,
- používá stejné module contracts,
- smí posílat jen K0rp-only nebo výslovně povolené agregované eventy,
- privacy režim musí být stále viditelný.

## 5. Architektonické pravidlo

Přidat samostatnou vrstvu:

```text
korp-core          = ekonomika a význam eventů
korp-progression   = thresholds, forms, upgrades, memos, prestige
korp-surface       = desktop artifacts, windows, folders, files, mutations
korp-modules       = jednotlivé appky a jejich contracts
korp-ui            = vykreslení OS a oken
```

Surface vrstva má poslouchat stejné progression ID. Nesmí duplikovat balance.

## 6. Závěr

Flow se s původní vizí nerozchází.

Potřebovalo pouze explicitně zaznamenat, že:

> Nový modul se neobjeví jako odemčená položka v abstraktním menu. Je autorizován, nainstalován a jeho shortcut se fyzicky objeví na ploše zaměstnance.

Stejně tak memo není popup reward, ale soubor v Doručených. Certifikace není badge v profilu, ale dokument. Prestige není pouze reset, ale archivace, úklid, změna buildu a instalace dalšího nesmyslně potřebného nástroje.
