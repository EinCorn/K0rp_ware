# K0rp_OS — Playtest Checklist

Verze: 0.4.0 pracovní RFC

## 1. Cíl

Ověřit K0rp_OS bez cloud telemetry a bez porušení local-first privacy.

První canonical loop:

```text
udělat činnost
→ vytvořit raw metriku
→ dostat auditní povinnost
→ certifikovat metriku
→ získat Evidence
→ autorizovat nový systém
→ vytvořit druhou metriku a backlog
```

Action-module prototype gate:

```text
pochopit hlavní verb
→ získat okamžitou odezvu
→ vytvořit dočasný build
→ uzavřít krátkou session
→ chtít zkusit jiný build
→ teprve potom uvažovat o OS packetu
```

## 2. Zásada měření

Rozlišovat:

- technickou correctness;
- srozumitelnost;
- krátkodobou satisfakci;
- únavu;
- pacing;
- chuť delegovat;
- chuť opakovat session;
- manipulativní tlak.

Hodnocení `funguje` neznamená `je zábavné`. Hodnocení `je šťavnaté` neznamená `je čitelné`.

## 3. Current playtest targets

Pro současný core:

- Audit 00-A do 1–3 minut;
- bootstrap ClickAudit packet z prvního post-unlock clicku;
- první Evidence do 5–15 minut celkem;
- Audit 16-C / Fidget permit do 10–25 minut;
- první Fidget packet po 3 skutečných settled sessions;
- mixed backlog musí být citelný před delegací.

Původní first-prestige target 240–310 minut je provisional do Tasku 024 a dalších playtestů.

## 4. Build gate

- root build projde;
- runtime tests projdou;
- persistence tests projdou;
- core tests/typecheck projdou;
- module tests/typecheck projdou;
- progression typecheck/validation projde;
- save migration projde;
- asset validators projdou pro dotčený visual task;
- Windows smoke test pro window behavior;
- web fallback se načte.

Codex musí na konci tasku vypsat přesné PowerShell příkazy.

## 5. First boot

- hráč chápe, že je na pracovní ploše zaměstnance;
- Audit 00-A je první zřejmá akce;
- plocha není přeplněná;
- privacy text je normální a srozumitelný;
- field activation vytvoří právě jeden raw click;
- pointer movement se nepočítá;
- po submitu se odemkne ClickAudit;
- submit nevynutí náhodný popup jiného okna;
- Audit 00-A nepřidá Evidence.

Kvalitativní otázka:

> Působí první audit jako iniciační procedura, nebo jako formulář vložený před skutečnou hru?

## 6. Raw metric integrity

### ClickAudit

- jeden fyzický intent = jeden manual click;
- drag handle pointer down = jeden click;
- drag movement = nula dalších clicks;
- delegated/system activity se neslévá s manual count;
- refresh zachová raw counter;
- raw click nepřidává Evidence;
- profile classification neukládá citlivý obsah.

### Fidget

- smysluplný spin a natural settle = právě jeden `sessionSettled`;
- pouhý open/close není closure;
- průběžné frames/ticks nejsou global events;
- raw settle nepřidává Evidence;
- refresh/migration nevytváří retroactive packets.

Kvalitativní otázka:

> Vypadá raw metrika jako doslovný záznam činnosti, nebo jako převlečená měna?

## 7. Packet creation

### ClickAudit

- bootstrap vznikne právě jednou;
- další normal packet až po 25 nových raw clicks;
- packet má correct range/quantity/status;
- refresh ho nevytvoří znovu;
- quantity-1 Audit 10-A auto-openne pouze jednou;
- pozdější packets jen přibudou do Formulářů bez focus steal.

### Fidget

- 1–2 nové sessions nevytvoří packet;
- 3. session vytvoří právě jeden range packet;
- remainder se zachová;
- packet creation neotevře auditní okno;
- mixed pending count zahrnuje oba sources;
- stejně range se nevytvoří dvakrát.

Kvalitativní otázka:

> Hráč chápe, že packet je nová povinnost, ne reward chest?

## 8. Audit and certification

- audit instance je navázaná na konkrétní packet;
- draft jde vyplnit;
- form clicks přispívají k další ClickAudit raw dávce;
- submit certifikuje právě jeden packet;
- Evidence se přidá právě jednou;
- repeated submit/double click/reload Evidence nezdvojí;
- certified document zůstane dohledatelný;
- packet status je `certified`;
- copy je krátké, suché a administrativní.

Kvalitativní otázky:

1. Je zřejmé, že audit změnil status stejné aktivity?
2. Působí Evidence jako uznaný záznam?
3. Je audit mechanická konverze, nebo jen dialog navíc?
4. Nejsou všechny odpovědi jen čtyři různé punchlines?

## 9. Evidence UI

Early taskbar:

- zobrazuje EV;
- zobrazuje celkový pending count;
- nezobrazuje všechny hidden meters;
- raw metrics jsou uvnitř modulů;
- nepoužívá současně NWU a Evidence pro tutéž hodnotu;
- run-local XP se nikdy neobjeví jako global EV.

Kvalitativní otázka:

> Rozumí hráč rozdílu mezi aktivitou, lokálním score a institucionálně uznanou Evidence?

## 10. Authorization

Audit 16-C:

- není dostupný bez EV;
- při EV 1 je dostupný;
- submit alokuje právě 1 EV;
- EV nejde pod nulu;
- Fidget se objeví až po authorization;
- repeated submit znovu neutrácí;
- authorization přežije refresh;
- surface mutation je viditelná, ale neukradne focus bez důvodu.

Kvalitativní otázka:

> Působí Fidget jako schválený nový systém, nebo jako položka koupená v běžném shopu?

## 11. Mixed backlog test

Task 023 je technicky hotový, ale delegation gate je kvalitativní.

- pending audits jsou viditelné, ale ne FOMO agresivní;
- backlog vzniká přirozeně používáním modulů;
- hráč může pokračovat v příjemné činnosti i s backlogem;
- backlog nezačne okamžitě blokovat vše;
- backlog není tak pomalý, že delegace nemá důvod;
- debug pressure odpovídá pending/stáří/discrepancies;
- pressure se nepersistuje jako fake resource;
- více packet sources působí jako jeden systém.

Otázky:

1. Kdy jste poprvé nechtěl/a vyplnit další audit?
2. Byla to produktivní designová únava, nebo pouze špatné UI?
3. Chtěl/a jste pomocníka dřív, než vám ho hra nabídla?
4. Přestali jste používat modul jen proto, že vytvářel paperwork?
5. Působila queue jako následek vaší aktivity?

Task 025 se otevírá pouze tehdy, když odpověď na 3 je často ano a odpověď na 4 není dominantně ano.

## 12. Delegation test

Po Tasku 025:

- stážista nevytváří manual clicks;
- delegated source je oddělený;
- delegace ubere rutinu;
- vytvoří výjimku, discrepancy nebo control sample;
- hráč vlastní finální certifikaci;
- assistant není pouhé `+x/sec`;
- capability a authorization nejsou slité;
- personnel artifacts jsou čitelné.

Kvalitativní otázka:

> Přestali jste dělat rutinu a začali řídit její problémy?

## 13. Current/later module test

### Bloom

- vlastní identita;
- wave closure je odlišná od click/settle;
- packet framework je společný;
- module-local values se neslévají s EV;
- cross-module bonusy nepřicházejí před čitelností loopu.

### Corner Watch

- corner hit není povinný;
- screensaver lze ukončit okamžitě;
- idle report není trest za nepřítomnost;
- near miss není falešně prezentovaný jackpot.

### Button Compliance

- panel není reflexní punishment game;
- sequence closure je čitelné;
- exceptions vytvářejí proces, ne game over;
- approval value má pozdější smysl.

## 14. Priority Containment greybox gate

Priority Containment se testuje nejdřív standalone bez OS progression.

### Scope check

```text
1 arena
movement
autofire
Triage Pulse
3 basic archetypes
1 elite
1 boss
5 waves
12 upgrades max
4–6 minute closure
```

Pokud prototype překročí scope před prvním playtestem, zastavit content expansion.

### First-minute test

- hráč se umí hýbat do 10 sekund;
- chápe, co je hrozba a co je processing effect;
- autofire dává smysl bez vysvětlení;
- Triage Pulse je rozpoznatelný;
- avatar, safe space a P0 jsou čitelné;
- žádný textový tutorial není nutný pro základní verb.

### Power curve test

- první významná upgrade volba do 60–90 sekund;
- upgrade mechanicky popisuje účinek;
- změna buildu je okamžitě viditelná;
- alespoň tři odlišné build archetypy jsou viable;
- jedna nabídka není vždy objektivně správná;
- random pool je transparentní a ne FOMO.

### Failure/closure test

- hráč dokáže říct, proč kapacita selhala;
- fail není vizuálně zaměněn s technickým bugem;
- `closed with reservation` je srozumitelný;
- raw report nevypadá jako EV reward;
- session lze pause/exit bez propadlé odměny;
- hráč má chuť zkusit jiný build.

### Launcher-risk test

Po session se zeptat:

1. Chcete se vrátit na K0rp desktop, nebo spustit jen další run?
2. Má pro vás report/audit potenciální význam, nebo je překážkou?
3. Dovedete si představit, že později řídíte policy místo přímého pohybu?
4. Působí module jako součást K0rpu, nebo jako jiná hra s ticket skiny?

Pokud většina hráčů chce pouze nekonečný standalone run a OS layer je čistá daň, integration design selhal.

## 15. Priority sensory gate

Až po funkčním greyboxu porovnat minimal a sensory build.

- feedback zlepšuje čitelnost;
- material archetypes jsou rozlišitelné;
- audio při peak density není stěna;
- wave break skutečně ztiší systém;
- music escalation nepřekryje alerts;
- screen shake off zachová pocit;
- reduce motion zachová timing;
- bez zvuku je stav čitelný;
- po 10 minutách není sample repetition únavná;
- integer 1×/2× render je sharp.

## 16. Priority OS integration gate

Až po accepted prototype:

- session closure emituje právě jeden privacy-safe aggregate event;
- run XP/score nevstupuje do global resources;
- packet threshold vychází z playtestu;
- packet creation neotevírá audit;
- Audit 27-P certifikuje právě jednou;
- raw kills/deflections nedávají EV;
- authorization vytvoří čitelnou surface mutation;
- action window není zmenšené do 167×167;
- desktop po zavření module zůstává použitelný.

## 17. Alignment Rally greybox gate

První scope:

```text
1 claim
1 paddle
4 response zones
3 stakeholder rules
8 upgrades max
4 closure outcomes
2–3 minute session
```

Test:

- hráč chápe, že mění stav claimu, ne pouze odráží míček;
- response zones jsou čitelné;
- trajectory/timing je uspokojivé;
- rally escalation není jen rychlejší chaos;
- closure outcomes dávají mechanický smysl;
- claim template není nutné číst během každého frame;
- module není pouze jednorázový vtip;
- custom/free text se neukládá do telemetry.

## 18. Automation/policy test

Po pozdějším policy prototype:

- hráč chápe target weights a risk tolerance;
- policy outcome se dá vysvětlit;
- delegated activity je oddělená;
- automation nepředstírá manual skill;
- discrepancy vzniká z konkrétního pravidla;
- intervention je skutečné rozhodnutí;
- auto mode není pouze video;
- hráč může převzít řízení nebo policy upravit.

Kvalitativní otázka:

> Přesunula automatizace zábavu z pohybu do rozhodování, nebo ji prostě odstranila?

## 19. Visual/window gate

Pro curated window tasks:

- complete shell se neroztahuje;
- frame používá nine-slice;
- header three-slice;
- material tile native resolution;
- live text není baked;
- compact 167×167 content se nezmenší;
- portrait audit/folder zůstává čitelný;
- action viewport je content-driven;
- active/inactive/hover/pressed states jsou jasné;
- controls mají správné hitboxy;
- browser scale nevytváří blur navíc;
- resize nesmí měnit logical gameplay coordinates.

## 20. Prestige

- hráč ví, co resetuje a co zůstane;
- closure lze dokončit bez guide;
- archivace/reboot je čitelná;
- stará cesta se po resetu vrací rychleji nebo jinak;
- nový systém působí jako systém, ne kosmetika;
- žádný permanentní document se neztratí;
- action-module progress není omylem resetován špatným scope.

## 21. Session exit and ethical retention

- existuje legitimní pause/exit/`UZAVŘÍT SMĚNU`;
- hráč nepřijde o rare reward jen proto, že odešel;
- appka netrestá pauzu;
- pending audits lze zpracovat později;
- návrat poskytne report a rozhodnutí, ne výčitku;
- žádný daily streak;
- žádná energie;
- žádná časově omezená upgrade nabídka;
- žádné skryté odds;
- žádné agresivní notification loops.

## 22. Qualitative questions

Po core session:

1. Co jste si myslel/a, že vyrábíte?
2. Kdy jste pochopil/a rozdíl mezi raw metrikou a Evidence?
3. Působily audity jako konverze, nebo dialog navíc?
4. Kdy jste chtěl/a rutinu delegovat?
5. Co působilo jako práce a co jako hračka?
6. Která surface mutation byla nejčitelnější?
7. Působil nějaký systém manipulativně?
8. Co byste otevřel/a znovu jako standalone appku?
9. Který modul byl nejpříjemnější a proč?
10. Který modul nejvíc poškodil chuť vrátit se na desktop?

Po action prototype:

1. Jaké bylo hlavní sloveso?
2. Co způsobilo první pocit síly?
3. V čem se buildy lišily?
4. Proč session skončila?
5. Chtěli jste další run, nebo jiný systém?
6. Působila corporate vrstva mechanicky, nebo pouze jako skin?

## 23. Local-only instrumentation

Development flag smí lokálně zaznamenat:

- milestone timestamps;
- K0rp event counts;
- packet/certification times;
- EV earned/spent;
- pending backlog;
- manual/delegated/system split;
- unlock order;
- window open/close;
- save/load errors;
- action session start/end;
- selected upgrade IDs;
- aggregate wave/closure outcome;
- performance summary.

Nesmí zaznamenat:

- jiné app names;
- URL;
- keys mimo K0rp;
- screenshots;
- raw pointer replay;
- osobní obsah;
- free-text claims;
- cloud telemetry bez samostatného rozhodnutí.

## 24. Balance change discipline

Po playtestu měnit nejvýše jednu vrstvu v jednom balance commitu:

- packet size;
- Evidence reward;
- audit field count;
- authorization cost;
- timer/duration;
- unlock threshold;
- discrepancy chance;
- upgrade weight;
- wave density;
- enemy speed/health;
- cross-module modifier;
- reset reward.

Každá změna musí uvést:

- pozorování;
- hypotézu;
- jednu změněnou vrstvu;
- očekávaný dopad;
- nový gate.

## 25. Důležité pravidlo

> Nejdřív ověřujeme, zda je příjemné něco dělat. Potom zda je zajímavé to certifikovat. A teprve potom zda je zábavné přestat to dělat a začít řídit někoho, kdo to dělá za nás.
