# K0rp_OS — Playtest Checklist

Verze: 0.3.0 pracovní RFC

## 1. Cíl

Ověřit canonical loop bez cloud telemetry a bez změny local-first privacy:

```text
udělat činnost
→ vytvořit raw metriku
→ dostat auditní povinnost
→ certifikovat metriku
→ získat Evidence
→ autorizovat nový systém
```

První priorita není přesná délka prestige cyklu. První priorita je zjistit, zda je zábavný a srozumitelný oblouk do Fidgetu.

## 2. Current playtest targets

Pro Tasks 020–023:

- Audit 00-A do 1–3 minut;
- první ClickAudit packet do 3–10 minut po unlocku;
- první Evidence do 5–15 minut celkem;
- Audit 16-C / Fidget permit do 10–25 minut;
- první Fidget packet podle skutečné session délky;
- backlog musí být citelný před delegací.

Původní first-prestige target 240–310 minut je provisional do Tasku 024.

## 3. Build gate

- root build projde;
- runtime tests projdou;
- runtime persistence tests projdou;
- core tests/typecheck projdou;
- module tests/typecheck projdou;
- progression package typecheck projde;
- database validation nehlásí unknown IDs;
- save migration test projde;
- Windows smoke test pro desktop window behavior;
- web fallback se načte.

## 4. First boot

- hráč chápe, že je na ploše zaměstnance;
- Audit 00-A je první zřejmá akce;
- plocha není přeplněná;
- privacy text je srozumitelný;
- audit field activation počítá právě jeden raw click;
- pointer movement se nepočítá;
- po submitu se odemkne ClickAudit;
- Audit 00-A sám nepřidá Evidence.

## 5. Raw metric integrity

ClickAudit:

- jeden úmyslný fyzický klik = jeden manual click;
- drag pointer movement nepřidává další kliky;
- delegated/system-generated activity se neslévá s manual count;
- refresh zachová raw counter;
- klik nepřidává přímo Evidence;
- source/profile classification neukládá citlivý obsah.

Kvalitativní otázka:

> Působí ClickAudit jako doslovný záznam aktivity, nebo jako obyčejný currency button?

Správná odpověď je první.

## 6. Packet creation

- 24 nových kliků nevytvoří packet;
- 25. klik vytvoří právě jeden pending packet;
- packet má jasný stav a množství;
- po refreshi se nevytvoří znovu;
- starý save nevytvoří retroaktivní packets;
- další dávka začne od správné baseline;
- batch nevypadá jako automaticky otevřená reward chest.

Kvalitativní otázka:

> Hráč chápe, že vznikla povinnost něco ověřit, ne že právě vyhrál šest bodů?

## 7. Audit 10-A and certification

- Audit 10-A je navázán na konkrétní packet;
- validní audit instance jde vyplnit;
- kliky ve formuláři už přispívají k další raw dávce;
- submit certifikuje právě jeden packet;
- Evidence se přidá právě jednou;
- repeated submit, double click nebo reload Evidence nezdvojí;
- dokončená audit instance zůstane dohledatelná;
- packet změní stav na `certified`.

Kvalitativní otázky:

1. Je zřejmé, že audit změnil status stejné aktivity?
2. Působí Evidence jako uznaný záznam, nebo jen jako náhodná měna?
3. Je formulář krátký, suchý a administrativně absurdní bez stand-up comedy tónu?

## 8. Evidence UI

Early taskbar:

- zobrazuje Evidence/EV;
- zobrazuje pending audit count;
- nezobrazuje všechny hidden meters;
- raw count zůstává uvnitř ClickAuditu;
- player-facing copy nepoužívá současně NWU i Evidence pro stejnou hodnotu.

Kvalitativní otázka:

> Rozumí hráč rozdílu mezi počtem kliků a počtem uznaných důkazů?

## 9. Audit 16-C and Fidget authorization

- Audit 16-C není dostupný bez Evidence;
- při EV 1 je dostupný;
- submit alokuje/spotřebuje právě 1 EV;
- Evidence nejde pod nulu;
- Fidget shortcut se objeví až po autorizaci;
- repeated submit znovu neutrácí;
- unlock přežije refresh.

Kvalitativní otázka:

> Působí Fidget jako nový schválený systém a odměna, ne jako další položka v shopu?

## 10. Fidget second metric

Po Tasku 023:

- Fidget je kvalitativně jiná hmatová činnost;
- session má čitelné natural closure;
- `sessionSettled` vytváří raw record nebo packet podle schváleného threshold;
- Fidget nepřidává Evidence přímo;
- Fidget packet jde auditovat stejným frameworkem jako ClickAudit packet;
- module-local state a global Evidence se neslévají.

Gate:

> Stejný core loop funguje pro dva různé typy činnosti bez speciálního hardcodovaného druhého systému.

## 11. Backlog test

- pending audity jsou viditelné, ale ne FOMO agresivní;
- backlog vzniká přirozeně používáním modulů;
- Audit Pressure odpovídá backlogu, stáří nebo discrepancies;
- hráč začne chtít rutinu delegovat;
- backlog není tak rychlý, že znemožní samotné používání appek;
- backlog není tak pomalý, že delegace nemá smysl.

Kvalitativní otázky:

1. Kdy jste poprvé nechtěl/a vyplnit další audit?
2. Byla to příjemná designová únava, nebo jen otravné UI?
3. Chtěl/a jste pomocníka dřív, než vám ho hra nabídla?

Teprve pozitivní odpověď na třetí otázku otevírá Task 025.

## 12. Delegation test

Po Tasku 025:

- stážista nevytváří manual clicks;
- delegated activity je oddělená;
- delegace ubere rutinu;
- delegace vytvoří výjimky nebo discrepancies;
- hráč stále vlastní finální certifikaci;
- systém nehraje celý modul místo hráče bez nového management rozhodnutí.

Kvalitativní otázka:

> Přestali jste dělat rutinu a začali řídit její problémy?

## 13. Later module test

Fidget/Bloom:

- každý modul má vlastní identitu;
- každý generuje jinou raw metriku;
- packet/audit framework je společný;
- hráč nemusí přepínat každých několik sekund;
- cross-module bonusy přicházejí až po čitelnosti jednotlivých loopů.

Corner/Button:

- Corner hit není nutný pro hlavní progression;
- screensaver lze ukončit okamžitě;
- Button Compliance není reflexní trest;
- Approval Units mají jasný pozdní účel;
- exceptions vytvářejí další proces, ne game-over.

## 14. Prestige

Až po Tasku 024+:

- hráč ví, co resetuje a co zůstane;
- closure lze dokončit bez guide;
- archivace/reboot je čitelná;
- po resetu se stará cesta vrací rychleji;
- Bubble Wrap působí jako nový systém, ne kosmetika;
- žádný permanentní dokument se neztratí.

## 15. Sensory test

Po 10 minutách:

- zvuk není únavný;
- sample repetition není nápadná;
- dense events nepřetěžují audio;
- bez zvuku zůstává stav čitelný;
- reduce motion zachová funkci;
- low sensory mode je stále uspokojivý.

## 16. Session exit

- existuje legitimní `UZAVŘÍT SMĚNU`;
- hráč nepřijde o zásadní rare reward;
- appka netrestá pauzu;
- pending audity lze zpracovat později;
- návrat poskytne report a rozhodnutí, ne výčitku.

## 17. Qualitative questions

Po session:

1. Co jste si myslel/a, že vyrábíte?
2. Kdy jste pochopil/a rozdíl mezi metrikou a Evidence?
3. Kdy hra poprvé změnila pravidla?
4. Působily audity jako smysluplná konverze, nebo jen dialog navíc?
5. Který modul byl nejpříjemnější a proč?
6. Kdy jste chtěl/a rutinu delegovat?
7. Co působilo jako práce a co jako hračka?
8. Která změna desktopu byla nejčitelnější?
9. Působil nějaký systém manipulativně?
10. Co byste otevřel/a znovu jako standalone appku?

## 18. Local-only instrumentation

Development flag smí lokálně zaznamenat:

- milestone timestamps;
- counts by K0rp event;
- packet creation/certification times;
- Evidence earned/spent;
- pending backlog;
- manual/delegated/system split;
- unlock order;
- window open/close;
- save/load errors.

Nesmí zaznamenat:

- názvy jiných aplikací;
- URL;
- klávesy mimo K0rp;
- screenshoty;
- osobní obsah;
- cloud telemetry bez samostatného explicitního rozhodnutí.

## 19. Balance change discipline

Po playtestu měnit nejvýše jednu vrstvu v jednom balance commitu:

- packet size;
- Evidence reward;
- audit field count;
- authorization cost;
- timer/duration;
- unlock threshold;
- discrepancy chance;
- cross-module modifier;
- reset reward.

Každá změna musí mít důvod, očekávaný dopad a konkrétní playtest pozorování.
