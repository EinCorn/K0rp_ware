import { resolveKorpRuntimeIcon } from '../ui/korpIconCatalog'

export default function KorpIcon({ iconId, className = '', slot }) {
  const icon = resolveKorpRuntimeIcon(iconId)
  const classes = [
    'korp-icon',
    slot ? `korp-icon-${slot}` : '',
    className,
    icon ? '' : 'is-missing',
  ].filter(Boolean).join(' ')

  if (!icon) {
    return (
      <span
        className={classes}
        data-korp-icon-missing={typeof iconId === 'string' ? iconId : ''}
        aria-hidden="true"
      />
    )
  }

  return (
    <img
      className={classes}
      src={icon.runtimeUrl}
      width={icon.intrinsicWidth}
      height={icon.intrinsicHeight}
      alt=""
      aria-hidden="true"
      draggable={false}
      data-korp-icon-id={icon.id}
    />
  )
}
