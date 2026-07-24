import { useState } from 'react'
import appShellUrl from '../../desktop/fidget/src/assets/app-shell.png?url'
import appWindowUrl from '../../desktop/fidget/src/assets/app-window.png?url'
import closeControlUrl from '../../desktop/fidget/src/assets/korp-ui-close.png?url'
import pinControlUrl from '../../desktop/fidget/src/assets/korp-ui-pin.png?url'
import modeControlUrl from '../../desktop/fidget/src/assets/korp-ui-reset.webp?url'
import rotationDisabledUrl from '../../design/ui-runtime/k0rp-ui-v01/assets/controls/individual/rotation.disabled.png?url'
import rotationHoverUrl from '../../design/ui-runtime/k0rp-ui-v01/assets/controls/individual/rotation.hover.png?url'
import rotationNormalUrl from '../../design/ui-runtime/k0rp-ui-v01/assets/controls/individual/rotation.normal.png?url'
import rotationPressedUrl from '../../design/ui-runtime/k0rp-ui-v01/assets/controls/individual/rotation.pressed.png?url'
import { FIDGET_MODES, getNextFidgetMode } from '../runtime/fidgetMotion'
import { FIDGET_MODULE_FOOTER_CONTROL_OFFSET } from '../runtime/fidgetPresentation'
import FidgetModule from './FidgetModule'
import KorpModuleWindow from './KorpModuleWindow'
import './FidgetWindow.css'

const rotationControlAssets = Object.freeze({
  normal: rotationNormalUrl,
  hover: rotationHoverUrl,
  pressed: rotationPressedUrl,
  disabled: rotationDisabledUrl,
})

function AssetButton({
  className,
  label,
  title = label,
  assetUrl,
  onClick,
  pressed,
  style,
  ...rest
}) {
  return (
    <button
      type="button"
      className={className}
      aria-label={label}
      aria-pressed={pressed}
      title={title}
      onPointerDown={(event) => event.stopPropagation()}
      onClick={onClick}
      style={{
        ...(assetUrl ? { backgroundImage: `url(${assetUrl})` } : {}),
        ...style,
      }}
      {...rest}
    />
  )
}

function FidgetModeControl({
  assets = null,
  className,
  disabled = false,
  mode,
  onToggle,
  style,
}) {
  const isClickMode = mode === FIDGET_MODES.click
  const label = isClickMode ? 'Klikací režim otáčení' : 'Ruční režim otáčení'
  const title = isClickMode
    ? 'Klikací režim: klikni vlevo nebo vpravo; funguje také Space a Enter'
    : 'Ruční režim: táhni pro roztočení, klepni pro zastavení nebo použij kolečko'

  return (
    <AssetButton
      className={className}
      label={label}
      title={title}
      assetUrl={assets ? null : modeControlUrl}
      pressed={isClickMode}
      onClick={onToggle}
      disabled={disabled}
      data-clickaudit-profile="fidget-module"
      style={{
        ...(assets ? {
          '--fidget-rotation-normal': `url(${assets.normal})`,
          '--fidget-rotation-hover': `url(${assets.hover})`,
          '--fidget-rotation-pressed': `url(${assets.pressed})`,
          '--fidget-rotation-disabled': `url(${assets.disabled})`,
        } : {}),
        ...style,
      }}
    />
  )
}

function FidgetWindowContent({ mode, onSessionSettled }) {
  return <FidgetModule mode={mode} onSessionSettled={onSessionSettled} />
}

export function FidgetEmbeddedWindow({
  title = 'Fidget',
  isActive = true,
  isPinned = false,
  onDragStart,
  onTogglePin,
  onMinimize,
  onClose,
  onSessionSettled,
}) {
  const [mode, setMode] = useState(FIDGET_MODES.manual)
  const toggleMode = () => setMode(getNextFidgetMode)

  return (
    <KorpModuleWindow
      title={title}
      isActive={isActive}
      isPinned={isPinned}
      onDragStart={onDragStart}
      onTogglePin={onTogglePin}
      onMinimize={onMinimize}
      onClose={onClose}
      footer={(
        <FidgetModeControl
          assets={rotationControlAssets}
          className="fidget-module-footer-rotation"
          mode={mode}
          onToggle={toggleMode}
          style={{
            '--fidget-footer-control-left': `${FIDGET_MODULE_FOOTER_CONTROL_OFFSET.x}px`,
            '--fidget-footer-control-top': `${FIDGET_MODULE_FOOTER_CONTROL_OFFSET.y}px`,
            '--fidget-footer-control-width': `${FIDGET_MODULE_FOOTER_CONTROL_OFFSET.width}px`,
            '--fidget-footer-control-height': `${FIDGET_MODULE_FOOTER_CONTROL_OFFSET.height}px`,
          }}
        />
      )}
    >
      <FidgetWindowContent mode={mode} onSessionSettled={onSessionSettled} />
    </KorpModuleWindow>
  )
}

export function FidgetStandaloneShell({ onClose, onSessionSettled }) {
  const [mode, setMode] = useState(FIDGET_MODES.manual)
  const [pinned, setPinned] = useState(false)

  return (
    <div
      className="fidget-standalone-shell"
      style={{ backgroundImage: `url(${appShellUrl})` }}
    >
      <div className="fidget-standalone-drag-region" aria-hidden="true" />
      <AssetButton
        className="fidget-asset-control fidget-shell-control-pin"
        label={pinned ? 'Odepnout náhled' : 'Připíchnout náhled'}
        assetUrl={pinControlUrl}
        pressed={pinned}
        onClick={() => setPinned((value) => !value)}
      />
      <FidgetModeControl
        className="fidget-asset-control fidget-shell-control-mode"
        mode={mode}
        onToggle={() => setMode(getNextFidgetMode)}
      />
      <AssetButton
        className="fidget-asset-control fidget-shell-control-close"
        label="Zavřít náhled Fidget"
        assetUrl={closeControlUrl}
        onClick={onClose}
      />
      <div
        className="fidget-window-frame fidget-window-frame-standalone"
        style={{ backgroundImage: `url(${appWindowUrl})` }}
      >
        <div className="fidget-window-content">
          <FidgetWindowContent mode={mode} onSessionSettled={onSessionSettled} />
        </div>
      </div>
    </div>
  )
}
