import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'
import {
  CLICK_AUDIT_BASIN_FLOOR_Y,
  CLICK_AUDIT_BASIN_RECT,
} from '../clickAuditPresentation.js'
import { FIDGET_MODULE_FOOTER_CONTROL_RECT } from '../fidgetPresentation.js'
import {
  KORP_MODULE_WINDOW_METRICS,
  KORP_MODULE_WINDOW_SIZE,
  getIntegerModuleWindowPreviewPosition,
  getModuleWindowHeaderState,
} from '../moduleWindowPresentation.js'

const readProjectFile = (relativePath) => readFileSync(
  new URL(`../../../${relativePath}`, import.meta.url),
  'utf8',
)

const shellContract = JSON.parse(readProjectFile(
  'design/ui-runtime/k0rp-ui-v01/window-shell-contract.json',
))
const runtimeAllowlist = JSON.parse(readProjectFile(
  'design/ui-runtime/k0rp-ui-v01/runtime-allowlist.json',
))
const runtimeCatalog = JSON.parse(readProjectFile(
  'design/ui-runtime/k0rp-ui-v01/catalog.json',
))

const rectRight = (rect) => rect.x + rect.width
const rectBottom = (rect) => rect.y + rect.height

function numericLeaves(value) {
  if (typeof value === 'number') return [value]
  if (value === null || typeof value !== 'object') return []
  return Object.values(value).flatMap(numericLeaves)
}

function readCssBlock(css, selector) {
  const selectorStart = css.lastIndexOf(`${selector} {`)
  assert.notEqual(selectorStart, -1, `Missing CSS selector: ${selector}`)
  const blockStart = css.indexOf('{', selectorStart) + 1
  const blockEnd = css.indexOf('}', blockStart)
  assert.notEqual(blockEnd, -1, `Unclosed CSS selector: ${selector}`)
  return css.slice(blockStart, blockEnd)
}

test('module window geometry stays aligned with the generated v01 contract', () => {
  const contractMetrics = shellContract.families.module.defaultMetricsPx

  assert.deepEqual(KORP_MODULE_WINDOW_METRICS.contentInsets, contractMetrics.contentInsets)
  assert.deepEqual(KORP_MODULE_WINDOW_METRICS.content, contractMetrics.content)
  assert.deepEqual(KORP_MODULE_WINDOW_METRICS.outer, contractMetrics.outer)
  assert.deepEqual(KORP_MODULE_WINDOW_SIZE, { width: 183, height: 223 })
  assert.equal(
    KORP_MODULE_WINDOW_METRICS.content.width
      + KORP_MODULE_WINDOW_METRICS.contentInsets.left
      + KORP_MODULE_WINDOW_METRICS.contentInsets.right,
    KORP_MODULE_WINDOW_METRICS.outer.width,
  )
  assert.equal(
    KORP_MODULE_WINDOW_METRICS.content.height
      + KORP_MODULE_WINDOW_METRICS.contentInsets.top
      + KORP_MODULE_WINDOW_METRICS.contentInsets.bottom,
    KORP_MODULE_WINDOW_METRICS.outer.height,
  )
  assert.equal(
    numericLeaves(KORP_MODULE_WINDOW_METRICS).every(Number.isInteger),
    true,
  )
})

test('module shell regions form an exact outer-coordinate partition', () => {
  const metrics = KORP_MODULE_WINDOW_METRICS

  assert.deepEqual(metrics.outerRect, { x: 0, y: 0, width: 183, height: 223 })
  assert.deepEqual(metrics.headerRect, { x: 0, y: 0, width: 183, height: 31 })
  assert.deepEqual(metrics.headerAssetRect, { x: 0, y: 1, width: 183, height: 27 })
  assert.deepEqual(metrics.headerViewportRect, { x: 4, y: 1, width: 175, height: 27 })
  assert.deepEqual(metrics.headerBodyRect, { x: 4, y: 1, width: 175, height: 24 })
  assert.deepEqual(metrics.headerRuleRect, { x: 4, y: 25, width: 175, height: 3 })
  assert.deepEqual(metrics.headerChromeRect, { x: 0, y: 0, width: 183, height: 31 })
  assert.deepEqual(metrics.contentRect, { x: 8, y: 31, width: 167, height: 167 })
  assert.deepEqual(metrics.footerRect, { x: 8, y: 198, width: 167, height: 17 })
  assert.deepEqual(metrics.bottomFrameRect, { x: 0, y: 215, width: 183, height: 8 })
  assert.deepEqual(metrics.controlsRect, { x: 117, y: 6, width: 58, height: 16 })
  assert.deepEqual(metrics.frameChromeRects, {
    topRailRect: { x: 0, y: 0, width: 183, height: 6 },
    leftRailRect: { x: 0, y: 0, width: 8, height: 223 },
    rightRailRect: { x: 175, y: 0, width: 8, height: 223 },
    headerSeamRect: { x: 0, y: 28, width: 183, height: 3 },
    bottomRailRect: { x: 0, y: 215, width: 183, height: 8 },
  })

  assert.equal(rectBottom(metrics.headerRect), metrics.contentRect.y)
  assert.equal(rectBottom(metrics.headerBodyRect), metrics.headerRuleRect.y)
  assert.equal(rectBottom(metrics.headerRuleRect), rectBottom(metrics.headerAssetRect))
  assert.equal(rectBottom(metrics.headerChromeRect), metrics.contentRect.y)
  assert.equal(rectBottom(metrics.contentRect), metrics.footerRect.y)
  assert.equal(rectBottom(metrics.footerRect), metrics.bottomFrameRect.y)
  assert.equal(rectBottom(metrics.bottomFrameRect), rectBottom(metrics.outerRect))
  assert.equal(metrics.contentRect.x, metrics.contentInsets.left)
  assert.equal(rectRight(metrics.contentRect), metrics.outer.width - metrics.contentInsets.right)
  assert.equal(metrics.footerRect.x, metrics.contentRect.x)
  assert.equal(rectRight(metrics.footerRect), rectRight(metrics.contentRect))
  assert.equal(metrics.headerRect.x, metrics.outerRect.x)
  assert.equal(rectRight(metrics.headerRect), rectRight(metrics.outerRect))
  assert.equal(
    numericLeaves({
      outerRect: metrics.outerRect,
      headerRect: metrics.headerRect,
      headerAssetRect: metrics.headerAssetRect,
      headerViewportRect: metrics.headerViewportRect,
      headerBodyRect: metrics.headerBodyRect,
      headerRuleRect: metrics.headerRuleRect,
      headerChromeRect: metrics.headerChromeRect,
      frameChromeRects: metrics.frameChromeRects,
      contentRect: metrics.contentRect,
      footerRect: metrics.footerRect,
      bottomFrameRect: metrics.bottomFrameRect,
      controlsRect: metrics.controlsRect,
    }).every(Number.isInteger),
    true,
  )
})

test('both pilot modules preserve the authored content slot and local controls stay contained', () => {
  const metrics = KORP_MODULE_WINDOW_METRICS
  const preserved = shellContract.families.module.preservedContentInstances

  assert.deepEqual(preserved.clickAudit, {
    width: metrics.contentRect.width,
    height: metrics.contentRect.height,
  })
  assert.deepEqual(preserved.fidget, {
    width: metrics.contentRect.width,
    height: metrics.contentRect.height,
  })

  const fidgetControlOuterRect = {
    x: metrics.footerRect.x + FIDGET_MODULE_FOOTER_CONTROL_RECT.x,
    y: metrics.footerRect.y + FIDGET_MODULE_FOOTER_CONTROL_RECT.y,
    width: FIDGET_MODULE_FOOTER_CONTROL_RECT.width,
    height: FIDGET_MODULE_FOOTER_CONTROL_RECT.height,
  }

  assert.deepEqual(FIDGET_MODULE_FOOTER_CONTROL_RECT, {
    x: 0,
    y: 1,
    width: 16,
    height: 16,
  })
  assert.equal(fidgetControlOuterRect.x >= metrics.footerRect.x, true)
  assert.equal(fidgetControlOuterRect.y >= metrics.footerRect.y, true)
  assert.equal(rectRight(fidgetControlOuterRect) <= rectRight(metrics.footerRect), true)
  assert.equal(rectBottom(fidgetControlOuterRect) <= rectBottom(metrics.footerRect), true)
})

test('ClickAudit basin owns the full content floor immediately above the footer', () => {
  const metrics = KORP_MODULE_WINDOW_METRICS

  assert.deepEqual(CLICK_AUDIT_BASIN_RECT, {
    x: 0,
    y: 0,
    width: metrics.contentRect.width,
    height: metrics.contentRect.height,
  })
  assert.equal(CLICK_AUDIT_BASIN_FLOOR_Y, metrics.contentRect.height)
  assert.equal(
    metrics.contentRect.y + CLICK_AUDIT_BASIN_FLOOR_Y,
    metrics.footerRect.y,
  )
  assert.equal(
    metrics.contentRect.y + CLICK_AUDIT_BASIN_FLOOR_Y < metrics.bottomFrameRect.y,
    true,
  )

  const source = readProjectFile('src/components/ClickAuditModule.jsx')
  const css = readProjectFile('src/components/ClickAuditModule.css')

  assert.match(source, /data-clickaudit-basin="content-floor"/)
  assert.match(source, /--clickaudit-basin-height/)
  assert.match(css, /\.clickaudit-basin\s*\{[\s\S]*height:\s*var\(--clickaudit-basin-height\)/)
  assert.match(css, /\.clickaudit-liquid-fill\s*\{[\s\S]*inset:\s*auto 0 0;/)
})

test('focused and unfocused module windows select deterministic authored header states', () => {
  assert.equal(getModuleWindowHeaderState(true), 'active')
  assert.equal(getModuleWindowHeaderState(false), 'inactive')

  const metrics = KORP_MODULE_WINDOW_METRICS
  const active = metrics.header.states.active
  const inactive = metrics.header.states.inactive
  const headerAssets = runtimeCatalog.assets.filter(
    (asset) => asset.id === active.bodyAssetId || asset.id === inactive.bodyAssetId,
  )

  assert.notEqual(active.bodyAssetId, inactive.bodyAssetId)
  assert.notEqual(active.ruleAssetId, inactive.ruleAssetId)
  assert.equal(headerAssets.length, 2)
  assert.equal(
    headerAssets.every(
      (asset) => asset.dimensions.width === 256 && asset.dimensions.height === 27,
    ),
    true,
  )
  assert.equal(metrics.header.bodyHeight + metrics.header.ruleHeight, metrics.header.height)
})

test('module shell layer topology keeps authored chrome above surfaces and below controls', () => {
  const source = readProjectFile('src/components/KorpModuleWindow.jsx')
  const css = readProjectFile('src/components/KorpModuleWindow.css')
  const metrics = KORP_MODULE_WINDOW_METRICS

  assert.deepEqual(metrics.layers, {
    opaqueBacking: 0,
    shellBackgrounds: 1,
    liveContent: 2,
    frameChrome: 3,
    stateRule: 4,
    interactiveChrome: 5,
  })
  assert.equal(numericLeaves(metrics.layers).every(Number.isInteger), true)
  assert.equal(metrics.layers.opaqueBacking < metrics.layers.shellBackgrounds, true)
  assert.equal(metrics.layers.shellBackgrounds < metrics.layers.liveContent, true)
  assert.equal(metrics.layers.liveContent < metrics.layers.frameChrome, true)
  assert.equal(metrics.layers.frameChrome < metrics.layers.stateRule, true)
  assert.equal(metrics.layers.stateRule < metrics.layers.interactiveChrome, true)

  for (const layer of [
    'header-body',
    'content-surface',
    'footer-body',
    'live-content',
    'frame-chrome',
    'header-state-rule',
    'interactive-header',
    'footer-controls',
  ]) {
    assert.match(source, new RegExp(`data-korp-module-layer="${layer}"`))
  }

  assert.match(
    readCssBlock(css, '.korp-module-window-frame'),
    /z-index:\s*var\(--korp-module-layer-frame-chrome\)/,
  )
  assert.match(
    readCssBlock(css, '.korp-module-window-frame'),
    /pointer-events:\s*none/,
  )
  const frameArtCss = readCssBlock(css, '.korp-module-window-frame-art')
  assert.match(frameArtCss, /border-image-source:\s*var\(--korp-module-frame\)/)
  assert.doesNotMatch(frameArtCss, /\bfill\b/)
  assert.match(
    readCssBlock(css, '.korp-module-window-header-rule-viewport'),
    /z-index:\s*var\(--korp-module-layer-state-rule\)/,
  )
  assert.doesNotMatch(
    readCssBlock(css, '.korp-module-window-header-interactions'),
    /z-index\s*:/,
  )
  assert.doesNotMatch(css, /\[data-header-state(?:=|\])/)
})

test('window-only previews center the odd-sized shell on integer coordinates', () => {
  assert.deepEqual(
    getIntegerModuleWindowPreviewPosition({ width: 1600, height: 900 }),
    { left: 709, top: 339 },
  )
  assert.deepEqual(
    getIntegerModuleWindowPreviewPosition({ width: 1920, height: 1080 }),
    { left: 869, top: 429 },
  )
})

test('shared module chrome imports only the curated v01 runtime subset', () => {
  const source = readProjectFile('src/components/KorpModuleWindow.jsx')
  const css = readProjectFile('src/components/KorpModuleWindow.css')
  const runtimeAssetImports = [...source.matchAll(
    /design\/ui-runtime\/k0rp-ui-v01\/assets\/([^'?]+)[?]url/g,
  )].map((match) => match[1])
  const catalogById = new Map(runtimeCatalog.assets.map((asset) => [asset.id, asset]))
  const allowlistedAssetPaths = runtimeAllowlist.groups
    .flatMap((group) => group.assetIds)
    .map((assetId) => catalogById.get(assetId).sourcePath.replace(/^assets\//, ''))

  assert.equal(runtimeAssetImports.length, 20)
  assert.equal(new Set(runtimeAssetImports).size, 20)
  assert.deepEqual(runtimeAssetImports.toSorted(), allowlistedAssetPaths.toSorted())
  assert.doesNotMatch(source, /design\/ui-source|k0rp-v3|window\.module\.(?:active|inactive)\.png/)
  assert.doesNotMatch(css, /background-size\s*:\s*100%\s+100%|filter\s*:|blur\(|transform\s*:/)
  assert.match(css, /border-image-source:\s*var\(--korp-module-frame\)/)
  assert.match(css, /border-image-source:\s*var\(--korp-module-header\)/)
  assert.match(css, /\.korp-module-window\s*\{[\s\S]*overflow:\s*hidden/)
  assert.match(
    css,
    /\.korp-module-window-header-body-viewport,[\s\S]*\.korp-module-window-header-rule-viewport\s*\{[\s\S]*overflow:\s*hidden/,
  )
  assert.match(css, /\.korp-module-window-controls\s*\{[\s\S]*left:\s*var\(--korp-module-controls-left\)/)
  assert.equal(KORP_MODULE_WINDOW_METRICS.surface.hasOpaqueBacking, true)
  assert.match(KORP_MODULE_WINDOW_METRICS.surface.backingColor, /^#[\da-f]{6}$/i)
  assert.match(KORP_MODULE_WINDOW_METRICS.surface.footerBackingColor, /^#[\da-f]{6}$/i)
  assert.deepEqual(
    KORP_MODULE_WINDOW_METRICS.surface.tile,
    { width: 32, height: 32, repeat: true },
  )
  assert.deepEqual(
    KORP_MODULE_WINDOW_METRICS.surface.textureRegions,
    { content: 'dark-panel', footer: null },
  )
  const contentSurfaceCss = readCssBlock(css, '.korp-module-window-content-surface')
  const footerSurfaceCss = readCssBlock(css, '.korp-module-window-footer-surface')
  assert.equal((css.match(/var\(--korp-module-surface\)/g) ?? []).length, 1)
  assert.match(contentSurfaceCss, /background-color:\s*var\(--korp-module-backing-color\)/)
  assert.match(contentSurfaceCss, /background-image:\s*var\(--korp-module-surface\)/)
  assert.match(contentSurfaceCss, /background-repeat:\s*repeat/)
  assert.match(footerSurfaceCss, /background-color:\s*var\(--korp-module-footer-backing-color\)/)
  assert.match(footerSurfaceCss, /background-repeat:\s*no-repeat/)
  assert.doesNotMatch(
    footerSurfaceCss,
    /var\(--korp-module-surface\)|background-repeat:\s*(?:repeat|[^;]*,\s*repeat)/,
  )
})

test('shared footer always exists while Fidget content and standalone shell stay preserved', () => {
  const sharedSource = readProjectFile('src/components/KorpModuleWindow.jsx')
  const source = readProjectFile('src/components/FidgetWindow.jsx')
  const css = readProjectFile('src/components/FidgetWindow.css')
  const moduleCss = readProjectFile('src/components/FidgetModule.css')

  assert.match(sharedSource, /data-korp-module-region="footer"/)
  assert.match(sharedSource, /data-footer-content=\{footer == null \? 'empty' : 'present'\}/)
  assert.doesNotMatch(sharedSource, /\{footer\s*&&/)
  assert.match(source, /footer=\{\([\s\S]*className="fidget-module-footer-mode"/)
  assert.match(source, /FIDGET_MODULE_FOOTER_CONTROL_RECT/)
  assert.doesNotMatch(source, /fidget-window-control-mode/)
  assert.match(css, /\.fidget-module-footer-mode\s*\{[\s\S]*left:\s*var\(--fidget-footer-control-left\)/)
  assert.match(css, /\.fidget-standalone-shell\s*\{[\s\S]*width:\s*230px;[\s\S]*height:\s*230px;/)
  assert.match(moduleCss, /\.fidget-module-spinner\s*\{[\s\S]*width:\s*132px;[\s\S]*height:\s*132px;/)
})
