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
import moduleActiveShellUrl from '../../design/ui-runtime/k0rp-ui-v01/assets/windows/shells/window.module.active.183x223.png?url'
import moduleInactiveShellUrl from '../../design/ui-runtime/k0rp-ui-v01/assets/windows/shells/window.module.inactive.183x223.png?url'
import {
  KORP_MODULE_WINDOW_METRICS,
  getIntegerModuleWindowPreviewPosition,
  getModuleWindowShellState,
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

const moduleShellAssets = Object.freeze({
  active: moduleActiveShellUrl,
  inactive: moduleInactiveShellUrl,
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
  const shellState = getModuleWindowShellState(isActive)
  const shellUrl = moduleShellAssets[shellState]
  const metrics = KORP_MODULE_WINDOW_METRICS

  return (
    <div
      className="korp-module-window"
      data-korp-module-window="v01"
      data-korp-module-layout="compact"
      data-shell-state={shellState}
      data-pinned={isPinned ? 'true' : 'false'}
      style={{
        '--korp-module-surface': `url(${darkPanelUrl})`,
        '--korp-module-outer-width': `${metrics.outerRect.width}px`,
        '--korp-module-outer-height': `${metrics.outerRect.height}px`,
        '--korp-module-header-left': `${metrics.headerRect.x}px`,
        '--korp-module-header-top': `${metrics.headerRect.y}px`,
        '--korp-module-header-width': `${metrics.headerRect.width}px`,
        '--korp-module-header-height': `${metrics.headerRect.height}px`,
        '--korp-module-backing-left': `${metrics.apertureBackingRect.x}px`,
        '--korp-module-backing-top': `${metrics.apertureBackingRect.y}px`,
        '--korp-module-backing-width': `${metrics.apertureBackingRect.width}px`,
        '--korp-module-backing-height': `${metrics.apertureBackingRect.height}px`,
        '--korp-module-content-left': `${metrics.contentRect.x}px`,
        '--korp-module-content-top': `${metrics.contentRect.y}px`,
        '--korp-module-content-width': `${metrics.contentRect.width}px`,
        '--korp-module-content-height': `${metrics.contentRect.height}px`,
        '--korp-module-footer-left': `${metrics.footerRect.x}px`,
        '--korp-module-footer-top': `${metrics.footerRect.y}px`,
        '--korp-module-footer-width': `${metrics.footerRect.width}px`,
        '--korp-module-footer-height': `${metrics.footerRect.height}px`,
        '--korp-module-controls-left': `${metrics.controlsRect.x}px`,
        '--korp-module-controls-top': `${metrics.controlsRect.y}px`,
        '--korp-module-controls-width': `${metrics.controlsRect.width}px`,
        '--korp-module-controls-height': `${metrics.controlsRect.height}px`,
        '--korp-module-control-width': `${metrics.controls.width}px`,
        '--korp-module-control-gap': `${metrics.controls.gap}px`,
        '--korp-module-title-left': `${metrics.titleRect.x}px`,
        '--korp-module-title-top': `${metrics.titleRect.y}px`,
        '--korp-module-title-width': `${metrics.titleRect.width}px`,
        '--korp-module-title-height': `${metrics.titleRect.height}px`,
        '--korp-module-interior-backing-color': metrics.surface.interiorBackingColor,
        '--korp-module-backing-color': metrics.surface.backingColor,
        '--korp-module-layer-opaque-backing': metrics.layers.opaqueBacking,
        '--korp-module-layer-shell-backgrounds': metrics.layers.shellBackgrounds,
        '--korp-module-layer-live-content': metrics.layers.liveContent,
        '--korp-module-layer-fixed-shell': metrics.layers.fixedShell,
        '--korp-module-layer-interactive-chrome': metrics.layers.interactiveChrome,
      }}
    >
      <div
        className="korp-module-window-backing"
        data-korp-module-layer="opaque-backing"
        aria-hidden="true"
      />
      <div
        className="korp-module-window-content-surface"
        data-korp-module-layer="content-surface"
        aria-hidden="true"
      />
      <div
        className="korp-module-window-content"
        data-korp-module-region="content"
        data-korp-module-layer="live-content"
      >
        {children}
      </div>
      <img
        className="korp-module-window-shell"
        src={shellUrl}
        width={metrics.shellRect.width}
        height={metrics.shellRect.height}
        alt=""
        draggable={false}
        data-korp-module-shell-state={shellState}
        data-korp-module-layer="fixed-shell"
        aria-hidden="true"
      />
      <div
        className="korp-module-window-header-interactions"
        data-korp-module-region="header"
        data-korp-module-layer="interactive-header"
      >
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
      <div
        className="korp-module-window-footer-content"
        data-korp-module-region="footer"
        data-korp-module-layer="footer-controls"
        data-footer-content={footer == null ? 'empty' : 'present'}
      >
        {footer}
      </div>
    </div>
  )
}
