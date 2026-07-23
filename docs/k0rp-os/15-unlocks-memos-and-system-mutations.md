# K0rp_OS — Unlocks, Memos and System Mutations

Verze: 0.4.0 pracovní RFC

## 1. Princip

Unlock není pouze změna booleanu.

Významný unlock má:

1. mechanickou podmínku;
2. in-universe authorization;
3. případnou alokaci Evidence;
4. viditelný důsledek na desktopu;
5. document/memo trail;
6. stable ID pro save migration;
7. explicitní reset scope.

Nový modul se neobjeví jako rozsvícená karta v katalogu. Je autorizován, nainstalován a fyzicky se projeví v systému.

## 2. Unlock classes

- module permission;
- procedure;
- equipment;
- capability group;
- proficiency;
- delegation slot;
- operator training;
- policy template;
- interpretation/analytics;
- folder/desktop artifact;
- Settings/screensaver capability;
- certification;
- prestige directive;
- cosmetic/material variant.

## 3. Capability versus authorization

```text
capability
= hráč nebo jednotka funkci umí nebo ji objevila

authorization
= systém dovolil funkci používat jako uznanou procedure
```

Capability může být objevena uvnitř runu. Persistentně nasazená je až po authorization.

To umožňuje mechanický paradox:

> Jednotka může funkci vykonávat, ale nesmí vlastnit její oprávnění.

Tento princip se ukazuje mechanikou. Nemá být vysvětlen jako lore přednáška.

## 4. Capability groups

Ne každý drobný upgrade dostává vlastní formulář. To by z administrativního humoru udělalo skutečně špatný produkt.

Autorizují se skupiny:

```text
Routing Procedures I
→ Return to Sender
→ Owner Assignment
→ Reprioritize

Alignment Templates I
→ Need More Data
→ Scope Reduction
→ Parking Lot

Stabilization Profiles I
→ nový bearing/material profile
→ nový settle interpretation
```

Uvnitř session se jednotlivé autorizované capability mohou objevit v draft poolu přes run-local XP.

## 5. Unlock flow

Preferovaný tok:

```text
player discovers or qualifies capability
→ requirement becomes visible
→ authorization form appears
→ Evidence is allocated
→ authorization flag is granted
→ surface mutation installs artifact
→ capability enters future session/draft/policy pool
```

Kosmetický material variant může mít lehčí flow bez plného formuláře. Nový modul, delegation, policy nebo pravidlo s významným dopadem vyžaduje authorization trail.

## 6. Memos

Memo je primárně soubor v Doručených, ne blocking popup.

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
related authorization/module/policy ID
```

Modal se používá jen pro systémově významnou událost:

- identity assignment;
- zásadní authorization;
- audit cycle closure;
- reboot;
- případně kritickou discrepancy, pokud opravdu blokuje další rozhodnutí.

## 7. Documents and folders

Canonical first-cycle folders:

- Doručené;
- Formuláře;
- Wellbeing;
- Care & Alignment;
- Čekající potvrzení;
- Certifikace;
- Knowledge Base;
- Archiv.

Later management artifacts:

- Personální záznamy;
- Procedures;
- Policy;
- Incidenty;
- Kontrolní vzorky;
- Discrepancies;
- Loadout Templates.

Folder není abstraktní menu. Je viditelný stav systému.

## 8. Current surface mutations

```text
Audit 00-A
→ ClickAudit shortcut
→ Doručené
→ first memo

first ClickAudit packet
→ Formuláře
→ Audit 10-A instance

Audit 16-C
→ Fidget authorization
→ Fidget shortcut
→ authorization memo

Fidget packet
→ Audit 18-S ve společné queue
```

Player-facing Evidence/PENDING readout se odhalí podle progression, ne jako výchozí dashboard.

## 9. Candidate module mutations

### Bloom

```text
Bloom authorization
→ Bloom shortcut
→ Care & Alignment folder
→ module files/reports
```

### Corner Watch

```text
Corner authorization
→ Settings / Screen Saver page
→ idle report file
→ optional pinned shortcut
```

### Button Compliance

```text
Button permit
→ shortcut
→ Čekající potvrzení
→ exception files
```

### Bubble Wrap

```text
first audit-cycle closure
→ archive/reboot/build mutation
→ Bubble Wrap installation
```

### Priority Containment

Až po accepted greybox a integration task:

```text
operational authorization
→ Priority Containment shortcut
→ larger action-window family
→ Operational Response folder nebo procedure registry
→ Audit 27-P template po prvním packetu
→ later Routing Procedures capability groups
```

Priority Containment se nesmí objevit pouze jako „nová hra dostupná“. Jeho instalace má být odpovědí na konkrétní procesní potřebu nebo incident.

### Alignment Rally

Až po samostatném gate:

```text
alignment authorization
→ Alignment Rally shortcut
→ argument template files
→ Audit 31-R
→ later Alignment Templates capability groups
```

Alignment může vzniknout jako důsledek disputed operational closure, ne náhodná ikonka v katalogu.

## 10. Delegation mutations

První stážista vytvoří:

- personnel file;
- assignment document;
- training status;
- delegated source indicator;
- control sample queue;
- discrepancy folder nebo file;
- supervision reminder.

Delegace nesmí pouze přidat číslo `+x/sec` bez viditelné organizační stopy.

## 11. Policy mutations

Policy je persistentní artifact, ne neviditelný checkbox v reduceru.

Příklad:

```text
Priority Routing Policy 01
TARGET WEIGHTS: P0 > OWNERLESS > QUICK ASK
RISK: STANDARD
EXCEPTIONS: RETURN TO SENDER
SUPERVISION: EVERY 3 SESSIONS
```

Policy může existovat jako:

- soubor;
- Control Room row;
- editable form;
- deployment certificate;
- incident reference.

Změna policy je činnost s auditní stopou, ale ne každé posunutí slideru musí okamžitě vytvořit nový packet.

## 12. Cross-module unlock conditions

Requirement model má podporovat:

- `all`;
- `any`;
- `atLeastN`;
- event count;
- lifetime certified Evidence;
- current meter range;
- module session closure;
- distinct modules used;
- certification count;
- owned authorization;
- capability group;
- operator training;
- discrepancy resolved;
- policy deployed;
- hidden condition.

Hráč nemá být nucen používat každý modul. Některé branches mají alternativní splnění.

Action module nesmí být gated pouze astronomickým množstvím EV. Má mít také smysluplnou procesní podmínku.

## 13. Installation presentation

Instalace významného systému může obsahovat:

- memo v Doručených;
- krátký system modal;
- progress indicator;
- nový shortcut;
- folder row;
- build/status změnu;
- první explicitní launch.

Nesmí:

- automaticky otevřít modul uprostřed jiné činnosti bez důvodu;
- ukrást focus vytvořením packetu;
- působit jako loot chest;
- odhalit celý budoucí katalog.

## 14. System mutation restraint

Povolené podivnosti:

- ikona se přesune;
- soubor se objeví v nečekané, ale dohledatelné složce;
- label/build se změní;
- wallpaper získá drobný nesoulad;
- vznikne oddělení, které nebylo v registru;
- report odkazuje na procedure, která byla autorizována až později;
- policy dostane ownera, který nemá odpovídající oprávnění.

Pravidla:

- žádný explicitní lore dump;
- žádné vysvětlení skryté meta roviny;
- mutation nesmí ničit save;
- musí být odlišitelná od technického bugu;
- accessibility umožní omezit random/anomaly changes;
- kritická informace nesmí existovat jen jako anomálie.

## 15. Reset behavior

Každý artifact deklaruje reset scope:

```text
module session
shift
audit cycle
reorganization
never
```

Příklady:

- run XP a temporary build → module session;
- pending cycle packet → audit cycle podle closure policy;
- capability authorization → never nebo explicitní reorganization;
- personnel assignment → cycle/reorganization;
- memo/certification → never;
- policy draft → explicitní scope;
- policy deployment history → archive.

Při prestige se cycle artifacts archivují nebo odstraní, permanentní mema/certifikace/authorizations zůstávají podle designu.

## 16. Source of truth

- economy/invariants: `20-core-loop.md`;
- activity/capability proposals: `21-activity-spectrum-and-arcade-modules.md`;
- narrative rules: tento dokument;
- machine data: `packages/korp-progression/data/` po příslušném tasku;
- desktop data: `surface-progression.json`;
- runtime: implementace po vertical slices.

Priority/Alignment IDs v tomto dokumentu jsou design candidates. Nejsou machine-readable canonical data před Tasks 035/038.

## 17. Důležité pravidlo

> Hráč nemá kupovat nové hračky z abstraktního shopu. Má získávat oprávnění k systémům, které se potom nevyžádaně zabydlí na jeho pracovní ploše a začnou vyrábět vlastní dokumentaci.
