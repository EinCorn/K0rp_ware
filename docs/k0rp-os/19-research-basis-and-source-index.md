# K0rp_OS — Research Basis and Source Index

Verze: 0.2.0  
Účel: dohledatelnost designových rozhodnutí, nikoli tvrzení o klinickém účinku.

## 1. Interní source of truth

### Původní vize

- `00-product-vision.md`
- `01-visual-style.md`
- `02-product-modes.md`
- `03-architecture.md`
- `04-event-model.md`
- `05-privacy-model.md`
- `06-screen-concepts.md`
- `07-roadmap.md`
- `08-codex-tasks.md`
- `09-module-backlog.md`
- `10-language-and-copy.md`
- `11-typography-and-brand.md`
- `12-platform-workflow.md`

### Nový design layer

- `13-progression-and-economy.md`
- `14-sensory-feedback.md`
- `15-unlocks-memos-and-system-mutations.md`
- `16-playtest-checklist.md`
- `17-first-cycle-balance.md`
- `18-desktop-surface-progression.md`

### Machine-readable database

- `packages/korp-progression/data/progression.database.json`
- `packages/korp-progression/data/surface-progression.json`
- `packages/korp-progression/data/first-cycle.balance.csv`
- `packages/korp-progression/data/upgrade-catalog.csv`
- `packages/korp-progression/data/memo-catalog.csv`

## 2. Akademické a odborné zdroje

### Idle/incremental design

Sultan A. Alharthi, Olaa Alsaedi, Phoebe O. Toups Dugas, Theresa Jean Tanenbaum a Jessica Hammer, *Playing to Wait: A Taxonomy of Idle Games*.  
DOI: [10.1145/3173574.3174195](https://doi.org/10.1145/3173574.3174195)

Použití:

- hra podporuje odchod i návrat;
- offline progress;
- přechod od manuální činnosti ke správě systému;
- taxonomie idle mechanik.

### Reward prediction error

Wolfram Schultz, přehled dopaminových reward prediction error mechanismů.  
Open-access review: [PMC4826767](https://pmc.ncbi.nlm.nih.gov/articles/PMC4826767/)

Použití:

- nepřesné označení „dopamin hit“ se v design docs nepoužívá jako neurobiologický fakt;
- variabilní odměna je chápána jako očekávání a překvapení, ne jako měřitelná dávka potěšení.

### ADHD and delay discounting

Meta-analytický přehled delay discounting u ADHD: [PMC5049699](https://pmc.ncbi.nlm.nih.gov/articles/PMC5049699/)

Použití:

- krátké cíle, okamžitá odezva a nízké entry friction mohou být pro část uživatelů přitažlivé;
- projekt netvrdí, že léčí ADHD nebo „dorovnává dopamin“.

### Focus Cat

Výzkumný idle-game prototype pro podporu dechové praxe u lidí s ADHD.  
DOI: [10.1145/3505270.3558381](https://doi.org/10.1145/3505270.3558381)

Použití:

- idle mechanika může podpořit návrat k malé praxi;
- nejde o důkaz, že komerční clickery prospívají všem lidem s ADHD.

### ASMR physiology

Poerio et al., *More than a feeling: Autonomous sensory meridian response (ASMR) is characterized by reliable changes in affect and physiology*.  
PLOS ONE: [10.1371/journal.pone.0196645](https://doi.org/10.1371/journal.pone.0196645)

Použití:

- ASMR je specifický a ne univerzální prožitek;
- v produktových docs se preferuje `sensory satisfaction` nebo `ASMR-adjacent`.

## 3. Herní inspirační reference

Tyto hry nejsou kopírovány. Jsou rozebírány podle designových funkcí.

### Cookie Clicker

Reference:

- progressive disclosure;
- nový systém jako odměna;
- aktivní krátká combo windows uvnitř idle struktury;
- ascension a rychlejší návrat.

Official: [Cookie Clicker on Steam](https://store.steampowered.com/app/1454400/Cookie_Clicker/)

### AdVenture Capitalist

Reference:

- ruční proces před automatizací;
- manažer jako odstranění známé rutiny;
- reset jako rychlý průchod starou cestou.

Official: [AdVenture Capitalist on Steam](https://store.steampowered.com/app/346900/AdVenture_Capitalist/)

### Revolution Idle

Reference:

- vrstvené reset systems;
- automatizace dřívějších vrstev;
- nový tab jako očekávaný reward;
- riziko opacity a guide dependence.

Official: [Revolution Idle on Steam](https://store.steampowered.com/app/2763740/Revolution_Idle/)

### (the) Gnorp Apologue

Reference:

- čísla zhmotněná ve světě;
- oddělená produkce a collection;
- build synergies;
- čitelný chaos.

Official: [the Gnorp Apologue on Steam](https://store.steampowered.com/app/1473350/the_Gnorp_Apologue/)

### Gamblers Table

Reference:

- materiálový microfeedback;
- fyzika mincí;
- zvuková hustota;
- počáteční tactile loop versus riziko mělké metaprogrese.

Official: [Gamblers Table on Steam](https://store.steampowered.com/app/3618390/Gamblers_Table/)

### Tower Wizard

Reference:

- krátký finite incremental;
- přirozené pacing unlocků;
- legitimní konec;
- prestige, který neznevažuje čas hráče.

Project reference: [Tower Wizard press kit](https://impress.games/press-kit/barribob/tower-wizard)

### Click and Conquer

Reference:

- jedna akce současně generuje feedback, odhalení prostoru a ekonomický posun;
- krátký finite scope;
- riziko, že větší mapa jen opakuje stejný trik.

Official: [Click and Conquer on Steam](https://store.steampowered.com/app/3267900/Click_and_Conquer/)

## 4. Design inferences

Následující jsou syntézy, nikoli přímé výsledky jednoho experimentu:

- nejhodnotnější unlock mění pravidlo nebo surface;
- automatizace má převzít rutinu, ne odstranit hračku;
- prestige má zrychlit starou cestu a otevřít nový systém;
- desktop artifact může být silnější odměna než achievement badge;
- finite closure a možnost odejít jsou legitimní součást retention designu;
- auditory/visual feedback sám neutáhne dlouhou progresi bez systémové evoluce.

## 5. Guardrails

Dokumentace nesmí tvrdit:

- že K0rp_OS léčí ADHD;
- že konkrétní interakce produkuje určitou dávku dopaminu;
- že každý tactile zvuk je ASMR;
- že variable rewards musí být hlavní cestou k progresu;
- že FOMO je nutná součást incremental hry.

## 6. Source update rule

Při přidání nového research-driven systému:

1. přidat zdroj nebo jasně označit inference;
2. uvést, který dokument a konstanta z něj vycházejí;
3. neodvozovat klinické tvrzení z hráčských recenzí;
4. oddělit inspiraci, implementaci a playtest výsledek.
