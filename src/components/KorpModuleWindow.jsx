import { useEffect, useState } from 'react'
import closeDisabledUrl from '../../design/ui-runtime/k0rp-ui-v01/assets/controls/individual/close.disabled.png?url'
import closeHoverUrl from '../../design/ui-runtime/k0rp-ui-v01/assets/controls/individual/close.hover.png?url'
import closeNormalUrl from '../../design/ui-runtime/k0rp-ui-v01/assets/controls/individual/close.normal.png?url'
import closePressedUrl from '../../design/ui-runtime/k0rp-ui-v01/assets/controls/individual/close.pressed.png?url'
import minimizeDisabledUrl from '../../design/ui-runtime/k0rp-ui-v01/assets/controls/individual/minimize.disabled.png?url'
import minimizeHoverUrl from '../../design/ui-runtime/k0rp-ui-v01/assets/controls/individual/minimize.hover.png?url'
import minimizeNormalUrl from '../../design/ui-runtime/k0rp-ui-v01/assets/controls/individual/minimize.normal.png?url'
import minimizePressedUrl from '../../design/ui-runtime/k0rp-ui-v01/assets/controls/individual/minimize.pressed.png?url'
import pinDisabledUrl from '../../design/ui-runtime/k0rp-ui-v01/assets/controls/individual/pin.disabled.png?url'
import pinHoverUrl from '../../design/ui-runtime/k0rp-ui-v01/assets/controls/individual/pin.hover.png?url'
import pinNormalUrl from '../../design/ui-runtime/k0rp-ui-v01/assets/controls/individual/pin.normal.png?url'
import pinPressedUrl from '../../design/ui-runtime/k0rp-ui-v01/assets/controls/individual/pin.pressed.png?url'
import unpinDisabledUrl from '../../design/ui-runtime/k0rp-ui-v01/assets/controls/individual/unpin.disabled.png?url'
import unpinHoverUrl from '../../design/ui-runtime/k0rp-ui-v01/assets/controls/individual/unpin.hover.png?url'
import unpinNormalUrl from '../../design/ui-runtime/k0rp-ui-v01/assets/controls/individual/unpin.normal.png?url'
import unpinPressedUrl from '../../design/ui-runtime/k0rp-ui-v01/assets/controls/individual/unpin.pressed.png?url'
import darkPanelUrl from '../../design/ui-runtime/k0rp-ui-v01/assets/surfaces/dark-panel.png?url'
import moduleHeaderActiveUrl from '../../design/ui-runtime/k0rp-ui-v01/assets/windows/headers/header.module.active.png?url'
import moduleHeaderInactiveUrl from '../../design/ui-runtime/k0rp-ui-v01/assets/windows/headers/header.module.inactive.png?url'
import moduleFrameUrl from '../../design/ui-runtime/k0rp-ui-v01/assets/windows/nine_slice/window.module.nine-slice.png?url'
import {
  KORP_MODULE_WINDOW_METRICS,
  getIntegerModuleWindowPreviewPosition,
  getModuleWindowHeaderState,
} from '../runtime/moduleWindowPresentation'
import './KorpModuleWindow.css'

const controlAssets = Object.freeze({
  close: Object.freeze({
    normal: closeNormalUrl,
    hover: closeHoverUrl,
    pressed: closePressedUrl,
    disabled: closeDisabledUrl,
  }),
  minimize: Object.freeze({
    normal: minimizeNormalUrl,
    hover: minimizeHoverUrl,
    pressed: minimizePressedUrl,
    disabled: minimizeDisabledUrl,
  }),
  pin: Object.freeze({
    normal: pinNormalUrl,
    hover: pinHoverUrl,
    pressed: pinPressedUrl,
    disabled: pinDisabledUrl,
  }),
  unpin: Object.freeze({
    normal: unpinNormalUrl,
    hover: unpinHoverUrl,
    pressed: unpinPressedUrl,
    disabled: unpinDisabledUrl,
  }),
})

const readPreviewPosition = () => getIntegerModuleWindowPreviewPosition({
  width: window.innerWidth,
  height: window.innerHeight,
})

export function KorpModuleWindowPreview({ children }) {
  const [position, setPosition] = useState(readPreviewPosition)

  useEffect(() => {
    const updatePosition = () => setPosition(readPreviewPosition())
    window.addEventListener('resize', updatePosition)
    return () => window.removeEventListener('resize', updatePosition)
  }, [])

  return (
    <div className="korp-module-window-preview-position" style={position}>
      {children}
    </div>
  )
}

function ModuleControl({ kind, label, onClick, pressed }) {
  const assets = controlAssets[kind]

  return (
    <button
      type="button"
      className={`korp-module-window-control is-${kind}`}
      aria-label={label}
      aria-pressed={pressed}
      onPointerDown={(event) => event.stopPropagation()}
      onClick={onClick}
      data-window-control="true"
      data-clickaudit-profile="window-control"
      style={{
        '--korp-control-normal': `url(${assets.normal})`,
        '--korp-control-hover': `url(${assets.hover})`,
        '--korp-control-pressed': `url(${assets.pressed})`,
        '--korp-control-disabled': `url(${assets.disabled})`,
      }}
    />
  )
}

export default function KorpModuleWindow({
  children,
  footer = null,
  title,
  isActive = true,
  isPinned = false,
  onDragStart,
  onTogglePin,
  onMinimize,
  onClose,
}) {
  const headerState = getModuleWindowHeaderState(isActive)
  const headerUrl = headerState === 'active'
    ? moduleHeaderActiveUrl
    : moduleHeaderInactiveUrl
  const metrics = KORP_MODULE_WINDOW_METRICS

  return (
    <div
      className="korp-module-window"
      data-korp-module-window="v01"
      data-header-state={headerState}
      data-pinned={isPinned ? 'true' : 'false'}
      style={{
        '--korp-module-frame': `url(${moduleFrameUrl})`,
        '--korp-module-header': `url(${headerUrl})`,
        '--korp-module-surface': `url(${darkPanelUrl})`,
        '--korp-module-outer-width': `${metrics.outer.width}px`,
        '--korp-module-outer-height': `${metrics.outer.height}px`,
        '--korp-module-content-left': `${metrics.contentInsets.left}px`,
        '--korp-module-content-top': `${metrics.contentInsets.top}px`,
        '--korp-module-content-width': `${metrics.content.width}px`,
        '--korp-module-content-height': `${metrics.content.height}px`,
        '--korp-module-footer-height': `${metrics.contentInsets.bottom - metrics.frame.capInsets.bottom}px`,
      }}
    >
      <div className="korp-module-window-header">
        <button
          type="button"
          className="korp-module-window-drag-region"
          aria-label={`Přesunout okno ${title}`}
          onPointerDown={onDragStart}
          data-window-drag-region="true"
          data-clickaudit-profile="window-drag-handle"
        />
        <span className="korp-module-window-title">{title}</span>
        <div className="korp-module-window-controls">
          <ModuleControl
            kind={isPinned ? 'unpin' : 'pin'}
            label={isPinned ? `Odepnout okno ${title}` : `Připíchnout okno ${title}`}
            pressed={isPinned}
            onClick={onTogglePin}
          />
          <ModuleControl
            kind="minimize"
            label={`Minimalizovat okno ${title}`}
            onClick={onMinimize}
          />
          <ModuleControl
            kind="close"
            label={`Zavřít okno ${title}`}
            onClick={onClose}
          />
        </div>
      </div>
      <div className="korp-module-window-content">{children}</div>
      {footer && <div className="korp-module-window-footer">{footer}</div>}
    </div>
  )
}
