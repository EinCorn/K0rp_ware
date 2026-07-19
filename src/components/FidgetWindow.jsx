import { useState } from 'react'
import appShellUrl from '../../desktop/fidget/src/assets/app-shell.png?url'
import appWindowUrl from '../../desktop/fidget/src/assets/app-window.png?url'
import closeControlUrl from '../../desktop/fidget/src/assets/korp-ui-close.png?url'
import pinControlUrl from '../../desktop/fidget/src/assets/korp-ui-pin.png?url'
import modeControlUrl from '../../desktop/fidget/src/assets/korp-ui-reset.webp?url'
import { FIDGET_MODES } from '../runtime/fidgetMotion'
import FidgetModule from './FidgetModule'
import './FidgetWindow.css'

function AssetButton({
  className,
  label,
  title = label,
  assetUrl,
  onClick,
  pressed,
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
      style={{ backgroundImage: `url(${assetUrl})` }}
      {...rest}
    />
  )
}

function FidgetModeControl({ className, mode, onToggle }) {
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
      assetUrl={modeControlUrl}
      pressed={isClickMode}
      onClick={onToggle}
      data-clickaudit-profile="fidget-module"
    />
  )
}

function FidgetWindowContent({ mode, onSessionSettled }) {
  return (
    <div className="fidget-window-content">
      <FidgetModule mode={mode} onSessionSettled={onSessionSettled} />
    </div>
  )
}

export function FidgetEmbeddedWindow({
  onDragStart,
  onMinimize,
  onSessionSettled,
  closeLabel = 'Minimalizovat Fidget',
}) {
  const [mode, setMode] = useState(FIDGET_MODES.manual)

  return (
    <div
      className="fidget-window-frame fidget-window-frame-embedded"
      style={{ backgroundImage: `url(${appWindowUrl})` }}
    >
      <button
        type="button"
        className="fidget-window-drag-region"
        aria-label="Přesunout okno Fidget"
        onPointerDown={onDragStart}
        data-window-drag-region="true"
        data-clickaudit-profile="window-drag-handle"
      />
      <FidgetModeControl
        className="fidget-asset-control fidget-window-control-mode"
        mode={mode}
        onToggle={() => setMode((currentMode) => (
          currentMode === FIDGET_MODES.click ? FIDGET_MODES.manual : FIDGET_MODES.click
        ))}
      />
      <AssetButton
        className="fidget-asset-control fidget-window-control-close"
        label={closeLabel}
        assetUrl={closeControlUrl}
        onClick={onMinimize}
        data-window-control="true"
        data-clickaudit-profile="window-control"
      />
      <FidgetWindowContent mode={mode} onSessionSettled={onSessionSettled} />
    </div>
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
        onToggle={() => setMode((currentMode) => (
          currentMode === FIDGET_MODES.click ? FIDGET_MODES.manual : FIDGET_MODES.click
        ))}
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
        <FidgetWindowContent mode={mode} onSessionSettled={onSessionSettled} />
      </div>
    </div>
  )
}
