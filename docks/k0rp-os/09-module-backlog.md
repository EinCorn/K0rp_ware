# K0rp_OS — Module Backlog

Verze: 0.1.3 pracovní návrh

## 1. Účel

Tento dokument drží aktuální a budoucí moduly K0rp_OS.

Modul není jen minihra. Modul je:

- samostatná hračka / appka,
- zdroj eventů,
- producent resources,
- potenciální okno v K0rp_OS,
- potenciální standalone app,
- potenciální overlay mini widget,
- in-universe oddělení nebo procedurální nástroj.

## 2. Module contract

Každý modul musí odpovědět na otázky:

```text
Co uživatel dělá?
Proč je to uspokojivé?
Jaký je korporátní bullshit wrapper?
Jaké eventy modul emituje?
Jaké resources produkuje?
Kde může běžet?
Jaký je privacy profile?
Jak se škáluje v incremental systému?
```

## 3. Categories

```text
AUDIT / CONFIRMATION
- měření, klikání, potvrzování, souhlas bez obsahu

STABILIZATION
- uklidnění, fidget, stress release, taktilní loop

CARE / CLEANING
- péče o povrch, růst, čistota, compliance zahrádka

ALIGNMENT
- zarovnání, zapadnutí, closure, mechanický souhlas

IDLE / SCREENSAVER
- čekání, pozorování, hypnotická nicota

ATTENTION SPLIT
- druhá pozornostní vrstva, dopaminový doprovod

DESK OBJECT
- manažerské těžítko, wellness artefakt, fyzika bez výstupu
```

## 4. Current v0.3 modules

### ClickAudit

Status: workshop/playable  
Category: AUDIT / CONFIRMATION

Core fantasy:

> Klik je důkaz přítomnosti.

Main action:

- klikání,
- sledování counteru,
- milestone progress,
- zdroje kliků.

Produces:

- Audit Pressure,
- Notional Work Units,
- Perceived Productivity.

Events:

- `clickaudit.click`,
- `clickaudit.milestoneReached`,
- `clickaudit.sourceUpdated`.

Risk:

- může se stát jen counterem, pokud nebude mít dost ceremonial reward a in-universe consequence.

### Fidget

Status: workshop/playable  
Category: STABILIZATION

Core fantasy:

> Pozornost lze stabilizovat tím, že ji odvedeme.

Main action:

- roztočit spinner,
- přepínat režim,
- sledovat rychlost.

Produces:

- Stabilization,
- Entropy Reduction,
- Perceived Control.

Events:

- `fidget.spinStarted`,
- `fidget.spinTick`,
- `fidget.spinStopped`,
- `fidget.modeChanged`.

Risk:

- nepřebarvit na cirkus; má zůstat hmatový a hypnotický.

### Bloom

Status: workshop/playable  
Category: CARE / CLEANING

Core fantasy:

> Drobná compliance zahrádka, kde kameny vypadají jako myšlenky a myšlenky jako úkoly.

Main action:

- klikat / čistit board,
- clearovat stones,
- postupovat vlnami.

Produces:

- Compliance Integrity,
- System Order,
- Bloom Integrity.

Events:

- `bloom.tileClicked`,
- `bloom.matchCleared`,
- `bloom.waveAdvanced`,
- `bloom.redStoneSpawned`.

Risk:

- držet rozdíl mezi cute puzzle a znepokojivou compliance zahrádkou.

## 5. Candidate v0.4 — First Expansion

### Corner Watch

Status: spec  
Category: IDLE / SCREENSAVER  
Suggested priority: high

Core fantasy:

> Čekání na roh jako náboženský akt kancelářského screensaveru.

Main action:

- sledovat odrážející se logo,
- čekat na corner hit,
- upravovat rychlost / úhel jen minimálně.

Produces:

- Idle Faith,
- Patience Units,
- Perceived Productivity.

Events:

- `corner.logoBounce`,
- `corner.nearMiss`,
- `corner.cornerHit`,
- `corner.sessionCompleted`.

Scaling:

- více log,
- vzácné corner streaky,
- falešné predikce,
- skins,
- screensaver mode.

In-universe copy:

> „Roh bude dosažen. Časový rámec nebyl schválen.“

Risk:

- moc jednoduché, ale to je zároveň síla. Nepřekomplikovat.

### Bublinková Fólie

Status: spec  
Category: STABILIZATION  
Suggested priority: high

Core fantasy:

> Fake wellness produkt: malý arch fólie prodaný jako korporátní relaxační systém.

Main action:

- praskat bubliny,
- dokončit arch,
- objevovat rare/vadné bubliny,
- vyměnit arch.

Produces:

- Relief Units,
- Pressure Released,
- Stabilization.

Events:

- `bubble.popped`,
- `bubble.defectivePressed`,
- `bubble.rareBubblePopped`,
- `bubble.sheetCompleted`.

Scaling:

- větší archy,
- červená premium fólie,
- automatický audit praskání,
- různé zvuky,
- různé materiály.

In-universe copy:

> „Relaxační fólie nenahrazuje odpočinek. Odpočinek nebyl schválen.“

Note:

- Inspirováno archetypem absurdně obrandovaného relaxačního produktu. Neopisovat konkrétní vtip z existujícího díla.

Risk:

- potřebuje satisfying pop feeling. Bez zvuku/animace bude slabší.

### Button Compliance

Status: spec  
Category: AUDIT / CONFIRMATION  
Suggested priority: high

Core fantasy:

> Uživatel potvrzuje, že potvrzuje, že je přítomen potvrzovacímu workflow.

Main action:

- mačkat tlačítka,
- plnit sekvence,
- potvrzovat potvrzení,
- sledovat kontrolky.

Produces:

- Approval Units,
- Audit Pressure,
- Krypto-management Score.

Events:

- `button.pressed`,
- `button.sequenceCompleted`,
- `button.confirmationConfirmed`,
- `button.panelReset`.

Scaling:

- více panelů,
- časované sekvence,
- absurdní souhlasové texty,
- falešné emergency tlačítko,
- tlačítka, která nic nedělají, ale vypadají urgentně.

In-universe copy:

> „Stisknutím potvrzujete, že jste připraven potvrdit další stisk.“

Risk:

- nemá být reflex game peklo. Spíš tactile/ritual panel.

## 6. Candidate v0.5 — Desk Object / ASMR

### Newtonova Kolíbka

Status: spec  
Category: DESK OBJECT / IDLE / STABILIZATION  
Suggested priority: medium-high

Core fantasy:

> Manažerská fyzika bez výstupu. Hybnost se předává, problém také.

Main action:

- zatáhnout kuličku,
- pustit,
- sledovat cykly,
- čekat na uklidnění.

Produces:

- Momentum,
- Transferred Responsibility,
- Idle Faith,
- Perceived Productivity.

Events:

- `cradle.pull`,
- `cradle.release`,
- `cradle.impact`,
- `cradle.cycleCompleted`,
- `cradle.motionEnded`,
- `cradle.responsibilityTransferred`.

Scaling:

- více materiálů,
- delší kolíbka,
- černé KØrp kuličky,
- desk-object unlock,
- impact counter,
- responsibility chain.

In-universe copy:

> „Každý náraz posouvá problém na další jednotku.“

Technical note:

- Fake physics preferred. Reálná fyzika není nutná a může být horší než kontrolovaná animace.

Risk:

- musí působit satisfying. Špatná animace zabije nápad.

### Zenová Zahrádka

Status: spec  
Category: CARE / ALIGNMENT / STABILIZATION / DESK OBJECT  
Suggested priority: medium

Core fantasy:

> Manažerská zenová zahrádka jako ritualizovaný surface order.

Main action:

- hrabat písek,
- kreslit čáry,
- přesouvat kameny,
- dokončovat patterny.

Produces:

- Procedural Calm,
- Sand Alignment,
- Entropy Reduction,
- System Order.

Events:

- `zen.rakeStroke`,
- `zen.patternCompleted`,
- `zen.stoneMoved`,
- `zen.sandReset`,
- `zen.harmonyThresholdReached`.

Scaling:

- nové hrábě,
- různé pískové textury,
- kameny s čísly,
- manažerské certifikáty,
- pattern templates.

In-universe copy:

> „Hrabejte, dokud proces nepřestane klást otázky.“

Risk:

- potřebuje dobrý tactile feel. Pokud bude jen kreslící canvas bez šťávy, bude slabá.

## 7. Candidate v0.6 — Care / Cleaning / Alignment

### Surface Compliance

Status: spec  
Category: CARE / CLEANING  
Suggested priority: medium-high

Core fantasy:

> Čistit špínu, která se stejně vrátí, a tvářit se, že tím řešíme příčinu.

Main action:

- tahat myší / hadrem,
- odkrývat čistý povrch,
- dokončit surface,
- najít residue / štítek / memo.

Produces:

- Cleanliness,
- Compliance Integrity,
- System Order.

Events:

- `surface.wipeStroke`,
- `surface.dirtRemoved`,
- `surface.patchCleaned`,
- `surface.surfaceCompleted`,
- `surface.residueDetected`.

Scaling:

- více povrchů,
- různé nečistoty,
- bonusové skryté poznámky,
- daily cleaning tasks,
- audit po vyčištění.

In-universe copy:

> „Nečistota byla odstraněna. Příčina zůstává v řešení.“

Risk:

- technicky víc práce kvůli maskám/texturám. Velmi silný modul, ale nedělat uspěchaně.

### Shape Compliance

Status: spec  
Category: ALIGNMENT  
Suggested priority: medium

Core fantasy:

> Uspokojivé zapadnutí tvaru jako mechanická náhrada smyslu.

Main action:

- drag,
- rotate,
- snap,
- complete set.

Produces:

- Alignment,
- Closure,
- System Order.

Events:

- `shape.dragStarted`,
- `shape.rotated`,
- `shape.snapped`,
- `shape.setCompleted`,
- `shape.misalignmentDetected`.

Scaling:

- více tvarů,
- různé materiály,
- kabely/porty,
- šanony/mezery,
- ozubená kola/mechanismy,
- procedurální patterny.

In-universe copy:

> „Tvar zapadl. Význam nebyl vyžadován.“

Risk:

- potřebuje přesné interakce. Špatné snapování bude otravné místo satisfying.

## 8. Candidate v0.7 — Attention Corruption

### Attention Runner

Status: spec  
Category: ATTENTION SPLIT  
Suggested priority: later

Core fantasy:

> Udržet pozornost tím, že ji rozbijeme na dvě části, z nichž ani jedna není úplně práce.

Main action:

- běh v nekonečné chodbě,
- jump / dodge,
- sběr ticketů/post-itů,
- běh vedle memo nebo jiné činnosti.

Produces:

- Attention Residue,
- Dopamine Drift,
- Notional Work Units.

Events:

- `runner.started`,
- `runner.jump`,
- `runner.obstacleAvoided`,
- `runner.comboReached`,
- `runner.runEnded`.

Scaling:

- různé chodby,
- různé překážky,
- low-input mode,
- split-screen mode,
- companion mode while reading internal memo.

In-universe copy:

> „Sub-task běží. Main task nebyl identifikován.“

Risk:

- může se stát příliš gamey a odvést K0rp_OS od UI simulátoru. Až později.

## 9. Resource map

```text
ClickAudit          → Audit Pressure, Notional Work Units
Fidget              → Stabilization, Entropy Reduction
Bloom               → Compliance Integrity, System Order
Corner Watch        → Idle Faith, Patience Units
Bublinková Fólie    → Relief Units, Pressure Released
Button Compliance   → Approval Units, Krypto-management Score
Newtonova Kolíbka   → Momentum, Transferred Responsibility
Zenová Zahrádka     → Procedural Calm, Sand Alignment
Surface Compliance  → Cleanliness, Compliance Integrity
Shape Compliance    → Alignment, Closure
Attention Runner    → Attention Residue, Dopamine Drift
Work Blob           → Notional Work Units
```

## 10. Suggested release grouping

```text
v0.3 current:
- ClickAudit
- Fidget
- Bloom

v0.4 first expansion:
- Corner Watch
- Bublinková Fólie
- Button Compliance

v0.5 desk object / ASMR:
- Newtonova Kolíbka
- Zenová Zahrádka

v0.6 care / cleaning / fitting:
- Surface Compliance
- Shape Compliance

v0.7 attention corruption:
- Attention Runner
```

## 11. Naming bank

```text
Oddělení Auditního Pohybu
Oddělení Opakovaného Souhlasu
Oddělení Taktilního Uklidnění
Oddělení Povrchové Nápravy
Oddělení Tvarové Konformity
Oddělení Rohového Očekávání
Oddělení Rozdělené Pozornosti
Oddělení Rituálního Hrablání
Oddělení Přenesené Odpovědnosti
Kinetická Pomůcka Manažerské Přítomnosti
Certifikovaná Písečná Plocha
Relaxační Fólie pro Procesní Úlevu
```

## 12. Důležité pravidlo backlogu

> Nový modul je povolený jen tehdy, když umí být zároveň hračka, proces, resource producer a in-universe absurdita.
