# K0rp_OS — Activity Spectrum and Arcade Modules

Verze: `0.4.0 design RFC`  
Status: canonical strategický návrh pro budoucí module prototypes; neimplementuje runtime ani balance

## 0. Účel

Tento dokument rozšiřuje K0rp_OS o dvě nové herní větve:

- **Priority Containment** — krátká hordová operational-response hra o odrážení, routování a uzavírání priorit;
- **Alignment Rally** — fyzikální argumentační rally, ve které se neodráží míček, ale požadavek měnící administrativní stav.

Nejde o pivot pryč od auditů, Fidgetu, ClickAuditu, Bloomu ani idle-management vrstvy. Jde o doplnění chybějící části spektra intenzity tak, aby K0rp_OS unesl:

```text
mrtvou administrativu
→ taktilní uklidnění
→ rytmické soustředění
→ krátký vysokointenzivní operational response
→ delegaci
→ policy management
→ dohled nad automatizací
```

Canonical ekonomický kontrakt zůstává v `20-core-loop.md`.

## 1. Strategický závěr

K0rp_OS není kolekce miniher a není ani čistý idle clicker.

> K0rp_OS je incremental management hra, v níž systém postupně autorizuje stále příjemnější způsoby, jak se vyhnout práci, promění je v měřitelné procesy a nakonec přinutí hráče řídit jejich automatizaci jako další práci.

Nové arkádové moduly dávají smysl pouze tehdy, když dodrží stejnou systémovou osu:

```text
modulová činnost
→ raw metrika
→ natural closure
→ metric packet
→ audit
→ Evidence
→ autorizace capability
→ delegace
→ chyba automatizace
→ další audit
```

Horda ani rally nesmějí udělovat Evidence přímo za kill, zásah, combo nebo odraz.

## 2. Co znamená „dopaminově uspokojivé“

Produktové docs nesmějí používat dopamin jako synonymum pro radost nebo jako přísadu, kterou lze přidat do tlačítka.

Pracovní designový překlad je:

```text
čitelné očekávání
→ srozumitelná akce
→ rychlá multisenzorická odezva
→ viditelný účinek
→ občasné překonání očekávání
→ smysluplná volba
→ jasné uzavření malého celku
```

Cílem není maximalizovat nutkání pokračovat. Cílem je vytvořit:

- pocit kompetence;
- nízké vstupní tření;
- čitelné power spikes;
- omezenou a transparentní variabilitu;
- legitimní možnost relaci uzavřít;
- návrat bez trestu, streaku nebo propadající odměny.

## 3. Activity spectrum

Moduly se mají lišit intenzitou, nikoliv hierarchií hodnoty.

### Nízká intenzita — regulation

- Fidget;
- Zenová Zahrádka;
- Newtonova Kolíbka;
- Surface Compliance;
- Bublinková Fólie.

Hlavní příslib: opakovatelný materiálový pocit, rytmus, klidné closure.

### Střední intenzita — focused interaction

- ClickAudit;
- Bloom;
- Shape Compliance;
- Alignment Rally.

Hlavní příslib: přesnost, timing, čitelná změna stavu, krátké rozhodovací sekvence.

### Vysoká intenzita — operational response

- Priority Containment;
- pozdější incident modules;
- případně Attention Runner jako companion activity, ne hlavní combat systém.

Hlavní příslib: prostorový tlak, buildcraft, tempo a výrazné uzavření vlny.

### Management intenzita — orchestration

- backlog;
- stážisti;
- policy templates;
- supervision;
- discrepancies;
- audit automatizace.

Hlavní příslib: hráč už nevykonává vše přímo. Rozhoduje, co smí systém dělat, jakým způsobem a kdo za chybu formálně odpovídá.

## 4. Čtyři vrstvy jedné module zkušenosti

```text
1. OKAMŽITÝ POCIT
   pohyb / klik / rotace / zásah / odraz

2. SESSION A BUILD
   vlna / rally / lokální XP / upgrade volba / closure

3. OS A BYROKRACIE
   packet / audit / Evidence / autorizace

4. AUTOMATIZACE A MANAGEMENT
   delegace / policy / výjimky / dohled / incident
```

### 4.1 Okamžitý pocit

Modul musí být příjemný dřív, než vznikne jakákoliv odměna. Evidence nesmí zachraňovat slabé ovládání.

### 4.2 Session a build

High-intensity moduly smějí používat dočasné module-local XP:

```text
akce uvnitř session
→ lokální XP
→ level-up nabídka
→ dočasný build
→ XP po session zanikne
```

Lokální XP:

- není Evidence;
- není globální měna;
- neobjevuje se na taskbaru;
- neobchází audit;
- slouží pouze pacingu konkrétní session.

### 4.3 OS a byrokracie

Natural closure vytvoří raw record. Až uzavřená dávka closures nebo jiná jasná packet boundary vytvoří auditní povinnost.

### 4.4 Automatizace a management

Automatizace mění hráčské sloveso:

```text
vykonej
→ nastav build
→ přiděl operátora
→ nastav policy
→ sleduj výjimky
→ proveď zásah
```

Nesmí pouze zapnout video nebo pasivní `+x/sec`.

## 5. Povinný kontrakt každého nového modulu

Každý module RFC musí odpovědět na těchto deset otázek:

1. Jaké je jediné hlavní sloveso?
2. Co je okamžitá sensory promise?
3. V čem se hráč zlepšuje?
4. Co je přirozené closure session?
5. Jaká doslovná raw metrika vzniká?
6. Jak se raw metrika batchuje?
7. Jaký audit ji certifikuje?
8. Co Evidence v modulu autorizuje?
9. Jak se modul později deleguje?
10. Jakou novou chybu automatizace vytváří?

Pokud modul neumí odpovědět alespoň na osm bodů bez improvizace, zůstává `idea`, ne `spec`.

## 6. Priority Containment

Pracovní canonical name:

```text
Priority Containment — Zadržování priorit
```

Alternativy zůstávají naming bank:

- Escalation Control;
- Queue Suppression;
- P0 Containment.

### 6.1 Fantasy

Hráč není voják. Je dostupná kapacita.

Do prostoru vstupují:

- quick asks;
- meeting invites;
- ownerless blockers;
- duplicate tickets;
- P0 escalations;
- executive priorities.

Položky po zásahu neumírají. Jsou:

- vráceny odesílateli;
- přeřazeny;
- sloučeny;
- delegovány;
- označeny jako duplicate;
- přesunuty do follow-upu;
- administrativně uzavřeny.

### 6.2 Hlavní sloveso

```text
pohybuj se
→ drž prostor
→ směruj tlak
→ skládej routing build
```

### 6.3 Ovládání prvního prototypu

```text
WASD / šipky / analog
→ pohyb

automatický základní nástroj
→ zpracuje nejbližší nebo policy-prioritní cíl

jedna aktivní schopnost: TRIAGE PULSE
→ odtlačí okolí / označí skutečné P0 / dočasně zpomalí čas
```

První prototyp nemá mít pět cooldownů ani manuální twin-stick míření jako povinný vstup.

### 6.4 Velikost surface

Priority Containment nesmí být vtěsnán do současného `167×167` compact module content boxu.

Provisional contract:

```text
logical gameplay viewport: 320×320
runtime render: 1:1
large/detached mode: 640×640 jako přesné 2×
fractional scaling: zakázán
```

Chrome může používat stejnou module family, ale content geometry je modulová potřeba, ne univerzální číslo.

### 6.5 Struktura session

První greybox:

```text
5 s briefing
→ 45 s vlna 1
→ jedna upgrade volba
→ 50 s vlna 2
→ jedna upgrade volba
→ 55 s vlna 3
→ jedna upgrade volba
→ 60 s vlna 4
→ Executive Escalation
→ closure report
```

Cílová délka prototypu: přibližně 4–6 minut.

### 6.6 Archetypy priorit

| Typ | Chování | Procesní význam |
|---|---|---|
| Quick Ask | malý, rychlý, přímý | „jen rychlý dotaz“ |
| Meeting Invite | vytváří blokující zónu | zabraná kapacita bez výstupu |
| Ownerless Blocker | pomalý, váže okolní položky | problém, který všichni vidí a nikdo nevlastní |
| Duplicate Ticket | po běžném zásahu se rozdělí | problém řešený vytvořením kopie |
| P0 Escalation | sleduje hráče a buffuje okolí | červená barva nahrazující kontext |
| Executive Priority | mění pravidla arény | nová priorita ruší všechny předchozí priority |

### 6.7 První upgrade pool

1. **Return to Sender** — zásah se odrazí k další prioritě.
2. **Need More Data** — zásah cíl výrazně zpomalí.
3. **Owner Assignment** — označený cíl je přitahován k department slotu.
4. **CC Everyone** — účinek přeskakuje mezi blízkými položkami.
5. **Scope Freeze** — pravidelně zastaví nově příchozí položky.
6. **Reprioritize** — větší knockback, menší direct processing.
7. **Meeting Avoidance** — průchod meeting zónou vytvoří krátký dash.
8. **Flexible Capacity** — zvyšuje movement a pickup radius.
9. **Exception Process** — malá transparentně popsaná šance na administrativní closure.
10. **Redundancy Plan** — přidá druhý processing channel.
11. **Acting Lead** — pomocná jednotka vykonává funkci, ale její výstupy mají nižší audit confidence.
12. **Administrative Density** — více řetězových účinků, ale vyšší pozdější Audit Pressure.

### 6.8 Build archetypy

```text
ROUTING
Owner Assignment + Return to Sender + Reprioritize

CONTROL
Need More Data + Scope Freeze + Meeting Avoidance

THROUGHPUT
CC Everyone + Redundancy Plan + Flexible Capacity

DANGEROUS AUTOMATION
Acting Lead + Exception Process + Administrative Density
```

### 6.9 Raw event bank

```text
priority.deflected
priority.rerouted
priority.duplicateMerged
priority.escalationContained
priority.sessionClosed
priority.sessionExceeded
```

Per-frame pohyb, nepřátelský tick ani každý projectile collision nemusí být globální event. Modul může lokálně agregovat micro-events a emitovat pouze privacy-safe raw/closure records.

### 6.10 Packet a audit

Provisional candidate:

```text
2 přirozeně uzavřené incident sessions
→ priority-containment packet
→ Audit 27-P
→ certifikace právě jednou
→ Evidence +1
```

Alternativní threshold se smí změnit až po playtestu. Implementace nesmí začít globálním packetem; nejdřív musí fungovat greybox session.

První copy Audit 27-P:

```text
OVĚŘENÍ SNÍŽENÍ PRIORITNÍHO ZATÍŽENÍ

Jakým způsobem byl objem priorit snížen?

○ Priority byly vyřešeny.
○ Priority byly přeřazeny.
○ Priority byly přejmenovány.
○ Snížení nebylo možné potvrdit.
```

### 6.11 Selhání

Fail není game over ani ztráta EV.

```text
KAPACITA PŘEKROČENA
RELACE UZAVŘENA S VÝHRADOU

Nezpracované priority byly převedeny do následné kontroly.
```

Výsledek může zvýšit discrepancy risk nebo vytvořit jiný packet status. Nevynuluje dosavadní raw práci.

### 6.12 Automatizace

#### Assist

- autofire;
- hráč stále pohybuje kapacitou;
- hráč vybírá build.

#### Delegované provedení

Hráč nastaví:

- target preference;
- risk tolerance;
- povolené exception processes;
- Triage Pulse policy;
- upgrade priority.

Výstup je `source: delegated` a má vlastní confidence.

#### Autonomní policy

Hráč řídí:

- loadout template;
- priority weights;
- supervision frequency;
- allowed exceptions;
- intervention threshold.

Chyby:

- skutečné P0 označeno jako duplicate;
- ownerless blocker dostal neexistujícího ownera;
- throughput byl optimalizován na úkor kritické priority;
- session byla uzavřena bez potvrzeného výsledku;
- Acting Lead použil exception na auditně citlivou položku.

## 7. Alignment Rally

Pracovní canonical name:

```text
Alignment Rally — Argument Routing
```

Alternativy:

- Counterpoint;
- Scope Return;
- Stakeholder Alignment.

### 7.1 Fantasy

Hráč neodráží míček. Odráží požadavek.

Příklad claimu:

```text
„Toto musí být hotové dnes.“
```

Claim nese stav:

```text
PRIORITA: P0
OWNER: NEURČEN
DOPAD: NEVYHODNOCEN
TERMÍN: DNES
DŮKAZ: CHYBÍ
```

Každý odraz mění jednu vlastnost nebo přidává administrativní kvalifikaci.

### 7.2 Hlavní sloveso

```text
načasuj odraz
→ zasáhni správnou response zónu
→ změň stav tvrzení
→ uzavři relaci administrativně uznatelným výsledkem
```

### 7.3 Response zones

Paddle není homogenní plocha:

```text
[ EVIDENCE ] [ SCOPE ] [ OWNER ] [ DEPENDENCY ]
```

- `EVIDENCE` vyžádá podklady a zpomalí claim;
- `SCOPE` claim zmenší nebo rozdělí;
- `OWNER` změní department routing;
- `DEPENDENCY` připojí navazující požadavek.

### 7.4 Escalating rally

```text
1–3 odrazy   → běžná argumentace
4–7 odrazů   → další stakeholders
8–12 odrazů  → scope creep / více claimů
13+          → EXECUTIVE ALIGNMENT
```

Obtížnost nesmí růst pouze rychlostí. Smí měnit:

- velikost response zones;
- povinné kvalifikace;
- počet claimů;
- stakeholder bias;
- zakázané odpovědi;
- deadline pressure.

### 7.5 Closure outcomes

```text
ACCEPTED
REJECTED
DEFERRED
OWNER ASSIGNED
SENT OFFLINE
MEETING REQUIRED
NO DECISION RECORDED
```

Cílem není vždy „vyhrát argument“. Cílem je vytvořit uznatelný konec relace.

### 7.6 První upgrade pool

- Return With Comments;
- Need More Data;
- CC Legal;
- Scope Reduction;
- Circle Back;
- Parallel Alignment;
- Pre-Read;
- Parking Lot;
- No Objection Recorded;
- Follow Up Offline;
- Executive Sponsor;
- Minutes Approved.

### 7.7 Raw event bank

```text
argument.responseLogged
argument.qualifierAttached
argument.claimSplit
argument.commitmentCreated
alignment.sessionClosed
alignment.sentOffline
```

### 7.8 Packet a audit

Provisional candidate:

```text
3 uzavřené alignment sessions
→ alignment packet
→ Audit 31-R
→ Evidence +1 po certifikaci
```

Copy:

```text
BYLO DOSAŽENO SHODY?

○ Shoda byla dosažena.
○ Shoda byla zaznamenána.
○ Nebyl zaznamenán nesouhlas.
○ Další diskuse byla přesunuta mimo auditní stopu.
```

### 7.9 Automatizační chyby

- bot požádal sám sebe o podklady;
- claim se vrátil jako nový claim;
- dva auto-responders použili Circle Back;
- `No Objection Recorded` schválil vlastní výstup;
- `Follow Up Offline` vytvořil nekonečnou neveřejnou frontu.

## 8. Vlastní unlocky bez měnového moru

Každá appka smí mít vlastní katalog, ale ne vlastní globální peněženku.

### Čtyři druhy hodnoty

```text
RAW METRIKA
= doslovný záznam činnosti

RUN-LOCAL XP
= dočasný pacing uvnitř session

EVIDENCE
= jediná hlavní early global spendable měna

AUTHORIZATION / PROFICIENCY
= persistentní flags, ne currency
```

### Capability flow

```text
činnost objeví capability
→ audit vytvoří Evidence
→ Evidence + formulář capability autorizuje
→ capability vstoupí do budoucího draft poolu
→ později ji lze přidělit operátorovi
```

Capability není authorization.

Ne každý upgrade dostává vlastní formulář. Autorizují se rodiny:

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

## 9. Sensory contract high-intensity modulů

Juice je zesilovač, ne náhrada mechaniky.

Správné pořadí:

```text
mechanická čitelnost
→ příčina a následek
→ koherentní audio/visual/haptic stack
→ density management
```

Příklad priority deflection stacku:

1. objekt změní směr;
2. krátce se deformuje;
3. zazní material-consistent impact;
4. objeví se stavový štítek;
5. okolní objekty zareagují;
6. případná haptika proběhne ve stejném okamžiku.

Vysoká intenzita potřebuje kontrast:

```text
hlučná vlna
→ náhlé ticho
→ doznívající objekt
→ archivní vysátí
→ tisk papíru
→ jedna upgrade volba
```

Hudba a zvuk se plánují od greyboxu, ne až před releasem.

## 10. Rizika

### Launcher lepších her

Jestli hráč otevře hordu a už nikdy nechce vidět desktop, integrace selhala.

Mitigace:

- krátké sessions;
- closure má význam v OS;
- audity mění autorizace a capability pool;
- automatizace vrací hráče do managementu;
- nové moduly vznikají jako důsledky starších systémů.

### Audity jako daň za zábavu

Audit musí nabídnout alespoň jedno:

- interpretaci;
- rozhodnutí;
- riziko discrepancy;
- autorizaci;
- přípravu budoucího buildu;
- nový kontext.

Pouhé `Ano → EV +1` nesmí být dlouhodobý default.

### Content explosion

Priority Containment greybox limit:

```text
1 aréna
1 avatar
3 běžné archetypy
1 elite
1 boss
1 základní nástroj
1 aktivní schopnost
12 upgradeů
5 vln
```

Žádná druhá mapa před potvrzením první minuty.

### Automatizace odstraní kompetenci

Auto mode musí otevřít nový skill: policy, risk, staffing a intervention.

### Nečitelný viewport

High-intensity module nesmí být zmenšen, aby se vešel do existující compact frame. Surface contract musí následovat gameplay geometry.

### Dark patterns

Zakázané:

- daily streak;
- skryté odds;
- propadající nabídky;
- penalizace za odchod;
- monetizované rerolly;
- falešná urgence mimo satirickou fiction.

## 11. Prototype a playtest pořadí

### Priority Containment greybox

```text
1. pohyb a základní autofire
2. 3 archetypy
3. Triage Pulse
4. 5 vln
5. 12 upgradeů
6. local-only run summary
7. playtest
8. teprve potom sensory pass
9. teprve potom OS packet/audit integration
```

Gate:

- základní verb je pochopen bez textového tutorialu;
- první pocit síly přijde do 60–90 sekund;
- existují alespoň tři čitelné build archetypy;
- selhání je vysvětlitelné;
- hráč chce zkusit jiný build;
- session má legitimní closure.

### Alignment Rally greybox

Až po vyhodnocení Priority Containment prototype:

```text
1 claim
1 paddle
4 response zones
3 stakeholder rules
8 upgradeů
4 closure outcomes
2–3 minuty
```

## 12. Task sequence recommendation

```text
Task 031 — activity-spectrum docs/data contracts
Task 032 — Priority Containment standalone greybox
Task 033 — Priority Containment buildcraft and local session summary
Task 034 — Priority Containment sensory/readability pass
Task 035 — Priority Containment OS packet/audit integration po playtest gate
Task 036 — delegated policy prototype pro Priority Containment
Task 037 — Alignment Rally standalone greybox
Task 038 — Alignment Rally OS integration po samostatném gate
```

Číslování je návrh. `07-roadmap.md` a `08-codex-tasks.md` určují skutečné implementační pořadí.

## 13. Explicitní non-goals

Tento RFC sám neautorizuje:

- immediate implementation obou modulů;
- přímé Evidence rewardy;
- nové globální currencies;
- procedurální stovky upgradeů;
- multiplayer;
- cloud telemetry;
- nové externí privacy permissions;
- full-screen engine rewrite;
- změnu skryté autorské roviny na explicitní UI lore.

## 14. Canonical rozhodnutí

- Priority Containment dostává zelenou jako první high-intensity prototype.
- Alignment Rally dostává zelenou jako následný experiment.
- Současný Metric → Audit → Evidence loop zůstává beze změny.
- Lokální run XP je povoleno pouze jako dočasný session pacing.
- Evidence zůstává jediná hlavní early global spendable měna.
- Automatizace musí vytvářet policy, supervision a discrepancies.
- Moduly nesmějí změnit K0rp_OS v launcher oddělených her.

> Systém nejdřív autorizuje rozptýlení. Potom změří jeho účinek. Následně rozptýlení automatizuje a otevře incident, protože automatizované rozptýlení nesplnilo očekávaný dopad.
