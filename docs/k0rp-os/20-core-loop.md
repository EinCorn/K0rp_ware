# K0rp_OS — Core Loop: Metric → Audit → Evidence

Verze: `0.3.0 canonical gameplay contract`  
Status: závazný produktový a ekonomický rámec pro další runtime práci

## 0. Účel dokumentu

Tento dokument definuje herní páteř K0rp_OS. Není to lore dump, seznam vtipů ani přesný endgame balance sheet.

Je to kontrakt, podle kterého musí fungovat další moduly, audity, automatizace, delegace a progression data.

Současný runtime na `main` po Tasku 019 stále používá část starší v0.2 ekonomiky. Migrace proběhne po malých vertical slices podle `08-codex-tasks.md`; tento dokument je už nyní designový source of truth.

## 1. Canonical product statement

> K0rp_OS je incremental management hra, ve které aktivita získává hodnotu teprve institucionálním potvrzením a každá automatizace vytváří větší potřebu dohledu.

Ještě kratší verze:

> Hráč nevyrábí práci. Vyrábí důkazy, že proběhla aktivita.

K0rp_OS není Cookie Clicker s kancelářskou grafikou. Čísla mohou růst, ale hlavním spektáklem není astronomická produkce. Hlavním spektáklem je rostoucí byrokratická hustota a vzdálenost mezi činností a jejím uznaným účinkem.

## 2. Canonical loop

```text
ÚMYSLNÁ ČINNOST
→ RAW METRIKA
→ AUDITOVATELNÁ DÁVKA
→ AUDITNÍ INSTANCE
→ CERTIFIKACE
→ EVIDENCE
→ AUTORIZACE NOVÉHO SYSTÉMU
→ NOVÁ ČINNOST A NOVÁ METRIKA
→ VÍCE AUDITŮ
→ BACKLOG
→ DELEGACE
→ CHYBY A NESROVNALOSTI
→ DALŠÍ AUDITY
```

Stručná systémová formule:

```text
Appka vytvoří metriku.
Audit z metriky vytvoří skutečnost.
Evidence dovolí systému vytvořit další metriku.
```

## 3. Základní pojmy

### 3.1 Úmyslná činnost

Jedna hráčská aktivace, která má herní význam:

- kliknutí;
- změna auditního pole;
- dokončená rotace nebo session;
- vyřešený stav v modulu;
- uzavřená mikrosekvence;
- jiná jasně ohraničená akce.

Pointer move, animační frame, fyzikální tick a pasivní render nejsou hráčská činnost.

### 3.2 Raw metrika

Raw metrika je doslovný záznam činnosti.

Příklady:

```text
ClickAudit: manuální kliky
Fidget: rotace a přirozeně ukončené sessions
Bloom: změny stavů a dokončené vlny
Bubble Wrap: skutečně prasklé bubliny
Surface Compliance: skutečně vyčištěná plocha
```

Raw metrika:

- není spendable currency;
- sama neodemkne nový modul;
- nesmí být zpětně násobena tak, aby jeden fyzický klik znamenal desítky fyzických kliků;
- může být klasifikována, zobrazena, batchována a auditována.

### 3.3 Auditovatelná dávka / metric packet

Dávka je ohraničený balík raw metriky připravený k ověření.

První příklad:

```text
25 clickaudit.click
→ clickaudit.batchCompleted
→ packet click-batch-0001
→ stav PENDING
```

Batch není odměna. Batch je nová administrativní povinnost.

### 3.4 Audit template a audit instance

`Audit template` je datová definice formuláře.  
`Audit instance` je konkrétní formulář navázaný na konkrétní packet, žádost nebo nesrovnalost.

Jednorázové formuláře:

- Audit 00-A;
- Audit 16-C;
- velká oprávnění;
- closure formuláře.

Opakovatelné auditní templates:

- certifikace ClickAudit dávky;
- Audit 18-S — ověření Fidget stabilization packetu;
- kontrola delegované aktivity;
- oprava nesrovnalosti.

`submittedFormIds` smí dál evidovat jednorázové formuláře. Opakovatelné audity potřebují vlastní `auditInstances` se stavem a vazbou na packet.

### 3.5 Evidence

Evidence je první player-facing spendable měna.

Pro počáteční migraci se nepřidává nový core resource ID. Stávající technický resource:

```text
notionalWorkUnits
```

bude hráčsky prezentován jako:

```text
Evidence
EV
```

Jeho význam se mění:

```text
raw činnost ≠ Evidence
certifikovaný packet = Evidence
```

Evidence se používá na autorizace, žádosti, procedures a později delegaci. Není to mzda, výkon ani skutečný dopad. Je to množství aktivity, které systém uznal jako vykazatelné.

### 3.6 Auditní backlog

Backlog je počet pending packetů nebo auditních instancí čekajících na zpracování.

Backlog není jen menu badge. Je to tlak, který má hráč skutečně pocítit před odemčením delegace.

### 3.7 Nesrovnalost

Nesrovnalost vzniká, když:

- audit nepotvrdí metriku jednoznačně;
- delegovaná aktivita selže;
- dva systémy si odporují;
- automatizace vytvoří výstup bez potřebné autorizace;
- packet zestárne nebo ztratí ownera.

Nesrovnalost nevynuluje hráče. Vytváří další práci, audit nebo incident.

## 4. Neměnné designové invarianty

### 4.1 Jeden skutečný klik je jeden skutečný klik

ClickAudit raw counter je posvátná doslovná metrika.

```text
1 fyzický úmyslný klik = 1 manual click
```

Upgrade může změnit zobrazení, interpretaci, auditní kapacitu, dashboard, kapalinu nebo dostupné analýzy. Nesmí tvrdit, že jeden fyzický klik byl ve skutečnosti padesát fyzických kliků.

### 4.2 Raw činnost nevyrábí spendable měnu

`clickaudit.click` nemá přímo přidávat Evidence.

Stejný princip platí pro další moduly: jejich primární akce vytvářejí raw metriku a module-local stav, nikoliv automaticky globální spendable currency.

### 4.3 Batch nevydělává

`clickaudit.batchCompleted` vytváří packet. Nevyplácí Evidence ani jiný hlavní reward.

### 4.4 Audit certifikuje právě jednou

Jeden packet může být certifikován maximálně jednou.

Repeated submit, refresh, double click nebo retry nesmí zdvojit Evidence.

### 4.5 Evidence autorizuje nový systém

Early-game upgrade není `click power × 10`.

První významná Evidence autorizuje Fidget — tedy povolení být rozptýlen — a otevírá druhou raw metriku.

### 4.6 Automatizace nesmí falšovat manuální metriku

Budoucí stážista nebo relay nesmí navyšovat `manualClicks`.

Minimální zdrojové rozlišení:

```text
manual
 delegated
 system-generated
```

Delegovaná aktivita může být auditovatelná, ale má vlastní důvěryhodnost, chyby, backlog a supervision cost.

### 4.7 Automatizace vytváří dohled

Automatizace přebírá rutinu, ale vytváří:

- kontrolní vzorky;
- výjimky;
- nesrovnalosti;
- potřebu schválení;
- dalšího člověka nebo systém, který ji sleduje.

### 4.8 Složitost roste jako byrokracie

K0rp_OS nepotřebuje jako hlavní atrakci noniliony.

Pozdější stav může vypadat takto:

```text
5 modulů
9 raw metrik
3 stážisti
4 dashboardy
12 auditních závislostí
2 nesrovnalosti
1 incident
0 prokázaných výsledků
```

### 4.9 Privacy invariant

Eventy smějí nést sémantický K0rp profil a agregovanou hodnotu. Nesmějí ukládat:

- souřadnice;
- viditelný text;
- URL;
- názvy externích aplikací;
- aktivní okno mimo K0rp;
- screenshots;
- raw keys.

## 5. Event contract

### 5.1 Raw activation

```text
clickaudit.click
```

Význam:

- zvyšuje doslovnou raw statistiku;
- eviduje bezpečný sémantický source/profile;
- nepřidává Evidence.

### 5.2 Packet creation

První modulová varianta:

```text
clickaudit.batchCompleted
```

Význam:

- ohraničená dávka raw kliků je kompletní;
- runtime vytvoří právě jeden pending packet;
- event sám nepřidává Evidence.

Až vznikne druhý generátor metrik, lze zavést obecný event:

```text
metric.packetCreated
```

Jeden packet ale nesmí být vytvořen dvakrát module-specific i generic eventem.

### 5.3 Form submit

```text
audit.formSubmitted
```

Význam:

- formulář byl řádně podán;
- u jednorázového formuláře spustí jeho completion effects;
- u packet auditu sám o sobě ještě není dostačující bez vazby na packet.

### 5.4 Evidence certification

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

Význam:

- konkrétní packet změnil stav z `pending` na `certified`;
- Evidence byla přidána právě jednou;
- vazba packet ↔ audit instance je persistována.

### 5.5 Future delegation events

Budoucí minimum:

```text
delegation.activityGenerated
audit.discrepancyRaised
delegation.trainingCompleted
```

Neimplementovat předtím, než playtest prokáže, že auditní backlog skutečně vytváří potřebu delegace.

## 6. Minimální runtime state

Pragmatický model rozšířený v Tasku 023:

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

Save ukládá state a ID, nikoliv celé definice templates.

## 7. První hratelný vertical slice

### 7.1 Přítomnost

```text
Audit 00-A
☐ Jsem v práci?
[POTVRDIT PŘÍTOMNOST]
```

Výsledek:

- hráč je přijat do relace;
- odemkne se ClickAudit;
- nevzniká Evidence pouze za existenci.

### 7.2 Raw aktivita

ClickAudit zaznamenává úmyslné interakce napříč K0rp_OS.

Po prvních 25 raw interakcích:

```text
DÁVKA 00-01
25 INTERAKCÍ
STAV: NEOVĚŘENO
```

### 7.3 Audit aktivity

Audit 10-A se stane opakovatelným packet audit template.

První copy:

```text
Byla zaznamenaná aktivita provedena úmyslně?

○ Ano
○ Ne
○ Nelze potvrdit

[PODAT VÝKAZ]
```

Každá odpověď může být administrativně přípustná. Volba může později změnit skrytou interpretaci nebo pravděpodobnost nesrovnalosti; první slice za všechny validní odpovědi udělí stejnou Evidence.

### 7.4 Evidence

Po úspěšném submitu:

```text
DÁVKA 00-01 → CERTIFIKOVÁNA
EVIDENCE +1
```

Kliky provedené během auditu už současně přispívají k další raw dávce. Systém tím vyrábí materiál pro vlastní pokračování.

### 7.5 Fidget authorization

Po získání první Evidence:

```text
Audit 16-C
Žádost o přidělení rotační stabilizace
```

Jedna Evidence je alokována/spotřebována na autorizaci. Po schválení se odemkne Fidget.

### 7.6 Druhá metrika

Fidget nevyrábí Evidence přímo.

```text
`fidget.sessionSettled` × 3
→ packet `fidget-sessions-<rangeStart>-<rangeEnd>`
→ pending repeatable Audit 18-S
→ platná certifikace právě jednou
→ Evidence +1
```

Packet size `3` je fixed provisional/playtestable hodnota Tasku 023. Neúplný zbytek sessions se zachová pro další packet. Raw session a packet creation nemají přímý Evidence reward; vytvoření packetu nikdy samo neotevře okno ani nepřevezme focus. Tím se prokáže, že core loop není hardcoded jen pro kliky.

## 8. Player-facing UI

Early taskbar smí ukazovat maximálně:

```text
EVIDENCE 1
ČEKÁ NA AUDIT 2
```

Raw metriky zůstávají uvnitř příslušných modulů.

Formuláře řadí ClickAudit i Fidget audity do jedné queue. Taskbar `ČEKÁ NA AUDIT` je celkový pending count přes oba metric sources.

Task 023 smí pro debug/playtest zobrazit odvozený provisional Audit Pressure:

```text
clamp(0, 100, pendingCount * 10 + floor(oldestPendingAgeMinutes / 10) + discrepancyCount * 20)
```

Tento debug readout není persistentní resource a nesmí se zapisovat do `korpState.resources.auditPressure`.

Audit Pressure, Perceived Productivity, Compliance Integrity a další KPI jsou:

- skryté telemetry;
- pozdější dashboardové unlocky;
- podmínky incidentů nebo nesrovnalostí;
- materiál pro reporty.

Nemají od první minuty plnit taskbar jako cockpit rozbitého logistického centra.

## 9. Delegation contract

Delegace přichází až po tom, co hráč zažije skutečně nepříjemný auditní backlog.

Budoucí stážista smí:

- generovat delegovanou raw metriku;
- předvyplnit audit;
- obsluhovat autorizovaný modul;
- vytvářet chyby;
- školit dalšího stážistu.

Nesmí:

- finálně certifikovat Evidence;
- odstranit hráčovu odpovědnost;
- být automaticky započítán jako manuální práce;
- vlastnit proces jen proto, že ho prakticky drží při životě.

Acting Lead Paradox je budoucí mechanický motiv:

> Jednotka smí vykonávat funkci, školit funkci a nést odpovědnost funkce. Nesmí obdržet autorizaci funkce.

## 10. Copy a kánon

Core loop se má vysvětlovat mechanikou, ne lore dumpem.

Humor auditů:

- začíná téměř normálně;
- roste administrativním vrstvením;
- používá mrtvou vážnost;
- nesmí být každý field samostatný punchline.

Interní kreativní zdroje, Hlas z chodby formulace a záchodové bláboly jsou content bank. Tento dokument z nich vytahuje pravidla, ale nevkládá autorskou meta rovinu do explicitního UI.

## 11. Explicitní non-goals prvního slice

Neimplementovat současně s Taskem 020:

- stážisty;
- celý první prestige;
- všechny existující moduly;
- procedurální generátor auditů;
- osm viditelných měn;
- offline automation;
- cloud;
- overlay;
- exponenciální click multipliers;
- finální analytics dashboard.

## 12. Migration rule

Pořadí migrace:

```text
Task 020 — Click packet → Audit 10-A → Evidence
Task 021 — Evidence authorization contract / Audit 16-C
Task 022 — asset-backed Fidget integration
Task 023 — Fidget packet → repeatable audit → backlog
Task 024 — machine-readable first-cycle balance/data reconciliation
Task 025 — delegation prototype až po backlog playtestu
```

Dokud konkrétní task není dokončen:

- runtime může dočasně obsahovat starší v0.2 chování;
- nové feature nesmí dále záviset na přímém `click → currency` modelu;
- rozdíl musí být v PR výslovně uveden, ne tiše domyšlen.

Schema 4 → 5 migration pro Task 023 zachová existující ClickAudit packet/audit stav, authorization a unlocky, nastaví `fidgetSessionBatchBaseline` na aktuální počet `fidget.sessionSettled` a vytvoří nula retroaktivních Fidget packetů. První packet vznikne až po třech nových settled sessions.

Současný machine-readable `events.json` obsahuje staré přímé yieldy pro `fidget.sessionSettled`, včetně `notionalWorkUnits`. Task 023 runtime tento direct-yield nepoužívá k udělení Evidence; oprava dat a parity patří do Tasku 024.

## 13. Playtest gate

Core loop je potvrzený teprve tehdy, když playtest prokáže, že je srozumitelné a alespoň krátkodobě uspokojivé:

```text
udělat činnost
→ dostat auditní povinnost
→ certifikovat metriku
→ získat Evidence
→ autorizovat Fidget
```

Pokud tento oblouk nefunguje, další moduly nejsou řešení. Jsou jen další důkazy, že se vývoj vyhnul odpovědi.
