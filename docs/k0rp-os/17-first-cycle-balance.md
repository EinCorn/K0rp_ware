# K0rp_OS — First Cycle Balance

Verze: `0.2.0 pracovní RFC`  
Cíl prvního prestige: **240–310 minut**, target **270 minut**.

## 1. Vstupní rozhodnutí

První interaction není prázdné tlačítko a není to menu.

Hráč dostane formulář:

```text
AUDIT 00-A
Vstupní audit přítomnosti a pracovního povrchu
```

Každá úmyslná interaction ve formuláři:

1. změní stav konkrétního pole;
2. vytvoří auditovatelnou interakci;
3. emituje `clickaudit.click` s profilem `audit-form`;
4. objeví se ve zdrojovém rozpisu ClickAuditu;
5. přispěje k prvním NWU a Audit Pressure.

Po odeslání formuláře se odemkne samotný ClickAudit. Hráč tak zjistí, že systém po celou dobu počítal jeho kliky, protože samozřejmě počítal.

Formulář obsahuje normální privacy větu lidským jazykem. In-universe humor nesmí znejasnit, co aplikace skutečně sleduje.

## 2. Hlavní loop prvního cyklu

```text
Audit 00-A
→ ClickAudit
→ formulář 10-A / auditní dávky
→ requisition Fidgetu
→ přirozený spin cycle
→ compliance zahrádka Bloom
→ volitelné Rohové Očekávání
→ Button Compliance
→ certifikace oddělení
→ formulář 42-Z
→ Uzavření auditního cyklu
→ Schválené Závěry
→ Bublinková Fólie
```

## 3. Resource hierarchie

Ne všechny resources mají být viditelné současně. Složitost se odemyká jako obsah.

| ID | Zkratka | Druh | Viditelnost | Reset | Význam |
|---|---:|---|---|---|---|
| `notionalWorkUnits` | NWU | currency | visible-after-audit | auditCycle | Hlavní spendable měna cyklu. |
| `auditPressure` | AP | meter | visible-from-start | auditCycle | Tlak vytvářený auditovanými interakcemi. |
| `stabilization` | STB | meter | visible-after-fidget | auditCycle | Dočasná stabilita z uklidňovacích procesů. |
| `entropy` | ENT | meter | visible-after-fidget | auditCycle | Míra procesního rozptylu. |
| `complianceIntegrity` | CI | meter | visible-after-bloom | auditCycle | Stav uspořádanosti drobných věcí. |
| `systemOrder` | SO | meter | hidden-until-memo | auditCycle | Pocit, že systém má tvar. |
| `perceivedProductivity` | PP | derived | hidden-until-memo | never | Odvozená ne-spendable metrika. |
| `approvalUnits` | AU | currency | visible-after-button | auditCycle | Sekundární měna potvrzovacího panelu. |
| `auditFindings` | AF | prestige | visible-after-first-prestige | never | Permanentní prestige měna. |

Module-local a hidden resources jsou podrobně definované v `packages/korp-progression/data/shards/resources.json`.

## 4. Audity jako progression interface

Databáze obsahuje sedm auditních formulářů:

- `00-A` — onboarding a první kliky;
- `10-A` — auditní dávky;
- `16-C` — requisition Fidgetu;
- `23-B` — přístup do Bloom;
- `27-R` — volitelné Rohové Očekávání;
- `31-F` — Button Compliance;
- `42-Z` — první prestige.

Zásadní změna systému se nekupuje pouze tlačítkem `BUY`. Hráč nejprve splní podmínky, potom vyplní formulář a až následně použije NWU/AU na aktivaci procedury.

## 5. První balance pass

| Čas | Fáze | Hlavní surface | Cumulative NWU | Audited clicks | Očekávané nákupy |
|---:|---|---|---:|---:|---|
| 0–12 min | Vstupní audit | audit-00-a | 10 | — | — |
| 12–35 min | Rozšíření auditní stopy | click-audit | 42 | 55 | counter calibration; batch standardization |
| 35–65 min | Stabilizace rozptýlením | fidget | 88 | 75 | Fidget permit; bearing lubrication |
| 65–110 min | Compliance zahrádka | bloom | 160 | 115 | Bloom permit; Green Handling |
| 110–145 min | Pasivní přítomnost | corner-watch | 225 | 135 | Corner waiver |
| 145–195 min | Opakovaný souhlas | button-compliance | 310 | 175 | Button permit; departmental routing |
| 195–250 min | Certifikace | multi-module | 430 | 210–280 | 3–4 module certifications |
| 250–275 min | Uzavření cyklu | audit-42-z | 450 | — | closure authority |

### Cílový objem prvního cyklu

- 210–300 všech auditovaných interakcí;
- přibližně 90–150 přímých ClickAudit kliků;
- 5 přirozeně ukončených Fidget sessions;
- 8 Bloom waves;
- 3 Button sequences;
- 3–4 certifikovaná oddělení;
- 6–8 přijatých mem;
- 420–500 lifetime NWU;
- přibližně 35 lifetime Approval Units;
- 4–6 Audit Findings po closure.

## 6. Anti-spam pravidlo ClickAuditu

Kliky se vždy počítají, ale jejich měnový výnos se nasycuje:

| Audited click v cyklu | NWU multiplier |
|---:|---:|
| 1–100 | 1.00× |
| 101–300 | 0.40× |
| 301+ | 0.10× |

Batch rewards zůstávají plné. Hráč nepřijde o counter ani feedback, ale hra jej jemně směruje ke střídání modulů.

## 7. Automatizace

Automatizace přesouvá hráče od rutiny k výjimkám:

- ClickAudit relay dokládá drobnou pasivní přítomnost, ale nevyplňuje formuláře;
- Bloom assistant řeší běžný green stav, ale ne yellow/red;
- Button stamp přebírá každý třetí standardní press, ale ne výjimku;
- Corner Watch zaznamená hit i bez přímého pohledu;
- Fidget meeting protocol stabilizuje pozadí, ale nenahrazuje celý spin cycle.

## 8. Cross-module rytmus

- vysoká Stabilization + nízká Entropy → lepší auditní batch;
- Fidget settle → 60 sekund lepší Bloom;
- Fidget settle → první Button sequence do 120 sekund dostane vyšší AU;
- red Bloom clear → pending confirmation v Button Compliance;
- Bloom wave → Button sequence do tří minut → bonus System Order;
- Corner session → doplňková auditní stopa;
- každý smysluplný click v modulu → zdrojový záznam v ClickAuditu.

Jde o krátká okna a vztahy, ne o povinnost neustále přepínat aplikace jako operátor rozbitého dispečinku.

## 9. První prestige

```text
UZAVŘENÍ AUDITNÍHO CYKLU
FORMULÁŘ 42-Z
```

Resetuje current-cycle resources, module-session state, cycle upgrades a pending tasks. Zachová Employee ID, settings, mema, lifetime stats, certifikace, cosmetics, permanent upgrades, známé moduly a Audit Findings.

Výpočet:

```text
3
+ clamp(certifiedDepartments - 2, 0, 3)
+ 1, pokud lifetime NWU >= 600
max 7 při prvním closure
```

Typický první výsledek: **5 AF**.

Vedle prestige directives se odemkne **Bublinková Fólie**. První prestige musí otevřít nový způsob interakce, ne pouze navýšit násobitel.

## 10. Retention guardrails

Nepoužívat daily streak, propadající reward, povinný corner hit, offline trest, energii, agresivní notification badge ani jedinou optimální rare událost.

Používat dobrovolné `UZAVŘÍT SMĚNU`, archivovaný offline report, mema v Inboxu, jasné closure points, optional idle větev a nový systém jako hlavní odměnu.

## Machine-readable source

- `packages/korp-progression/data/progression.database.json`
- `packages/korp-progression/data/first-cycle.balance.csv`
- `packages/korp-progression/data/shards/first-cycle-phases.json`
- `packages/korp-progression/src/progression.database.ts`
