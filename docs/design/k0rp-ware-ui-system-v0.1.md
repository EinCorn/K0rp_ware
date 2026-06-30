# K0rp_ware UI Design System v0.1

Pracovní pravidla pro web a desktop appky. Cíl: jednoduché, jasné, špinavě institucionální a pixelartově stylizované rozhraní.

## Základní mantra

1. nejdřív čitelnost,
2. potom funkce,
3. potom špína,
4. až nakonec dekor.

UI nemá působit jako moderní SaaS. Má působit jako interní nástroj z mírně poškozené korporátní reality.

## Desktop layout

Každá desktop appka má stejnou základní kostru:

```text
┌───────────────────────┐
│ drag            close │
│ pin                   │
│ reset/mode            │
│                       │
│      main stage       │
│                       │
│      status bar       │
└───────────────────────┘
```

Levý control strip nesmí zasahovat do hlavní plochy. Hlavní obsah se centruje vůči usable area, ne nutně vůči celému oknu.

## Barvy

```css
--korp-void: #070706;
--korp-panel: #17140f;
--korp-panel-2: #262119;
--korp-paper: #d8cfbd;
--korp-muted: #8f8574;
--korp-line: rgba(216, 207, 189, 0.18);
--korp-line-strong: rgba(216, 207, 189, 0.34);

--korp-rose: #d97b80;
--korp-red: #ba5148;
--korp-yellow: #c9a33e;
--korp-green: #6f9a57;
--korp-blue: #6b91ad;
```

Použití:

- rose: K0rp brand, pin, ClickAudit akcent,
- red: close, chyba, abnormalita,
- yellow: Fidget, warning, sticky-note energie,
- green: Bloom, success, stav OK,
- blue: help, info, technický hint.

## Typografie

Dočasně používáme systémový monospace. Cílově:

```css
--font-ui: 'Korp UI', monospace;
--font-display: 'Korp Display', monospace;
--font-digits: 'Korp Digits', monospace;
```

Pravidla:

- desktop appky mají minimum textu,
- text v appkách není selectable,
- labely jsou krátké,
- čísla jsou výrazná a stabilní,
- web může mít víc textu než desktop, ale pořád v panelech.

## Text selection

Desktop appky:

```css
html,
body,
#app,
#app * {
  -webkit-user-select: none;
  user-select: none;
  -webkit-touch-callout: none;
}
```

Výjimka pouze přes explicitní opt-in `.is-selectable`, pokud někdy vznikne potřeba kopírovat diagnostiku.

## ClickAudit

Charakter: stroj, audit, číslo.

Musí držet:

- opticky centrovaný counter,
- liquid progress,
- pin/reset/close v control stripu,
- žádný pevný milestone banner.

Odměny mohou být drobné částice nebo hvězdy, ale ne velká statická hláška.

## Fidget

Charakter: objekt a mechanická hračka.

Musí držet:

- spinner jako hlavní objekt,
- mode toggle ikonicky,
- minimum slov,
- barevný motion efekt až při pohybu.

## Bloom

Charakter: stavová mřížka.

Musí držet:

- 5×5 board mimo levý control strip,
- score/wave jako spodní display,
- jasné green/yellow/red stavy,
- čistou symetrii.

## Web dashboard

Dashboard je control panel, ne plakát.

Musí držet:

- jeden hlavní wordmark,
- jeden status strip,
- tři modulové karty,
- footer s Ø brandingem,
- žádný výtahový obrázek ani duplicitní top ornamenty.

## Další kroky

1. testovat layout fixes,
2. vytvořit MVP SVG ikony,
3. přidat textury,
4. sjednotit CSS do shared theme souborů,
5. teprve potom řešit finální app icons a fonty.
