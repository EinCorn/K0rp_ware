# K0rp_OS — Privacy Model

Verze: 0.4.0 pracovní návrh

## 1. Základní pravidlo

K0rp_OS si může dělat srandu z kontroly. **Nesmí se stát kontrolou.**

Produkt je satira na pseudo-produktivitu, krypto-management, měření ne-výkonu a korporátní rituály. Privacy model proto musí být:

- local-first;
- čitelný;
- explicitní;
- minimální;
- oddělený od doublespeaku;
- bezpečný i po přidání action modules, delegation a policy.

## 2. Co smíme sledovat uvnitř K0rp

Explicitní interakce s hrou:

- clicks;
- audit field changes;
- Fidget settled sessions;
- Bloom state changes/waves;
- bubble pops/sheets;
- button sequences;
- cleaned surfaces;
- snapped shapes;
- corner/observation closures;
- Zen patterns;
- cradle motion closures;
- Priority Containment aggregate outcomes/session closure;
- Alignment Rally template-safe outcomes/session closure;
- K0rp unlocks, authorizations, packets, audits, policies a settings.

## 3. Co není automaticky globální event

Následující zůstává transient/module-local, pokud není výslovně agregováno:

- pointer coordinates;
- every animation/physics tick;
- every projectile collision;
- exact enemy trajectory history;
- full input replay;
- frame-by-frame spinner state;
- temporary run XP;
- temporary particles;
- raw controller motion;
- precise claim trajectory log.

High-intensity module může lokálně použít data pro simulation. Do core/save/bridge posílá pouze potřebné aggregate records.

## 4. Co nesmíme sledovat defaultně

- external app names;
- external window titles;
- URL;
- visible text;
- clipboard;
- screenshots;
- raw keys;
- document contents;
- work files;
- process list;
- third-party identity;
- free-text claims;
- voice/audio recording;
- full action replay;
- exact pointer heatmap;
- biometric data.

## 5. Privacy modes

### OFF

Žádný tracking mimo explicitní local module state nutný pro běh appky.

### K0rp-only

Pouze interakce uvnitř K0rp modules/surfaces.

Příklady:

```text
clickaudit.click
fidget.sessionSettled
bloom.waveAdvanced
priority.sessionClosed
alignment.sessionClosed
```

### Privacy Work Blob

Pouze anonymní aggregate pulse mimo K0rp:

```text
system.externalWorkPulse
system.externalIdlePulse
```

Bez app name, URL, title, text nebo screenshotu.

Není součást current MVP.

### Local Full Mode

Experimentální explicitní opt-in pro osobní zařízení.

Podmínky:

- local processing;
- jasný indicator;
- no raw cloud sync;
- export/delete;
- permission-by-permission review;
- samostatný implementation/security task.

Není součást current roadmap core.

## 6. Module privacy profile

```ts
export type KorpPrivacyProfile =
  | "korpOnly"
  | "localAggregate"
  | "localSensitiveOptIn"
  | "cloudSyncSafe";
```

Current/candidate mapping:

```text
ClickAudit           → korpOnly
Fidget               → korpOnly
Bloom                → korpOnly
Bubble Wrap          → korpOnly
Button Compliance    → korpOnly
Surface Compliance   → korpOnly
Shape Compliance     → korpOnly
Corner Watch         → korpOnly
Zenová Zahrádka      → korpOnly
Newtonova Kolíbka    → korpOnly
Attention Runner     → korpOnly
Priority Containment → korpOnly; aggregate closure only for bridge
Alignment Rally      → korpOnly; template ID/outcome, no free text
Overlay Work Blob    → localAggregate
```

## 7. Action-module event limits

### Priority Containment

Povolený session summary:

```json
{
  "type": "priority.sessionClosed",
  "meta": {
    "source": "manual",
    "outcome": "closed-with-reservation",
    "waveCount": 5,
    "processedCount": 84,
    "routedCount": 21
  }
}
```

Zakázané:

- frame-by-frame position;
- complete collision log;
- raw input timeline;
- screen recording;
- external ticket content;
- user-entered workplace data.

### Alignment Rally

Povolené:

- fictional template ID;
- response/qualifier class;
- closure outcome;
- aggregate rally count.

Zakázané:

- hráčem vložený skutečný text;
- pasted email/chat content;
- names;
- external document parsing;
- complete trajectory/input replay.

První prototype používá pouze bundled fictional claims.

## 8. Delegation and policy privacy

Povolené persistent data:

- fictional operator ID;
- module assignment;
- capability/authorization IDs;
- policy IDs;
- target weights;
- risk tolerance;
- allowed exception IDs;
- supervision cadence;
- aggregate confidence/outcome;
- discrepancy IDs.

Zakázané:

- reálná jména kolegů;
- pracovní účty;
- external schedules;
- employer data;
- real performance evaluation;
- import reálných tickets/priorities.

K0rp personnel jsou fictional system entities, ne kopie workplace rosteru.

## 9. Local playtest instrumentation

Development mode smí lokálně zaznamenat:

- milestone timestamps;
- event counts;
- packet/certification times;
- unlock order;
- selected bundled upgrade IDs;
- action session duration/outcome;
- aggregate performance metrics;
- rendering performance;
- save/load errors.

Musí být:

- off nebo explicitně označený;
- exportable;
- deletable;
- bez cloud uploadu;
- bez external context.

## 10. Standalone bridge

```text
standalone module
→ local state
→ explicit linked mode
→ aggregate KorpEvent
→ authorization/source validation
→ K0rp_OS core
```

Bridge nesmí posílat:

- pointer stream;
- physics frames;
- screenshots;
- external app context;
- free text;
- full replay.

Unlinked mode funguje bez accountu a bez campaign rewardu.

## 11. Cloud sync

Pozdější a volitelný.

Povolené candidates:

- fake employee ID;
- progression totals;
- packets/audit status, pokud je bezpečně serializovaný;
- authorizations;
- cosmetics;
- settings;
- bundled policy IDs/config;
- language preference.

Nepovolené:

- raw external activity;
- URL/app/window names;
- keyboard/pointer data;
- screenshots;
- personal content;
- free-text claims;
- full action replay;
- local debug instrumentation bez výslovného opt-in designu.

## 12. UI pravidla

Privacy state musí být viditelný:

```text
K0RP-ONLY
PRIVACY WORK BLOB
OFF
LOCAL FULL MODE
```

Consent text je normální lidskou řečí.

Dobře:

> „Tento režim ukládá pouze souhrnné K0rp eventy. Nezaznamenává názvy aplikací, weby, text, obrazovku ani vstupy mimo K0rp.“

Špatně:

> „Souhlasíte s optimalizací pracovního komfortu.“

K0rp fiction může být absurdní. Privacy consent ne.

## 13. Export and delete

Uživatel musí mít možnost:

- exportovat local save;
- smazat local save;
- resetovat fake employee ID;
- smazat local playtest logs;
- odpojit standalone bridge;
- vypnout sync;
- smazat cloud progress, pokud sync existuje.

## 14. Platform note

Windows je primary platform pro desktop/overlay behavior. Privacy-sensitive functions musí být ověřené hlavně na Windows.

Mac je dev/design/smoke-test prostředí. Nelze z něj odvodit bezpečnost Windows global hooks.

Platform bridge je mimo `korp-core`. Core dostává normalizované aggregate events, ne raw OS data.

## 15. Důležité pravidlo

> Hra o kontrole nesmí začít kontrolovat. Hra o hromadě priorit nesmí dostat přístup k těm skutečným.
