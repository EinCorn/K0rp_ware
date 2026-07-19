import { useState } from 'react'
import appShellUrl from '../../desktop/fidget/src/assets/app-shell.png?url'
import appWindowUrl from '../../desktop/fidget/src/assets/app-window.png?url'
import closeControlUrl from '../../desktop/fidget/src/assets/korp-ui-close.png?url'
import pinControlUrl from '../../desktop/fidget/src/assets/korp-ui-pin.png?url'
import modeControlUrl from '../../desktop/fidget/src/assets/korp-ui-reset.webp?url'
import { FIDGET_MODES, getNextFidgetMode } from '../runtime/fidgetMotion'
import FidgetModule from './FidgetModule'
import KorpModuleWindow from './KorpModuleWindow'
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
  return <FidgetModule mode={mode} onSessionSettled={onSessionSettled} />
}

export function FidgetEmbeddedWindow({
  title = 'Fidget / Místní modul',
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
          className="fidget-module-footer-mode"
          mode={mode}
          onToggle={toggleMode}
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
