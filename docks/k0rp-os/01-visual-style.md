# K0rp_OS — Visual Style Guide

Verze: 0.1.3 pracovní návrh  
Status: interní vizuální směr
![K0rp_OS concepts](./assets/concepts/)

## 1. Základní estetika

Cíl: **pixelart s nádechem komiksů 50. let, starého interního softwaru, špinavých průmyslových panelů a liminální kancelářské tísně.**

K0rp_OS nesmí působit jako čistý moderní produkt. Má působit jako rozhraní, které bylo původně navrženo pro něco velmi nudného, ale časem se v něm usadila osobnost.

Klíčová slova:

- pixelart,
- 8–16 bit feeling,
- CRT/terminal patina,
- špinavý kancelářský hardware,
- retro industrial panel,
- golden-age comics linka,
- 50s corporate optimism po lobotomii,
- liminální chodby,
- utilitární UI,
- signage,
- vnitřní rozhlas,
- tabulky, štítky, varování, oddělení,
- manažerské desk objects, které vypadají uklidňující jen do chvíle, než je systém začne měřit.

## 2. Vizuální reference z aktuální práce

### K0rp_ware dashboard

Aktuální dashboard už dobře drží směr: robustní rámy, černé panely, špinavé kovové povrchy, barevně odlišené moduly, pixelová typografie a in-universe texty typu „vše, co nezaznamenáme, neexistuje“.

Zachovat:

- těžké panely,
- modulární karty,
- zvýraznění červená/žlutá/zelená,
- horní status bar,
- pocit starého interního portálu,
- elevator / hallway vignette jako živý kus budovy.

Rozšířit:

- víc falešných systémových prvků,
- interní memo prvky,
- stav zaměstnance,
- fake taskbar,
- chybová hlášení a upozornění,
- locked module placeholders,
- desk object shelf / wellness section.

### Shared app shell

Současný shell je základní vizuální jazyk widgetů.

Zachovat:

- venkovní kovový rámeček,
- app-window jako vnitřní pracovní plocha,
- close/pin/reset/mode controls,
- transparentní okno bez nativního titlebaru,
- tmavou patinu,
- pocit, že každá appka je fyzický kus interního zařízení.

### ClickAudit

Silné prvky:

- flip-card digit look,
- liquid progress uvnitř číslic,
- hvězdičky jako absurdní odměna,
- zdroj kliků jako falešný analytický panel.

Směr:

- počítadlo má působit jako starý mechanický stroj,
- liquid nemá být moderní gradient, ale pixelová hmota / interní kapalina,
- hvězdičky mají být trochu příliš slavnostní na banální klikání.

### Fidget

Silné prvky:

- velký fyzický spinner,
- barevná aura pohybu,
- levé ovládání režimu,
- přepínače KLIK/RUČNÍ.

Směr:

- fidget má působit hmatově,
- spinner může být skoro objekt moci,
- pohybové trail efekty držet v červené/žluté/zelené,
- nezahlcovat: Fidget je stabilizační, ne cirkus.

### Bloom

Silné prvky:

- květina / kameny / drobné lístky,
- green/yellow/red status,
- compliance garden pocit,
- „Nechte je růst“ jako jemně znepokojivá věta.

Směr:

- puzzle stones mají vypadat jako drobné pracovní myšlenky / úkolové sedimenty,
- red stones nemají být jen „bad“, ale spíš infikované / přetížené,
- burst efekt by měl být spíš suchý procedurální rozpad než ohňostroj.

### Hlas z chodby thumbnails

Důležitý inspirační směr: liminální chodba, kancelářský prostor, figurína / objekt člověka, strohé označení místnosti, staré světlo, absurdní předmět s klidnou kompozicí.

Použít pro K0rp_OS:

- backgroundy plochy,
- loading screens,
- help / knowledge base,
- interní školení,
- onboarding,
- „screenshoty“ oddělení,
- idle hallway screens.

## 3. Barevný systém

### Primární tmavé materiály

- uhlová černá,
- špinavá grafitová,
- tmavý kov,
- starý beton,
- zažloutlá šedá,
- vybledlá kancelářská béžová.

### Akcenty

- červená: audit, chyba, výstraha, ClickAudit,
- žlutá: fidget, pozornost, nestabilní pomoc,
- zelená: Bloom, růst, compliance, falešná bezpečnost,
- modrá: help, knowledge base, systémová informace,
- oranžová: cleaning, warning, procedural care,
- fialová/tmavá duha: vzácné nebo toxicky uklidňující eventy,
- šedobílá: text, starý štítek, prach.

### Rainbow / liquid

Rainbow kapalina může existovat, ale musí být špinavá, pixelová, skoro toxická. Ne čistý pride gradient / moderní candy UI. Má působit jako interní spektrální náplň systému.

## 4. Typografie

### 4.1 Canonical UI font

Primární font pro texty, popisky, tlačítka, panely, tooltipy, interní hlášky a běžné UI texty je:

```text
Pixel Operator
Pixel Operator Mono
```

Použití:

- `Pixel Operator` = běžné UI texty, popisky, titulky modulů, tlačítka, krátké hlášky.
- `Pixel Operator Mono` = systémové texty, čísla, event log, debug/status panely, registry, faux terminal, hodnoty resources.

Tohle není volitelná estetická preference, ale součást identity K0rp_OS. Texty samotné aplikace mají být v tomto fontovém směru, protože současný vizuální jazyk app shellu, dashboardu a pixelového corporate UI na něm stojí.

### 4.2 Logo

Logo `KØrp` / `K0rp_ware` je už rozhodnuté a nemá se redesignovat v rámci běžného UI polish nebo refactoru.

Pravidlo:

```text
Logo je asset / značka.
UI text je Pixel Operator / Pixel Operator Mono.
```

Codex ani jiný implementační agent nemá navrhovat nové logo, měnit tvar `Ø`, nahrazovat značku generickým wordmarkem nebo „vylepšovat“ logo bez explicitního zadání.

### 4.3 Fallbacky

Pokud font není dostupný, UI může dočasně použít fallback pouze jako technickou nouzovku:

```css
font-family: "Pixel Operator", "Pixel Operator Mono", monospace;
```

Fallback nesmí změnit vizuální směr produktu. Pro release build má být fontová dostupnost řešená vědomě a testovaná.

### 4.4 Čitelnost

Text musí být čitelný, i když je stylizovaný. Pixelart nesmí být výmluva pro nečitelný bordel.

Doporučení:

- krátké UI labely držet velké a kontrastní,
- delší memo texty dávat do panelů s dostatečným line-height,
- čísla a statistiky preferovat v mono variantě,
- nepoužívat subpixelově malé texty jen proto, že „vypadají retro“.

### 4.5 Font files a licence

Dokumentace definuje fontový směr, ale nepřikládá fontové soubory. Před distribucí desktop/web buildu je nutné ověřit licenční podmínky zvolených fontů a rozhodnout, zda se font bundluje, načítá lokálně, nebo se použije licenčně bezpečná náhrada.

## 5. UI materiály

Používat:

- kovové rámy,
- šrouby,
- rýhy,
- staré plastové tlačítko,
- štítky,
- nalepené papírky,
- CRT glow,
- scanlines jemně,
- vnitřní stíny,
- patinu,
- prach,
- mřížku,
- mechanické hinges,
- drobné analogové objekty: fólie, kolíbka, písek, kuličky, hrábě, bubliny, tlačítka.

Nepoužívat moc:

- čistý glassmorphism,
- moderní gradients bez pixelové patiny,
- neumorphism,
- příliš neonový cyberpunk,
- příliš veselý cartoon,
- sterilní mobile-game UI.

## 6. Komiks 50. let — jak přesně

Neznamená to „superhrdina v plášti“. Znamená to:

- omezené palety,
- silnější ink linku,
- halftone pocit,
- lehce přepálené plakátové pózy,
- staré firemní instruktážní materiály,
- optimistické layouty s depresivním obsahem,
- nápisy jako z manuálu, který tvrdí, že všechno bude v pořádku.

Příklad použití:

- školící obrazovka: „SPRÁVNÉ DRŽENÍ KLIKU“;
- interní plakát: „ÚSMĚV JE VOLITELNÝ, PŘÍTOMNOST POVINNÁ“;
- help screen: figurína ukazuje na panel a má přes obličej post-it;
- wellness plakát: „RELAXATION SHEET — schválená forma neodpočinku“.

## 7. K0rp_OS plocha

Desktop má působit jako pracovní stanice ve firmě, která interně vyvinula vlastní OS, protože běžné systémy byly příliš lidské.

Základní prvky:

- tmavý/šedý wallpaper s logem KØrp,
- levý sloupec ikon,
- spodní taskbar,
- employee id,
- systémový čas,
- notional work counter,
- interní status / shift / oddělení,
- Recycle / Compliance Bin,
- locked modules jako šedé ikony s razítkem „PENDING“.

## 8. Vizuální směr nových modulů

### Corner Watch

- černá/tmavá obrazovka,
- malé KØrp logo nebo module icon odrážející se od hran,
- screen-saver patina,
- corner hit jako přehnaně slavnostní mikro-event.

### Bublinková Fólie

- červená nebo špinavě růžová fólie jako fake wellness produkt,
- malé bubliny s mechanickým pixel pop efektem,
- občasné vadné / extra tvrdé bubliny,
- obal jako certified corporate relaxation sheet.

### Button Compliance

- panel tlačítek, páček, kontrolek,
- jasný tactile push feeling,
- červené/žluté/šedé stavy,
- texty jako „CONFIRMATION READY“ / „POTVRZENÍ ČEKÁ NA POTVRZENÍ“.

### Surface Compliance

- špinavý panel, sklo, monitor nebo formulář,
- myší se stírá vrstva prachu / kafe / toneru,
- pod špínou se občas objeví štítek, memo, číslo místnosti, nebo drobný nesoulad,
- cleaning brush/wipe cursor.

### Shape Compliance

- tvary a díry jako mechanické compliance puzzle,
- uspokojivé snapnutí,
- ozubená kola, razítka, šanony, kabely, spirály,
- po dokončení žádný reálný výstup, jen pocit closure.

### Attention Runner

- malý běžec / vozík / clipboard v nekonečné chodbě,
- překážky: meetingy, kabely, kužely, otevřené tickety,
- vizuálně spíš mini conveyor než barevný mobilní runner,
- má fungovat jako druhá půlka obrazovky pro rozbitou pozornost.

### Zenová Zahrádka

- malý písečný box na manažerském stole,
- hrábě kreslí čáry do pixelového písku,
- kameny jako drobné tmavé objekty,
- klidná animace, ale textově podezřelá.

### Newtonova Kolíbka

- kovové kuličky na tmavém stole,
- hypnotický swing,
- mechanický pixel highlight,
- těžítko pro přenos hybnosti, odpovědnosti a nicoty.

## 9. Důležité pravidlo

> Každý modul musí na první pohled vypadat jako hračka, na druhý jako pracovní nástroj a na třetí jako důkaz, že někdo utratil budget za špatné oddělení.
