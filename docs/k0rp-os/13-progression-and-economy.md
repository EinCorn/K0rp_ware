# K0rp_OS — Progression and Economy

Verze: 0.2.0 pracovní RFC

## 1. Záměr

K0rp_OS není jeden velký clicker. Je to federovaný incremental systém:

- každý modul má vlastní hmatovou mikro-smyčku;
- OS z jejich eventů skládá kariéru, byrokracii a desktop artifacts;
- odměnou je hlavně nový systém, oprávnění nebo změna pravidel;
- čísla dokazují, že něco probíhá, ale nejsou jediným obsahem.

## 2. Audit-first onboarding

První interakcí je `AUDIT 00-A`.

Každá úmyslná změna pole:

```text
audit interaction
→ clickaudit.click(profile: audit-form)
→ local field state
```

Po submitu:

- zavře se auditní okno;
- nainstaluje se ClickAudit;
- objeví se Doručené;
- zobrazí se NWU;
- vznikne první memo a schválený formulář.

## 3. Resource taxonomy

### Currency

- `notionalWorkUnits` — hlavní spendable cycle currency;
- `approvalUnits` — administrativní měna;
- `auditFindings` — permanentní prestige currency.

### Meters

- Audit Pressure;
- Entropy;
- Stabilization;
- Compliance Integrity;
- System Order.

Mají min/max a mohou se resetovat. Nejsou to nekonečné pytle bodů.

### Derived

- Perceived Productivity;
- Perceived Control.

Neutrácejí se. Počítají se z jiných stavů.

### Module-local

Bloom Integrity, Idle Faith, Relief Units, Cleanliness, Alignment, Momentum a další.

### Lifetime/hidden

Lifetime click/batch/session totals, Krypto-management Score, Dopamine Drift, Transferred Responsibility.

## 4. Core loop

```text
hmatatelná akce
→ okamžitá odezva
→ lokální postup
→ přirozené closure
→ milestone event
→ formulář / memo / oprávnění
→ systémová změna
→ bezpečný bod k odchodu
```

## 5. First-cycle pacing

Cíl: první auditní closure za 240–310 minut, target 270.

- 0–12: Audit 00-A;
- 12–35: ClickAudit;
- 35–65: Fidget;
- 65–110: Bloom;
- 110–145: optional Corner Watch;
- 145–195: Button Compliance;
- 195–250: certifications/cross-module closure;
- 250–275: form 42-Z and prestige.

Detailní data jsou v `packages/korp-progression/data/first-cycle.balance.csv` a `17-first-cycle-balance.md`.

## 6. Click anti-spam

Kliky se vždy evidují, ale currency yield se sytí:

- 1–100: 1.00×;
- 101–300: 0.40×;
- 301+: 0.10×.

Milestone/batch reward zůstává významný. Hráč není trestán za klikání, ale čistý autoclicker nemá být optimální cesta.

## 7. Upgrade classes

- Procedures — mění pravidlo nebo výnos;
- Equipment — mění materiál, fyziku nebo tactile feel;
- Permissions — odemykají modul/oddělení/surface;
- Delegation — automatizuje rutinu a nechává výjimky;
- Interpretation — odhaluje metriky a historii;
- Contamination/system mutation — mění desktop nebo způsob, jak se OS chová.

## 8. Automation rule

Automatizace nesmí odstranit hračku.

```text
manual operation
→ assistant handles routine
→ player handles exceptions
→ orchestration across modules
→ audit of automation
```

## 9. Prestige

První prestige:

```text
UZAVŘENÍ AUDITNÍHO CYKLU
FORMULÁŘ 42-Z
```

Resetuje cycle state a zachovává identity, mema, certifikace, lifetime stats, permanent upgrades a Audit Findings.

Typický první výsledek: 5 Audit Findings.

Hlavní odměna: Bublinková Fólie jako nový interaction system plus archivace/reboot desktopu.

## 10. Ethical retention

Zakázané jako core requirement:

- daily streak;
- propadající odměna;
- energie;
- povinný rare event;
- trest za offline;
- agresivní notification badge;
- monetizace čekání.

Používat:

- uzavření směny;
- archive report;
- voluntary return;
- přirozené closure points;
- nový systém jako odměnu;
- offline report bez trestu.
