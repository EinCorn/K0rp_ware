# K0rp_ware Asset Map v0.1

Tento dokument popisuje plánovanou mapu assetů pro K0rp_ware. Produkční assety budeme tvořit postupně. Zatím slouží jako pořádek pro další kroky.

## Struktura

```text
src/assets/k0rp-ui/
  branding/
  icons/
  icons/modules/
  textures/
  frames/
  fonts/
  app-icons/
  references/
```

## Branding

```text
branding/
  korp-mark.svg
  korp-wordmark.svg
  korp-ware-wordmark.svg
  korp-footer-mark.svg
```

Pravidlo: neduplikovat silné logo, samotný znak a název na jednom místě. Header má být střídmý, footer může nést výraznější Ø motiv.

## Základní ikony

První průchod v repu:

```text
icons/
  close.svg
  grip.svg
  pin.svg
  reset.svg
  click.svg
  manual.svg
  open.svg
  download.svg
```

Význam:

```text
close = zavřít
grip = úchop okna
pin = připíchnout
reset = resetovat
click = klikací režim
manual = ruční režim
open = otevřít web
download = stáhnout appku
```

Ikony mají být malé, čitelné, jednoduché, pixel-friendly a barvené přes currentColor.

## Modulové ikony

První sada:

```text
icons/modules/
  click-audit.svg
  fidget.svg
  bloom.svg
  unknown.svg
```

`unknown.svg` je dočasná ikona pro neurčený nebo fallback stav. Později ji můžeme přejmenovat nebo nahradit přesnějším symbolem.

Použití: dashboard, source breakdown, případně app icons.

## Textury

```text
textures/
  noise-1.png
  grid-dark.png
  dirty-panel.png
```

Textury mají být malé, opakovatelné, tlumené a použitelné jako CSS background. Účel: šum, mřížka, špinavý panel.

## Frames

První kanonický frame asset:

```text
frames/
  app-shell.webp
```

Dočasné lokální kopie pro desktop buildy:

```text
desktop/click-audit/src/assets/app-shell.webp
desktop/fidget/src/assets/app-shell.webp
desktop/bloom-desktop/src/assets/app-shell.webp
```

`app-shell.webp` je jednotný rámeček pro malé desktop appky: tmavý panel, vnitřní pracovní plocha, spodní Ø footer a průduchy po stranách. Je to první skutečný hmotný UI artefakt K0rp_ware.

Další plánované frame assety:

```text
frames/
  panel-frame.svg
  button-frame.svg
  status-bar-frame.svg
```

Použití: hlavní panely, tlačítka, spodní score/status lišty. Dlouhodobě vhodné pro jednotný špinavý pixel-panel systém.

## Fonty

```text
fonts/
  korp-ui.woff2
  korp-display.woff2
  korp-digits.woff2
```

Fonty musí být licenčně bezpečné. Dokud nejsou vybrané nebo vytvořené, používáme systémový monospace fallback.

## Reference

```text
references/
  korp-logo.png
  korp-mark.png
  hlas-z-chodby-*.png
```

Reference nejsou produkční assety. Slouží pro držení vizuálního směru: pixelart, špinavá kancelářská liminalita, jednoduchá silueta, komiksová čitelnost.

## MVP pořadí

1. opravit layout test skinu,
2. vytvořit základní SVG control ikony,
3. napojit SVG ikony do webu a desktop shellů,
4. vytvořit a napojit jednotný app-shell frame,
5. vytvořit 2 až 3 textury pro vnitřní prvky,
6. sjednotit panel/button systém,
7. teprve potom řešit app icons a detailní modulové ilustrace.
