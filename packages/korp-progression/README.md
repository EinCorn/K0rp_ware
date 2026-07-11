# K0rp progression database v0.1.1

Pracovní progression pack pro `EinCorn/K0rp_ware`.

## Co tento balík řeší

- první interakcí je vyplnění auditu `00-A`;
- každá úmyslná interakce formuláře současně vytváří `clickaudit.click`;
- první auditní cyklus je navržený na přibližně 4–5 hodin smíšeného hraní;
- obsahuje propojené resources, eventy, formuláře, upgrades, certifikace, mema, cross-module interakce a první prestige;
- data jsou dostupná jako TypeScript constants i čisté JSON/CSV;
- první prestige není úplná reorganizace, ale **Uzavření auditního cyklu**;
- po prvním prestige se odemyká Bublinková Fólie jako skutečně nový systém.

## Důležité

Toto je návrhová databáze a první balance pass, ne hotová ekonomika po playtestu.

Čísla jsou nastavená tak, aby:

- první zásadní změna pravidel přišla během prvních 20–30 minut;
- Fidget byl dostupný přibližně po 35–50 minutách;
- Bloom přibližně po 60–80 minutách;
- Corner Watch byl volitelná idle větev;
- Button Compliance přišel přibližně ve třetí hodině;
- closure checklist byl splnitelný kolem 4:10–4:40;
- samotný formulář prestige a první post-prestige návrat posunuly celek ke 4,5 hodinám.

## Základní designová věta

> Hráč nejprve vyplní audit. Audit vytváří kliky. Kliky vytvoří potřebu dalšího auditu. Teprve potom se z pracovní stanice začne stávat incremental systém.

## Soubory

- `docs/first-cycle-rfc.md` — kompletní návrh první 4–5hodinové smyčky;
- `docs/integration-map.md` — doporučené napojení na současný `korp-core`;
- `docs/desktop-surface-progression.md` — mapování progression na fake desktop;
- `src/progression.database.ts` — sestavení databáze ze shardů;
- `src/progression.types.ts` — typy;
- `src/progression.validation.ts` — základní runtime validace referencí;
- `data/progression.database.json` — index strojových dat;
- `data/shards/*.json` — kompletní databáze po logických částech;
- `data/surface-progression.json` — desktop artifacts a mutations;
- `data/first-cycle.balance.csv` — časová balance první smyčky;
- `data/upgrade-catalog.csv` — rychlý katalog upgrades;
- `data/memo-catalog.csv` — rychlý katalog mem.

## v0.1.1 — desktop surface addendum

Tato verze nemění ekonomiku ani module loops. Přidává explicitní mapping:

- postupně se zaplňující falešný desktop;
- moduly jako interní application windows;
- audity, mema, reporty a certifikace jako soubory;
- složky jako viditelný stav hry;
- Corner Watch jako skutečný screensaver;
- první prestige jako archivace, úklid plochy, reboot a změna OS buildu;
- oddělení canonical desktopu, web fallbacku, standalone appek a budoucího overlay.

## Repo integration note

JSON files are canonical machine-readable data. TypeScript files import them to avoid duplicated generated source. The package does not alter current module runtime behavior until explicitly connected.

`data/progression.database.json` je index. Kompletní data žijí v `data/shards/*.json` a jsou sestavena v `src/progression.database.ts`.
