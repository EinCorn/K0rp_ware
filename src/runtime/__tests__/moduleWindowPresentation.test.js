import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
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
const readProjectBytes = (relativePath) => readFileSync(
  new URL(`../../../${relativePath}`, import.meta.url),
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
const rectContains = (outerRect, innerRect) => (
  innerRect.x >= outerRect.x
  && innerRect.y >= outerRect.y
  && rectRight(innerRect) <= rectRight(outerRect)
  && rectBottom(innerRect) <= rectBottom(outerRect)
)
const rectsIntersect = (leftRect, rightRect) => (
  leftRect.x < rectRight(rightRect)
  && rectRight(leftRect) > rightRect.x
  && leftRect.y < rectBottom(rightRect)
  && rectBottom(leftRect) > rightRect.y
)

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
  assert.deepEqual(metrics.headerRuleAssetRect, { x: 0, y: 1, width: 183, height: 27 })
  assert.deepEqual(metrics.headerRuleRect, { x: 4, y: 25, width: 175, height: 3 })
  assert.deepEqual(metrics.headerSeamRect, { x: 8, y: 30, width: 167, height: 1 })
  assert.deepEqual(metrics.contentRect, { x: 8, y: 31, width: 167, height: 167 })
  assert.deepEqual(metrics.footerRect, { x: 8, y: 198, width: 167, height: 17 })
  assert.deepEqual(metrics.footerSafeRect, { x: 8, y: 199, width: 167, height: 16 })
  assert.deepEqual(metrics.footerControlRect, { x: 84, y: 199, width: 16, height: 16 })
  assert.deepEqual(metrics.bottomFrameRect, { x: 0, y: 215, width: 183, height: 8 })
  assert.deepEqual(metrics.controlsRect, { x: 117, y: 6, width: 58, height: 16 })
  assert.deepEqual(metrics.frameOpticalCropInsets, {
    top: 2,
    right: 3,
    bottom: 3,
    left: 3,
  })
  assert.deepEqual(metrics.frameViewportRect, {
    x: 3,
    y: 2,
    width: 177,
    height: 218,
  })
  assert.deepEqual(metrics.interiorBackingRect, {
    x: 8,
    y: 6,
    width: 167,
    height: 209,
  })
  assert.deepEqual(metrics.frameRailRects, {
    topRailRect: { x: 3, y: 2, width: 177, height: 4 },
    leftRailRect: { x: 3, y: 2, width: 5, height: 218 },
    rightRailRect: { x: 175, y: 2, width: 5, height: 218 },
    bottomRailRect: { x: 3, y: 215, width: 177, height: 5 },
  })

  assert.equal(rectBottom(metrics.headerRect), metrics.contentRect.y)
  assert.equal(rectBottom(metrics.headerRuleRect), 28)
  assert.equal(rectBottom(metrics.headerSeamRect), metrics.contentRect.y)
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
    metrics.frameViewportRect.x,
    metrics.outerRect.x + metrics.frameOpticalCropInsets.left,
  )
  assert.equal(
    metrics.frameViewportRect.y,
    metrics.outerRect.y + metrics.frameOpticalCropInsets.top,
  )
  assert.equal(
    rectRight(metrics.frameViewportRect),
    rectRight(metrics.outerRect) - metrics.frameOpticalCropInsets.right,
  )
  assert.equal(
    rectBottom(metrics.frameViewportRect),
    rectBottom(metrics.outerRect) - metrics.frameOpticalCropInsets.bottom,
  )
  assert.equal(rectContains(metrics.outerRect, metrics.frameViewportRect), true)
  assert.equal(rectContains(metrics.outerRect, metrics.interiorBackingRect), true)
  assert.equal(metrics.interiorBackingRect.x > metrics.outerRect.x, true)
  assert.equal(metrics.interiorBackingRect.y > metrics.outerRect.y, true)
  assert.equal(
    rectRight(metrics.interiorBackingRect) < rectRight(metrics.outerRect),
    true,
  )
  assert.equal(
    rectBottom(metrics.interiorBackingRect) < rectBottom(metrics.outerRect),
    true,
  )
  for (const rect of [
    metrics.titleRect,
    metrics.controlsRect,
    metrics.contentRect,
    metrics.footerRect,
  ]) {
    assert.equal(rectContains(metrics.interiorBackingRect, rect), true)
  }
  assert.equal(
    numericLeaves({
      outerRect: metrics.outerRect,
      headerRect: metrics.headerRect,
      headerRuleAssetRect: metrics.headerRuleAssetRect,
      headerRuleRect: metrics.headerRuleRect,
      headerSeamRect: metrics.headerSeamRect,
      frameOpticalCropInsets: metrics.frameOpticalCropInsets,
      frameViewportRect: metrics.frameViewportRect,
      frameRailRects: metrics.frameRailRects,
      interiorBackingRect: metrics.interiorBackingRect,
      contentRect: metrics.contentRect,
      footerRect: metrics.footerRect,
      footerSafeRect: metrics.footerSafeRect,
      footerControlRect: metrics.footerControlRect,
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
    x: 76,
    y: 1,
    width: 16,
    height: 16,
  })
  assert.deepEqual(fidgetControlOuterRect, metrics.footerControlRect)
  assert.equal(rectContains(metrics.footerSafeRect, fidgetControlOuterRect), true)
  assert.equal(rectsIntersect(fidgetControlOuterRect, metrics.contentRect), false)
  assert.equal(
    rectsIntersect(fidgetControlOuterRect, metrics.frameRailRects.leftRailRect),
    false,
  )
  assert.equal(
    rectsIntersect(fidgetControlOuterRect, metrics.frameRailRects.rightRailRect),
    false,
  )
  assert.equal(rectsIntersect(fidgetControlOuterRect, metrics.bottomFrameRect), false)
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

test('focused and unfocused module windows change only the narrow authored state rule', () => {
  assert.equal(getModuleWindowHeaderState(true), 'active')
  assert.equal(getModuleWindowHeaderState(false), 'inactive')

  const metrics = KORP_MODULE_WINDOW_METRICS
  const active = metrics.header.states.active
  const inactive = metrics.header.states.inactive
  const headerAssets = runtimeCatalog.assets.filter(
    (asset) => asset.id === active.ruleAssetId || asset.id === inactive.ruleAssetId,
  )

  assert.notEqual(active.ruleAssetId, inactive.ruleAssetId)
  assert.equal('bodyAssetId' in active, false)
  assert.equal('bodyAssetId' in inactive, false)
  assert.deepEqual(numericLeaves(active), [])
  assert.deepEqual(numericLeaves(inactive), [])
  assert.equal(headerAssets.length, 2)
  assert.equal(
    headerAssets.every(
      (asset) => asset.dimensions.width === 256 && asset.dimensions.height === 27,
    ),
    true,
  )
  assert.equal(metrics.header.rule.height >= 1 && metrics.header.rule.height <= 3, true)
  assert.deepEqual(metrics.headerRuleRect, { x: 4, y: 25, width: 175, height: 3 })
  assert.equal(rectContains(metrics.headerRect, metrics.headerRuleRect), true)
  assert.equal(rectsIntersect(metrics.headerRuleRect, metrics.controlsRect), false)
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
    'opaque-backing',
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
  assert.doesNotMatch(source, /header-body|headerBody|bodyAssetId/)
  assert.doesNotMatch(source, /frameChromePieceEntries|data-frame-chrome-piece/)
  assert.equal(
    (source.match(/className="korp-module-window-frame-viewport"/g) ?? []).length,
    1,
  )
  assert.match(source, /<span className="korp-module-window-title">\{title\}<\/span>/)
  assert.match(source, /kind=\{isPinned \? 'unpin' : 'pin'\}/)
  assert.match(source, /kind="minimize"/)
  assert.match(source, /kind="close"/)

  assert.match(
    readCssBlock(css, '.korp-module-window-frame'),
    /z-index:\s*var\(--korp-module-layer-frame-chrome\)/,
  )
  assert.match(
    readCssBlock(css, '.korp-module-window-frame'),
    /pointer-events:\s*none/,
  )
  const backingCss = readCssBlock(css, '.korp-module-window-backing')
  assert.match(backingCss, /left:\s*var\(--korp-module-backing-left\)/)
  assert.match(backingCss, /top:\s*var\(--korp-module-backing-top\)/)
  assert.match(backingCss, /width:\s*var\(--korp-module-backing-width\)/)
  assert.match(backingCss, /height:\s*var\(--korp-module-backing-height\)/)
  assert.doesNotMatch(backingCss, /\binset\s*:\s*0/)
  const frameViewportCss = readCssBlock(css, '.korp-module-window-frame-viewport')
  assert.match(frameViewportCss, /left:\s*var\(--korp-module-frame-viewport-left\)/)
  assert.match(frameViewportCss, /top:\s*var\(--korp-module-frame-viewport-top\)/)
  assert.match(frameViewportCss, /overflow:\s*hidden/)
  assert.match(frameViewportCss, /pointer-events:\s*none/)
  const frameArtCss = readCssBlock(css, '.korp-module-window-frame-art')
  assert.match(frameArtCss, /border-image-source:\s*var\(--korp-module-frame\)/)
  assert.doesNotMatch(frameArtCss, /\bfill\b/)
  assert.match(frameArtCss, /left:\s*var\(--korp-module-frame-art-left\)/)
  assert.match(frameArtCss, /top:\s*var\(--korp-module-frame-art-top\)/)
  const seamCss = readCssBlock(css, '.korp-module-window-header-seam')
  assert.match(seamCss, /background-color:\s*var\(--korp-module-shell-outline-color\)/)
  assert.match(
    readCssBlock(css, '.korp-module-window-header-rule-viewport'),
    /z-index:\s*var\(--korp-module-layer-state-rule\)/,
  )
  assert.doesNotMatch(
    readCssBlock(css, '.korp-module-window-header-interactions'),
    /z-index\s*:/,
  )
  assert.doesNotMatch(css, /\[data-header-state(?:=|\])[^{}]*\{[^}]*(?:left|top|width|height)\s*:/)
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
  const allowlistedAssetPathSet = new Set(allowlistedAssetPaths)
  const frameAsset = catalogById.get(KORP_MODULE_WINDOW_METRICS.frame.assetId)
  const frameBytes = readProjectBytes(
    `design/ui-runtime/k0rp-ui-v01/${frameAsset.sourcePath}`,
  )
  const frameSha256 = createHash('sha256').update(frameBytes).digest('hex')

  assert.equal(new Set(runtimeAssetImports).size, runtimeAssetImports.length)
  assert.equal(runtimeAssetImports.every((assetPath) => allowlistedAssetPathSet.has(assetPath)), true)
  assert.match(source, /moduleStateRuleActiveUrl/)
  assert.match(source, /moduleStateRuleInactiveUrl/)
  assert.doesNotMatch(source, /moduleHeader|header-body|headerBody|bodyAssetId/)
  assert.doesNotMatch(source, /design\/ui-source|k0rp-v3|window\.module\.(?:active|inactive)\.png/)
  assert.doesNotMatch(css, /background-size\s*:\s*100%\s+100%|filter\s*:|blur\(|transform\s*:/)
  assert.match(css, /border-image-source:\s*var\(--korp-module-frame\)/)
  assert.match(css, /border-image-source:\s*var\(--korp-module-state-rule\)/)
  assert.match(css, /\.korp-module-window\s*\{[\s\S]*overflow:\s*hidden/)
  assert.match(css, /\.korp-module-window-header-rule-viewport\s*\{[\s\S]*overflow:\s*hidden/)
  assert.match(css, /\.korp-module-window-controls\s*\{[\s\S]*left:\s*var\(--korp-module-controls-left\)/)
  assert.equal(frameAsset.sourcePath, 'assets/windows/nine_slice/window.module.nine-slice.png')
  assert.equal(
    frameSha256,
    '4663329190432d40262d90cbacca144c66498c166c291952cf26d3597e01241b',
  )
  assert.equal(frameSha256, frameAsset.sha256)
  assert.equal(KORP_MODULE_WINDOW_METRICS.surface.hasOpaqueBacking, true)
  assert.match(KORP_MODULE_WINDOW_METRICS.surface.interiorBackingColor, /^#[\da-f]{6}$/i)
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
  assert.doesNotMatch(
    footerSurfaceCss,
    /var\(--korp-module-surface\)|background-image|background-repeat|linear-gradient|box-shadow/,
  )
  assert.doesNotMatch(css, /\.korp-module-window-footer-surface::(?:before|after)/)
})

test('shared footer always exists while Fidget content and standalone shell stay preserved', () => {
  const sharedSource = readProjectFile('src/components/KorpModuleWindow.jsx')
  const clickAuditSource = readProjectFile('src/components/ClickAuditWindow.jsx')
  const source = readProjectFile('src/components/FidgetWindow.jsx')
  const css = readProjectFile('src/components/FidgetWindow.css')
  const moduleCss = readProjectFile('src/components/FidgetModule.css')
  const clickAuditEmbeddedSource = clickAuditSource.slice(
    clickAuditSource.indexOf('export function ClickAuditEmbeddedWindow'),
    clickAuditSource.indexOf('export function ClickAuditStandaloneShell'),
  )
  const fidgetEmbeddedSource = source.slice(
    source.indexOf('export function FidgetEmbeddedWindow'),
    source.indexOf('export function FidgetStandaloneShell'),
  )
  const footerControlCss = readCssBlock(css, '.fidget-module-footer-mode')

  assert.match(sharedSource, /data-korp-module-region="footer"/)
  assert.match(sharedSource, /data-footer-content=\{footer == null \? 'empty' : 'present'\}/)
  assert.doesNotMatch(sharedSource, /\{footer\s*&&/)
  assert.doesNotMatch(clickAuditEmbeddedSource, /\bfooter=/)
  assert.match(fidgetEmbeddedSource, /footer=\{\([\s\S]*className="fidget-module-footer-mode"/)
  assert.match(fidgetEmbeddedSource, /FIDGET_MODULE_FOOTER_CONTROL_RECT/)
  assert.equal(
    (fidgetEmbeddedSource.match(/<FidgetModeControl/g) ?? []).length,
    1,
  )
  assert.doesNotMatch(source, /fidget-window-control-mode/)
  assert.match(footerControlCss, /left:\s*var\(--fidget-footer-control-left\)/)
  assert.match(footerControlCss, /width:\s*var\(--fidget-footer-control-width\)/)
  assert.match(footerControlCss, /height:\s*var\(--fidget-footer-control-height\)/)
  assert.doesNotMatch(footerControlCss, /transform|background-size/)
  assert.match(
    css,
    /\.fidget-module-footer-mode:hover,[\s\S]*outline-offset:\s*-1px/,
  )
  assert.match(css, /\.fidget-standalone-shell\s*\{[\s\S]*width:\s*230px;[\s\S]*height:\s*230px;/)
  assert.match(moduleCss, /\.fidget-module-spinner\s*\{[\s\S]*width:\s*132px;[\s\S]*height:\s*132px;/)
})
