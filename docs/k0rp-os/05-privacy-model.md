# K0rp_OS — Privacy Model

Verze: 0.1.3 pracovní návrh

## 1. Základní pravidlo

K0rp_OS si může dělat srandu z kontroly. **Nesmí se stát kontrolou.**

Produkt je satira na pseudo-produktivitu, krypto-management, měření ne-výkonu a korporátní rituály. Proto musí být privacy model čistý, čitelný a lokální-first.

## 2. Co smíme sledovat bez rizika

Uvnitř K0rp modulů lze sledovat:

- kliky v ClickAudit,
- spiny ve Fidget,
- tahy v Bloom,
- prasklé bubliny,
- stisky tlačítek,
- vyčištěnou plochu,
- zapadnuté tvary,
- odrazy loga,
- hrabání písku,
- cykly Newtonovy kolíbky,
- interní K0rp progress,
- unlocky,
- settings.

To jsou explicitní interakce s hrou / modulem.

## 3. Co nesmíme sledovat defaultně

K0rp_OS nesmí defaultně sledovat:

- názvy aplikací,
- názvy oken,
- URL,
- text,
- clipboard,
- screenshoty,
- klávesy,
- obsah dokumentů,
- pracovní soubory,
- procesy,
- konkrétní weby,
- identitu třetích stran.

## 4. Privacy režimy

### OFF

Nesleduje nic mimo explicitní modul.

### K0rp-only

Sleduje jen interakce uvnitř K0rp modulů.

Příklad:

```text
bubble.popped
clickaudit.click
fidget.spinTick
```

### Privacy Work Blob

Sleduje pouze agregovanou aktivitu mimo K0rp.

Příklad:

```text
system.externalWorkPulse
system.externalIdlePulse
```

Neobsahuje app name, URL, title ani content.

### Local Full Mode

Experimentální režim pro osobní zařízení.

Podmínky:

- explicitní opt-in,
- lokální zpracování,
- jasný indikátor,
- žádný cloud raw sync,
- možnost export/delete.

Není součást MVP.

## 5. Cloud sync

Cloud sync je volitelný a pozdější.

Povolené pro sync:

- fake employee id,
- progress totals,
- unlocks,
- cosmetics,
- settings,
- achievement state,
- language preference.

Nepovolené pro sync:

- raw external activity,
- URL,
- app/window names,
- keyboard data,
- screenshots,
- personal content.

## 6. Module privacy profile

Každý modul má privacy profile.

```ts
export type KorpPrivacyProfile =
  | "korpOnly"
  | "localAggregate"
  | "localSensitiveOptIn"
  | "cloudSyncSafe";
```

Příklady:

```text
ClickAudit          → korpOnly / localAggregate podle režimu
Fidget              → korpOnly
Bloom               → korpOnly
Bublinková Fólie    → korpOnly
Button Compliance   → korpOnly
Surface Compliance  → korpOnly
Shape Compliance    → korpOnly
Corner Watch        → korpOnly
Zenová Zahrádka     → korpOnly
Newtonova Kolíbka   → korpOnly
Attention Runner    → korpOnly
Overlay Work Blob   → localAggregate
```

## 7. UI pravidla

Privacy stav musí být viditelný.

Overlay musí mít jasný indikátor:

```text
K0RP-ONLY
PRIVACY WORK BLOB
OFF
LOCAL FULL MODE
```

Consent text musí být normální lidskou řečí, ne in-universe doublespeak.

Dobře:

> Režim Privacy Work Blob zaznamenává pouze anonymní pulzy aktivity. Nezaznamenává názvy aplikací, weby, text ani obrazovku.

Špatně:

> Souhlasíte s optimalizací zážitku.

K0rp může být absurdní, ale privacy consent musí být čitelný.

## 8. Export / delete

Uživatel musí mít možnost:

- exportovat lokální save,
- smazat lokální save,
- resetovat fake employee id,
- vypnout sync,
- smazat cloud progress, pokud sync existuje.

## 9. Důležité pravidlo

> Privacy model není vedlejší feature. Je to součást pointy. Hra o kontrole nesmí sama začít kontrolovat.


## Platform privacy note

Windows je primární platforma pro overlay a desktop behavior, takže všechny privacy-sensitive funkce musí být ručně ověřené hlavně na Windows.

Mac může sloužit pro vývoj, návrh a smoke test, ale nesmí se z něj odvodit, že overlay/global activity behavior je bezpečně vyřešený i na Windows.

Platform-specific bridges musí být oddělené od `korp-core`. Core smí dostávat jen normalizované eventy, ne raw OS data.
