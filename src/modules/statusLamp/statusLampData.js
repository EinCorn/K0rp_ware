export const STATUS_LAMP_STORAGE_KEY = 'k0rp-ware.status-lamp.state'

export const statuses = [
  {
    id: 'available',
    label: 'Dostupný',
    severity: 'green',
    description: 'Uživatel je technicky přítomen. Tento stav může být dočasný.',
  },
  {
    id: 'thinking',
    label: 'Přemýšlení',
    severity: 'blue',
    description: 'Viditelný výstup se v tuto chvíli nedoporučuje.',
  },
  {
    id: 'deep-work-lying',
    label: 'Deep Work, ale lže',
    severity: 'amber',
    description: 'Chráněný stav pro profesionálně orámované vnitřní bloudění.',
  },
  {
    id: 'strategically-unavailable',
    label: 'Strategicky nedostupný',
    severity: 'red',
    description: 'Přítomnost byla přesunuta do pozdější fáze sladění.',
  },
  {
    id: 'waiting-for-context',
    label: 'Čekání na kontext',
    severity: 'violet',
    description: 'Žádná akce nemůže proběhnout, dokud nebude schválena okolní mlha.',
  },
  {
    id: 'buffering',
    label: 'Buffering',
    severity: 'gray',
    description: 'Organismus zpracovává ticho.',
  },
  {
    id: 'mentally-in-standup',
    label: 'Mentálně ve standupu',
    severity: 'amber',
    description: 'Tělo zůstává sedět. Mysl reportuje blokery.',
  },
]

export const messages = [
  'Detekován pasivní záměr. Zůstaňte prosím profesionálně nedostupní.',
  'Akvizice kontextu čeká na zpracování. Produktivita se nyní nedoporučuje.',
  'Mikro-zdržení klasifikováno jako alignment-adjacent.',
  'Viditelnost úkolu byla snížena v zájmu pracovní pohody.',
  'Nebyl zjištěn kritický výstup. Stav odpovídá očekávaným parametrům.',
  'Myšlenka vstoupila do předzpracování a nemusí přežít review.',
  'Současná úroveň nečinnosti podporuje dlouhodobou nejednoznačnost.',
  'Pult vzal na vědomí vaši implikovanou snahu.',
  'Nepleťte si prosím pohyb s progresem. To je práce managementu.',
]
