import { resolveKorpUiAsset } from '../ui/korpUiAssetCatalog.js'
import {
  getKorpV3TitlebarAssetId,
  getKorpV3WindowControlAssetId,
  getKorpV3WindowGeometry,
} from '../runtime/korpV3WindowPresentation.js'
import './KorpV3Window.css'

const assetUrl = (id) => resolveKorpUiAsset(id)?.runtimeUrl ?? null

// The standalone control exports are authored for the wide standard titlebar.
// Compact Audit/Folder frames use the same material at half that native size,
// which lands on the established 18–19px embedded-window control rhythm.
const compactControlSize = (value) => Math.max(1, Math.round((value ?? 0) / 2))

const cssAssetUrl = (id) => {
  const runtimeUrl = assetUrl(id)
  return runtimeUrl ? `url("${runtimeUrl}")` : 'none'
}

function KorpV3WindowControl({ action, label, onActivate, disabled = false }) {
  const controlAssets = Object.fromEntries(
    ['normal', 'hover', 'pressed', 'disabled'].map((state) => [
      state,
      resolveKorpUiAsset(getKorpV3WindowControlAssetId(action, state)),
    ]),
  )
  const displayWidth = compactControlSize(controlAssets.normal?.nativeWidth)
  const displayHeight = compactControlSize(controlAssets.normal?.nativeHeight)
  const displaySize = `${displayWidth}px ${displayHeight}px`
  const style = {
    '--korp-v3-control-normal': cssAssetUrl(controlAssets.normal?.id),
    '--korp-v3-control-normal-size': displaySize,
    '--korp-v3-control-hover': cssAssetUrl(controlAssets.hover?.id),
    '--korp-v3-control-hover-size': displaySize,
    '--korp-v3-control-pressed': cssAssetUrl(controlAssets.pressed?.id),
    '--korp-v3-control-pressed-size': displaySize,
    '--korp-v3-control-disabled': cssAssetUrl(controlAssets.disabled?.id),
    '--korp-v3-control-disabled-size': displaySize,
    '--korp-v3-control-width': `${displayWidth}px`,
    '--korp-v3-control-height': `${displayHeight}px`,
  }

  return (
    <button
      type="button"
      className={`korp-v3-window-control is-${action}`}
      style={style}
      aria-label={label}
      disabled={disabled}
      onPointerDown={(event) => event.stopPropagation()}
      onClick={onActivate}
      data-window-control="true"
      data-clickaudit-profile="window-control"
    />
  )
}

export function KorpV3WindowHeader({
  windowState,
  isActive,
  onClose,
  onMinimize,
  onPointerDown,
}) {
  const titlebarId = getKorpV3TitlebarAssetId(isActive)
  const titlebar = resolveKorpUiAsset(titlebarId)

  return (
    <header
      className={`korp-v3-window-header${isActive ? ' is-active' : ' is-inactive'}`}
      style={{
        '--korp-v3-titlebar': titlebar?.runtimeUrl ? `url("${titlebar.runtimeUrl}")` : 'none',
        '--korp-v3-titlebar-width': `${titlebar?.nativeWidth ?? 0}px`,
        '--korp-v3-titlebar-height': `${titlebar?.nativeHeight ?? 0}px`,
      }}
      onPointerDown={onPointerDown}
      data-window-drag-region="true"
      data-clickaudit-profile="window-drag-handle"
      data-korp-v3-titlebar={titlebarId}
    >
      <span className="korp-v3-window-title">{windowState.title}</span>
      <span className="korp-v3-window-controls">
        <KorpV3WindowControl
          action="minimize"
          label={`Minimalizovat okno ${windowState.taskbarTitle}`}
          onActivate={() => onMinimize(windowState.id)}
        />
        <KorpV3WindowControl
          action="close"
          label={`Zavřít okno ${windowState.taskbarTitle}`}
          onActivate={() => onClose(windowState.id)}
        />
      </span>
    </header>
  )
}

export function KorpV3WindowFrame({
  family,
  windowState,
  isActive,
  className = '',
  style,
  labelledBy,
  onClose,
  onMinimize,
  onDragStart,
  onPointerDown,
  children,
}) {
  const geometry = getKorpV3WindowGeometry(family)
  if (!geometry) return null

  const surfaceId = family === 'folder'
    ? 'window.folder.list_surface'
    : `window.${family}.content`
  const surface = resolveKorpUiAsset(surfaceId)
  const frameId = `window.${family}.frame`
  const frameUrl = assetUrl(frameId)

  return (
    <article
      className={`korp-v3-window korp-v3-window-${family} ${isActive ? 'is-active' : 'is-inactive'} ${className}`.trim()}
      style={{
        ...style,
        '--korp-v3-window-width': `${geometry.width}px`,
        '--korp-v3-window-height': `${geometry.height}px`,
        '--korp-v3-content-x': `${geometry.contentRect.x}px`,
        '--korp-v3-content-y': `${geometry.contentRect.y}px`,
        '--korp-v3-content-width': `${geometry.contentRect.width}px`,
        '--korp-v3-content-height': `${geometry.contentRect.height}px`,
        '--korp-v3-content-surface': surface?.runtimeUrl ? `url("${surface.runtimeUrl}")` : 'none',
      }}
      data-window-id={windowState.id}
      data-korp-v3-family={family}
      aria-labelledby={labelledBy}
      onPointerDown={onPointerDown}
    >
      {frameUrl ? (
        <img
          className="korp-v3-window-frame"
          src={frameUrl}
          alt=""
          aria-hidden="true"
          draggable="false"
          data-korp-v3-asset={frameId}
        />
      ) : null}
      <div className="korp-v3-window-surface">
        {children}
      </div>
      <KorpV3WindowHeader
        windowState={windowState}
        isActive={isActive}
        onClose={onClose}
        onMinimize={onMinimize}
        onPointerDown={onDragStart}
      />
    </article>
  )
}
