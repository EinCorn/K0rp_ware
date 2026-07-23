# K0rp_OS — Language & Copy Guide

Verze: 0.4.0 pracovní návrh

## 1. Primární jazyk

Primární jazyk K0rp_OS je čeština.

Čeština je canonical voice pro:

- UI;
- interní hlášky;
- audit forms;
- module labels;
- mema;
- Knowledge Base;
- errors;
- onboarding;
- session closure reports;
- policy a discrepancy surfaces.

Anglická lokalizace přijde později. Nemá být doslovná, ale funkčně a tónově ekvivalentní.

## 2. Jaká čeština

Cílový jazyk:

- český základ;
- korporátní doublespeak;
- přirozené anglicismy;
- provozní/business slovník;
- suchý humor;
- lehce znepokojivá formalita;
- věty, které by mohly být reálným interním oznámením, kdyby realita měla horší copywritera.

Nechceme:

- sterilní SaaS překlad;
- fantasy/combat slang;
- gamer meme voice;
- přehnaně tajemné lore formulace;
- stand-up punchline v každém field labelu.

## 3. Anglicismy

Používat tam, kde znějí přirozeně pro firemní/provozní prostředí:

```text
module
feature
workflow
dashboard
compliance
audit
status
sync
update
ticket
task
feedback
performance
focus
privacy
release
build
incident
tracking
resource
unlock
milestone
owner
scope
priority
capacity
routing
alignment
follow-up
policy
exception
supervision
```

Anglicismus není sám o sobě vtip. Musí být funkční součástí věty.

## 4. Doublespeak

Vzorec:

```text
pozitivní nebo neutrální procesní výraz
+ přesný stav
+ nepatrně špatný důsledek
```

Příklady:

- „Váš klid byl úspěšně zařazen do fronty.“
- „Povrch je clean. Příčina zůstává v pending review.“
- „Stabilizace probíhá. Nepleťte si ji s řešením.“
- „Výkon nebyl detekován. Pocit výkonu je stabilní.“
- „Souhlas byl přijat. Obsah souhlasu nebyl přiložen.“
- „Priority byly sníženy změnou jejich označení.“
- „Shoda nebyla dosažena. Nebyl však zaznamenán nesouhlas.“

## 5. Míra absurdity

Dobře:

> „Tvar zapadl. Význam nebyl vyžadován.“

> „Kapacita byla překročena v souladu s aktuální prioritou.“

Špatně:

> „LOL ticket horde goes brrr.“

> „Zabil jsi executive bosse a získal 500 corporate coins.“

K0rp_OS je parodie zevnitř systému. Ne komentátor stojící venku s cedulí, že systém je absurdní.

## 6. Copy layers

### System status

Krátké, klidné, věcné:

- `SYSTÉM ONLINE.`
- `PŘÍTOMNOST DETEKOVÁNA.`
- `NEČINNOST PROBÍHÁ STANDARDNĚ.`
- `KONTEXT IGNOROVÁN.`
- `RELACE UZAVŘENA.`
- `RELACE UZAVŘENA S VÝHRADOU.`

### Module tooltip

Jedna věta, která vysvětlí účel a zároveň ho mírně poškodí.

- ClickAudit: „Měří kliky. Vyhodnocuje přítomnost. Optimalizuje nic.“
- Fidget: „Nástroj pro stabilizaci rozptýlením.“
- Bloom: „Nechte drobné myšlenky růst do měřitelných problémů.“
- Priority Containment: „Snižuje prioritní zatížení změnou směru jeho pohybu.“
- Alignment Rally: „Vrací požadavky, dokud nezískají přijatelný administrativní tvar.“

### Audit question

Auditní otázka:

- začíná téměř normálně;
- je srozumitelná bez lore;
- odpovědi mohou být absurdní až svou blízkostí;
- nesmí být pět samostatných gagů v jednom formuláři.

### Closure report

Closure report odděluje module outcome od institucionálního uznání.

Dobře:

```text
RELACE UZAVŘENA
ZPRACOVÁNO: 84 POLOŽEK
VRÁCENO ODESÍLATELI: 12
VÝSLEDEK: NEOVĚŘEN
```

Špatně:

```text
VICTORY!
+1 EVIDENCE
```

Evidence nevzniká module closure. Vzniká až pozdějším auditem.

### Upgrade copy

Upgrade title může být krátký corporate termín. Description musí jasně říct mechanický účinek.

Dobře:

```text
RETURN TO SENDER
Zpracovaný požadavek se jednou odrazí k nejbližší další prioritě.
```

Špatně:

```text
RETURN TO SENDER
Synergie je teď šílená.
```

Humor nesmí zakrýt pravidlo.

### Policy copy

Policy UI musí být zvlášť přesné, protože hráč rozhoduje o automatizaci.

```text
PREFEROVAT SKUTEČNÉ P0
TOLERANCE RIZIKA: STANDARDNÍ
POVOLENÉ VÝJIMKY: 1
KONTROLNÍ VZOREK: KAŽDÁ 3. RELACE
```

### Discrepancy copy

Discrepancy popíše konflikt, ne morální selhání hráče.

```text
NESROVNALOST
Položka byla označena jako duplicate před vznikem původní položky.
Vyžaduje se lokální kontrola.
```

### Internal memo

Formální, zdánlivě normální, s jedním přesně umístěným absurdním bodem.

```text
OD: Oddělení Přenesené Odpovědnosti
PŘEDMĚT: Aktualizace hybnosti

Vážení zaměstnanci,
s potěšením oznamujeme, že hybnost byla úspěšně předána dalšímu oddělení.
Odpovědnost zůstává ve fázi interpretace.

Děkujeme za vaši účast na pohybu.
```

### Privacy text

Privacy copy nesmí používat doublespeak.

Dobře:

> „Tento režim nezaznamenává názvy aplikací, weby, text ani obrazovku. Ukládá pouze anonymní K0rp eventy a souhrnné hodnoty.“

Špatně:

> „Optimalizujeme váš pracovní komfort.“

## 7. Názvy modulů

Preferovaný pattern:

```text
anglický/korporátní termín + český in-universe podtitul
```

Příklady:

- `Button Compliance — Oddělení Opakovaného Souhlasu`
- `Surface Compliance — Povrchová Náprava`
- `Corner Watch — Rohové Očekávání`
- `Bublinková Fólie — Certified Relaxation Sheet`
- `Newtonova Kolíbka — Přenos Odpovědnosti`
- `Priority Containment — Zadržování priorit`
- `Alignment Rally — Argument Routing`

Pracovní názvy v docs nejsou automaticky finální labely ve hře.

## 8. Priority Containment language bank

### Enemy/object names

Používat objekty/procesy, ne lidi:

- Quick Ask;
- Meeting Invite;
- Ownerless Blocker;
- Duplicate Ticket;
- P0 Escalation;
- Executive Priority.

### Status copy

- „Nová priorita nahradila všechny předchozí priority.“
- „Owner nebyl nalezen. Položka zůstává přidělena.“
- „Duplicate byl sloučen s položkou, která dosud nevznikla.“
- „Kapacita byla rozšířena změnou očekávání.“
- „Nezpracované priority byly převedeny do následné kontroly.“

### Audit 27-P draft

```text
OVĚŘENÍ SNÍŽENÍ PRIORITNÍHO ZATÍŽENÍ

Jakým způsobem byl objem priorit snížen?

○ Priority byly vyřešeny.
○ Priority byly přeřazeny.
○ Priority byly přejmenovány.
○ Snížení nebylo možné potvrdit.
```

Tento copy je design draft, ne machine-readable canonical form před Taskem 035.

## 9. Alignment Rally language bank

### Claim templates

- „Toto musí být hotové dnes.“
- „Změna nebude mít dopad.“
- „Owner je přece jasný.“
- „Je to jen rychlá úprava.“

Claims jsou fictional templates. Nemají být přímé citace konkrétních lidí nebo firmy.

### Response zones

```text
EVIDENCE
SCOPE
OWNER
DEPENDENCY
```

### Closure outcomes

```text
ACCEPTED
REJECTED
DEFERRED
OWNER ASSIGNED
SENT OFFLINE
MEETING REQUIRED
NO DECISION RECORDED
```

### Status copy

- „Shoda byla zaznamenána bez potvrzení jejího vzniku.“
- „Nebyl zaznamenán nesouhlas.“
- „Další diskuse byla přesunuta mimo auditní stopu.“
- „Claim získal ownera. Owner nebyl informován.“

### Audit 31-R draft

```text
BYLO DOSAŽENO SHODY?

○ Shoda byla dosažena.
○ Shoda byla zaznamenána.
○ Nebyl zaznamenán nesouhlas.
○ Další diskuse byla přesunuta mimo auditní stopu.
```

## 10. Copy examples pro ostatní moduly

### Corner Watch

- „Roh bude dosažen. Časový rámec nebyl schválen.“
- „Čekání je forma účasti.“
- „Téměř významné.“

### Bublinková Fólie

- „Relaxační fólie nenahrazuje odpočinek. Odpočinek nebyl schválen.“
- „Tento benefit byl započítán.“
- „Tlak byl uvolněn do lokálního prostředí.“

### Button Compliance

- „Potvrzení čeká na potvrzení.“
- „Souhlas zaznamenán. Obsah souhlasu nebyl připojen.“
- „Panel byl optimalizován pro maximální pocit účasti.“

### Surface Compliance

- „Clean stav dosažen. Audit může začít.“
- „Povrch je připraven přijmout další nečistotu.“
- „Residue removed. Meaning pending.“

### Shape Compliance

- „Tvar zapadl. Význam nebyl vyžadován.“
- „Alignment completed. Please do not interpret.“
- „Nesoulad byl odstraněn mechanickým souhlasem.“

### Attention Runner

- „Sub-task běží. Main task nebyl identifikován.“
- „Pozornost rozdělena na menší nepoužitelné části.“
- „Doprovodný kanál aktivní.“

### Zenová Zahrádka

- „Klid byl aplikován na povrch.“
- „Hrabejte, dokud proces nepřestane klást otázky.“
- „Tento písek byl certifikován pro manažerské uvolnění.“

### Newtonova Kolíbka

- „Hybnost byla předána. Odpovědnost nikoli.“
- „Každý náraz posouvá problém na další jednotku.“
- „Systém zůstává v pohybu. Výstup nebyl detekován.“

## 11. Forbidden patterns

Vyhnout se:

- explicitnímu lore dumpu;
- vysvětlování skryté meta vrstvy;
- konkrétní parodii jedné reálné firmy;
- moralizování o produktivitě;
- gamer meme slangu;
- fantasy combat slovníku typu kill, loot, boss chest v player-facing copy;
- terapeutickým a klinickým slibům;
- „dopamin hit“ jako faktickému popisu;
- větám, které skrývají mechanické pravidlo upgradu;
- generovaným auditům, kde je každý řádek punchline.

## 12. Font a live text

Text je fyzická vrstva systému.

Current runtime font baseline:

```text
Pixel Operator
Pixel Operator Mono
```

Pravidla:

- labels a body: čitelný application font;
- registry, event logy a čísla: mono;
- logo je asset;
- text nesmí být zapečen do button backgroundů, pokud má být dynamický nebo lokalizovatelný;
- hover/pressed state může nezávisle měnit background asset i live text color;
- případná budoucí změna OS fontu musí projít samostatným readability gate, ne být vedlejší efekt asset tasku.

## 13. Důležité pravidlo

> K0rp_OS může používat češtinu, anglicismy a corporate doublespeak skoro v každé větě, ale pořád musí znít jako produkt, který by mohl existovat.

> Ne jako parodie zvenku. Jako interní nástroj, který už dávno zapomněl, že je parodií.
