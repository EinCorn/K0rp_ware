# K0rp_OS — First Cycle Balance

Verze: `0.3.0 migration RFC`  
Status: early vertical slice je canonical; pozdější 4–5hodinový cycle balance je provisional do Tasku 024.

## 1. Důvod rebalance

V0.2 balance předpokládal:

```text
raw click
→ přímý NWU/AP výnos
→ batch reward
→ nákup upgradu
```

Canonical v0.3 loop je:

```text
raw metrika
→ pending packet
→ audit
→ Evidence
→ autorizace
```

Proto staré cumulative NWU tabulky, click yield multipliers a část upgrade costs nejsou implementation source pro Tasks 020–023.

## 2. Vstupní rozhodnutí

První interaction není menu ani prázdné tlačítko.

```text
AUDIT 00-A
☐ Jsem v práci?
[POTVRDIT PŘÍTOMNOST]
```

Každá úmyslná interaction ve formuláři:

1. změní stav konkrétního pole;
2. emituje právě jeden `clickaudit.click` s bezpečným K0rp profilem;
3. objeví se v raw ClickAudit counteru;
4. nepřidá přímo Evidence.

Po odeslání se odemkne ClickAudit. Presence Audit potvrzuje existenci relace, ne ekonomickou hodnotu hráče.

## 3. První canonical vertical slice

```text
Audit 00-A
→ ClickAudit
→ 25 raw clicks
→ ClickAudit packet 00-01
→ Audit 10-A instance
→ Evidence +1
→ Audit 16-C
→ Evidence alokována
→ Fidget
→ 3 přirozeně ukončené sessions
→ packet `fidget-sessions-1-3`
→ Audit 18-S
→ Evidence +1
```

### Provisional playtest targets

| Krok | Target | Poznámka |
|---|---:|---|
| Audit 00-A | 1–3 min | okamžitě srozumitelný onboarding |
| První ClickAudit packet | 3–10 min po unlocku | 25 úmyslných interakcí napříč OS |
| První Audit 10-A | 1–3 min | krátká certifikace, ne formulářový román |
| První Evidence | 5–15 min celkem | vznikne pouze certifikací packetu |
| Audit 16-C / Fidget permit | 10–25 min celkem | první Evidence rychle otevře nový interaction system |
| První Fidget packet | po 3 nových settled sessions | fixed provisional/playtestable threshold Tasku 023 |

Rozsahy jsou playtest targety, ne slib. Důležité je pořadí a význam.

## 4. Resource hierarchie

Ne všechny resources mají být viditelné současně.

| Technical ID | Player label | Druh | Early visibility | Význam |
|---|---|---|---|---|
| `notionalWorkUnits` | Evidence / EV | currency | po první certifikaci | uznaná vykazatelná aktivita |
| `auditPressure` | skryté / později AP | meter | po backlog unlocku | tlak z pending auditů a discrepancies |
| `stabilization` | STB | meter/module state | po Fidgetu | lokální nebo cycle stabilizace |
| `entropy` | ENT | meter | po Fidgetu | procesní rozptyl |
| `complianceIntegrity` | CI | meter | po Bloom | stav uspořádanosti |
| `systemOrder` | SO | meter | hidden-until-memo | odvozený pocit tvaru systému |
| `perceivedProductivity` | PP | derived | hidden | interpretace, ne spendable currency |
| `approvalUnits` | AU | late currency | po Button Compliance | sekundární pozdní systém |
| `auditFindings` | AF | prestige | po first closure | permanentní závěry |

Early taskbar:

```text
EV 1
PENDING 2
```

Raw kliky, rotace a další moduly mají vlastní readout uvnitř module windows.

## 5. Audit 10-A

Audit 10-A je repeatable audit template navázaný na konkrétní ClickAudit packet.

První minimální pole:

```text
Byla zaznamenaná aktivita provedena úmyslně?

○ Ano
○ Ne
○ Nelze potvrdit

[PODAT VÝKAZ]
```

Pro první slice:

- všechny tři odpovědi jsou administrativně validní;
- každá validní certifikace přidá 1 EV;
- volba může být uložena jako interpretace pro budoucí discrepancies;
- packet lze certifikovat právě jednou;
- kliky ve formuláři už tvoří část další raw dávky.

### Audit 18-S

Audit 18-S je repeatable audit template navázaný na konkrétní Fidget stabilization packet.

```text
Byla zaznamenaná stabilizační relace ukončena přirozeně?

○ Ano
○ Ne
○ Nelze potvrdit

[CERTIFIKOVAT STABILIZACI]
```

Pro Task 023 jsou všechny tři odpovědi administrativně validní. Každá platná certifikace přidá `EV +1`, ale konkrétní packet lze certifikovat právě jednou.

## 6. Packet balance

### ClickAudit

První batch size:

```text
25 raw manual K0rp_OS interactions
```

Packet:

```text
quantity: 25
source: manual
status: pending
```

Žádný přímý batch reward.

### Fidget

Fixed provisional/playtestable packet size Tasku 023:

```text
3 nové `fidget.sessionSettled`
```

Packet:

```text
id: fidget-sessions-<rangeStart>-<rangeEnd>
quantity: 3
source: manual
status: pending
auditTemplateId: audit-18-s
```

Neúplný zbytek jedné nebo dvou sessions se zachová pro další packet. Vytvoření packetu samo neotevírá okno ani nepřebírá focus. Raw session ani packet creation nepřidávají Evidence; `EV +1` vzniká až jednorázovou certifikací Audit 18-S.

## 7. Anti-spam pravidlo ClickAuditu

Kliky se vždy doslovně počítají.

Nemají currency multiplier, protože samy currency negenerují.

Anti-spam tvoří:

- packet boundary;
- auditní práce;
- backlog;
- idempotentní certifikace;
- pozdější source diversity a kontrolní vzorky;
- oddělení manual/delegated/system-generated activity.

Autoclicker může nafouknout raw číslo, ale bez auditního zpracování nevytvoří odpovídající Evidence.

## 8. Evidence authorization

První Evidence nemá financovat procentní click upgrade.

```text
EV 1
→ Audit 16-C
→ EV 1 alokována
→ Fidget autorizován
```

Fidget permit je první důkaz, že hlavní reward je nový systém.

## 9. Audit backlog

Backlog se počítá ze společné queue ClickAudit i Fidget repeatable packet auditů. Taskbar ukazuje celkový počet všech pending položek, ne oddělený součet pouze jednoho metric source.

Early status:

```text
0 pending → čistá relace
1–2 pending → běžná administrativní stopa
3+ pending → viditelný auditní backlog
```

Task 023 používá pouze debug-only provisional tlak:

```text
clamp(0, 100,
  pendingCount * 10
  + floor(oldestPendingAgeMinutes / 10)
  + discrepancyCount * 20)
```

Tato hodnota se počítá z mixed backlogu, není canonical balance a nepersistuje se do `korpState.resources.auditPressure`. Finální pressure thresholds a machine-readable formula vzniknou až v Tasku 024 po playtestu Tasku 023.

Delegace se nesmí odemknout pouze časem. Má přijít, až backlog začne být skutečnou rutinní bolestí.

## 10. Automation and delegation

Budoucí automatizace nevyrábí falešné manuální metriky.

```text
manual clicks
 delegated clicks
 system-generated interactions
```

Každá kategorie je oddělená.

Delegovaná aktivita:

- může být batchována;
- může vyžadovat audit;
- může generovat discrepancies;
- nesmí sama finálně certifikovat Evidence.

## 11. Pozdější první cyklus

Po ověření ClickAudit a Fidget loopu se znovu přebalancují:

```text
Bloom
→ optional Corner Watch
→ Button Compliance
→ certifications
→ Audit 42-Z
→ first closure
→ Audit Findings
→ Bubble Wrap
```

Původní target 240–310 minut a 4–6 Audit Findings zůstává hypotéza, ne současná acceptance criteria.

Task 024 musí přepsat:

- `first-cycle.balance.csv`;
- `first-cycle-phases.json`;
- přímé event yield assumptions v `events.json`, včetně starého `fidget.sessionSettled → notionalWorkUnits`;
- upgrade costs;
- audit requirements;
- cumulative resource targets;
- first prestige math, pokud playtest ukáže potřebu.

## 12. Cross-module rytmus

Cross-module bonuses mají vznikat až po stabilním jednotlivém loopu.

Preferované vztahy:

- Fidget session vytvoří auditovatelnou metriku;
- Bloom vytvoří jiný druh packetu;
- Button řeší autorizaci a výjimky;
- Corner Watch vytváří idle report, ne povinný rare gate;
- ClickAudit sleduje source breakdown, ale nezvětšuje fyzické kliky.

Nejde o povinnost neustále přepínat aplikace jako operátor rozbitého dispečinku.

## 13. First prestige

První prestige zůstává reprezentováno formulářem:

```text
UZAVŘENÍ AUDITNÍHO CYKLU
FORMULÁŘ 42-Z
```

Resetuje cycle state a zachovává Employee ID, settings, mema, lifetime stats, certifikace, cosmetics, permanent upgrades, známé moduly a Audit Findings.

Hlavní odměnou je nový interaction system, ne pouze multiplier.

## 14. Retention guardrails

Nepoužívat:

- daily streak;
- propadající reward;
- povinný corner hit;
- offline trest;
- energii;
- agresivní notification badge;
- jedinou optimální rare událost.

Používat:

- dobrovolné uzavření směny;
- archivovaný offline report;
- mema v Inboxu;
- jasné closure points;
- audit backlog jako interní tlak, ne FOMO;
- nový systém jako hlavní odměnu.

## 15. Machine-readable migration

Do dokončení Tasku 024 nejsou staré v0.2 JSON/CSV hodnoty canonical balance source.

Task 023 proto implementuje pouze runtime packet/audit contract: raw `fidget.sessionSettled` nesmí přímo udělit Evidence, i když současný `events.json` ještě obsahuje starý direct-yield záznam. Schema 4 → 5 migration nastavuje Fidget baseline na aktuální settled-session count a vytváří nula retroaktivních packetů.

Canonical význam určuje:

1. `20-core-loop.md`;
2. tato migration RFC;
3. `07-roadmap.md`;
4. konkrétní task acceptance criteria.
