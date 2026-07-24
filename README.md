# K0rp_ware / K0rp_OS

Malé lokální desk nástroje a vznikající falešný pracovní operační systém z dílny K0rpu: řízená krokrastinace, ritualizované zdržení, měřitelná aktivita a profesionálně certifikovaný ne-výstup.

## Aktuální směr

`main` obsahuje první hratelný vertical slice K0rp_OS:

```text
Audit 00-A
→ ClickAudit
→ metric packet
→ Audit 10-A
→ Evidence / EV
→ Audit 16-C
→ Fidget authorization
→ Fidget sessions
→ Audit 18-S
→ mixed backlog
```

Canonical design:

```text
Appka vytvoří metriku.
Audit z metriky vytvoří skutečnost.
Evidence dovolí systému vytvořit další metriku.
Automatizace vytvoří potřebu dohledu.
```

K0rp_OS není launcher zamčených miniher. Je to fake desktop, na kterém se moduly autorizují, instalují, vytvářejí raw metriky, packety, dokumenty a později delegaci, policy a discrepancies.

Podrobná dokumentace:

```text
docs/k0rp-os/README.md
docs/k0rp-os/20-core-loop.md
docs/k0rp-os/07-roadmap.md
```

## Současné moduly

### ClickAudit

- doslovný raw counter úmyslných K0rp_OS kliků;
- jeden fyzický klik zůstává jedním manual clickem;
- flip digits a liquid progress;
- ClickAudit packet po bootstrapu a později po 25 nových kliknutích;
- žádná Evidence přímo za klik;
- samostatná desktop appka zůstává zachována.

### Fidget

- lokální fidget spinner;
- ruční a klikací režim;
- pin / always-on-top ve standalone surface;
- natural settled sessions;
- packet po třech nových settled sessions;
- žádná Evidence přímo za spin;
- K0rp_OS surface se odemyká authorization formulářem.

### Bloom

- lokální 5×5 puzzle se stavovými kameny;
- green/yellow/red stavy;
- score a waves;
- lokální ukládání standalone průběhu;
- global K0rp_OS packet/audit integrace je budoucí Task 027.

## Aktuální implementační stav

Dokončeno na `main`:

- fake desktop a window manager;
- Audit 00-A;
- global K0rp-only click tracking;
- versioned local persistence;
- repeatable ClickAudit a Fidget packet audits;
- Evidence certification;
- Fidget authorization;
- mixed pending queue;
- canonical icon pack;
- curated UI asset pack v01 source/runtime contract bez plošného visual rollout.

Následující gameplay/data krok:

```text
Task 024 — first-cycle data and balance reconciliation
```

Paralelní visual candidate:

```text
Task 024B — curated ClickAudit + Fidget window chrome pilot
```

Budoucí Priority Containment a Alignment Rally jsou zatím pouze design/prototype track. Nejsou implementované v runtime, neudělují Evidence a nesmějí přeskočit standalone greybox/playtest gate.

## Lokální vývoj — root K0rp_OS

Windows PowerShell:

```powershell
Set-Location 'C:\Users\danie\Projects\K0rp_ware'
git checkout main
git pull --ff-only origin main

Get-Process -Name node -ErrorAction SilentlyContinue | Stop-Process -Force
npm ci
npm run dev
```

Production build:

```powershell
npm run build
```

Core validation:

```powershell
npm run validate:korp-icons
npm run validate:korp-ui-assets
npm run validate:korp-ui-pack-v01
npm run test:runtime
npm run test:runtime-save
npm run test:korp-core
npm run typecheck:korp-core
npm run test:korp-modules
npm run typecheck:korp-modules
npm run typecheck:korp-progression
npm run validate:korp-progression
npm run build
```

Použij pouze scripts, které existují v aktuálním `package.json`. Při `EPERM` na Rolldown native binding nejdřív ukonči běžící Node/Vite proces.

## Standalone desktop appky

### ClickAudit

```powershell
Set-Location 'C:\Users\danie\Projects\K0rp_ware\desktop\click-audit'
npm install
npm run dev
```

Lokální bridge/API:

```text
GET  http://127.0.0.1:47891/state
GET  http://127.0.0.1:47891/health
POST http://127.0.0.1:47891/always-on-top?enabled=true
POST http://127.0.0.1:47891/always-on-top?enabled=false
POST http://127.0.0.1:47891/app-click?source=fidget
POST http://127.0.0.1:47891/app-click?source=bloom
```

### Fidget

```powershell
Set-Location 'C:\Users\danie\Projects\K0rp_ware\desktop\fidget'
npm install
npm run dev
```

### Bloom

```powershell
Set-Location 'C:\Users\danie\Projects\K0rp_ware\desktop\bloom-desktop'
npm install
npm run dev
```

Standalone appky jsou legitimní surfaces. Nejsou samostatné campaign unlocky a jejich unlinked local progress se nesmí tiše vydávat za K0rp_OS Evidence.

## Web routes

```text
/
/?app=click-audit
/?app=fidget
/?app=bloom
```

Public deployment:

```text
https://k0rp-ware.k0rp.workers.dev
```

Public deployment může proti aktuálnímu `main` zaostávat. Zdrojová pravda je repository `main`, ne poslední ručně nasazený build.

## Release a deploy

Web:

```powershell
Set-Location 'C:\Users\danie\Projects\K0rp_ware'
git checkout main
git pull --ff-only origin main
npm ci
npm run build
npx wrangler deploy
```

Desktop release tag používej pouze pro explicitně připravený release:

```powershell
git tag <release-tag>
git push origin <release-tag>
```

Před tagem musí projít Windows build/smoke gate. Nezvyšovat release pouze proto, že docs získaly hezčí formulaci.

## Privacy boundary

K0rp_ware je local-first.

Current runtime:

- nečte názvy externích aplikací;
- nečte URL;
- neukládá text z jiných oken;
- nepořizuje screenshots;
- neukládá raw keys;
- neukládá pointer coordinates;
- používá pouze bezpečné semantic K0rp profiles a aggregate values;
- nemá povinný účet ani cloud sync.

Budoucí action modules nesmějí importovat skutečné pracovní tickets, e-maily, chaty nebo priority. Hra o kontrole se nesmí stát kontrolou.

## Project rule

> Robustní K0rp_OS není další nesmysl přidaný bez systému. Je to systém, do kterého lze další nesmysl přidat bez toho, aby se předchozí změnily v incident.
