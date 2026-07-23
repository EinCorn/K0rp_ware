# K0rp_OS — First Cycle Balance

Verze: `0.4.0 migration RFC`  
Status: early vertical slice je implementovaný; full machine-readable reconciliation zůstává Tasku 024; pozdější first-cycle pacing je provisional

## 1. Důvod rebalance

Starý v0.2 model předpokládal:

```text
raw action
→ přímý NWU/AP výnos
→ batch reward
→ nákup procentního upgradu
```

Canonical model:

```text
raw metrika
→ pending packet
→ audit
→ Evidence
→ authorization
→ nový systém
```

Proto staré cumulative NWU tabulky, direct-yield eventy, click multipliers a část upgrade costs nejsou současný implementation source.

## 2. Vstupní rozhodnutí

První interaction:

```text
AUDIT 00-A
☐ Jsem v práci?
[POTVRDIT PŘÍTOMNOST]
```

Každá úmyslná field activation:

1. změní konkrétní pole;
2. emituje právě jeden privacy-safe `clickaudit.click`;
3. objeví se v raw counteru;
4. nepřidá Evidence.

Po submitu:

- odemkne se ClickAudit;
- zachytí se současná raw baseline;
- armuje se právě jeden bootstrap packet;
- žádná Evidence nevzniká pouze za přítomnost.

## 3. Implementovaný vertical slice

```text
Audit 00-A
→ ClickAudit unlock
→ první pozdější úmyslný K0rp_OS klik
→ bootstrap ClickAudit packet quantity 1
→ Audit 10-A auto-open právě jednou
→ Evidence +1
→ Audit 16-C
→ Evidence alokována
→ Fidget authorization
→ 3 nové natural settled sessions
→ packet fidget-sessions-1-3
→ Audit 18-S ve shared queue
→ Evidence +1 po certifikaci
→ mixed backlog
```

Po bootstrap packetu:

```text
každých dalších 25 raw clicks od baseline
→ další quantity-25 ClickAudit packet
→ queue bez forced popupu
```

Task 023 / PR #45 dokončil druhý metric source. Task 024 musí sjednotit data.

## 4. Provisional playtest targets

| Krok | Target | Poznámka |
|---|---:|---|
| Audit 00-A | 1–3 min | srozumitelný onboarding |
| Bootstrap ClickAudit packet | první pozdější klik | rychlé vysvětlení loopu |
| První Audit 10-A | 1–3 min | krátká certifikace |
| První Evidence | 5–15 min celkem | pouze certifikací packetu |
| Audit 16-C / Fidget permit | 10–25 min | Evidence otevře nový interaction system |
| První Fidget packet | po 3 nových settled sessions | current fixed provisional threshold |
| První citelný mixed backlog | podle používání obou modulů | musí přijít před delegací |

Rozsahy jsou testovací cíle, ne slib.

## 5. Resource hierarchy

| Technical ID / layer | Player label | Druh | Early visibility | Význam |
|---|---|---|---|---|
| `notionalWorkUnits` | Evidence / EV | global currency | po první certifikaci | uznaná aktivita |
| `auditPressure` | hidden / později AP | meter | po backlogu | tlak z pending/discrepancies |
| `stabilization` | STB nebo module state | meter/local | po Fidgetu | stabilizační stav |
| `entropy` | ENT | meter | po Fidgetu | procesní rozptyl |
| `complianceIntegrity` | CI | meter | po Bloom | stav uspořádanosti |
| `systemOrder` | SO | derived/meter | hidden | interpretace systému |
| `perceivedProductivity` | PP | derived | hidden | interpretace, ne currency |
| `approvalUnits` | AU | late candidate | později | potvrzovací systém |
| `auditFindings` | AF | prestige | po first closure | permanentní závěry |
| run-local XP | bez global labelu | session value | uvnitř action runu | dočasný build pacing |

Early taskbar:

```text
EV 1
PENDING 2
```

Raw metrics a run-local XP zůstávají uvnitř module windows.

## 6. Audit 10-A

Repeatable template navázaný na ClickAudit packet.

```text
Byla zaznamenaná aktivita provedena úmyslně?

○ Ano
○ Ne
○ Nelze potvrdit

[PODAT VÝKAZ]
```

Current slice:

- všechny odpovědi jsou administrativně validní;
- packet lze certifikovat právě jednou;
- validní certifikace přidá 1 EV;
- answer se uchová pro pozdější interpretation/discrepancy;
- clicks ve formu už přispívají k další raw dávce.

## 7. Audit 18-S

Repeatable template navázaný na Fidget packet.

```text
Byla zaznamenaná stabilizační relace ukončena přirozeně?

○ Ano
○ Ne
○ Nelze potvrdit

[CERTIFIKOVAT STABILIZACI]
```

Current slice:

- všechny odpovědi jsou administrativně validní;
- packet lze certifikovat právě jednou;
- validní certifikace přidá 1 EV;
- packet creation nikdy neotevírá okno ani nepřebírá focus.

## 8. Packet balance

### ClickAudit bootstrap

```text
quantity: 1
source: manual
range: first post-unlock click
status: pending
```

Účel není dlouhodobý balance. Je to onboarding loopu.

### ClickAudit normal

```text
quantity: 25
source: manual
range: explicit raw click interval
status: pending
```

Žádný direct batch reward.

### Fidget

```text
quantity: 3 settled sessions
source: manual
id: fidget-sessions-<rangeStart>-<rangeEnd>
status: pending
auditTemplateId: audit-18-s
```

Remainder jedné nebo dvou sessions se zachová. Žádná Evidence před auditem.

## 9. Anti-spam

Kliky se doslovně počítají. Nemají currency multiplier, protože samy currency nevyrábějí.

Anti-spam tvoří:

- packet boundary;
- auditní práce;
- backlog;
- exactly-once certifikace;
- source split;
- pozdější control samples a diversity.

Autoclicker může nafouknout raw číslo. Nesmí se proměnit v manual Evidence bez odpovídajícího procesu.

## 10. Evidence authorization

První EV:

```text
EV 1
→ Audit 16-C
→ EV 1 alokována
→ Fidget authorized
```

První významná odměna je nový interaction system, ne procentní click upgrade.

## 11. Mixed backlog

Backlog je společná queue ClickAudit a Fidget packet audits.

Provisional interpretation:

```text
0 pending → čistá relace
1–2       → běžná administrativní stopa
3+        → citelný backlog candidate
```

Task 023 debug-only pressure:

```text
clamp(0, 100,
  pendingCount * 10
  + floor(oldestPendingAgeMinutes / 10)
  + discrepancyCount * 20)
```

Tato hodnota:

- není final balance;
- není persistentní resource;
- slouží pouze playtestu;
- musí být přehodnocena v Tasku 024/028.

Delegace se nesmí odemknout pouze časem. Má přijít po skutečné rutině.

## 12. Delegation candidate balance

První stážista:

- nesmí generovat manual clicks;
- může předvyplnit nebo obsloužit jednu rutinu;
- nemůže finálně certifikovat EV;
- má vlastní confidence/error rate;
- vytváří control sample/discrepancy;
- musí ušetřit víc rutiny, než kolik okamžitě přidá administrativy;
- dlouhodobě má vytvořit nový management loop.

Přesná rychlost, error rate a cost se nastaví až po backlog playtestu.

## 13. Later first-cycle order

Po data parity a delegation gate se znovu balanceuje:

```text
Bloom integration
→ optional Corner Watch
→ Button Compliance
→ certifications
→ Audit 42-Z
→ first closure
→ Audit Findings
→ post-prestige interaction system
```

Původní target 240–310 minut a 4–6 AF je hypotéza, ne acceptance criteria.

## 14. Action-module boundary

Priority Containment a Alignment Rally nejsou součástí Tasku 024 first-cycle rebalance.

Důvody:

- nemají accepted greybox;
- session duration/pacing není playtestované;
- packet thresholds jsou pouze candidates;
- buildcraft a sensory density se nejdřív ověřují standalone;
- jejich přidání nesmí zakrýt slabinu current first cycle.

### Priority Containment candidate

```text
4–6 min session
→ run-local XP/build
→ aggregate session closure
→ candidate packet po 2 closures
→ Audit 27-P
→ EV po certifikaci
```

Závazné:

- kill/deflection nedává EV;
- run XP není global;
- `closed-with-reservation` není ztráta předchozí EV;
- threshold se mění pouze podle playtestu.

### Alignment Rally candidate

```text
2–3 min session
→ response/build state
→ aggregate closure
→ candidate packet po 3 closures
→ Audit 31-R
→ EV po certifikaci
```

Závazné:

- odraz nedává EV;
- closure outcome může měnit discrepancy/interpretation;
- custom text není economic input.

## 15. Capability group balance

Action upgrade families se autorizují ve skupinách, ne formulářem za každé procento.

Příklad:

```text
Routing Procedures I
cost: provisional EV + process requirement
unlocks draft eligibility:
- Return to Sender
- Owner Assignment
- Reprioritize
```

Balance authorization group zahrnuje:

- cost;
- process requirement;
- dostupný draft pool;
- persistent scope;
- případný supervision side effect.

## 16. Cross-module rhythm

Preferované vztahy:

- ClickAudit zachytí raw intent;
- Fidget vytvoří natural closures;
- Bloom přidá spatial/status metric;
- Button řeší authorization/exceptions;
- Corner vytvoří idle report;
- action module vytvoří session report a pozdější discrepancy;
- Alignment může reagovat na disputed closure;
- intern obslouží rutinu, ale neodpovídá za finální EV.

Nejde o povinnost přepínat aplikace každých několik sekund.

## 17. First prestige

```text
UZAVŘENÍ AUDITNÍHO CYKLU
FORMULÁŘ 42-Z
```

Resetuje cycle state a zachovává podle contractu:

- Employee ID;
- settings;
- mema;
- lifetime stats;
- certifications;
- cosmetics;
- permanent authorizations/procedures;
- Audit Findings.

Hlavní odměna je nový system interaction, ne pouze multiplier.

## 18. Retention guardrails

Nepoužívat:

- daily streak;
- propadající reward;
- povinný corner hit;
- offline trest;
- energii;
- agresivní badge;
- skryté odds;
- časově omezený action upgrade choice;
- monetizované rerolls.

Používat:

- voluntary shift closure;
- archived offline report;
- jasné module session closure;
- pause/exit;
- backlog jako interní tlak, ne FOMO;
- nový systém jako odměnu;
- transparentní upgrade pool.

## 19. Task 024 data impact

Task 024 musí přepsat nebo ověřit:

- resource labels;
- raw event yields;
- `audit.evidenceCertified`;
- audits 10-A/16-C/18-S;
- packet definitions/references;
- first-cycle phases;
- balance CSV;
- upgrade assumptions;
- progression version;
- runtime/data/docs parity.

Nesmí přidat Priority/Alignment candidate data.

## 20. Balance discipline

Jedna změna na jeden balance commit:

- packet size;
- Evidence reward;
- authorization cost;
- audit length;
- discrepancy rate;
- timer/session duration;
- upgrade weight;
- wave density;
- prestige target.

Každá změna musí mít konkrétní playtest pozorování.

## 21. Důležité pravidlo

> První cyklus se nesmí nafukovat novou hordou jen proto, že horda může být zábavná. Nejdřív musí být pravdivě vybalancovaná činnost, audit, Evidence, authorization a backlog, které už máme.
