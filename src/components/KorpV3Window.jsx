import { resolveKorpUiAsset } from '../ui/korpUiAssetCatalog.js'
import {
  getKorpV3TitlebarAssetId,
  getKorpV3WindowControlAssetId,
  getKorpV3WindowGeometry,
} from '../runtime/korpV3WindowPresentation.js'
import './KorpV3Window.css'

const FRAME_SLICE_KEYS = Object.freeze([
  'tl', 't', 'tr',
  'l', 'c', 'r',
  'bl', 'b', 'br',
])

const assetUrl = (id) => resolveKorpUiAsset(id)?.runtimeUrl ?? null

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
  const displayWidth = Math.max(
    ...Object.values(controlAssets).map((asset) => asset?.nativeWidth ?? 0),
  )
  const displayHeight = Math.max(
    ...Object.values(controlAssets).map((asset) => asset?.nativeHeight ?? 0),
  )
  const style = {
    '--korp-v3-control-normal': cssAssetUrl(controlAssets.normal?.id),
    '--korp-v3-control-normal-size': `${controlAssets.normal?.nativeWidth ?? 0}px ${controlAssets.normal?.nativeHeight ?? 0}px`,
    '--korp-v3-control-hover': cssAssetUrl(controlAssets.hover?.id),
    '--korp-v3-control-hover-size': `${controlAssets.hover?.nativeWidth ?? 0}px ${controlAssets.hover?.nativeHeight ?? 0}px`,
    '--korp-v3-control-pressed': cssAssetUrl(controlAssets.pressed?.id),
    '--korp-v3-control-pressed-size': `${controlAssets.pressed?.nativeWidth ?? 0}px ${controlAssets.pressed?.nativeHeight ?? 0}px`,
    '--korp-v3-control-disabled': cssAssetUrl(controlAssets.disabled?.id),
    '--korp-v3-control-disabled-size': `${controlAssets.disabled?.nativeWidth ?? 0}px ${controlAssets.disabled?.nativeHeight ?? 0}px`,
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
        '--korp-v3-titlebar-width': `${titlebar?.intrinsicWidth ?? 0}px`,
        '--korp-v3-titlebar-height': `${titlebar?.intrinsicHeight ?? 0}px`,
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

  return (
    <article
      className={`korp-v3-window korp-v3-window-${family} ${className}`.trim()}
      style={{
        ...style,
        '--korp-v3-window-width': `${geometry.width}px`,
        '--korp-v3-window-height': `${geometry.height}px`,
        '--korp-v3-content-x': `${geometry.contentRect.x}px`,
        '--korp-v3-content-y': `${geometry.contentRect.y}px`,
        '--korp-v3-content-width': `${geometry.contentRect.width}px`,
        '--korp-v3-content-height': `${geometry.contentRect.height}px`,
        '--korp-v3-frame-columns': geometry.slices.columns.map((value) => `${value}px`).join(' '),
        '--korp-v3-frame-rows': geometry.slices.rows.map((value) => `${value}px`).join(' '),
        '--korp-v3-content-surface': surface?.runtimeUrl ? `url("${surface.runtimeUrl}")` : 'none',
      }}
      data-window-id={windowState.id}
      data-korp-v3-family={family}
      aria-labelledby={labelledBy}
      onPointerDown={onPointerDown}
    >
      <div className="korp-v3-window-frame" aria-hidden="true">
        {FRAME_SLICE_KEYS.map((slice) => {
          const id = `window.${family}.frame.slice.${slice}`
          const runtimeUrl = assetUrl(id)

          return runtimeUrl ? (
            <img
              key={slice}
              className={`korp-v3-frame-piece korp-v3-frame-piece-${slice}`}
              src={runtimeUrl}
              alt=""
              draggable="false"
              data-korp-v3-asset={id}
            />
          ) : null
        })}
      </div>
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
