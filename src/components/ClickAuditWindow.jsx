import { useState } from 'react'
import appShellUrl from '../../desktop/click-audit/src/assets/app-shell.png?url'
import appWindowUrl from '../../desktop/click-audit/src/assets/app-window.png?url'
import closeControlUrl from '../../desktop/click-audit/src/assets/korp-ui-close.png?url'
import pinControlUrl from '../../desktop/click-audit/src/assets/korp-ui-pin.png?url'
import resetControlUrl from '../../desktop/click-audit/src/assets/korp-ui-reset.webp?url'
import KorpModuleWindow from './KorpModuleWindow'
import './ClickAuditWindow.css'

function AssetButton({ className, label, assetUrl, onClick, disabled = false, pressed, ...rest }) {
  return (
    <button
      type="button"
      className={className}
      aria-label={label}
      aria-pressed={pressed}
      disabled={disabled}
      onPointerDown={(event) => event.stopPropagation()}
      onClick={onClick}
      style={{ backgroundImage: `url(${assetUrl})` }}
      {...rest}
    />
  )
}

export function ClickAuditEmbeddedWindow({
  children,
  title = 'ClickAudit',
  isActive = true,
  isPinned = false,
  onDragStart,
  onTogglePin,
  onMinimize,
  onClose,
}) {
  return (
    <KorpModuleWindow
      title={title}
      isActive={isActive}
      isPinned={isPinned}
      onDragStart={onDragStart}
      onTogglePin={onTogglePin}
      onMinimize={onMinimize}
      onClose={onClose}
    >
      {children}
    </KorpModuleWindow>
  )
}

export function ClickAuditStandaloneShell({
  children,
  onClose,
}) {
  const [pinned, setPinned] = useState(false)

  return (
    <div
      className="clickaudit-standalone-shell"
      style={{ backgroundImage: `url(${appShellUrl})` }}
    >
      <div className="clickaudit-standalone-drag-region" aria-hidden="true" />
      <AssetButton
        className="clickaudit-shell-control clickaudit-shell-control-pin"
        label={pinned ? 'Odepnout náhled' : 'Připíchnout náhled'}
        assetUrl={pinControlUrl}
        pressed={pinned}
        onClick={() => setPinned((value) => !value)}
      />
      <AssetButton
        className="clickaudit-shell-control clickaudit-shell-control-reset"
        label="Reset není ve sdíleném runtime zatím dostupný"
        assetUrl={resetControlUrl}
        disabled
      />
      <AssetButton
        className="clickaudit-shell-control clickaudit-shell-control-close"
        label="Zavřít náhled ClickAudit"
        assetUrl={closeControlUrl}
        onClick={onClose}
      />
      <div
        className="clickaudit-window-frame clickaudit-window-frame-standalone"
        style={{ backgroundImage: `url(${appWindowUrl})` }}
      >
        <div className="clickaudit-window-content">{children}</div>
      </div>
    </div>
  )
}
