# K0rp_OS — Typography & Brand Lock

Verze: 0.1.3 pracovní návrh  
Status: závazný vizuální detail pro UI implementaci

## 1. Účel dokumentu

Tento dokument zamyká dva důležité body vizuální identity:

1. aplikační texty používají `Pixel Operator` / `Pixel Operator Mono`,
2. logo `KØrp` / `K0rp_ware` je hotový asset a nemá se redesignovat.

Je to malý detail jen zdánlivě. Ve skutečnosti je to jedna z věcí, která drží K0rp_OS pohromadě: bez správného fontu se z toho snadno stane generic pixel UI s korporátním skinem.

## 2. Fontový standard

Canonical aplikační fonty:

```text
Pixel Operator
Pixel Operator Mono
```

### Pixel Operator

Použití:

- názvy modulů,
- tlačítka,
- běžné popisky,
- tooltips,
- krátká systémová hlášení,
- interní memo nadpisy,
- menu položky,
- taskbar a launcher texty.

### Pixel Operator Mono

Použití:

- čísla,
- resources,
- event log,
- registry,
- terminal-like prvky,
- debug/status hodnoty,
- employee ID,
- build/version labels,
- `v0.3 DÍLNA`, `SYSTÉM ONLINE`, `KONTEXT IGNOROVÁN` apod.

## 3. Logo lock

Logo `KØrp`, `K0rp_ware` a příbuzné značkové varianty jsou považované za rozhodnuté.

Zakázané bez explicitního zadání:

- redesign loga,
- nahrazení `Ø` jiným symbolem,
- změna proporcí wordmarku,
- generování nového loga podle promptu,
- převod loga do běžného fontového nápisu,
- „modernizace“ značky.

Povolené:

- použití existujícího assetu,
- export ve vhodné velikosti,
- technická optimalizace souboru,
- barevné varianty pouze pokud vycházejí z již schváleného vizuálního směru.

## 4. Implementační pravidlo

Doporučené CSS tokeny:

```css
:root {
  --korp-font-ui: "Pixel Operator", monospace;
  --korp-font-mono: "Pixel Operator Mono", "Pixel Operator", monospace;
}

.korp-ui-text {
  font-family: var(--korp-font-ui);
}

.korp-system-text,
.korp-number,
.korp-event-log {
  font-family: var(--korp-font-mono);
}
```

Fallback je technická nouzovka, ne designový směr.

## 5. Licence a distribuce

Tento docs pack neobsahuje fontové soubory.

Před release buildem je nutné:

- ověřit licenci fontu,
- rozhodnout, zda se font smí bundlovat v desktop/web aplikaci,
- uložit rozhodnutí do docs,
- nepřidávat font files do repa bez ověřeného právního/licenčního důvodu.

## 6. Codex / AI guardrail

Při zadávání úkolů Codexu nebo jinému implementačnímu agentovi přidat do promptu:

```text
Use Pixel Operator / Pixel Operator Mono as the UI font direction. Do not redesign or replace the K0rp/K0rp_ware logo. Treat the logo as an existing fixed asset. Do not add font files unless explicitly provided and license-cleared.
```

## 7. Kritérium přijetí

UI změna je fontově přijatelná, pokud:

- běžné UI texty vypadají konzistentně s Pixel Operator stylem,
- systémové/číselné texty používají mono variantu nebo odpovídající token,
- logo zůstalo beze změny,
- fallback se neobjevuje jako viditelný finální stav,
- text je čitelný v runtime velikostech.
