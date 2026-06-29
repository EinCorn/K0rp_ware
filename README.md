# K0rp_ware

Malé lokální desk nástroje z dílny K0rpu: řízená krokrastinace, ritualizované zdržení a profesionálně orámovaný ne-výstup.

Produkce:

```text
https://k0rp-ware.k0rp.workers.dev
```

## Aktuální záběr

Produkční řez v0.2 drží tři moduly: **ClickAudit**, **Fidget** a **Bloom**. Rozpracovaná v0.3 převádí projekt do češtiny a čistí desktop appky na malé frameless widgety.

### ClickAudit

- lokální souhrnné počítadlo kliků
- webový pult zrcadlí stav z `127.0.0.1:47891`
- bezpečné zdroje: ClickAudit, Fidget, Bloom a `Work?`
- žádný účet, cloud sync ani telemetrie
- žádné souřadnice, screenshoty ani názvy oken

### Fidget

- lokální fidget spinner
- ruční a klikací režim
- pin / always-on-top
- žádná telemetrie
- žádná měřitelná pracovní hodnota

### Bloom

- lokální puzzle se stavovými kameny
- zelené, žluté a červené indikátory
- pomalejší postup vln
- červené kameny se objevují od vlny 15
- pin / always-on-top
- lokální ukládání průběhu

## Desktop balíčky

Pult ukazuje u každého modulu:

```text
Otevřít web
Stáhnout appku
```

Desktop odkaz vede na poslední GitHub Release.

## Release

```bash
cd ~/Projects/K0rp_ware
git pull
git tag k0rp-ware-v0.3
git push origin k0rp-ware-v0.3
```

Ruční spuštění:

```text
Actions -> K0rp desktop release -> Run workflow -> release_tag: k0rp-ware-v0.3
```

## Lokální web

```bash
cd ~/Projects/K0rp_ware
git pull
npm install
npm run dev
```

## Deploy webu

```bash
cd ~/Projects/K0rp_ware
git pull
npm run build
npx wrangler deploy
```

## ClickAudit desktop

```bash
cd ~/Projects/K0rp_ware
git pull
cd desktop/click-audit
npm install
npm run dev
```

Lokální API:

```text
GET  http://127.0.0.1:47891/state
GET  http://127.0.0.1:47891/health
POST http://127.0.0.1:47891/always-on-top?enabled=true
POST http://127.0.0.1:47891/always-on-top?enabled=false
POST http://127.0.0.1:47891/app-click?source=fidget
POST http://127.0.0.1:47891/app-click?source=bloom
```

## Fidget desktop

```bash
cd ~/Projects/K0rp_ware
git pull
cd desktop/fidget
npm install
npm run dev
```

## Bloom desktop

```bash
cd ~/Projects/K0rp_ware
git pull
cd desktop/bloom-desktop
npm install
npm run dev
```

## Routy

```text
/
/?app=click-audit
/?app=fidget
/?app=bloom
```

## Hranice projektu

K0rp_ware je local-first. Žádné účty, žádný cloud sync, žádná telemetrie. `Work?` znamená jen „klik mimo známé K0rp_ware appky“, ne identifikaci cizí aplikace.
