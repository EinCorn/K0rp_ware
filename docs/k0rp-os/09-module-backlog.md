# K0rp_OS — Module Backlog

Verze: 0.2.0 pracovní návrh

## 1. Účel

Tento dokument drží aktuální a budoucí moduly K0rp_OS.

Modul není jen minihra. Modul je:

- samostatná hračka / appka,
- zdroj eventů,
- producent resources,
- potenciální okno v K0rp_OS,
- potenciální standalone app,
- potenciální overlay mini widget,
- in-universe oddělení nebo procedurální nástroj.

## 2. Module contract

Každý modul musí odpovědět na otázky:

```text
Co uživatel dělá?
Proč je to uspokojivé?
Jaký je korporátní bullshit wrapper?
Jaké eventy modul emituje?
Jaké resources produkuje?
Kde může běžet?
Jaký je privacy profile?
Jak se škáluje v incremental systému?
Jak se projeví na canonical desktopu?
Jaký má sensory a closure contract?
```

## 3. Categories

```text
AUDIT / CONFIRMATION
STABILIZATION
CARE / CLEANING
ALIGNMENT
IDLE / SCREENSAVER
ATTENTION SPLIT
DESK OBJECT
```

## 4. Current v0.3 modules

### ClickAudit

Status: workshop/playable  
Category: AUDIT / CONFIRMATION

Core fantasy: klik je důkaz přítomnosti.

Produces Audit Pressure, NWU a Perceived Productivity. Riziko: bez ceremonial reward a in-universe consequences se zredukuje na counter.

### Fidget

Status: workshop/playable  
Category: STABILIZATION

Core fantasy: pozornost lze stabilizovat tím, že ji odvedeme.

Produces Stabilization, Entropy Reduction a Perceived Control. Musí zůstat hmatový a hypnotický, ne cirkusový.

### Bloom

Status: workshop/playable  
Category: CARE / CLEANING

Core fantasy: compliance zahrádka, kde kameny vypadají jako myšlenky a myšlenky jako úkoly.

Produces Compliance Integrity, System Order a Bloom Integrity. Musí držet rozdíl mezi cute puzzle a znepokojivou péčí.

## 5. Candidate v0.4 — First Expansion

### Corner Watch

Category: IDLE / SCREENSAVER.

- sledovat odrážející se logo;
- near miss / corner hit / session completed;
- Idle Faith a Patience Units;
- primárně se instaluje jako screensaver;
- corner hit není povinný pro hlavní progression;
- nepřekomplikovat.

### Bublinková Fólie

Category: STABILIZATION.

- pop / drag / sheet completion;
- Relief Units a Pressure Released;
- defective/rare/reinforced materials;
- post-prestige nový-system reward;
- bez dobrého audio/visual feedbacku bude slabá.

### Button Compliance

Category: AUDIT / CONFIRMATION.

- fyzický panel, kontrolky a sekvence;
- Approval Units;
- potvrzování potvrzení;
- false-positive a exception routing;
- nemá být reflex-game peklo.

## 6. Candidate v0.5 — Desk Object / ASMR-adjacent

### Newtonova Kolíbka

- fake/controlled physics;
- Momentum a Transferred Responsibility;
- přirozený motion-ended closure;
- material variants;
- špatná animace zabije nápad.

### Zenová Zahrádka

- rake strokes, písek, kameny a patterny;
- Procedural Calm a Sand Alignment;
- free mode i procedural mode;
- nesmí být jen mrtvý drawing canvas.

## 7. Candidate v0.6 — Care / Cleaning / Alignment

### Surface Compliance

- wipe masks a material profiles;
- Cleanliness, Compliance Integrity a System Order;
- hidden residue/files;
- technicky náročnější, nedělat uspěchaně.

### Shape Compliance

- drag / rotate / snap;
- Alignment a Closure;
- přesná tolerance a keyboard alternative;
- špatné snapování bude otravné místo satisfying.

## 8. Candidate v0.7 — Attention Corruption

### Attention Runner

- low-input companion strip;
- Attention Residue a satirický Dopamine Drift;
- až po první closure smyčce;
- nesmí změnit K0rp_OS v běžný arcade launcher.

## 9. Resource map

```text
ClickAudit          → Audit Pressure, Notional Work Units
Fidget              → Stabilization, Entropy Reduction
Bloom               → Compliance Integrity, System Order
Corner Watch        → Idle Faith, Patience Units
Bublinková Fólie    → Relief Units, Pressure Released
Button Compliance   → Approval Units, Krypto-management Score
Newtonova Kolíbka   → Momentum, Transferred Responsibility
Zenová Zahrádka     → Procedural Calm, Sand Alignment
Surface Compliance  → Cleanliness, Compliance Integrity
Shape Compliance    → Alignment, Closure
Attention Runner    → Attention Residue, Dopamine Drift
Work Blob           → Notional Work Units
```

## 10. Release grouping

```text
v0.3 current:
- ClickAudit
- Fidget
- Bloom

first-cycle integration:
- Button Compliance
- Corner Watch
- post-prestige Bublinková Fólie

later:
- Newtonova Kolíbka
- Zenová Zahrádka
- Surface Compliance
- Shape Compliance
- Attention Runner
```

Technické pořadí se řídí engine value v `07-roadmap.md`, ne pouze původním číslováním release group.

## 11. Naming bank

```text
Oddělení Auditního Pohybu
Oddělení Opakovaného Souhlasu
Oddělení Taktilního Uklidnění
Oddělení Povrchové Nápravy
Oddělení Tvarové Konformity
Oddělení Rohového Očekávání
Oddělení Rozdělené Pozornosti
Oddělení Rituálního Hrablání
Oddělení Přenesené Odpovědnosti
Kinetická Pomůcka Manažerské Přítomnosti
Certifikovaná Písečná Plocha
Relaxační Fólie pro Procesní Úlevu
```

## 12. Důležité pravidlo backlogu

> Nový modul je povolený jen tehdy, když umí být zároveň hračka, proces, resource producer a in-universe absurdita.

## 13. Module unlock manifestation

Každý modul musí deklarovat:

```text
desktop artifact
folder/category
installation notification
taskbar widget, pokud existuje
settings/screensaver integration, pokud existuje
standalone bridge policy
web fallback surface
```

Příklady:

- ClickAudit → desktop shortcut po `00-A`;
- Fidget → shortcut + Wellbeing folder;
- Bloom → shortcut + Care & Alignment;
- Corner Watch → primárně screensaver + Settings page;
- Button Compliance → shortcut + Čekající potvrzení;
- Bubble Wrap → post-prestige instalovaný shortcut.

## 14. Standalone zachování modulu

Standalone verze není marketingový preview.

- zachovává hlavní tactile/procrastination loop;
- funguje bez campaign save;
- může mít module-local progress;
- při připojení posílá jen aggregate K0rp events;
- nesmí vyžadovat overlay ani account;
- nesmí měnit význam eventů oproti OS window verzi.

## 15. Sensory contract

Každý nový modul musí doplnit:

- material profile;
- micro/meso/ceremonial feedback;
- density limit;
- reduce-motion variantu;
- audio-off behavior;
- přirozený closure point.

Bez toho může být modul funkčně správný a přesto senzoricky mrtvý.
