# K0rp_OS — Product Modes

Verze: 0.2.0 pracovní návrh

## 1. Přehled

K0rp_OS nemá být jeden rigidní runtime. Má mít více režimů, které používají stejné jádro, stejný module contract a stejný jazyk progressu.

Produktové režimy:

1. Web portal
2. Standalone appky
3. K0rp_OS desktop hra
4. Overlay lišta
5. Account / sync režim

Důležité: moduly musí být navržené tak, aby mohly žít na více surfaces bez přepsání logiky.

## 2. Web portal

Web je veřejný vstup do K0rp_ware / K0rp_OS.

Funkce:

- landing / dashboard,
- webové verze modulů,
- download standalone appek,
- preview K0rp_OS,
- knowledge base,
- později account login.

Web může běžet i bez accountu a bez cloudu. Lokální progress je validní režim.

## 3. Standalone appky

Každý modul může existovat jako samostatná malá appka.

Příklady:

- ClickAudit,
- Fidget,
- Bloom,
- Corner Watch,
- Bublinková Fólie,
- Button Compliance,
- Surface Compliance.

Standalone režim:

- funguje lokálně,
- může mít vlastní malé okno,
- může sledovat jen vlastní interakce,
- může volitelně posílat aggregate eventy do K0rp Core,
- nesmí vyžadovat hlavní K0rp_OS.

## 4. K0rp_OS desktop hra

Hlavní režim.

K0rp_OS desktop hra obsahuje:

- fake desktop,
- taskbar,
- module windows,
- global resources,
- unlocky,
- interní mema,
- knowledge base,
- fake settings,
- module registry,
- local save/load.

Tady má být nejsilnější incremental loop.

## 5. Overlay lišta

Overlay je pozdější režim, který běží nad běžnou prací.

První pravidlo: overlay nesmí být šmírovací nástroj.

Overlay může:

- zobrazovat K0rp status,
- spouštět malé moduly,
- přijímat K0rp-only events,
- v privacy režimu počítat jen agregovanou aktivitu,
- fungovat jako drobná satirická přítomnost na monitoru.

Overlay nesmí bez explicitního režimu:

- číst URL,
- číst názvy oken,
- číst text,
- pořizovat screenshoty,
- logovat klávesy,
- posílat raw aktivitu do cloudu.

## 6. Account / sync

Account je volitelný.

Syncovat lze:

- global progress,
- unlocks,
- settings,
- cosmetics,
- fake employee id,
- export/import state.

Nesyncovat:

- raw click log,
- názvy aplikací,
- URL,
- text,
- screenshoty,
- pracovní obsah.

## 7. Privacy režimy

### OFF

Nesleduje nic mimo explicitní modul.

### K0rp-only

Sleduje pouze interakce uvnitř K0rp modulů.

### Privacy Work Blob

Sleduje pouze agregovanou aktivitu mimo K0rp bez detailu:

- uživatel byl aktivní,
- uživatel byl idle,
- došlo k anonymnímu external work pulsu.

Nezná aplikaci, URL, obsah ani kontext.

### Local Full Mode

Experimentální režim pro osobní počítač. Pouze lokálně. Pouze explicitně. Není součást MVP.

## 8. Module surfaces

Každý modul v manifestu deklaruje, kde může běžet.

Možné surfaces:

```ts
export type KorpSurface =
  | "webCard"
  | "standaloneWindow"
  | "osWindow"
  | "overlayMini"
  | "idleScreen"
  | "backgroundService";
```

Příklad:

```ts
const cornerWatchSurfaces = ["standaloneWindow", "osWindow", "idleScreen", "overlayMini"];
const attentionRunnerSurfaces = ["osWindow", "webCard"];
```

## 9. Module maturity

Moduly mohou mít maturity stav:

```ts
export type KorpModuleMaturity =
  | "idea"
  | "spec"
  | "prototype"
  | "workshop"
  | "playable"
  | "released"
  | "retired";
```

Současný stav:

- ClickAudit — workshop/playable,
- Fidget — workshop/playable,
- Bloom — workshop/playable,
- nové moduly — idea/spec.

## 10. Důležité pravidlo

> Režimy se mohou lišit. Core význam eventů musí zůstat společný.

## Platform priority

K0rp_OS má více surfaces, ale primární desktop target je **Windows**.

Mac je podporované a užitečné dev/test prostředí, hlavně pro Couch Mode, design, docs, asset work a rychlé smoke testy. Windows je ale rozhodující platforma pro:

- desktop app behavior,
- overlay bar,
- window transparency,
- always-on-top behavior,
- installer/release,
- finální pocit „pracovního počítače“.

Každý product mode by měl být označený podle toho, zda jde o cross-platform feature, web-only feature, nebo Windows-required feature.

## 11. Canonical hierarchy surfaces

### K0rp_OS desktop

Canonical full game. Vlastní globální progression, desktop artifacts, složky, soubory, window manager, screensaver, mema, lokální save a prestige.

### Web desktop

Fallback full-game surface v browseru. Simuluje stejnou pracovní plochu a používá stejné progression ID. Může mít lokální browser save. Neumí pravý OS overlay ani všechny native window funkce.

### Standalone module

Samostatná prokrastinační appka. Musí fungovat bez hlavního K0rp_OS.

- nepřipojený režim: pouze module-local session/progress;
- připojený režim: aggregate K0rp events mohou být předány do aktivního K0rp_OS runtime;
- global campaign přijímá rewards pouze z modulu, který je v daném save autorizovaný;
- modulová logika nesmí mít separátní přepsanou variantu pro OS, web a standalone.

### Overlay

Pozdější companion surface. Není podmínkou prvního auditního cyklu.

- quick launch,
- malé module surfaces,
- privacy indicator,
- K0rp-only events,
- případně explicitní Privacy Work Blob.

## 12. Product mode není progression unlock

Release pořadí produktu a herní pořadí unlocků jsou dvě různé osy.

Například Corner Watch se v kampani odemkne jako screensaver, ale jeho standalone build může být veřejně dostupný od začátku. To nepřeskakuje campaign progression, dokud standalone není připojený k autorizovanému save.

## 13. Surface contract

Každý modul musí používat:

- stejné event names,
- stejný module ID,
- stejný význam resource effects,
- stejnou privacy klasifikaci,
- oddělený lokální UI/session state,
- volitelný bridge do společného runtime.

Rozdíl surface smí měnit presentation a window behavior, ne význam kliknutí, spinu, wave nebo completed sheetu.
