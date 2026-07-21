# K0rp_OS — Module Backlog

Verze: 0.4.0 pracovní návrh

## 1. Účel

Tento dokument drží současné a budoucí moduly K0rp_OS.

Modul není pouze minihra. Je současně:

- samostatná hračka nebo appka;
- zdroj doslovné raw metriky;
- vlastník module-local state;
- potenciální zdroj natural closures a metric packets;
- OS window / standalone / web surface;
- in-universe procedura nebo oddělení;
- budoucí cíl autorizace, delegace a dohledu;
- sensory contract.

Modul sám nevyrábí globální spendable Evidence. Evidence vzniká certifikací jeho packetu.

## 2. Povinný module contract

Každý nový modul musí odpovědět:

1. Jaké je jeho jediné hlavní sloveso?
2. Co je okamžitá sensory promise?
3. V čem se hráč zlepšuje?
4. Co je natural closure?
5. Jaká doslovná raw metrika vzniká?
6. Jak se raw metrika batchuje?
7. Jaký audit ji certifikuje?
8. Co Evidence v modulu autorizuje?
9. Jak se modul později deleguje?
10. Jakou novou chybu automatizace vytváří?

Dále deklaruje:

```text
module ID
category
activity intensity
maturity
supported surfaces
content geometry
privacy profile
raw events
closure events
packet candidate
capability groups
material/sensory profile
accessibility behavior
desktop artifact
folder/category
standalone bridge policy
```

Pokud modul neumí odpovědět bez improvizace alespoň na osm základních otázek, zůstává `idea`, ne `spec`.

## 3. Activity categories and intensity

Categories:

```text
AUDIT / CONFIRMATION
STABILIZATION / REGULATION
CARE / CLEANING
ALIGNMENT
IDLE / SCREENSAVER
ATTENTION SPLIT
DESK OBJECT
OPERATIONAL RESPONSE
MANAGEMENT / ORCHESTRATION
```

Intensity spectrum:

- low: Fidget, Bubble Wrap, Zen, Newtonova Kolíbka, Surface Compliance;
- medium: ClickAudit, Bloom, Shape Compliance, Alignment Rally;
- high: Priority Containment a budoucí incident-response modules;
- management: stážista, policy, discrepancy review a Control Room.

Intenzita není quality tier.

## 4. Current modules

### ClickAudit

Status: workshop/playable  
Category: AUDIT / CONFIRMATION  
Intensity: medium  
Geometry: compact square `167×167`

Core fantasy:

> Klik je důkaz přítomnosti, dokud audit nerozhodne, co měl znamenat.

Raw metric a flow:

```text
clickaudit.click
→ bootstrap quantity 1 / později quantity 25
→ Audit 10-A
→ Evidence +1 po certifikaci
```

Sensory promise:

- digit flip;
- liquid progress;
- přesný click feedback;
- milestone ceremony bez permanentního ohňostroje.

Automation risk:

- delegated/system activity vydávaná za manual click;
- stále složitější interpretace téhož raw kliknutí.

### Fidget

Status: workshop/playable, integrated  
Category: STABILIZATION  
Intensity: low  
Geometry: compact square `167×167`

Core fantasy:

> Pozornost lze stabilizovat tím, že ji odvedeme.

Flow:

```text
úmyslný spin
→ natural settle
→ fidget.sessionSettled
→ packet po 3 sessions
→ Audit 18-S
→ Evidence +1 po certifikaci
```

Sensory promise:

- spin-up;
- resonance;
- coast-down;
- natural settle.

Automation risk:

- libovolný pohyb překlasifikovaný jako stabilizace;
- optimalizace RPM zničí účel modulu.

### Bloom

Status: workshop/playable, global integration pending  
Category: CARE / CLEANING  
Intensity: medium

Core fantasy:

> Compliance zahrádka, kde kameny vypadají jako myšlenky a myšlenky jako úkoly.

Candidate flow:

```text
bloom.tileClicked / matchCleared
→ bloom.waveAdvanced
→ Bloom packet
→ audit
→ Evidence
```

Module-local values:

- Bloom Integrity;
- score;
- wave;
- stone distribution.

Automation risk:

- systém přebarví stav bez odstranění problému;
- optimalizuje green ratio místo closure.

## 5. First-cycle candidates

### Button Compliance

Status: spec candidate  
Category: AUDIT / CONFIRMATION

- fyzický panel, relays a lights;
- presses a sequence closure;
- exceptions a false positives;
- Approval Units mohou být pozdější module-local nebo late-system value, ne early second Evidence;
- nesmí být reflexní trest;
- vhodný pro authorization a confirmation workflows.

Automation risk: systém potvrzuje vlastní potvrzení nebo dvě procedury čekají jedna na druhou.

### Corner Watch

Status: spec candidate  
Category: IDLE / SCREENSAVER

- logo bounce, near miss, corner hit a observation closure;
- primárně Settings/screensaver surface;
- corner hit není mandatory rare gate;
- report může vzniknout i bez aktivního pohledu.

Automation risk: systém vykáže pozorování během nepřítomnosti nebo near miss přejmenuje na dostatečný roh.

### Bublinková Fólie

Status: spec candidate  
Category: STABILIZATION

- pop / drag / sheet closure;
- defective/rare/reinforced materials;
- post-prestige new interaction system candidate;
- vyžaduje audio variance a density management;
- rare bubble nesmí být FOMO gate.

Automation risk: automatické praskání odstraní tactile value a vytvoří sheet-integrity audit.

## 6. Desk Object / ASMR-adjacent candidates

### Newtonova Kolíbka

- controlled/fake physics;
- pull/release;
- motion-ended closure;
- material variants;
- Momentum a Transferred Responsibility jsou module-local/interpretive;
- špatná animace zabije nápad.

### Zenová Zahrádka

- rake strokes, sand, stones a pattern closure;
- free i procedural mode;
- nesmí být mrtvý drawing canvas;
- automatizace může optimalizovat počet čar a zničit samotný pattern.

## 7. Care / Cleaning / Alignment candidates

### Surface Compliance

- wipe masks;
- material profiles;
- clean patch a surface closure;
- hidden residue/files;
- native-resolution tiles, žádné roztažené textury;
- automatizace odstraní povrchový důkaz místo příčiny.

### Shape Compliance

- drag / rotate / snap;
- set closure;
- přesná tolerance;
- keyboard alternative;
- špatné snapování je otrava, ne satisfakce;
- automatizace může numericky alignovat vizuálně špatný tvar.

## 8. Attention candidate

### Attention Runner

- low-input companion strip;
- jump/avoidance/run closure;
- až po prvním uzavřeném auditním cyklu;
- nesmí převzít hlavní ekonomiku ani změnit desktop v arcade catalog.

## 9. Operational-response candidate

### Priority Containment — Zadržování priorit

Status: **approved for future standalone greybox**  
Category: OPERATIONAL RESPONSE  
Intensity: high  
Geometry: action square `320×320` provisional

Core fantasy:

> Hráč je dostupná kapacita v prostoru zaplněném prioritami, které lze odrazit, routovat, sloučit, vrátit nebo administrativně uzavřít.

Hlavní sloveso:

```text
pohybovat se
→ držet prostor
→ směrovat tlak
→ skládat routing build
```

První scope:

- movement;
- autofire;
- Triage Pulse;
- 3 basic archetypes, 1 elite a 1 boss;
- 5 waves;
- 12 upgrades maximum;
- 4–6 minute closure.

Raw candidate events:

```text
priority.deflected
priority.rerouted
priority.duplicateMerged
priority.escalationContained
priority.sessionClosed
priority.sessionExceeded
```

Packet candidate až po playtestu:

```text
2 closed sessions
→ priority packet
→ Audit 27-P
→ Evidence po certifikaci
```

Module-local values:

- run XP;
- wave;
- build;
- capacity;
- routed/closed counts.

Run XP po session zaniká a nikdy není Evidence.

Automation path:

```text
assist
→ delegated operator
→ policy
→ supervision
```

Automation risks:

- P0 označen jako duplicate;
- nonexistent owner;
- throughput optimalizován proti kritickému cíli;
- exception na auditně citlivé prioritě;
- closure bez prokázaného výsledku.

Podrobný RFC: `21-activity-spectrum-and-arcade-modules.md`.

## 10. Alignment candidate

### Alignment Rally — Argument Routing

Status: **approved as later standalone experiment**  
Category: ALIGNMENT  
Intensity: medium/high

Core fantasy:

> Hráč neodráží míček. Odráží požadavek a každým zásahem mění jeho administrativní stav.

Response zones:

```text
EVIDENCE / SCOPE / OWNER / DEPENDENCY
```

Closure outcomes:

```text
ACCEPTED
REJECTED
DEFERRED
OWNER ASSIGNED
SENT OFFLINE
MEETING REQUIRED
NO DECISION RECORDED
```

Raw candidate events:

```text
argument.responseLogged
argument.qualifierAttached
argument.claimSplit
argument.commitmentCreated
alignment.sessionClosed
alignment.sentOffline
```

Packet candidate až po playtestu:

```text
3 closed sessions
→ alignment packet
→ Audit 31-R
→ Evidence po certifikaci
```

Automation risks:

- bot požádá sám sebe o podklady;
- Circle Back loop;
- no-objection self-approval;
- nekonečný offline follow-up.

## 11. Management / Orchestration

Management není jedna minihra. Je pozdější systém přes moduly.

### Personnel / intern

- delegated raw source;
- předvyplnění auditu;
- module assignment;
- training;
- confidence;
- discrepancies;
- capability bez plné authorization.

### Policy Control Room

- loadout templates;
- target weights;
- risk tolerance;
- exception allowlist;
- supervision cadence;
- intervention threshold;
- incident summaries.

Control Room není early launcher. Odemkne se až po více automatizovaných procesech.

## 12. Value map

### Global

```text
Evidence / EV
→ jediná hlavní early spendable currency
```

### Raw metrics

```text
ClickAudit           → manual clicks
Fidget               → settled sessions
Bloom                → status changes / waves
Corner Watch         → observation closures
Bubble Wrap          → popped bubbles / sheets
Button Compliance    → presses / sequences
Newtonova Kolíbka    → motion closures
Zenová Zahrádka      → pattern closures
Surface Compliance   → cleaned surfaces
Shape Compliance     → completed sets
Priority Containment → operational session closures
Alignment Rally      → alignment session closures
```

### Module-local/session values

- run XP;
- score;
- wave;
- Bloom Integrity;
- Momentum;
- Cleanliness;
- Alignment state;
- material state.

Module-local value není global resource a nepatří na early taskbar.

### Persistent non-currency values

- authorization;
- capability group;
- proficiency;
- known upgrade;
- policy template;
- operator training.

## 13. Capability groups

Ne každý upgrade potřebuje vlastní formulář.

```text
Routing Procedures I
→ Return to Sender
→ Owner Assignment
→ Reprioritize

Alignment Templates I
→ Need More Data
→ Scope Reduction
→ Parking Lot
```

Capability může být objevena hraním, ale do persistentního draft poolu vstoupí až po autorizaci.

## 14. Unlock manifestation

Každý modul deklaruje:

- authorization form;
- desktop artifact;
- folder/category;
- installation notification;
- taskbar widget, pokud je skutečně potřebný;
- Settings/screensaver integration;
- standalone bridge policy;
- web fallback;
- reset scope.

Příklady:

- ClickAudit → shortcut po 00-A;
- Fidget → shortcut po 16-C;
- Bloom → Care & Alignment;
- Corner Watch → Settings/screensaver;
- Button Compliance → Čekající potvrzení;
- Bubble Wrap → post-prestige install;
- Priority Containment → operational authorization + action window;
- Alignment Rally → alignment authorization + argument templates.

## 15. Standalone contract

Standalone verze:

- zachovává hlavní tactile/action loop;
- funguje bez campaign save;
- může mít module-local progress;
- linked mode posílá pouze aggregate K0rp events;
- campaign přijímá rewards jen z authorized modulu;
- nemění event semantics proti OS window;
- nevyžaduje overlay ani account.

Action prototype je nejdřív standalone, aby se ověřila jeho vlastní hratelnost bez podpory auditní ekonomiky.

## 16. Sensory contract

Každý modul doplní:

- material profile;
- micro/meso/ceremonial/systemic feedback;
- density limit;
- reduce-motion variantu;
- audio-off behavior;
- natural closure;
- čitelnost bez zvuku;
- input alternative.

High-intensity modul navíc:

- peak-density readability;
- music escalation/de-escalation;
- screen-shake off;
- integer scaling;
- žádný plný sample pro každý objekt při husté vlně.

## 17. Release grouping

### Current core

- ClickAudit;
- Fidget;
- Bloom standalone.

### First-cycle integration

- Bloom global integration;
- Button Compliance;
- Corner Watch;
- Bubble Wrap post-prestige.

### Regulation expansion

- Newtonova Kolíbka;
- Zenová Zahrádka;
- Surface Compliance;
- Shape Compliance.

### Action R&D

- Priority Containment first;
- Alignment Rally second.

Action R&D neodsouvá first-cycle data parity a delegation gate.

## 18. Důležité pravidlo backlogu

> Nový modul je povolený jen tehdy, když umí být hračka, proces, raw metric source, budoucí auditní problém a in-universe absurdita.

> Jestli je pouze zábavnější než zbytek produktu a nepotřebuje K0rp_OS, nevznikl modul. Vznikla jiná hra, která si omylem nechala firemní ikonku.
