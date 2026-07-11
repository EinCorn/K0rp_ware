# K0rp_OS — Sensory Feedback

Verze: 0.2.0 pracovní RFC

## 1. Terminologie

Ne každý příjemný klik je ASMR. Dokument používá:

- sensory satisfaction;
- tactile-feeling feedback;
- ASMR-adjacent audio;
- hmatový/rytmický loop.

Klinická tvrzení o ADHD nebo dopaminu se nepoužívají. Senzorická vrstva má být volitelná, regulovatelná a přístupná.

## 2. Feedback hierarchy

### Micro

Klik, pop, snap, malý dopad, digit flip.

### Meso

Dokončená řada, stabilní rotace, clean patch, audit batch.

### Ceremonial

Sheet complete, Bloom wave, corner hit, schválený formulář.

### Systemic

Nové oddělení, instalace modulu, audit closure, reboot.

Vše nesmí znít ani vypadat stejně velké.

## 3. Audio buses

- UI/forms;
- tactile interactions;
- material impacts;
- ambient office;
- ceremonial rewards;
- system errors/anomalies.

Každý bus má vlastní hlasitost a mute.

## 4. Material profiles

Minimální ID:

```text
metal.light
metal.heavy
plastic.hollow
plastic.soft
paper.dry
glass.dirty
sand.fine
liquid.viscous
bubble.thin
bubble.reinforced
stone.clean
stone.overloaded
```

Profil určuje sample family, pitch/volume variance, stereo, decay, concurrency a visual response.

## 5. Density management

Při hustých eventech:

- nehrát plný sample pro každý objekt;
- seskupovat události do batch zvuku;
- omezit concurrent voices;
- přecházet z transientů do textury;
- ceremonial event musí zůstat čitelný.

## 6. Visual-material match

Zvuk, pohyb a obraz musí mít stejnou hmotnost.

- těžká mince/kov → pomalejší náběh a hlubší impact;
- plastová bublina → krátký suchý pop;
- kapalina → viskózní wave;
- snap → magnetické přitažení, lock frame, krátký click.

## 7. Module sensory contracts

### ClickAudit

- digit flip;
- liquid deformation;
- subtle click;
- milestone ceremony;
- žádný permanentní ohňostroj.

### Fidget

- spin-up, resonance, coast-down;
- material/bearing profiles;
- completion je natural settle, ne nekonečné max RPM.

### Bloom

- stone material distinction;
- chain density;
- red state není jen hlasitější;
- procedural dry burst.

### Corner Watch

- quiet bounce;
- near-miss cue;
- corner hit ceremony;
- hit se archivuje i bez pohledu.

### Button Compliance

- physical button depth;
- switch/relay sounds;
- sequence closure;
- false-positive odlišit bez trestající sirény.

### Bubble Wrap

- sample variance;
- press-and-drag;
- reinforced/defective bubble;
- sheet completion;
- batch density limit.

## 8. Accessibility settings

- Reduce Motion;
- flash/screen-shake off;
- quiet mode;
- high-frequency reduction;
- sensory intensity low/standard/high;
- larger snap tolerance;
- keyboard alternatives;
- color-independent states;
- random anomaly toggle.

## 9. Acceptance criteria

Modul není sensory-ready, pokud:

- opakuje jediný sample bez variance;
- feedback překrývá informace;
- po deseti minutách je únavný;
- bez zvuku není stav čitelný;
- reduce motion rozbije gameplay;
- closure nemá vlastní čitelný moment.
