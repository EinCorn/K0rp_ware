# K0rp_OS — Core Loop: Metric → Audit → Evidence

Verze: `0.4.0 canonical gameplay contract`  
Status: závazný produktový a ekonomický rámec pro runtime, data, modules, delegation a action prototypes

## 0. Účel dokumentu

Tento dokument definuje herní páteř K0rp_OS.

Není to:

- lore dump;
- seznam vtipů;
- přesný endgame balance sheet;
- povolení přidat každý nový modul okamžitě do progression databáze.

Je to kontrakt, podle kterého musí fungovat:

- raw metriky;
- module sessions;
- metric packets;
- audity;
- Evidence;
- authorizations;
- backlog;
- delegation;
- automation;
- budoucí action modules.

Runtime po Tasku 023 už implementuje ClickAudit i Fidget packet/audit flow. Task 024 musí sjednotit starší machine-readable data, která ještě částečně reprezentují v0.2 direct-yield ekonomiku.

## 1. Canonical product statement

> K0rp_OS je incremental management hra, ve které aktivita získává hodnotu teprve institucionálním potvrzením a každá automatizace vytváří větší potřebu dohledu.

Ještě kratší:

> Hráč nevyrábí práci. Vyrábí důkazy, že proběhla aktivita.

K0rp_OS není Cookie Clicker s kancelářskou grafikou a není launcher oddělených miniher. Čísla, score i hordy mohou existovat, ale hlavním dlouhodobým spektáklem je byrokratická hustota a rostoucí vzdálenost mezi činností a jejím uznaným účinkem.

## 2. Canonical global loop

```text
ÚMYSLNÁ ČINNOST
→ RAW METRIKA
→ NATURAL CLOSURE NEBO THRESHOLD
→ AUDITOVATELNÁ DÁVKA
→ AUDITNÍ INSTANCE
→ CERTIFIKACE
→ EVIDENCE
→ AUTORIZACE NOVÉHO SYSTÉMU NEBO CAPABILITY GROUP
→ NOVÁ ČINNOST A NOVÁ METRIKA
→ VÍCE AUDITŮ
→ BACKLOG
→ DELEGACE
→ CHYBY A NESROVNALOSTI
→ POLICY A DOHLED
→ DALŠÍ AUDITY
```

Stručná formule:

```text
Appka vytvoří metriku.
Audit z metriky vytvoří skutečnost.
Evidence dovolí systému vytvořit další metriku.
Automatizace vytvoří potřebu dohledu.
```

## 3. Module-local loop versus global loop

Některé moduly mají pouze malou interakci:

```text
klik
→ feedback
→ raw count
```

Jiné mohou mít krátký run:

```text
pohyb / odraz / čištění
→ run-local XP
→ build choice
→ wave/session closure
→ aggregate raw record
```

Module-local loop může být bohatý, uspokojivý a dočasně odměňující. Globální K0rp progress ale vzniká až přes packet/audit/Evidence.

## 4. Základní pojmy

### 4.1 Úmyslná činnost

Jedna hráčská aktivace, která má herní význam:

- kliknutí;
- změna auditního pole;
- úmyslný spin;
- dokončená rotace;
- vyřešený stav;
- odražená/routovaná priorita;
- kvalifikovaný argumentační odraz;
- jiná jasně ohraničená akce.

Pointer move, animační frame, průběžný physics tick, passive render a dekorativní particle nejsou samy globální hráčská činnost.

### 4.2 Raw metrika

Doslovný záznam činnosti.

```text
ClickAudit           → manual clicks
Fidget               → settled sessions
Bloom                → state changes / completed waves
Bubble Wrap          → popped bubbles / completed sheets
Surface Compliance   → cleaned patches / surfaces
Priority Containment → operational outcomes / session closures
Alignment Rally      → response/closure outcomes
```

Raw metrika:

- není spendable currency;
- sama neodemkne modul;
- nesmí být zpětně násobena tak, aby falšovala fyzickou činnost;
- může být zobrazena, klasifikována, agregována, batchována a auditována.

### 4.3 Run-local XP a temporary build

Action/build module smí mít dočasnou hodnotu:

```text
run XP
```

Run-local XP:

- existuje pouze uvnitř module session;
- nabídne dočasné upgrade choices;
- po closure zanikne;
- není Evidence;
- není global resource;
- nesmí se objevit na global taskbaru;
- nesmí autorizovat persistentní capability bez auditu/procedure.

### 4.4 Natural closure

Natural closure je přirozený konec smysluplné činnosti:

- Fidget se po úmyslném pohybu přirozeně zastaví;
- Bloom dokončí vlnu;
- sheet je dokončen;
- operational session je uzavřena;
- alignment relace skončí uznatelným outcome.

Closure může být raw packet boundary candidate. Není automatický Evidence reward.

### 4.5 Auditovatelná dávka / metric packet

Ohraničený balík raw metriky připravený k ověření.

Příklady:

```text
25 clickaudit.click
→ ClickAudit packet
→ PENDING

3 fidget.sessionSettled
→ Fidget packet
→ PENDING
```

Budoucí candidate:

```text
N priority.sessionClosed
→ Priority packet
→ PENDING
```

Packet není odměna. Packet je nová administrativní povinnost.

### 4.6 Audit template a audit instance

`Audit template` je datová definice.

`Audit instance` je konkrétní formulář navázaný na konkrétní packet, authorization, discrepancy nebo closure.

Jednorázové formuláře:

- Audit 00-A;
- Audit 16-C;
- zásadní authorizations;
- cycle closure.

Repeatable templates:

- Audit 10-A pro ClickAudit packet;
- Audit 18-S pro Fidget packet;
- budoucí packet audits;
- kontrola delegated activity;
- discrepancy resolution.

One-time forms používají `submittedFormIds`. Repeatable audits používají `auditInstances`.

### 4.7 Evidence

Technical resource ID:

```text
notionalWorkUnits
```

Player-facing:

```text
Evidence
EV
```

Význam:

```text
raw činnost ≠ Evidence
run-local XP ≠ Evidence
packet ≠ Evidence
certifikovaný packet = Evidence
```

Evidence se používá na authorizations, procedures, equipment, capability groups a později delegation/policy systems.

Není mzda, výkon ani skutečný dopad. Je to množství aktivity, které systém uznal jako vykazatelnou.

### 4.8 Authorization, capability a proficiency

```text
capability
= funkci lze prakticky vykonat

authorization
= systém dovolil funkci oficiálně použít

proficiency
= persistentní zkušenost uvnitř systému
```

Capability není authorization.

Hráč může capability objevit v runu, ale persistentní draft/policy pool ji smí používat až po authorization group.

### 4.9 Auditní backlog

Počet pending packetů nebo auditních instancí.

Backlog:

- není pouze badge;
- má být skutečně pocítěný;
- nesmí být agresivní FOMO;
- je prerequisite pro delegation;
- později zahrnuje discrepancies a control samples.

### 4.10 Nesrovnalost

Vzniká, když:

- audit nepotvrdí metriku jednoznačně;
- delegated activity selže;
- dvě procedures si odporují;
- automation použije nepovolenou exception;
- packet zestárne nebo ztratí ownera;
- policy optimalizuje špatný outcome;
- closure proběhne bez prokázaného výsledku.

Nesrovnalost nevynuluje hráče. Vytváří další práci, audit nebo incident.

## 5. Neměnné invarianty

### 5.1 Jeden skutečný klik je jeden skutečný klik

```text
1 fyzický úmyslný klik = 1 manual click
```

Upgrade může změnit zobrazení, analytics, material, batch procedure nebo interpretation. Nesmí tvrdit, že jeden fyzický klik byl padesát fyzických kliků.

### 5.2 Raw činnost nevyrábí spendable měnu

`clickaudit.click`, `fidget.sessionSettled`, priority impacts ani alignment responses nepřidávají přímo Evidence.

### 5.3 Run-local XP nevyrábí global currency

Score, combo, wave XP a temporary build mohou vytvořit okamžitý pocit progression. Nesmějí obcházet audit.

### 5.4 Packet nevydělává

Packet creation je persistence a audit obligation. Žádný automatic EV grant.

### 5.5 Audit certifikuje právě jednou

Repeated submit, double click, refresh nebo retry nesmí zdvojit Evidence.

### 5.6 Evidence autorizuje nový systém

Early meaningful reward je nový interaction/procedure/capability, ne click power multiplier.

### 5.7 Capability není authorization

Praktická schopnost sama neudělí persistentní oprávnění. Authorization musí mít declarative trail.

### 5.8 Automatizace nesmí falšovat manual metric

Minimum source categories:

```text
manual
delegated
system-generated
```

### 5.9 Automatizace vytváří dohled

Automatizace přebírá rutinu, ale vytváří:

- control samples;
- exceptions;
- confidence;
- discrepancies;
- potřebu schválení;
- policy;
- intervention.

### 5.10 Automatizace mění hráčské sloveso

```text
vykonej
→ nastav build
→ přiděl operátora
→ nastav policy
→ sleduj výjimky
→ zasáhni
```

Auto mode nesmí být pouze video nebo pasivní `+x/sec`.

### 5.11 Složitost roste jako byrokracie

Pozdější stav může být:

```text
7 modulů
11 raw metrik
3 operators
5 policies
14 auditních závislostí
4 discrepancies
1 incident
0 prokázaných výsledků
```

### 5.12 Activity spectrum nesmí rozbít jednotu produktu

K0rp_OS smí obsahovat:

- formuláře;
- desk objects;
- puzzles;
- action sessions;
- idle management.

Všechny vrstvy ale musí sdílet authorization, artifact, event a auditní jazyk. Action module nesmí udělat z OS nepovinný vestibul.

### 5.13 Privacy invariant

Eventy smějí nést semantic K0rp profile a aggregate hodnoty. Nesmějí ukládat:

- coordinates;
- visible text;
- URL;
- external app names;
- external active window;
- screenshots;
- raw keys;
- free-text claims;
- full input replay.

## 6. Event contract

### 6.1 Raw activation

```text
clickaudit.click
```

Zvyšuje raw stat a nepřidává Evidence.

Budoucí action raw events mohou být:

```text
priority.deflected
argument.responseLogged
```

High-frequency collisions/ticks se lokálně agregují. Globální event bus není physics profiler.

### 6.2 Natural closure

```text
fidget.sessionSettled
bloom.waveAdvanced
priority.sessionClosed
alignment.sessionClosed
```

Closure je privacy-safe aggregate a nesmí být emitovaný dvakrát za jednu session.

### 6.3 Packet creation

```text
clickaudit.batchCompleted
metric.packetCreated
```

Generic a module-specific event se nesmějí zdvojit pro stejný packet.

### 6.4 Form submit

```text
audit.formSubmitted
```

U packet auditu nestačí bez vazby na konkrétní packet.

### 6.5 Evidence certification

```text
audit.evidenceCertified
```

Minimální metadata:

```ts
{
  packetId: string;
  auditInstanceId: string;
  metricType: string;
  evidenceAmount: number;
}
```

### 6.6 Authorization

```text
authorization.granted
authorization.capabilityGroupGranted
```

### 6.7 Delegation and discrepancy

```text
delegation.activityGenerated
delegation.trainingCompleted
audit.discrepancyRaised
policy.interventionRequested
```

Neimplementovat delegation před backlog product gate.

## 7. Runtime state minimum

```ts
type MetricPacket = {
  id: string;
  metricType: string;
  source: "manual" | "delegated" | "system-generated";
  quantity: number;
  status: "pending" | "certified" | "rejected";
  createdAt: number;
  auditTemplateId: string;
  rangeStart?: number;
  rangeEnd?: number;
  certifiedAt?: number;
};

type AuditInstance = {
  id: string;
  templateId: string;
  packetId?: string;
  status: "available" | "draft" | "submitted" | "closed";
  values: Record<string, unknown>;
  createdAt: number;
  submittedAt?: number;
};

type MetricAuditRuntimeState = {
  metricPackets: MetricPacket[];
  auditInstances: AuditInstance[];
  clickBatchBaseline: number;
  fidgetSessionBatchBaseline: number;
};
```

Action module může mít oddělený `ModuleSessionState` s run XP/buildem. Save ukládá stable IDs a stav, ne celé definitions.

## 8. Implementovaný vertical slice

### 8.1 Přítomnost

```text
Audit 00-A
☐ Jsem v práci?
[POTVRDIT PŘÍTOMNOST]
```

Výsledek:

- relace přijata;
- ClickAudit unlocked;
- baseline captured;
- bootstrap armed;
- žádná Evidence.

### 8.2 Bootstrap raw activity

První pozdější úmyslný click:

```text
quantity-1 packet
→ Audit 10-A auto-open právě jednou
```

Tento bootstrap učí loop. Není long-term balance.

### 8.3 Normal ClickAudit flow

```text
25 nových raw clicks
→ quantity-25 packet
→ queue ve Formulářích
→ explicit open
→ Audit 10-A
→ Evidence +1
```

### 8.4 Fidget authorization

```text
EV 1
→ Audit 16-C
→ allocate 1 EV
→ Fidget authorized
```

### 8.5 Druhá metrika

```text
3 nové fidget.sessionSettled
→ Fidget packet
→ Audit 18-S
→ Evidence +1 po certifikaci
```

Packet creation neotevírá okno a nebere focus.

## 9. Player-facing UI

Early taskbar maximálně:

```text
EVIDENCE 1
ČEKÁ NA AUDIT 2
```

Raw metrics a run XP jsou v module windows.

Hidden KPI jsou telemetry/dashboard unlocky, ne early clutter.

## 10. Delegation contract

Delegace přichází až po pocítěném backlogu.

Stážista smí:

- generovat delegated raw metric;
- předvyplnit audit;
- obsluhovat authorized module;
- používat assigned capability;
- vytvářet errors;
- školit další jednotku.

Nesmí:

- finálně certifikovat Evidence;
- odstranit hráčovu odpovědnost;
- být započítán jako manual;
- získat authorization jen proto, že prakticky drží proces při životě.

Acting Lead Paradox je mechanický motiv, ne explicitní lore dump.

## 11. Action-module boundary

Priority Containment a Alignment Rally jsou strategicky schválené prototype candidates.

Před OS integration musí:

1. fungovat jako standalone greybox;
2. mít čitelný main verb;
3. mít natural closure;
4. prokázat několik build paths;
5. projít sensory/readability gate;
6. projít launcher-risk test;
7. mít schválený packet threshold.

Prototype smí mít run-local XP. Nesmí mít direct EV.

Candidate global flows:

```text
Priority session closure
→ provisional packet
→ Audit 27-P
→ EV

Alignment session closure
→ provisional packet
→ Audit 31-R
→ EV
```

Candidate thresholds nejsou machine-readable source před Tasks 035/038.

## 12. Copy and canon

Core loop se vysvětluje mechanikou.

Audit humor:

- začíná skoro normálně;
- roste vrstvením;
- používá mrtvou vážnost;
- nesmí být každý field punchline.

Interní kreativní zdroje jsou content bank. Skrytá autorská meta rovina se nevkládá do explicitního UI vysvětlení.

## 13. Migration order

```text
Task 020 — Click packet → Audit 10-A → Evidence       DONE
Task 021 — Audit 16-C / Fidget authorization          DONE
Task 022 — asset-backed Fidget                         DONE
Task 023 — Fidget packet → Audit 18-S → mixed backlog DONE
Task 024 — machine-readable data/balance reconciliation NEXT
Task 025 — delegation prototype after backlog gate
```

Visual Tasks 024A–024D jsou samostatná window/assets osa a nemění ekonomiku.

Future action Tasks 031–038 jsou prototype/integration osa a nesmějí přeskočit current core/data gates.

## 14. Playtest gates

Current core je potvrzený, když je srozumitelné a krátkodobě uspokojivé:

```text
udělat činnost
→ dostat auditní povinnost
→ certifikovat metriku
→ získat EV
→ autorizovat Fidget
→ vytvořit druhou metriku a backlog
```

Action module je potvrzený, když:

```text
pochopit verb
→ získat immediate feedback
→ vytvořit build
→ uzavřít session
→ chtít jiný build
→ přijmout OS report/audit jako důsledek, ne daň
```

Pokud current core nefunguje, další modul není řešení. Pokud action greybox nefunguje bez Evidence, auditní ekonomika ho nezachrání.

## 15. Explicitní non-goals

- nový global resource pro každou appku;
- direct EV za kill, click, pop nebo spin;
- procedurální stovky audit jokes;
- engine rewrite pouze kvůli action module;
- action viewport natlačený do compact 167×167;
- automatizace bez policy/supervision;
- daily streak, energy, FOMO nebo offline penalty;
- cloud/overlay před local-first stability;
- external activity tracking;
- explicitní vysvětlování skryté meta roviny.

## 16. Důležité pravidlo

> K0rp_OS může hráči dovolit odrážet stovky priorit. Pořád ale není důležité, kolik jich zmizelo. Důležité je, kolik z nich bylo uznáno jako řádně uzavřených, kdo to potvrdil a proč tím vznikla potřeba dalšího dohledu.
