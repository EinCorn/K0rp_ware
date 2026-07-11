# Integration map — napojení na současný K0rp_ware

Tento soubor popisuje doporučený postup integrace databáze. Nejde o automaticky aplikovaný patch.

## 1. Nový package

Přidat:

```text
packages/korp-progression/
```

Package nemá obsahovat React, DOM ani Tauri API. Je to čistá datová vrstva.

## 2. Rozšíření `KorpResources`

Současný core už většinu resources zná. Doplnit především:

```ts
auditFindings: number;
```

Dále je vhodné časem oddělit:

```ts
resources.current
resources.lifetime
resources.derived
```

První pragmatická varianta může zůstat flat, ale lifetime generated totals musí být ve stats.

## 3. Nové progression-bearing eventy

Přidat:

```ts
"audit.formSubmitted"
"clickaudit.batchCompleted"
"fidget.sessionSettled"
"system.shiftClosed"
"system.memoAcknowledged"
"system.auditCycleClosed"
```

`fidget.spinTick` ponechat jako transient/local event. Neměl by nafukovat persistentní global event log každý animační frame.

## 4. Audit interaction bridge

Každé skutečné field activation:

```text
audit field change
→ clickaudit.click(profile: audit-form)
→ local field state
```

Submit:

```text
audit.formSubmitted
→ form completion effects
→ unlock queue
→ memo queue
```

Jedna vůle uživatele smí vytvořit maximálně jeden auditovaný click. Pointer move, drag frame a animace se nepočítají.

## 5. Runtime provider

Doporučený mezikrok:

```text
KorpRuntimeProvider
├─ state
├─ lifetimeStats
├─ dispatch(event)
├─ applyProgressionEffects()
├─ purchaseUpgrade()
├─ submitAuditForm()
├─ unlockQueue
├─ memoQueue
├─ save/load
└─ closeAuditCycle()
```

Standalone moduly nemají držet vlastní izolovaný permanentní `KorpState`, pokud běží uvnitř K0rp_OS. Mohou mít lokální session state, ale globální eventy mají jít do jednoho runtime.

## 6. Upgrade effect resolver

Nedoporučuje se přidávat všech 37 upgrades jako další větve do jednoho reducer switch.

Minimální pipeline:

```text
base event effect
→ click profile
→ permanent directives
→ cycle upgrades
→ cross-module modifiers
→ caps and meter rules
→ stats
→ certifications
→ unlocks
→ memos
→ save
```

## 7. Initial module visibility

První spuštění:

```text
system audit surface = visible
ClickAudit = locked until 00-A submit
Fidget = locked
Bloom = locked
Corner Watch = locked
Button Compliance = locked
```

Po dokončení prvního cyklu zůstávají známé moduly viditelné, i když některé procedury vyžadují rychlou reautorizaci.

## 8. Save migration

Přidat verzi progression dat nezávislou na core state:

```ts
progressionDataVersion: "0.1.0-draft"
```

Save nesmí ukládat celé definice. Ukládá jen ID a stav:

```ts
ownedUpgradeIds: string[];
acknowledgedMemoIds: string[];
certifiedModuleIds: string[];
submittedFormIds: string[];
auditFindings: number;
cycleNumber: number;
```

## 9. První implementační slice

Doporučené pořadí:

1. progression package + validation;
2. lifetime stats;
3. Audit 00-A;
4. všechny audit field interactions emitují clicks;
5. ClickAudit batch 25;
6. formulář 10-A;
7. Fidget `sessionSettled`;
8. Bloom `waveAdvanced`;
9. local save;
10. teprve potom Button/Corner a prestige.

## 10. Co zatím neimplementovat

- cloud sync;
- daily streak;
- raw event telemetry mimo lokální save;
- Reorganization druhého stupně;
- procedurální generování formulářů;
- všech 37 upgrades naráz;
- audio systém bez společných density limits;
- Attention Runner před dokončením první closure smyčky.
