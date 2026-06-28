export const STATUS_LAMP_STORAGE_KEY = 'k0rp-ware.status-lamp.state'

export const statuses = [
  {
    id: 'available',
    label: 'Available',
    severity: 'green',
    description: 'The user is technically present. This condition may be temporary.',
  },
  {
    id: 'thinking',
    label: 'Thinking',
    severity: 'blue',
    description: 'Visible output is not currently recommended.',
  },
  {
    id: 'deep-work-lying',
    label: 'Deep Work, but lying',
    severity: 'amber',
    description: 'A protected state for professionally framed internal drift.',
  },
  {
    id: 'strategically-unavailable',
    label: 'Strategically Unavailable',
    severity: 'red',
    description: 'Presence has been moved to a later phase of alignment.',
  },
  {
    id: 'waiting-for-context',
    label: 'Waiting for Context',
    severity: 'violet',
    description: 'No action can be performed until the surrounding fog is approved.',
  },
  {
    id: 'buffering',
    label: 'Buffering',
    severity: 'gray',
    description: 'The organism is processing silence.',
  },
  {
    id: 'mentally-in-standup',
    label: 'Mentally in Standup',
    severity: 'amber',
    description: 'The body remains seated. The mind is reporting blockers.',
  },
]

export const messages = [
  'Passive intent detected. Please remain professionally unavailable.',
  'Context acquisition pending. Productivity is not recommended at this time.',
  'Micro-delay classified as alignment-adjacent.',
  'Task visibility has been reduced for associate wellbeing.',
  'No critical output detected. This is within expected parameters.',
  'A thought has entered pre-processing and may not survive review.',
  'Current inactivity level supports long-term ambiguity.',
  'The dashboard has acknowledged your implied effort.',
  'Please do not mistake motion for progress. That is management\'s job.',
]
