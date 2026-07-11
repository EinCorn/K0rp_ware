# RFC — první auditní cyklus K0rp_OS

Verze: `0.1.0-draft`  
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
| `notionalWorkUnits` | NWU | currency | visible-after-audit | auditCycle | Hlavní spendable měna cyklu. Neříká, kolik práce proběhlo; říká, kolik práce lze vykázat. |
| `auditPressure` | AP | meter | visible-from-start | auditCycle | Tlak vytvářený auditovanými interakcemi. Vyšší tlak otevírá oprávnění, ale zvyšuje nestabilitu procesu. |
| `stabilization` | STB | meter | visible-after-fidget | auditCycle | Dočasná stabilita získaná přes Fidget a další uklidňovací procesy. Pomalu klesá během aktivní relace. |
| `entropy` | ENT | meter | visible-after-fidget | auditCycle | Míra procesního rozptylu. Není to zdraví ani trest; mění výskyt chyb, červených stavů a některé bonusy. |
| `complianceIntegrity` | CI | meter | visible-after-bloom | auditCycle | Stav, do něhož se systém dostává, když drobné věci vypadají správně uspořádané. |
| `systemOrder` | SO | meter | hidden-until-memo | auditCycle | Odvozený pocit, že systém má tvar. Potřebný k uzavření auditního cyklu. |
| `perceivedProductivity` | PP | derived | hidden-until-memo | never | Odvozená veličina z NWU rate, pořádku, stabilizace a entropie. Není přímo utratitelná. |
| `perceivedControl` | PC | derived | hidden | auditCycle | Vedlejší metrika stabilizačních a potvrzovacích rituálů. |
| `approvalUnits` | AU | currency | visible-after-button | auditCycle | Sekundární měna vydávaná Button Compliance. Používá se na oprávnění a uzavření cyklu. |
| `auditFindings` | AF | prestige | visible-after-first-prestige | never | Permanentní prestige měna získaná uzavřením auditního cyklu. |
| `idleFaith` | IF | module-local | visible-in-module | auditCycle | Víra, že roh bude dosažen bez ohledu na schválený časový rámec. |
| `patienceUnits` | PU | module-local | visible-in-module | auditCycle | Měří near misses a administrativně uznané čekání. |
| `bloomIntegrity` | BI | module-local | visible-in-module | moduleSession | Lokální stav compliance zahrádky. |
| `reliefUnits` | RU | module-local | visible-in-module | moduleSession | Počet formálně uznaných taktilních úlev. |
| `pressureReleased` | PR | lifetime-stat | visible-in-module | never | Lifetime statistika prasklé procedurální tenze. |
| `cleanliness` | CLN | module-local | visible-in-module | moduleSession | Stav viditelného povrchu. Příčina není součástí měření. |
| `alignment` | ALN | module-local | visible-in-module | moduleSession | Míra mechanického souhlasu mezi tvarem a otvorem. |
| `closure` | CLS | module-local | visible-in-module | moduleSession | Pocit dokončení bez nutnosti významu. |
| `attentionResidue` | AR | module-local | visible-in-module | moduleSession | Zbytky pozornosti zachycené po rozdělení. |
| `proceduralCalm` | CALM | module-local | visible-in-module | auditCycle | Klid aplikovaný na povrch procesu. |
| `sandAlignment` | SA | module-local | visible-in-module | moduleSession | Míra, do níž písek přestal klást otázky. |
| `momentum` | MOM | module-local | visible-in-module | moduleSession | Nahromaděná hybnost bez nutnosti výstupu. |
| `transferredResponsibility` | TR | lifetime-stat | hidden-until-memo | never | Lifetime počet předání problému další jednotce. |
| `kryptoManagementScore` | KMS | hidden | hidden | never | Skrytá statistika rituálů, které vypadají řiditelněji než jejich účinek. |
| `dopamineDrift` | DD | hidden | hidden | auditCycle | In-universe satirická metrika, nikoliv neurologické tvrzení. |

### Klíčová pravidla

- `notionalWorkUnits` je hlavní spendable měna cyklu.
- Pro unlock thresholds používat také lifetime generated total, aby nákupy neblokovaly postup.
- `auditPressure`, `entropy`, `stabilization`, `complianceIntegrity` a `systemOrder` jsou metery, ne pytle nekonečných peněz.
- `perceivedProductivity` je derived metric a nesmí se utrácet.
- `auditFindings` je permanentní prestige měna.
- module-local resources se běžně nezobrazují v hlavním taskbaru.
- hidden resources se odemykají memem nebo analytickým panelem.

## 4. Audity jako progression interface

Databáze obsahuje sedm auditních formulářů:

- `00-A` — onboarding a první kliky;
- `10-A` — auditní dávky;
- `16-C` — requisition Fidgetu;
- `23-B` — přístup do Bloom;
- `27-R` — volitelné Rohové Očekávání;
- `31-F` — Button Compliance;
- `42-Z` — první prestige.

Upgrade se tedy nekupuje pouze tlačítkem `BUY`. U zásadních změn hráč nejprve splní podmínky, potom vyplní formulář a až následně použije NWU/AU na aktivaci procedury.

## 5. První balance pass

| Čas | Fáze | Hlavní surface | Cumulative NWU | Audited clicks | Očekávané nákupy |
|---:|---|---|---:|---:|---|
| 0–12 min | Vstupní audit | audit-00-a | 10 | — | — |
| 12–35 min | Rozšíření auditní stopy | click-audit | 42 | 55 | sys.counter-calibration; sys.audit-batch-standardization |
| 35–65 min | Stabilizace rozptýlením | fidget | 88 | 75 | fidget.access-permit; fidget.bearing-lubrication |
| 65–110 min | Compliance zahrádka | bloom | 160 | 115 | bloom.access-permit; bloom.green-handling |
| 110–145 min | Pasivní přítomnost a směrování | corner-watch | 225 | 135 | corner.access-waiver |
| 145–195 min | Opakovaný souhlas | button-compliance | 310 | 175 | button.access-permit; sys.departmental-routing |
| 195–250 min | Mezioddělová certifikace | multi-module | 430 | — | click.audit-certification; fidget.settle-certification; bloom.wave-certification; button.sequence-certification |
| 250–275 min | Uzavření auditního cyklu | audit-42-z | 450 | — | sys.cycle-closure-authority |

### Cílový objem prvního cyklu

- 210–300 všech auditovaných interakcí;
- z toho přibližně 90–150 přímých ClickAudit kliků;
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

Batch rewards zůstávají plné. Hráč tedy nepřijde o counter ani feedback, ale hra ho jemně směruje ke střídání modulů.

Autoclicker by neměl být hlavní optimální strategie. Ne kvůli moralizování, ale protože by vymazal z produktu všechny zajímavější části.

## 7. Automatizace

Automatizace musí přesouvat hráče od rutiny k výjimkám:

- ClickAudit relay dokládá drobnou pasivní přítomnost, ale nevyplňuje formuláře.
- Bloom assistant řeší běžný green stav, ale ne yellow/red.
- Button stamp přebírá každý třetí standardní press, ale ne výjimku.
- Corner Watch zaznamená hit i bez přímého pohledu.
- Fidget meeting protocol stabilizuje pozadí, ale nenahrazuje celý spin cycle.

## 8. Cross-module rytmus

Nejsilnější první kombinace:

- vysoká Stabilization + nízká Entropy → lepší auditní batch;
- Fidget settle → 60 sekund lepší Bloom;
- Fidget settle → první Button sequence do 120 sekund dostane vyšší AU;
- red Bloom clear → vytvoří pending confirmation v Button Compliance;
- Bloom wave → Button sequence do tří minut → bonus System Order;
- Corner session → doplňková auditní stopa;
- každý smysluplný click v modulu → zdrojový záznam v ClickAuditu.

Jde o krátká okna a vztahy, ne o povinnost neustále přepínat aplikace jako operátor rozbitého dispečinku.

## 9. První prestige

Název:

```text
UZAVŘENÍ AUDITNÍHO CYKLU
```

Prestige se spouští formulářem `42-Z`.

### Resetuje

- current cycle NWU;
- Audit Pressure;
- Stabilization;
- Entropy na výchozí hodnotu;
- Compliance Integrity a System Order;
- Approval Units;
- module-session state;
- cycle-scoped upgrades;
- pending forms a tasks.

### Zachová

- Employee ID;
- settings;
- mema a lifetime statistiky;
- certifikace;
- cosmetics;
- never-reset upgrades;
- známé moduly;
- Audit Findings.

### Výpočet Audit Findings

```text
3
+ clamp(certifiedDepartments - 2, 0, 3)
+ 1, pokud lifetime NWU >= 600
max 7 při prvním closure
```

Typický první výsledek: **5 AF**.

### Post-prestige změna

Vedle prestige directives se odemkne **Bublinková Fólie**. To je zásadní: první prestige musí otevřít nový způsob interakce, ne jen navýšit násobitel.

## 10. Retention guardrails

Nepoužívat:

- daily streak;
- propadající reward;
- povinný corner hit;
- offline trest;
- energii;
- notifikaci typu „zahrádka umírá“;
- jedinou optimální rare událost;
- červený badge, který nikdy nejde uklidit.

Používat:

- dobrovolné `UZAVŘÍT SMĚNU`;
- archivovaný offline report;
- mema v Inboxu;
- jasné closure points;
- optional idle větev;
- nový systém jako hlavní odměnu;
- nastavitelnou sensory intenzitu.

## 11. Co se musí playtestovat

1. Kolik skutečných kliků vyprodukuje audit 00-A na myši i touchpadu.
2. Zda první batch přijde do 20–30 minut.
3. Zda Fidget působí jako úleva, ne jako další povinná meter práce.
4. Kolik Bloom wave trvá bez upgradu a s Green Handling.
5. Zda Button přichází před únavou z první trojice.
6. Zda lze prestige dokončit bez Corner hitu.
7. Zda hráč chápe rozdíl current NWU a lifetime NWU.
8. Zda po resetu dosáhne Bloom přibližně za 35–50 % původního času.
9. Zda audio zůstává příjemné po deseti minutách, ne jen po deseti sekundách.
10. Zda hráč najde legitimní bod k odchodu.
