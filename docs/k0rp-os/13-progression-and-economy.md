# K0rp_OS — Progression and Economy

Verze: 0.3.0 pracovní RFC

## 1. Záměr

K0rp_OS není jeden velký clicker. Je to federovaný incremental management systém:

- každý modul má vlastní hmatovou mikro-smyčku;
- modul vytváří doslovnou raw metriku;
- OS metriku balí do auditovatelných packetů;
- audit z packetu vytvoří Evidence;
- Evidence autorizuje další systém;
- nový systém vytváří další metriku, audity a později potřebu delegace;
- hlavní růst je byrokratická hustota, ne pouze velikost čísla.

Canonical kontrakt je v `20-core-loop.md`.

## 2. Audit-first onboarding

První interakcí je `AUDIT 00-A`.

```text
audit field activation
→ clickaudit.click(profile: active-audit-field)
→ local field state
```

Po submitu:

- hráč je přijat do relace;
- odemkne se ClickAudit;
- objeví se Doručené a první memo;
- nevzniká automaticky Evidence pouze za potvrzení existence.

Audit 00-A je iniciační rituál a privacy onboarding, ne první currency faucet.

## 3. Ekonomické vrstvy

### 3.1 Raw metriky

Raw metrika je doslovná aktivita uvnitř modulu.

```text
ClickAudit       → manual click count
Fidget           → rotations / sessionSettled
Bloom            → status changes / waveAdvanced
Button Compliance→ presses / sequenceCompleted
Corner Watch     → observation session / near misses
```

Raw metriky:

- nejsou spendable;
- samy neodemknou modul;
- nesmějí být násobeny tak, aby falšovaly fyzickou činnost;
- mohou tvořit packet, zdrojový breakdown a milestone.

### 3.2 Metric packets

Packet je ohraničená dávka raw metriky čekající na audit.

```text
raw metric threshold nebo natural closure
→ packet
→ pending audit
```

Packet má source, quantity, status a audit template. Packet sám nic nevyplácí.

### 3.3 Evidence

Pro první migraci se používá stávající technický resource:

```text
notionalWorkUnits
```

Player-facing label:

```text
Evidence
EV
```

Evidence znamená množství aktivity, kterou systém uznal jako vykazatelnou.

Evidence vzniká jen certifikací packetu:

```text
pending packet
→ audit instance
→ audit.evidenceCertified
→ Evidence
```

Evidence je spendable/alokovatelná na:

- module permits;
- procedures;
- equipment requisitions;
- delegation slots;
- pozdější systémové autorizace.

### 3.4 Meters

Meters nejsou currency.

- Audit Pressure;
- Entropy;
- Stabilization;
- Compliance Integrity;
- System Order.

Audit Pressure se nemá zvyšovat mechanicky za každý klik. Má postupně odrážet:

- počet pending auditů;
- stáří backlogu;
- počet discrepancies;
- neověřenou delegovanou aktivitu;
- neuzavřené odpovědnosti.

### 3.5 Derived a hidden telemetry

- Perceived Productivity;
- Perceived Control;
- Krypto-management Score;
- další interní interpretace.

Neutrácejí se. Mohou se odhalit dashboardem, memem nebo incidentem.

### 3.6 Module-local resources

Bloom Integrity, Idle Faith, Relief Units, Cleanliness, Alignment, Momentum a další zůstávají uvnitř modulu nebo jeho dokumentace.

### 3.7 Prestige

Audit Findings zůstávají permanentní prestige měnou, ale první prestige balance se nesmí finalizovat před ověřením Metric → Audit → Evidence loopu.

## 4. Canonical core loop

```text
hmatatelná akce
→ okamžitá odezva
→ raw metrika
→ přirozené closure nebo threshold
→ pending packet
→ auditní instance
→ certifikace
→ Evidence
→ autorizace
→ nový modul / pravidlo / surface
```

Bez auditu může existovat aktivita, ale ne uznaná Evidence.

## 5. První ekonomický slice

```text
Audit 00-A
→ ClickAudit
→ 25 raw kliků
→ pending ClickAudit packet
→ Audit 10-A
→ Evidence +1
→ Audit 16-C
→ Evidence alokována
→ Fidget
```

První Evidence má rychle otevřít nový způsob interakce. Nemá být uložena do abstraktního shopu s deseti procentními upgrady.

## 6. ClickAudit integrity

ClickAudit raw counter je doslovný.

```text
1 úmyslný fyzický klik = 1 manual click
```

Povolené upgrady:

- nové vizualizace;
- liquid variants;
- digit cards;
- source breakdown;
- audit batch rules;
- dashboardy;
- interpretace a milestone copy;
- odemykání dalších auditních templates.

Zakázané jako canonical raw count:

- `1 click = 50 clicks`;
- pasivní relay započítaný jako manuální klik;
- retroaktivní přidání falešných fyzických kliků;
- Evidence přímo za každý klik.

## 7. Anti-spam bez měnového nasycení kliků

Starý v0.2 model s přímým NWU multiplierem pro jednotlivé kliky se ruší jako cílový design.

Anti-spam vzniká přirozeně:

- raw klik se vždy počítá;
- pouze uzavřená dávka vytváří packet;
- packet vyžaduje audit;
- backlog omezuje čisté spamování;
- Evidence vzniká z certifikace, ne z rychlosti klikání;
- později může systém vyžadovat různorodost zdrojů nebo kontrolní vzorek.

Hráč není trestán za klikání. Jen nezískává spendable hodnotu bez administrativního uznání.

## 8. Authorization místo klasického shopu

Zásadní systémová změna má preferovat tento tok:

```text
splněná podmínka
→ dostupný formulář
→ alokace Evidence
→ autorizace
→ surface mutation / shortcut / permission
```

Ne každý kosmetický nebo drobný procedure upgrade potřebuje celý formulář. Nový modul, oddělení, delegace nebo významná změna pravidel ano.

## 9. Automation and delegation

Automatizace nesmí odstranit hračku ani falšovat manual metrics.

```text
manual operation
→ assistant handles routine
→ player handles exceptions
→ audit of assistant
→ orchestration across modules
→ audit of orchestration
```

Minimální source categories:

```text
manual
delegated
system-generated
```

Delegovaná aktivita:

- může vytvářet packet;
- má vlastní error/discrepancy rate;
- vyžaduje supervision;
- nemůže sama finálně certifikovat Evidence;
- nesmí se slít s manuální raw metrikou.

## 10. Audit backlog jako progression pressure

Backlog je důležitý přechod mezi active a idle/management vrstvou.

Hráč musí nejdřív pocítit, že audity začínají překážet. Teprve potom se odemyká delegace.

Příliš brzká automatizace by odstranila problém dřív, než se stal herní zkušeností.

## 11. First-cycle pacing

Přesný 4–5hodinový balance pass z v0.2 je provisional a bude přepočítán po Tasks 020–024.

Nejdřív se playtestuje:

```text
Audit 00-A
→ první ClickAudit packet
→ první Evidence
→ Fidget authorization
→ první Fidget packet
→ první skutečný auditní backlog
```

Až potom se finalizují Bloom, Button, Corner, certifikace a první prestige.

## 12. Prestige

První prestige zůstává:

```text
UZAVŘENÍ AUDITNÍHO CYKLU
FORMULÁŘ 42-Z
```

Resetuje cycle state a zachovává identity, mema, certifikace, lifetime stats, permanent upgrades a Audit Findings.

Hlavní odměnou má být nový systém, nikoliv pouze násobitel. Bublinková Fólie zůstává kandidát na post-prestige interaction system.

## 13. Player-facing complexity

Early taskbar:

```text
EV 1
PENDING 2
```

Raw metriky patří do module windows. Skryté KPI se odemykají později.

Na začátku nemá hráč sledovat osm globálních čísel. Složitost se má odemknout jako obsah a administrativní zátěž.

## 14. Ethical retention

Zakázané jako core requirement:

- daily streak;
- propadající odměna;
- energie;
- povinný rare event;
- trest za offline;
- agresivní notification badge;
- monetizace čekání.

Používat:

- uzavření směny;
- archive report;
- voluntary return;
- přirozené closure points;
- nový systém jako odměnu;
- offline report bez trestu.

## 15. Current migration status

Po Tasku 019 runtime stále částečně přidává resources přímo z `clickaudit.click` a machine-readable balance obsahuje staré NWU výnosy.

Tasks 020–024 musí sjednotit:

- korp-core reducer semantics;
- runtime packet/audit state;
- save schema;
- audit forms;
- resources metadata;
- events data;
- upgrade catalog;
- first-cycle CSV/JSON;
- player-facing UI.

Dokud migrace není dokončena, nové feature nesmějí dále rozšiřovat přímý `raw action → currency` model.
