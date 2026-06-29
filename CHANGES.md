# Změny

## 0.3.0 dílna

- Přepsán hlavní veřejný tón projektu do češtiny a K0rp stylu.
- Přeložen webový pult, ClickAudit bridge, Fidget a Bloom webové obrazovky.
- Přeloženy desktop UI texty pro ClickAudit, Fidget a Bloom.
- Přidána webová routa `/?app=bloom`, aby Bloom nebyl jen slib v chodbě.
- Zachovány bezpečnostní hranice ClickAuditu: žádné souřadnice, screenshoty, názvy oken ani telemetrie.

## 0.2.0 draft

- Přidáno globální počítání kliků uvnitř K0rp_ware oken.
- Přidán modul ClickAudit.
- Přidán fidget modul Compliance Pebble.
- Přidána hra Archive Bloom.
- Přidán module-specific styling a aktualizované README routy.
- Přidán experimentální StatusLamp Pin mode přes Document Picture-in-Picture, pokud ho prohlížeč podporuje.
- Přidán GitHub Actions workflow pro automatický Cloudflare Workers deploy.
- Přidán `desktop/click-audit` Tauri scaffold pro lokální přenosné počítadlo kliků.
- Přidán Dashboard ↔ ClickAudit localhost bridge pro živé zrcadlení progresu a základní vzdálené příkazy.
- Produkční pult byl zúžen na ClickAudit; ostatní moduly zůstaly zaparkované v repu.

## 0.1.1

- Hlavní app soubor rozdělen do cílenějších komponent a modulových souborů.
- Přidány sdílené helpery v `src/core`.
- Přidán module registry.
- Aktualizováno README podle tehdejší struktury.

## 0.1.0

- Přidán první pult a prototyp StatusLamp.
- Přidána Cloudflare deploy konfigurace.
