# K0rp_OS — Unlocks, Memos and System Mutations

Verze: 0.2.0 pracovní RFC

## 1. Princip

Unlock není pouze změna booleanu. Má mít:

1. mechanickou podmínku;
2. in-universe autorizaci;
3. viditelný důsledek na desktopu;
4. případně memo/document trail;
5. zachované ID pro save migration.

## 2. Unlock classes

- module permission;
- procedure;
- equipment;
- delegation;
- interpretation/analytics;
- folder/desktop artifact;
- settings/screensaver capability;
- certification;
- prestige directive;
- cosmetic/material variant.

## 3. Memos

Memo je primárně soubor v `Doručené`, ne blocking popup.

Metadata:

```text
id
from
subject
priority
delivery
trigger
body
acknowledgement behavior
archive target
```

Modal použít jen při systémově významné události.

## 4. Documents and folders

Canonical folders prvního cyklu:

- Doručené;
- Formuláře;
- Wellbeing;
- Care & Alignment;
- Čekající potvrzení;
- Certifikace;
- Knowledge Base;
- Archiv.

Formuláře, certifikáty a reporty musí existovat jako artifacts s vlastními ID.

## 5. Surface mutations

Příklady:

- audit 00-A → ClickAudit shortcut, Inbox, NWU widget;
- first batch → Forms folder, 10-A file;
- Fidget permit → Fidget shortcut, Wellbeing;
- Bloom permit → Bloom shortcut, Care & Alignment;
- Corner waiver → screensaver + Settings page;
- Button permit → shortcut, Pending Confirmations, AU widget;
- first prestige → archive folder, cleaned desktop, wallpaper/build change, Bubble Wrap.

## 6. Cross-module unlocks

Podmínky musí podporovat:

- `all`;
- `any`;
- `atLeastN`;
- event count;
- lifetime resource;
- current meter range;
- module session completed;
- distinct modules used;
- sequence/window;
- certification count;
- owned unlock;
- hidden condition.

Hráč nemá být nucen používat každý modul. Některé větve mají nabízet alternativní splnění.

## 7. System mutation restraint

Systémové podivnosti:

- ikona se přesune;
- soubor se objeví v nečekané složce;
- label/build se změní;
- wallpaper získá drobný nesoulad;
- vznikne oddělení, které nebylo v registru.

Pravidla:

- žádný explicitní lore dump;
- žádné vysvětlování meta roviny;
- mutation nesmí ničit save;
- musí být odlišitelná od technického bugu;
- accessibility umožní omezit náhodné změny.

## 8. Reset behavior

Každý artifact deklaruje reset scope:

- module session;
- shift;
- audit cycle;
- reorganization;
- never.

Při prestige se cycle artifacts archivují nebo odstraní, permanentní mema/certifikace zůstávají.

## 9. Source of truth

- machine data: `packages/korp-progression/data/progression.database.json`;
- desktop data: `packages/korp-progression/data/surface-progression.json`;
- TypeScript constants: package `src`;
- narrative rule: tento dokument a `18-desktop-surface-progression.md`.
