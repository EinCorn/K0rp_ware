# K0rp_OS — Playtest Checklist

Verze: 0.2.0 pracovní RFC

## 1. Cíl

Ověřit první auditní cyklus bez cloud telemetrie a bez změny soukromí produktu.

Target:

- první prestige 240–310 minut;
- medián přibližně 270 minut;
- první systémová změna do 20–35 minut;
- Fidget do 35–65 minut;
- Bloom do 65–110 minut;
- Button Compliance před únavou z původní trojice.

## 2. Build gate

- root build projde;
- core tests/typecheck projdou;
- module tests/typecheck projdou;
- progression package typecheck projde;
- database validation nehlásí unknown IDs;
- save lze exportovat/importovat;
- Windows smoke test pro desktop window behavior;
- web fallback se načte.

## 3. First boot

- hráč chápe, že je na ploše zaměstnance;
- audit 00-A je první zřejmá akce;
- plocha není přeplněná;
- privacy text je srozumitelný;
- audit field interaction počítá právě jeden click;
- pointer movement se nepočítá;
- po submitu je jasné, co se změnilo.

## 4. 0–35 minut

- první ClickAudit feedback je okamžitý;
- hráč rozumí current vs lifetime NWU;
- první batch přijde do target okna;
- formulář 10-A působí jako nový krok, ne jen další dialog;
- click saturation není vnímána jako rozbitý counter.

## 5. Fidget/Bloom

- Fidget je úleva a kvalitativně jiná činnost;
- natural settle je čitelný;
- Bloom wave duration je přiměřená;
- cross-module bonus je pochopitelný;
- hráč nemusí přepínat každých několik sekund;
- moduly se otevírají jako okna a zachovávají svou identitu.

## 6. Corner/Button

- Corner hit není nutný pro hlavní progression;
- screensaver lze ukončit okamžitě;
- offline/idle hit se archivuje;
- Button Compliance není reflexní trest;
- Approval Units mají jasný účel;
- pending confirmation folder je pochopitelný.

## 7. Prestige

- hráč ví, co resetuje a co zůstane;
- closure lze dokončit bez guide;
- archivace/reboot je čitelná;
- po resetu se starý obsah vrací výrazně rychleji;
- Bubble Wrap působí jako nový systém, ne kosmetika;
- žádný permanentní dokument se neztratí.

## 8. Sensory test

Po 10 minutách:

- zvuk není únavný;
- sample repetition není nápadná;
- dense events nepřetěžují audio;
- bez zvuku zůstává stav čitelný;
- reduce motion zachová funkci;
- low sensory mode je stále uspokojivý.

## 9. Session exit

- existuje legitimní `UZAVŘÍT SMĚNU`;
- hráč nepřijde o zásadní rare reward;
- appka netrestá pauzu;
- pending mema lze přečíst později;
- návrat poskytne report a rozhodnutí, ne výčitku.

## 10. Qualitative questions

Po session:

1. Co jste si myslel/a, že děláte?
2. Kdy hra poprvé změnila pravidla?
3. Který modul byl nejpříjemnější a proč?
4. Který resource byl nejasný?
5. Kdy jste chtěl/a skončit?
6. Našli jste bezpečné místo k odchodu?
7. Co působilo jako práce a co jako hračka?
8. Která změna desktopu byla nejčitelnější?
9. Působil nějaký systém manipulativně?
10. Co byste otevřel/a znovu jako standalone appku?

## 11. Local-only instrumentation

Development flag smí lokálně zaznamenat:

- milestone timestamps;
- counts by K0rp event;
- current/lifetime resources;
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

## 12. Balance change discipline

Po playtestu měnit nejvýše jednu z následujících vrstev v jednom balance commitu:

- costs;
- event yield;
- timer/duration;
- unlock threshold;
- cross-module multiplier;
- reset reward.

Každá změna musí mít důvod a očekávaný dopad.
