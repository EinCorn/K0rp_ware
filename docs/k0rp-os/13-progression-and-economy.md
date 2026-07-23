# K0rp_OS — Progression and Economy

Verze: 0.4.0 pracovní RFC

## 1. Záměr

K0rp_OS není jeden velký clicker. Je to federovaný incremental management systém:

- každý modul má vlastní hmatovou nebo prostorovou mikro-smyčku;
- modul vytváří doslovnou raw metriku;
- některé moduly mají krátkou session a dočasný build;
- OS raw closures balí do auditovatelných packetů;
- audit z packetu vytvoří Evidence;
- Evidence autorizuje další systém nebo capability group;
- nový systém vytváří další metriku, audity a backlog;
- delegace převezme rutinu, ale vytvoří dohled a výjimky;
- hlavním spektáklem je byrokratická hustota, ne pouze velikost čísla.

Canonical kontrakt je v `20-core-loop.md`. Activity spectrum a action-module návrhy jsou v `21-activity-spectrum-and-arcade-modules.md`.

## 2. Audit-first onboarding

První interakcí je Audit 00-A.

```text
audit field activation
→ clickaudit.click(profile: active-audit-field)
→ local field state
```

Po submitu:

- hráč je přijat do relace;
- odemkne se ClickAudit;
- objeví se Doručené a první memo;
- nevzniká Evidence pouze za potvrzení existence.

Audit 00-A je iniciační rituál a privacy onboarding, ne currency faucet.

## 3. Čtyři druhy hodnoty

### 3.1 Raw metrika

Doslovná aktivita uvnitř modulu:

```text
ClickAudit           → manual clicks
Fidget               → settled sessions
Bloom                → status changes / waves
Priority Containment → operational session closures
Alignment Rally      → alignment session closures
```

Raw metriky:

- nejsou spendable;
- samy neodemknou modul;
- nesmějí být násobeny tak, aby falšovaly fyzickou činnost;
- mohou být klasifikovány, agregovány, batchovány a auditovány.

### 3.2 Run-local XP a session state

High-intensity nebo build-based modul smí mít dočasné XP:

```text
raw action uvnitř session
→ run XP
→ level-up volba
→ dočasný build
→ closure
→ run XP zanikne
```

Run-local XP:

- nepatří do global `KorpState.resources`;
- není Evidence;
- není synchronizovaná globální peněženka;
- nemůže sama autorizovat modul;
- slouží pouze rytmu, buildcraftu a pocitu síly během konkrétní session.

Module-local score, combo, wave a build jsou stejná vrstva.

### 3.3 Evidence

Pro první migraci se používá technical resource ID:

```text
notionalWorkUnits
```

Player-facing label:

```text
Evidence
EV
```

Evidence znamená aktivitu, kterou systém uznal jako vykazatelnou.

```text
pending packet
→ audit instance
→ audit.evidenceCertified
→ Evidence
```

Evidence je jediná hlavní early global spendable currency.

Použití:

- module permits;
- procedures;
- equipment requisitions;
- capability groups;
- delegation slots;
- pozdější policy/system authorizations.

### 3.4 Authorization, capability a proficiency

Nejsou měny.

```text
authorization
= systém dovolil modul nebo procedure používat

capability
= hráč nebo jednotka prokázala, že funkci umí vykonat

proficiency
= persistentní zkušenost/znalost uvnitř autorizovaného systému
```

Důležitý invariant:

> Capability není authorization.

Hráč může capability objevit v session, ale do persistentního draft poolu se dostane až po schválené authorization group.

## 4. Meters a skryté telemetry

Meters nejsou currency:

- Audit Pressure;
- Entropy;
- Stabilization;
- Compliance Integrity;
- System Order.

Audit Pressure se odvozuje z:

- pending auditů;
- stáří backlogu;
- discrepancies;
- neověřené delegated activity;
- neuzavřených odpovědností.

Nemá růst za každý projectile impact nebo klik.

Derived telemetry:

- Perceived Productivity;
- Perceived Control;
- Krypto-management Score;
- throughput interpretations;
- confidence;
- administrative density.

Neutrácejí se. Odhalují se dashboardem, memem, incidentem nebo reportem.

## 5. Canonical core loop

```text
hmatatelná nebo prostorová akce
→ okamžitá odezva
→ raw metrika
→ natural closure / threshold
→ pending packet
→ auditní instance
→ certifikace
→ Evidence
→ authorization
→ nový modul / capability / surface
→ více raw metrik
→ backlog
→ delegace
→ discrepancy
```

Bez auditu může existovat aktivita, score, build i closure. Nemůže vzniknout uznaná Evidence.

## 6. Current first economic slice

```text
Audit 00-A
→ ClickAudit
→ bootstrap packet quantity 1
→ Audit 10-A
→ Evidence +1
→ Audit 16-C
→ Evidence alokována
→ Fidget
→ 3 settled sessions
→ Fidget packet
→ Audit 18-S
→ Evidence +1
→ mixed backlog
```

Task 023 tento druhý metric source technicky dokončil. Task 024 sjednotí machine-readable data.

## 7. ClickAudit integrity

```text
1 úmyslný fyzický klik = 1 manual click
```

Povolené upgrady:

- digit/liquid/material variants;
- source breakdown;
- audit batch procedures;
- dashboards;
- interpretace;
- milestone copy;
- nové audit templates;
- capability kategorie.

Zakázané:

- `1 click = 50 manual clicks`;
- passive relay započítaný jako manual;
- retroaktivní falešné kliky;
- Evidence přímo za klik;
- auto-generated click vydávaný za přítomnost člověka.

## 8. Packet economics

Packet je administrativní povinnost.

```text
raw metric boundary
→ packet
→ pending audit
```

Packet má:

- stable ID;
- source;
- quantity/range;
- status;
- audit template;
- timestamps;
- případně confidence/outcome class.

Packet sám nic nevyplácí.

Pro action modules se packet threshold nesmí vymyslet před playtestem. Candidate values z design RFC nejsou machine-readable balance source.

## 9. Authorization místo klasického shopu

Zásadní systémová změna preferuje:

```text
splněná podmínka
→ dostupný formulář
→ alokace Evidence
→ authorization
→ surface mutation
```

Ne každý drobný upgrade potřebuje formulář.

Autorizují se smysluplné skupiny:

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

Uvnitř jedné session se jednotlivé autorizované capability mohou draftovat přes run-local XP.

## 10. Permanent versus temporary progression

### Temporary

- run XP;
- současný level;
- vybrané upgrades;
- combo;
- wave modifiers;
- temporary score;
- momentální incident state.

### Persistent module-local

- discovered capability;
- proficiency;
- known loadout template;
- cosmetic/material variants;
- best local reports;
- accessibility settings.

### Persistent global

- Evidence balance;
- authorizations;
- module unlocks;
- audit/certification history;
- mema;
- policies;
- operator training;
- prestige state.

Každá hodnota musí mít explicitní reset scope.

## 11. Automation and delegation

Automatizace nesmí odstranit hračku ani falšovat manual metrics.

```text
manual operation
→ assistant handles routine
→ player handles exceptions
→ policy manages assistant
→ player audits policy
```

Source categories:

```text
manual
delegated
system-generated
```

Delegovaná aktivita:

- může vytvářet packet;
- má vlastní confidence/error rate;
- vyžaduje supervision;
- nemůže finálně certifikovat Evidence;
- nesmí se slít s manual raw metric.

Action-module automation navíc používá:

- loadout template;
- target weights;
- risk tolerance;
- allowed exceptions;
- supervision cadence;
- intervention threshold.

Automatizace mění hráčské sloveso. Nezapíná pouze pasivní video.

## 12. Backlog jako progression pressure

Hráč musí nejdřív pocítit rutinu, kterou má delegace řešit.

Příliš brzká automatizace odstraní problém dřív, než se stal herní zkušeností.

Backlog nesmí být:

- FOMO badge;
- offline trest;
- permanentní blokace příjemných modulů;
- tak pomalý, že management nemá smysl;
- tak rychlý, že hráč nestihne nic kromě formulářů.

## 13. Activity spectrum v ekonomice

Různé intensity používají stejný global loop, ale jiný lokální rytmus.

### Low intensity

```text
jedna hmatová akce
→ natural settle / sheet / pattern closure
→ packet po několika closures
```

### Medium intensity

```text
krátká sekvence / wave / rally
→ jasný stavový closure
→ packet
```

### High intensity

```text
4–6 minute session
→ lokální build a run XP
→ aggregate session closure
→ packet až po schváleném threshold
```

Vysoká intenzita není ospravedlnění pro vyšší Evidence yield. Balance se odvíjí od času, kognitivní náročnosti, backlogu a role modulu v progression, ne od množství částic.

## 14. Priority Containment economy boundary

Design candidate:

```text
Priority session
→ local run XP/build
→ priority.sessionClosed
→ provisional packet po 2 closures
→ Audit 27-P
→ Evidence +1
```

Závazné už nyní:

- kill/deflection nedává EV;
- run XP není EV;
- session fail může vytvořit `closed-with-reservation`, ne ztrátu EV;
- packet threshold se finalizuje až po greybox playtestu;
- authorization může odemykat capability groups, ne procentní damage shop.

## 15. Alignment Rally economy boundary

Design candidate:

```text
Alignment session
→ local response/build state
→ alignment.sessionClosed
→ provisional packet po 3 closures
→ Audit 31-R
→ Evidence +1
```

Závazné:

- každý odraz nevydělává EV;
- closure outcome může měnit interpretation/discrepancy, ne základní existence Evidence bez auditu;
- custom text claimu se nepoužívá jako economic input;
- authorization groups odemykají response templates.

## 16. Cross-module progression

Preferované vztahy:

- Fidget poskytne nový typ closure;
- Bloom poskytne prostorový/statusový packet;
- Button Compliance obslouží authorization/exceptions;
- Corner Watch vytvoří idle report;
- ClickAudit interpretuje source breakdown;
- Priority Containment vytvoří operational discrepancies;
- Alignment Rally může vzniknout jako reakce na disputed closure;
- stážista obslouží modul, ale vytvoří kontrolní vzorek.

Cross-module bonusy až po stabilitě jednotlivých loops. Hráč nemá neustále přepínat okna jako operátor rozbitého dispečinku.

## 17. First-cycle boundary

First-cycle balance zůstává zaměřený na:

```text
presence
→ ClickAudit
→ Evidence
→ Fidget
→ mixed backlog
→ delegation
→ Bloom / first-cycle content
→ closure/prestige
```

Priority Containment a Alignment Rally nejsou součástí Tasku 024 first-cycle rebalance. Jsou pozdější module R&D a vyžadují vlastní greybox gates.

## 18. Prestige

První prestige:

```text
UZAVŘENÍ AUDITNÍHO CYKLU
FORMULÁŘ 42-Z
```

Resetuje cycle state a zachovává:

- identity;
- settings;
- mema;
- lifetime stats;
- certifications;
- permanent authorizations;
- cosmetics;
- permanent procedures;
- Audit Findings.

Hlavní odměnou je nový interaction system a rychlejší/odlišný návrat, ne pouze multiplier.

## 19. Player-facing complexity

Early taskbar:

```text
EV 1
PENDING 2
```

Raw metrics zůstávají uvnitř modulů. Run XP uvnitř session. Hidden KPI se odemykají později.

Na začátku nemá hráč osm globálních čísel. Složitost se odemyká jako systém, ne jako cockpit.

## 20. Ethical retention

Zakázané jako core requirement:

- daily streak;
- propadající reward;
- energie;
- povinný rare event;
- trest za offline;
- agresivní notification badge;
- skryté odds;
- časově omezený upgrade draft;
- monetizované rerolly;
- monetizace čekání.

Používat:

- jasná session closure;
- voluntary return;
- uzavření směny;
- archive report;
- pause;
- transparentní random pool;
- nový systém jako odměnu;
- offline report bez trestu.

## 21. Current migration status

Runtime po Tasku 023 už používá:

- ClickAudit packets;
- Fidget packets;
- repeatable audits;
- Evidence certification;
- mixed backlog;
- authorization.

Task 024 musí sjednotit:

- resources metadata;
- events data;
- audit forms/templates;
- upgrade assumptions;
- first-cycle CSV/JSON;
- TypeScript exports;
- runtime/prose parity.

Action-module candidate data se do této migrace nezahrnují.

## 22. Důležité pravidlo

> K0rp_OS může mít uvnitř modulu score, level, build a exploze. Globálně je stále rozhodující to, co systém uznal, autorizoval a následně musel auditovat.
