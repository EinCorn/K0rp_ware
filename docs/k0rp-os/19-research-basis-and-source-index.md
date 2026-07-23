# K0rp_OS — Research Basis and Source Index

Verze: 0.4.0  
Účel: dohledatelnost designových rozhodnutí, nikoli tvrzení o klinickém účinku nebo zaručeném receptu na zábavu

## 1. Jak tento dokument číst

Rozlišovat:

```text
SOURCE
= konkrétní výzkum, odborný text nebo oficiální herní reference

DESIGN INFERENCE
= syntéza pro K0rp_OS, kterou musí ověřit prototype/playtest

IMPLEMENTATION
= konkrétní pravidlo v docs/data/runtime

PLAYTEST RESULT
= pozorování z našeho buildu
```

Úspěch cizí hry nedokazuje, že její jediná mechanika bude fungovat v K0rpu. Akademický výzkum také nedává univerzální přesný recept. Zdroje zmenšují prostor pro slepé domněnky; zábavnost musí potvrdit vlastní prototype.

## 2. Interní source of truth

### Product/core docs

- `00-product-vision.md`;
- `01-visual-style.md`;
- `02-product-modes.md`;
- `03-architecture.md`;
- `04-event-model.md`;
- `05-privacy-model.md`;
- `06-screen-concepts.md`;
- `07-roadmap.md`;
- `08-codex-tasks.md`;
- `09-module-backlog.md`;
- `10-language-and-copy.md`;
- `11-typography-and-brand.md`;
- `12-platform-workflow.md`.

### Progression and module strategy

- `13-progression-and-economy.md`;
- `14-sensory-feedback.md`;
- `15-unlocks-memos-and-system-mutations.md`;
- `16-playtest-checklist.md`;
- `17-first-cycle-balance.md`;
- `18-desktop-surface-progression.md`;
- `20-core-loop.md`;
- `21-activity-spectrum-and-arcade-modules.md`.

### Interní autorská syntéza

Canonical core loop vychází z interních designových úvah ZB-036 a ZB-037:

- qualification vs capability;
- Acting Lead Paradox;
- raw metrika;
- auditní certifikace;
- Evidence;
- prokrastinační nástroje;
- backlog;
- delegace vlastní prokrastinace.

Activity-spectrum rozšíření vzniklo z další interní syntézy:

- administrativní nuda jako jedna vrstva, ne celý gameplay;
- desk objects a micro-apps jako regulation;
- Priority Containment jako operational-response fantasy;
- Alignment Rally jako fyzikální argumentační systém;
- automatizace činnosti a následné řízení jejího výkonu.

Interní poznámky nejsou veřejný lore dump ani empirický výzkum. Mechanická pravidla jsou přepsaná do obecných contracts. Skrytá autorská meta rovina se nepřevádí do explicitního vysvětlení publiku.

### Machine-readable data

- `packages/korp-progression/data/progression.database.json`;
- `surface-progression.json`;
- `first-cycle.balance.csv`;
- `upgrade-catalog.csv`;
- `memo-catalog.csv`;
- package RFC a integration map.

Po Tasku 023 runtime předbíhá část starších machine-readable event yields. Task 024 sjednotí parity. Action-module candidate data se přidají až po prototype gates.

## 3. Idle and incremental design

### Playing to Wait: A Taxonomy of Idle Games

Alharthi et al.  
DOI: [10.1145/3173574.3174195](https://doi.org/10.1145/3173574.3174195)

Relevantní:

- odchod a návrat;
- waiting jako součást designu;
- automatizace;
- attention a computational cycles jako zdroje;
- posun od vykonávání ke správě.

K0rp inference:

- automatizace přijde až po zažití manual routine;
- přebírá rutinu, ale vytváří dohled;
- idle progress nesmí falšovat manual metrics;
- návrat dává report a rozhodnutí, ne trest.

## 4. Motivation, competence and autonomy

### The Motivational Pull of Video Games

Ryan, Rigby, Przybylski (2006).  
DOI: [10.1007/s11031-006-9051-8](https://doi.org/10.1007/s11031-006-9051-8)

### A Motivational Model of Video Game Engagement

Przybylski, Rigby, Ryan (2010).  
DOI: [10.1037/a0019440](https://doi.org/10.1037/a0019440)

Relevantní:

- competence;
- autonomy;
- relatedness;
- need satisfaction jako rámec motivace/engagementu.

K0rp inference:

- modul má být srozumitelný a umožnit mastery;
- upgrade volba má skutečně měnit postup, ne pouze předstírat volbu;
- intenzita se má dát regulovat;
- corporate fiction nemá hráči brát základní kontrolu nad pause/exit/accessibility.

### The Motivating Role of Violence in Video Games

Przybylski, Ryan, Rigby (2009).  
DOI: [10.1177/0146167208327216](https://doi.org/10.1177/0146167208327216)

Relevantní:

- violent content samo přidávalo málo k enjoyment/motivation po zohlednění autonomy a competence.

K0rp inference:

- Priority Containment nepotřebuje krev ani literal killing;
- satisfakce má vzniknout pohybem, buildem, čitelností a routingem;
- objekty se administrativně uzavírají, vracejí a přesměrovávají.

## 5. Challenge, flow and pacing

### Using Flow Theory to Design Video Games as Experimental Stimuli

Sharek, Wiebe (2011).  
DOI: [10.1177/1071181311551316](https://doi.org/10.1177/1071181311551316)

### Flow and enjoyment beyond skill-demand balance

Baumann, Lürig, Engeser (2016).  
DOI: [10.1007/s11031-016-9549-7](https://doi.org/10.1007/s11031-016-9549-7)

### The relationship between skill-challenge balance, expertise, flow and urge to keep playing

Larche, Dixon (2020).  
DOI: [10.1556/2006.2020.00070](https://doi.org/10.1556/2006.2020.00070)

Relevantní:

- challenge/skill vztah je důležitý, ale není univerzální jednoduchá křivka;
- expertise mění reakci na obtížnost;
- pacing a krátké breaks mohou ovlivnit flow/enjoyment;
- flow/arousal může zvyšovat urge pokračovat.

K0rp inference:

- action module potřebuje intensity/accessibility options;
- wave breaks jsou designová součást;
- těžší není automaticky lepší;
- challenge se testuje s různě zkušenými hráči;
- čisté closure a exit points jsou také etická guardrail.

## 6. Player enjoyment evidence

### Player Enjoyment in Video Games: A Systematic Review and Meta-analysis of the Effects of Game Design Choices

Caroux, Pujol (2023).  
DOI: [10.1080/10447318.2023.2210880](https://doi.org/10.1080/10447318.2023.2210880)

Relevantní:

- analyzované design choices neměly jednoduchý univerzální efekt napříč všemi kontexty;
- v agregovaných výsledcích měla konzistentní význam hudba;
- player a game characteristics je nutné zkoumat v interakci.

K0rp inference:

- neexistuje jistý checklist `autofire + particles = zábava`;
- hudba se plánuje od prototypu;
- obtížnost, control mode a juice se musí testovat v konkrétním modulu;
- review counts jiných her jsou inspirační signál, ne experimentální důkaz.

## 7. Reward learning terminology

### Dopamine reward prediction error coding

Schultz, open-access review.  
[PMC4826767](https://pmc.ncbi.nlm.nih.gov/articles/PMC4826767/)

Relevantní:

- prediction error a learning;
- rozdíl mezi očekáváním a výsledkem;
- nepřesnost populárního „dopamine hit“ jazyka.

K0rp inference:

- používat čitelná očekávání, pravidelné closure a omezené překvapení;
- netvrdit, že konkrétní effect produkuje dávku potěšení;
- variable reward nesmí být jediná retention strategie;
- upgrade pool má být transparentní a bez monetizovaných rerolls/FOMO.

## 8. Game feel and visual juiciness

### Good Game Feel: An Empirically Grounded Framework for Juicy Design

Hicks et al. (2018).  
DOI: [10.26503/dl.v2018i1.936](https://doi.org/10.26503/dl.v2018i1.936)

### Juicy Game Design: Understanding the Impact of Visual Embellishments on Player Experience

Hicks et al. (2019).  
DOI: [10.1145/3311350.3347171](https://doi.org/10.1145/3311350.3347171)

Relevantní:

- juiciness jako redundantní non-functional feedback;
- visual appeal může růst;
- competence benefit není automatický ve všech podmínkách.

K0rp inference:

- mechanika a state readability před particles;
- coherent stack místo náhodného efektového bordelu;
- A/B greybox vs sensory pass;
- ptát se, zda feedback pomáhá chápat příčinu/closure, ne pouze zda je hezčí.

## 9. Haptics and audio

### Juicy Haptic Design

Singhal, Schneider (2021).  
DOI: [10.1145/3411764.3445463](https://doi.org/10.1145/3411764.3445463)

Relevantní:

- haptic embellishments mohou posílit player experience;
- haptika je redundantní vrstva, ne jediný nositel informace.

K0rp inference:

- optional low-intensity controller haptics;
- samostatný off/slider;
- žádná vibrace za každý dense collision;
- kritický state je čitelný i bez haptiky.

### Echoes of Player Experience: Audio Assessment and Player Experience in Games

Nunes, Darin (2024).  
DOI: [10.1145/3677069](https://doi.org/10.1145/3677069)

### The Impact of Health-Related User Interface Sounds on Player Experience

Robb et al. (2017).  
DOI: [10.1177/1046878116688236](https://doi.org/10.1177/1046878116688236)

K0rp inference:

- audio bus a material semantics se testují;
- alerts musí sdělovat stav, ne pouze emoci;
- hudba a UI effects nesmějí maskovat důležité cues;
- action density potřebuje concurrency/batching.

## 10. ASMR and sensory satisfaction

### More than a feeling: ASMR is characterized by reliable changes in affect and physiology

Poerio et al.  
DOI: [10.1371/journal.pone.0196645](https://doi.org/10.1371/journal.pone.0196645)

Relevantní:

- ASMR je specifická a ne univerzální zkušenost;
- účinek se netýká automaticky každého člověka ani každého clean soundu.

K0rp inference:

- používat `sensory satisfaction` a `ASMR-adjacent`;
- čisté transienty, materiál, rytmus, prostor a pomalé návraty;
- žádné klinické sliby;
- quiet/high-frequency reduction/accessibility.

## 11. ADHD-related guardrails

### Delay discounting meta-analysis

[PMC5049699](https://pmc.ncbi.nlm.nih.gov/articles/PMC5049699/)

### Focus Cat

DOI: [10.1145/3505270.3558381](https://doi.org/10.1145/3505270.3558381)

K0rp inference:

- krátké cíle a nízký entry friction mohou být pro část lidí přitažlivé;
- idle mechanic může podpořit návrat k malé činnosti;
- K0rp_OS netvrdí, že léčí ADHD nebo „dorovnává dopamin“;
- accessibility a closure jsou důležitější než marketingový neuro-jargon.

## 12. Herní inspirační reference — incremental foundation

### Cookie Clicker

Official: [Steam](https://store.steampowered.com/app/1454400/Cookie_Clicker/)

Reference:

- progressive disclosure;
- nový systém jako reward;
- active windows uvnitř idle struktury;
- ascension.

K0rp odlišení:

- raw click není spendable currency;
- hlavní escalation je bureaucracy, ne multiplier inflation.

### AdVenture Capitalist

Official: [Steam](https://store.steampowered.com/app/346900/AdVenture_Capitalist/)

Reference:

- ruční proces před automatizací;
- manager jako odstranění známé rutiny;
- reset jako rychlejší průchod.

K0rp odlišení:

- delegace generuje errors/supervision;
- manual metric se nefalšuje.

### Revolution Idle

Official: [Steam](https://store.steampowered.com/app/2763740/Revolution_Idle/)

Reference:

- vrstvené systémy;
- automatizace dřívějších vrstev;
- nový tab jako reward;
- riziko opacity/guide dependence.

### (the) Gnorp Apologue

Official: [Steam](https://store.steampowered.com/app/1473350/the_Gnorp_Apologue/)

Reference:

- čísla zhmotněná ve světě;
- build synergies;
- čitelný chaos.

### Gamblers Table

Official: [Steam](https://store.steampowered.com/app/3618390/Gamblers_Table/)

Reference:

- material microfeedback;
- fyzika;
- sound density;
- riziko mělké metaprogression.

### Tower Wizard

Reference: [Press kit](https://impress.games/press-kit/barribob/tower-wizard)

- krátký finite incremental;
- pacing unlocků;
- legitimní konec;
- prestige respektující čas.

## 13. Herní inspirační reference — survivor/action

### Vampire Survivors

Official: [Steam](https://store.steampowered.com/app/1794680/Vampire_Survivors/)

Reference:

- minimum inputů;
- automatic attacks;
- positioning;
- frequent build choices;
- snowball a screen-clearing power.

K0rp inference:

- autofire může přesunout pozornost k movement/build decisions;
- nekopírovat 30min run ani content scale;
- action module stále potřebuje vlastní druhé sloveso a closure.

### Brotato

Official: [Steam](https://store.steampowered.com/app/1942280/Brotato/)

Reference:

- krátké waves;
- inter-wave shop/choice;
- compact runs;
- accessibility/difficulty options;
- auto/manual aiming options.

K0rp inference:

- 45–60s wave rhythm je vhodný pro desktop module;
- krátké ticho a procedural choice se dobře propojují s paper/report ceremony.

### Deep Rock Galactic: Survivor

Official: [Steam](https://store.steampowered.com/app/2321470/Deep_Rock_Galactic_Survivor/)

Reference:

- auto-shooter plus mining/objectives;
- druhé sloveso a mission structure;
- corporate framing.

K0rp inference:

- Priority Containment nesmí být pouze chůze v kruhu;
- druhé sloveso je routing/triage/owner assignment.

### Balatro

Official: [Steam](https://store.steampowered.com/app/2379780/Balatro/)

Reference:

- jednoduché základní pravidlo;
- system-changing items;
- čitelné synergie;
- silný build identity z malého počtu pravidel.

K0rp inference:

- první prototype nepotřebuje stovky upgradeů;
- dvanáct kvalitních rules může vytvořit několik build archetypů;
- description musí umožnit předvídat synergy.

### BALL x PIT

Official: [Steam](https://store.steampowered.com/app/2062430/BALL_x_PIT/)

Reference:

- ricochet physics;
- hordes;
- build/fusion;
- automation/meta layer.

K0rp inference:

- action, fyzika a automatizace mohou existovat v jednom produktu;
- Alignment Rally musí mít state/argument identity, ne pouze office reskin bounce game.

## 14. Herní inspirační reference — trajectory/rally

### Lethal League Blaze

Official: [Steam](https://store.steampowered.com/app/553310/Lethal_League_Blaze/)

Reference:

- escalating rally speed;
- angle/timing;
- ownership a readable impact.

K0rp inference:

- Alignment Rally získává drama z měnící se trajektorie a stavu;
- escalation nesmí být jen nekontrolovatelná rychlost.

### Peglin

Official: [Steam](https://store.steampowered.com/app/1296610/Peglin/)

Reference:

- jeden fyzikální input;
- dlouhý důsledek;
- relics měnící fyziku;
- trajectory anticipation.

K0rp inference:

- přesný odraz může vytvořit delší satisfakční sekvenci;
- upgrade musí měnit pravidlo, ne pouze score multiplier.

## 15. Design inferences

Následující jsou K0rp syntézy, ne přímé výsledky jediné studie:

- nejhodnotnější unlock mění pravidlo nebo surface;
- aktivita a Evidence jsou různé vrstvy;
- run-local XP smí existovat bez nové global currency;
- action module nejdřív potřebuje vlastní standalone fun gate;
- automatizace přebírá rutinu, ale vytváří supervision;
- byrokratická hustota může nahradit number inflation;
- kompetence a autonomie jsou důležitější než literal violence;
- music/audio se plánují od prototypu;
- juice posiluje čitelnost a appeal, ale není náhradou mechaniky;
- short waves a closure points mohou lépe sedět desktop module než dlouhý run;
- physical trajectory plus semantic state může vytvořit Alignment Rally;
- action module se musí vracet do OS přes reports, audits, authorizations a policy;
- launcher-risk je samostatný playtest gate;
- finite closure a možnost odejít jsou designová i etická výhoda.

## 16. Guardrails

Dokumentace nesmí tvrdit:

- že K0rp_OS léčí ADHD;
- že konkrétní interakce produkuje určitou dávku dopaminu;
- že každý tactile sound je ASMR;
- že review score dokazuje konkrétní mechaniku;
- že survivor autofire je univerzálně zábavné;
- že hard difficulty vždy vytváří flow;
- že variable reward je povinný retention tool;
- že violence je zdroj enjoymentu;
- že interní autorské poznámky jsou empirický výzkum;
- že satirická mechanika je doslovný popis konkrétní firmy/osoby.

## 17. Source update rule

Při přidání research-driven systému:

1. přidat source nebo jasně označit inference;
2. uvést, který doc/constant z něj vychází;
3. neodvozovat klinické tvrzení z recenzí;
4. oddělit inspiration, implementation a playtest result;
5. aktualizovat datum/verzi dokumentu;
6. interní osobní materiál převést na obecný mechanismus;
7. nepublikovat skrytou meta rovinu;
8. neprohlásit provisional packet threshold za canonical balance před playtestem;
9. při rozporu zdrojů zachovat nejistotu a testovat konkrétní produktovou hypotézu.
