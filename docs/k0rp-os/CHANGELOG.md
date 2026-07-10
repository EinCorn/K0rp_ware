# K0rp_OS Docs — Changelog

## v0.1.3

Datum: pracovní návrh

### Přidáno

- `11-typography-and-brand.md`.
- Fontový standard:
  - `Pixel Operator` pro běžné UI texty,
  - `Pixel Operator Mono` pro systémové texty, čísla, resources, registry a logy.
- CSS token návrh pro `--korp-font-ui` a `--korp-font-mono`.
- Codex / AI guardrail pro fonty a logo.

### Změněno

- `01-visual-style.md` má rozšířenou typografickou sekci.
- `10-language-and-copy.md` doplněn o font jako součást hlasu systému.
- README doplněn o nový typography/brand dokument.

### Brand lock

- Logo `KØrp` / `K0rp_ware` je považované za rozhodnuté a nemá se redesignovat v běžném UI polish/refactoru.
- Docs pack neobsahuje fontové soubory; licence a bundlování fontů se musí vyřešit před release buildem.

## v0.1.1

Datum: pracovní návrh

### Přidáno

- `09-module-backlog.md`.
- `10-language-and-copy.md`.
- Concept board asset v `assets/concept-board-v0.1.png`.
- Module candidates:
  - Corner Watch,
  - Bublinková Fólie,
  - Button Compliance,
  - Surface Compliance,
  - Shape Compliance,
  - Attention Runner,
  - Zenová Zahrádka,
  - Newtonova Kolíbka.
- Resource map pro nové moduly.
- Event model pro nové moduly.
- Module manifest návrh.
- Module surfaces a maturity model.
- Codex tasky pro `korp-modules`, module registry a první prototypy.

### Změněno

- Product vision nyní výslovně říká, že K0rp_OS má být TypeScript-first modular engine.
- Roadmapa rozděluje nové moduly do v0.4–v0.7.
- Architecture víc zdůrazňuje feature churn jako design requirement.
- Visual style doplněn o desk object / ASMR moduly.
- Screen concepts doplněny o návrhy obrazovek nových modulů.

### Jazyk

- Čeština potvrzena jako primární/canonical jazyk K0rp_OS.
- Angličtina plánovaná později.
- Korporátní doublespeak a anglicismy jsou explicitně součástí stylu.

## v0.1

První RFC pack:

- product vision,
- visual style,
- product modes,
- architecture,
- event model,
- privacy model,
- screen concepts,
- roadmap,
- codex tasks.
