# K0rp_OS UI Asset Pack v0.1

Komplexní pracovní sada pixel-art assetů pro canonical K0rp_OS desktop. Navazuje na předchozí sadu desktopových ikon a používá stejnou paletu, obrys, světlo, materiály a blokový stín.

## Obsah

- horní systémová lišta a její segmenty;
- spodní taskbar včetně Start, task buttons, EV/AUDITY, privacy badge, hodin a tray ikon;
- kompletní rodina ovládacích prvků oken ve čtyřech stavech;
- osm sémantických variant oken: module, audit, document, folder, memo, terminal, system, prestige;
- transparentní window shells, header assets a nine-slice metadata;
- opakovatelné surface tiles;
- checkboxy, radio, toggle, input, scale, progress a button states;
- koncepty Auditů 00-A, 10-A a autorizace 16-C;
- identity assignment, installation sequence, desktop mutation, certification a cycle closure/reboot;
- šest velkých preview boardů včetně canonical desktopu 1520×855;
- `manifest.json`, Excel-friendly `manifest.csv`, `palette.json`, `nine-slice.json` a CSS tokens.

## Základní pravidla

1. **Jedna konstrukce, různé materiály.** Okna mají stejný vnější frame a chování. Audit, folder nebo terminal se liší header accentem a vnitřním povrchem, ne náhodným novým layoutem.
2. **Audit je dokument.** Paper surface, code label, field controls, status row a submit action. Dokončený audit se změní v read-only artifact s certifikačním blokem.
3. **Unlock není popup odměna.** Audit/Evidence autorizuje modul, následuje instalace a teprve potom se fyzicky objeví shortcut, folder nebo Settings capability.
4. **Memo je soubor.** Routine memo se zakládá v Doručené. Modaly jsou vyhrazené pro identity assignment, certification, prestige a jiné systémově významné události.
5. **Barva není jediný signál.** State mění také glyph, rámeček, kontrast a text.
6. **Závoj není UI položka.** Neexistuje explicitní lore tlačítko ani vysvětlující symbol; podivnost zůstává v patině, copy a drobných nesouladech.

## Runtime rozměry

```text
Canvas:          1520 × 855
Top system rail: 36 px
Taskbar:         38 px
Window header:   27 px
Control:         18 × 16 px
```

## Integrace

- produkční assety jsou v `assets/` v 1× logickém rozlišení;
- taskbar chips, action buttons a inputy mají také `blank` varianty bez rasterizovaného textu;
- škálovat pouze nearest-neighbor;
- transparentní window shells mají samostatný content slot;
- margins pro nine-slice jsou v `tokens/nine-slice.json`;
- runtime text má zůstat HTML/CSS kvůli lokalizaci, přístupnosti a dynamickým hodnotám;
- `Pixel Operator` / `Pixel Operator Mono` jsou fontový směr, ale fontové soubory nejsou součástí balíčku;
- stávající standalone `app-shell` se tímto balíčkem automaticky nenahrazuje. Jde o OS-level chrome a systémové surfaces.

## Důležité repo podklady

- `docs/k0rp-os/01-visual-style.md`
- `docs/k0rp-os/06-screen-concepts.md`
- `docs/k0rp-os/11-typography-and-brand.md`
- `docs/k0rp-os/14-sensory-feedback.md`
- `docs/k0rp-os/15-unlocks-memos-and-system-mutations.md`
- `docs/k0rp-os/20-core-loop.md`
- `packages/korp-progression/data/shards/audit-forms.json`
- `src/components/KorpOsShell.css`
- `src/components/AuditFormDocument.css`
