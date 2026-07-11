# K0rp_OS — Product Vision

Verze: 0.2.0 pracovní návrh
Status: interní dokument / RFC  
Projekt: K0rp_ware → K0rp_OS

## 1. Elevator pitch

**K0rp_OS je falešný operační systém zaměstnance K0rpu.**  
Tváří se jako pracovní nástroj, ale ve skutečnosti je to hra o práci, která není práce: o klikání, fidgetování, drobných rituálech, měření ne-výkonu, pseudo-produktivitě, krypto-managementu a uklidňovacích objektech, které vypadají jako benefit, ale chovají se jako další proces.

Uživatel spouští jednotlivé moduly, plní absurdní mikro-úkony, sbírá ne zcela užitečné ukazatele, odemyká další části systému a postupně má pocit, že se účastní pracovního procesu, který je možná jen velmi dobře organizovaná forma prokrastinace.

K0rp_OS má být zároveň:

- samostatně spustitelná desktop hra,
- webový portál s jednotlivými moduly,
- sada standalone appek / widgetů,
- později overlay lišta běžící nad běžnou prací,
- in-universe rozhraní K0rpu,
- modulární TypeScriptový engine, do kterého lze postupně přidávat další appky, resources, events, unlocks a absurdní features.

## 2. Co K0rp_OS je

K0rp_OS je:

- incremental / idle / micro-interaction hra,
- satirický pseudo-produktivní systém,
- desktop UI simulátor,
- sada mini appek propojených přes společný progress,
- estetický objekt a mood machine,
- bezpečný lokální playground pro „krokrastinaci“,
- engine-first systém: nejdřív robustní jádro, potom rostoucí knihovna modulů.

Důležité: K0rp_OS není jen launcher pro tři malé appky. To je jen první viditelná vrstva. Skutečný produkt je systém, ve kterém každá mikrointerakce získává význam, metriky, vnitřní hlášení a absurdní důsledky.

## 3. Co K0rp_OS není

K0rp_OS není:

- skutečný pracovní nástroj,
- produktivní tracker,
- time-tracking software,
- nástroj na kontrolu zaměstnanců,
- spyware,
- morální systém pro zlepšení života,
- korporátní dashboard pro reálnou práci,
- klasická fullscreen game-engine hra,
- pevně uzavřený design, který nelze po měsíci přestavět, protože autor dostal lepší, horší nebo nebezpečně chutný nápad.

Pokud se K0rp_OS někdy chová jako produktivní nástroj, je to součást vtipu. Pokud by začal být skutečně užitečný, musí to být podezřelé.

## 4. Hlavní fantazie hráče

Hráč nemá být hrdina, který zachraňuje svět. Hráč je zaměstnanec systému, který obsluhuje drobné rituály a přitom se snaží udržet iluzi, že se něco děje.

Hlavní hráčská fantazie:

> „Sedím u počítače K0rpu a provádím úkony, které vypadají jako práce, měří se jako práce, odměňují se jako práce, ale v jádru jsou možná jen krásně organizovaná nicota.“

Sekundární fantazie:

> „Mám na monitoru malou rušivou věc, která mě uklidňuje, vyrušuje, zaměstnává a zároveň si ze mě dělá velmi formální srandu.“

## 5. Cílový pocit

K0rp_OS má působit jako:

- starý interní software, který nikdo nevypnul,
- pracovní stanice v liminální kanceláři,
- portál k oddělení, které neexistuje v organizační struktuře,
- hračka na nervový systém,
- corporate Tamagotchi,
- procedurální oltář pro klikání,
- retro terminal s duší účetního formuláře,
- manažerský stůl, na kterém se uklidňovací předměty změnily na KPI.

Tón:

- absurdní,
- suchý,
- lehce znepokojivý,
- korporátně klidný,
- ne hysterický,
- ne „haha random“,
- spíš normální text posunutý o 8 stupňů špatným směrem.

## 6. Jazyk produktu

Primární jazyk K0rp_OS je **čeština**.

To neznamená čistou spisovnou češtinu. Znamená to český produktový základ infikovaný korporátním doublespeakem, provozními termíny a anglicismy.

Cílový jazyk:

- česky jako hlavní UI a in-universe text,
- anglicismy skoro v každé druhé větě, pokud znějí přirozeně pro korporátní prostředí,
- výrazy jako module, dashboard, compliance, workflow, ticket, task, status, sync, performance, audit, feedback, focus, update,
- lokální CZ absurdita + globální corporate řeč,
- později anglická lokalizace, ale čeština je canonical voice.

Příklad tónu:

> „Surface Compliance dokončen. Povrch je clean. Příčina znečištění zůstává v pending review.“

Další detaily jsou v `10-language-and-copy.md`.

## 7. Stabilní principy K0rp světa pro produkt

Používat:

- krypto-management jako interní produktový koncept,
- memetickou nákazu frázemi, slogany a metrikami,
- corporate cosmic horror jen přes artefakty, UI, chyby a texty,
- objekty s větší identitou než lidé,
- anonymní funkce místo psychologicky rozepsaných postav,
- suchý humor a provozní jazyk,
- produktový jazyk, který zní jako benefit a zároveň jako varování.

Nepoužívat směrem k publiku:

- explicitní vysvětlování meta vrstvy,
- učebnicový lore dump,
- „tady je tajná metafyzika světa“,
- příliš přímou parodii jedné konkrétní firmy,
- reálné pracovní termíny tam, kde by mohly působit jako konkrétní obvinění.

## 8. Current v0.3 modules

### ClickAudit

Audit klikání a interakcí. Měří, vyhodnocuje, optimalizuje. Klik není akce. Klik je důkaz přítomnosti.

Funkce v systému:

- generuje Click Events,
- zvyšuje Audit Pressure,
- přispívá k Notional Work Units,
- odemyká milníky a hlášení.

### Fidget

Nástroj pro rozptýlení. Pomáhá přežít schůzky. Stabilizuje pozornost tím, že ji odvádí.

Funkce v systému:

- snižuje Entropy,
- generuje Fidget Stabilization,
- krátkodobě zvyšuje Perceived Control,
- může spouštět uklidňující nebo rušivé stavy.

### Bloom

Sběr drobných myšlenek. Nechte je růst. Compliance zahrádka převlečená za puzzle.

Funkce v systému:

- generuje Bloom Integrity,
- pracuje s vlnami,
- čistí / mutuje stavové kameny,
- odemyká texty spojené s péčí, růstem a drobným rozpadem.

## 9. Candidate module backlog

První sada rozšíření:

- **Corner Watch** — odrážející se KØrp logo / čekání na roh,
- **Bublinková Fólie** — praskání bublinek jako certified relaxation sheet,
- **Button Compliance** — mačkání tlačítek, potvrzování potvrzení,
- **Surface Compliance** — čištění špinavých ploch,
- **Shape Compliance** — zapadání tvarů, zarovnání, uspokojivé fitnutí,
- **Attention Runner** — endless runner pro rozdělení pozornosti,
- **Zenová Zahrádka** — manažerské hrablání písku pro procedural calm,
- **Newtonova Kolíbka** — kinetické těžítko pro přenos hybnosti a odpovědnosti.

Tyto moduly nejsou jen „další minihry“. Jsou to další oddělení K0rp_OS.

Detaily jsou v `09-module-backlog.md`.

## 10. Produktová osa

1. **K0rp_ware** — web a standalone moduly.
2. **K0rp Core** — TypeScript engine pro events, resources, progress, unlocks a module registry.
3. **K0rp_OS** — hlavní desktop hra / falešná pracovní plocha.
4. **K0rp Overlay** — malá lišta nad skutečnou prací.
5. **K0rp Account** — volitelný sync progressu, ne sledování práce.

## 11. MVP definice

MVP K0rp_OS je funkční, když:

- existuje jedna desktop/web aplikace simulující K0rp pracovní plochu,
- umí otevřít ClickAudit, Fidget a Bloom jako interní moduly,
- všechny moduly posílají eventy do společného core,
- progress a unlocky se ukládají lokálně,
- hráč vidí alespoň základní metriky,
- existují první interní hlášení / mema,
- žádný mód nesbírá citlivá data,
- architektura umožňuje přidat další modul bez přepisování starých modulů.

## 12. Nejdůležitější designová věta

> K0rp_OS má být systém, který vypadá jako produktivita, chová se jako hračka a zanechává pocit, že obojí je možná totéž.

## 13. Nejdůležitější technická věta

> K0rp_OS má být modular-first engine, ne sbírka izolovaných blbostí v hezkém rámečku.

## Platform stance

K0rp_OS je web-native a TypeScript-first, ale primární desktop platforma je Windows.

Mac se používá jako pohodlné sekundární vývojové/design/test prostředí. Je důležitý pro domácí workflow, grafiku, docs a cross-platform sanity check. Finální desktop UX a overlay behavior ale musí být ověřené na Windows.

Tohle je součást produktové reality: K0rp_OS má být robustní systém, který jde rozvíjet z gauče i od stolu, aniž by jeden režim lhal, že je tím druhým.

## 14. Canonical runtime: plocha zaměstnance

K0rp_OS desktop je canonical full-game surface. Hra se při prvním spuštění netváří jako katalog modulů ani jako dashboard s odemčenými kartami. Po přiřazení identity hráč vstoupí na téměř prázdnou fiktivní pracovní plochu zaměstnance K0rpu.

Výchozí stav:

- tmavý K0rp wallpaper,
- spodní taskbar,
- Employee ID,
- systémový čas,
- čitelný privacy status,
- Compliance Bin,
- automaticky otevřený dokument `AUDIT 00-A`.

První herní interakcí je vyplnění auditu. Každá úmyslná změna pole současně vytváří auditovatelný `clickaudit.click`. Po odeslání formuláře se teprve objeví shortcut ClickAuditu, složka Doručené a první vykázané metriky.

Důležité:

> Nový modul se nemá pouze přepnout z `locked` na `available`. Má být autorizován, nainstalován a fyzicky se projevit v operačním systému.

## 15. Progrese plochy

Dlouhodobý progress se projevuje také materiálně:

- novými shortcuts,
- složkami,
- soubory,
- pending formuláři,
- certifikáty,
- taskbar widgets,
- položkami v Settings,
- screensavery,
- změnami wallpaperu,
- build number,
- archivací po uzavření auditního cyklu.

Mema jsou soubory v Doručených. Certifikace jsou dokumenty. Corner Watch se primárně odemyká jako spořič obrazovky. Prestige se projevuje jako archivace, úklid pracovní plochy, reboot a instalace nového systému.

## 16. Oddělení herní a produktové osy

Herní progression:

```text
Audit 00-A
→ ClickAudit
→ Fidget
→ Bloom
→ Corner Watch
→ Button Compliance
→ Uzavření auditního cyklu
→ Bublinková Fólie
```

Produktové surfaces:

```text
K0rp_OS desktop
↔ web fallback
↔ standalone moduly
→ později K0rp Overlay
→ volitelně account/sync
```

Overlay ani standalone build nejsou hráčské prestige rewards. Jsou to technické/product modes sdílející stejné core, manifests a event semantics.
