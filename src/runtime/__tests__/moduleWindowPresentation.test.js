import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { existsSync, readFileSync } from 'node:fs'
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
  getModuleWindowShellState,
} from '../moduleWindowPresentation.js'

const readProjectFile = (relativePath) => readFileSync(
  new URL(`../../../${relativePath}`, import.meta.url),
  'utf8',
)
const readProjectBytes = (relativePath) => readFileSync(
  new URL(`../../../${relativePath}`, import.meta.url),
)
const projectFileExists = (relativePath) => existsSync(
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
const expandRect = (rect, amount) => ({
  x: rect.x - amount,
  y: rect.y - amount,
  width: rect.width + (amount * 2),
  height: rect.height + (amount * 2),
})

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

function readPngDimensions(bytes) {
  assert.deepEqual([...bytes.subarray(0, 8)], [137, 80, 78, 71, 13, 10, 26, 10])
  assert.equal(bytes.subarray(12, 16).toString('ascii'), 'IHDR')
  return {
    width: bytes.readUInt32BE(16),
    height: bytes.readUInt32BE(20),
  }
}

test('module geometry stays aligned with the fixed authored shell contract', () => {
  const contractMetrics = shellContract.families.module.defaultMetricsPx
  const contractShell = shellContract.compositionPolicy.modulePilotShell

  assert.deepEqual(KORP_MODULE_WINDOW_METRICS.contentInsets, contractMetrics.contentInsets)
  assert.deepEqual(KORP_MODULE_WINDOW_METRICS.content, contractMetrics.content)
  assert.deepEqual(KORP_MODULE_WINDOW_METRICS.outer, contractMetrics.outer)
  assert.deepEqual(KORP_MODULE_WINDOW_SIZE, { width: 183, height: 223 })
  assert.deepEqual(KORP_MODULE_WINDOW_METRICS.shell.assetIds, contractShell.assets)
  assert.deepEqual(
    KORP_MODULE_WINDOW_METRICS.shell.transparentApertureRect,
    contractShell.transparentAperturePx,
  )
  assert.deepEqual(KORP_MODULE_WINDOW_METRICS.contentRect, contractShell.contentRectPx)
  assert.deepEqual(
    KORP_MODULE_WINDOW_METRICS.apertureUnderlayRect,
    contractShell.apertureUnderlayRectPx,
  )
  assert.deepEqual(contractShell.contentRectPx, contractShell.transparentAperturePx)
  assert.deepEqual(contractShell.apertureUnderlay, {
    derivedFrom: 'contentRectPx',
    expansionPx: 1,
    usage: ['opaque-backing', 'repeated-surface'],
    backgroundCoverageOnly: true,
    clipToOuterRect: true,
    liveViewportUsesUnderlayRect: false,
    shellMasksOverscan: true,
    textureOrigin: 'contentRectPx',
  })
  assert.deepEqual(contractShell.contentPlacement, {
    anchor: 'shell-top-left',
    positioning: 'absolute-integer-px',
    clipToContentRect: true,
    derivedOrPercentageLayoutAllowed: false,
    translateCenteringAllowed: false,
  })
  assert.equal(KORP_MODULE_WINDOW_METRICS.shell.classification, 'fixed')
  assert.equal(KORP_MODULE_WINDOW_METRICS.shell.nativeScale, 1)
  assert.equal(contractShell.resizable, false)
  assert.equal(shellContract.families.module.resizing.supported, false)
  assert.equal(
    shellContract.families.module.resizing.composition,
    'deferred-explicit-authored-export-contract',
  )
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
  assert.equal(numericLeaves(KORP_MODULE_WINDOW_METRICS).every(Number.isInteger), true)
})

test('fixed shell, aperture, content, footer and controls use exact authored coordinates', () => {
  const metrics = KORP_MODULE_WINDOW_METRICS

  assert.deepEqual(metrics.outerRect, { x: 0, y: 0, width: 183, height: 223 })
  assert.deepEqual(metrics.shellRect, metrics.outerRect)
  assert.deepEqual(metrics.headerRect, { x: 0, y: 0, width: 183, height: 31 })
  assert.deepEqual(metrics.apertureUnderlayRect, { x: 4, y: 27, width: 175, height: 175 })
  assert.deepEqual(metrics.contentRect, { x: 5, y: 28, width: 173, height: 173 })
  assert.deepEqual(metrics.shell.transparentApertureRect, metrics.contentRect)
  assert.deepEqual(metrics.footerRect, { x: 8, y: 198, width: 167, height: 17 })
  assert.deepEqual(metrics.footerSafeRect, { x: 8, y: 199, width: 167, height: 16 })
  assert.deepEqual(metrics.footerControlRect, { x: 12, y: 199, width: 16, height: 16 })
  assert.deepEqual(metrics.bottomFrameRect, { x: 0, y: 215, width: 183, height: 8 })
  assert.deepEqual(metrics.controlsRect, { x: 120, y: 5, width: 58, height: 16 })
  assert.deepEqual(metrics.titleRect, { x: 17, y: 6, width: 99, height: 16 })

  assert.equal(metrics.apertureUnderlayExpansion, 1)
  assert.deepEqual(
    metrics.apertureUnderlayRect,
    expandRect(metrics.contentRect, metrics.apertureUnderlayExpansion),
  )
  for (const rect of [
    metrics.shellRect,
    metrics.apertureUnderlayRect,
    metrics.contentRect,
  ]) {
    assert.equal(Object.values(rect).every(Number.isInteger), true)
  }
  assert.equal(rectContains(metrics.outerRect, metrics.apertureUnderlayRect), true)
  assert.equal(rectContains(metrics.apertureUnderlayRect, metrics.contentRect), true)
  assert.equal(metrics.contentRect.x - metrics.apertureUnderlayRect.x, 1)
  assert.equal(metrics.contentRect.y - metrics.apertureUnderlayRect.y, 1)
  assert.equal(rectRight(metrics.apertureUnderlayRect) - rectRight(metrics.contentRect), 1)
  assert.equal(rectBottom(metrics.apertureUnderlayRect) - rectBottom(metrics.contentRect), 1)
  assert.notDeepEqual(metrics.apertureUnderlayRect, metrics.contentRect)
  assert.equal(rectContains(metrics.outerRect, metrics.contentRect), true)
  assert.equal(metrics.contentRect.x, metrics.contentInsets.left)
  assert.equal(metrics.contentRect.y, metrics.contentInsets.top)
  assert.equal(rectRight(metrics.contentRect), metrics.outerRect.width - metrics.contentInsets.right)
  assert.equal(rectBottom(metrics.contentRect), metrics.outerRect.height - metrics.contentInsets.bottom)
  assert.equal(rectBottom(metrics.contentRect), 201)
  assert.equal(rectBottom(metrics.footerRect), metrics.bottomFrameRect.y)
  assert.equal(rectBottom(metrics.bottomFrameRect), rectBottom(metrics.outerRect))
  assert.equal(rectRight(metrics.controlsRect), metrics.outerRect.width - 5)
  assert.equal(metrics.titleRect.x + metrics.titleRect.width + 4, metrics.controlsRect.x)
})

test('focus selects one native fixed-shell asset without changing geometry', () => {
  const metrics = KORP_MODULE_WINDOW_METRICS

  assert.equal(getModuleWindowShellState(true), 'active')
  assert.equal(getModuleWindowShellState(false), 'inactive')
  assert.equal(metrics.shell.assetIds.active, 'window.module.compact.active')
  assert.equal(metrics.shell.assetIds.inactive, 'window.module.compact.inactive')
  assert.notEqual(metrics.shell.assetIds.active, metrics.shell.assetIds.inactive)
  assert.deepEqual(metrics.shell.rect, metrics.outerRect)
  assert.deepEqual(metrics.shell.transparentApertureRect, metrics.contentRect)
})

test('reviewed fixed-shell runtime assets retain native 183x223 bytes', () => {
  const catalogById = new Map(runtimeCatalog.assets.map((asset) => [asset.id, asset]))
  const expectations = new Map([
    ['window.module.compact.active', {
      path: 'assets/windows/shells/window.module.active.183x223.png',
      sha256: '099fc8f5299ac3ddec23260696060c9850f1e6cae6adf8139f4f1039f0fff3aa',
    }],
    ['window.module.compact.inactive', {
      path: 'assets/windows/shells/window.module.inactive.183x223.png',
      sha256: '6268bb831c27bdcef658f9a0c89cad7a7860d14d95209d2186d79bbd5d73e3a2',
    }],
  ])

  for (const [assetId, expected] of expectations) {
    const asset = catalogById.get(assetId)
    const runtimeBytes = readProjectBytes(
      `design/ui-runtime/k0rp-ui-v01/${expected.path}`,
    )

    assert.deepEqual(asset.dimensions, { width: 183, height: 223 })
    assert.equal(asset.textureMode, 'fixed')
    assert.equal(asset.runtimeEligible, true)
    assert.equal(asset.sourcePath, expected.path)
    assert.equal(asset.sha256, expected.sha256)
    assert.deepEqual(readPngDimensions(runtimeBytes), { width: 183, height: 223 })
    assert.equal(createHash('sha256').update(runtimeBytes).digest('hex'), expected.sha256)
  }
})

test('shared window renders backing, content, whole shell and live chrome in that order', () => {
  const source = readProjectFile('src/components/KorpModuleWindow.jsx')
  const css = readProjectFile('src/components/KorpModuleWindow.css')
  const metrics = KORP_MODULE_WINDOW_METRICS

  assert.deepEqual(metrics.layers, {
    opaqueBacking: 0,
    shellBackgrounds: 1,
    liveContent: 2,
    fixedShell: 3,
    interactiveChrome: 4,
  })
  assert.equal(metrics.layers.fixedShell > metrics.layers.opaqueBacking, true)
  assert.equal(metrics.layers.fixedShell > metrics.layers.shellBackgrounds, true)
  assert.equal(metrics.layers.fixedShell > metrics.layers.liveContent, true)
  assert.equal(metrics.layers.interactiveChrome > metrics.layers.fixedShell, true)
  for (const layer of [
    'opaque-backing',
    'content-surface',
    'live-content',
    'fixed-shell',
    'interactive-header',
    'footer-controls',
  ]) {
    assert.match(source, new RegExp(`data-korp-module-layer="${layer}"`))
  }
  for (const rejectedLayer of [
    'footer-body',
    'frame-chrome',
    'state-strip',
  ]) {
    assert.doesNotMatch(source, new RegExp(`data-korp-module-layer="${rejectedLayer}"`))
  }

  assert.match(source, /const shellUrl = moduleShellAssets\[shellState\]/)
  assert.match(source, /className="korp-module-window-shell"/)
  assert.match(source, /src=\{shellUrl\}/)
  assert.match(source, /width=\{metrics\.shellRect\.width\}/)
  assert.match(source, /height=\{metrics\.shellRect\.height\}/)
  assert.match(source, /draggable=\{false\}/)
  assert.match(source, /data-korp-module-shell-state=\{shellState\}/)
  assert.match(source, /data-korp-module-viewport="authored-content-rect"/)
  for (const [cssField, rectField] of [
    ['left', 'x'],
    ['top', 'y'],
    ['width', 'width'],
    ['height', 'height'],
  ]) {
    assert.equal(
      source.includes(
        `'--korp-module-underlay-${cssField}': \`\${metrics.apertureUnderlayRect.${rectField}}px\`,`,
      ),
      true,
    )
  }
  assert.match(
    source,
    /--korp-module-surface-origin-x': `\$\{metrics\.surface\.tile\.originOffset\.x\}px`/,
  )
  assert.match(
    source,
    /--korp-module-surface-origin-y': `\$\{metrics\.surface\.tile\.originOffset\.y\}px`/,
  )
  assert.match(source, /<span className="korp-module-window-title">\{title\}<\/span>/)
  assert.match(source, /kind=\{isPinned \? 'unpin' : 'pin'\}/)
  assert.match(source, /kind="minimize"/)
  assert.match(source, /kind="close"/)

  const backingCss = readCssBlock(css, '.korp-module-window-backing')
  const contentCss = readCssBlock(css, '.korp-module-window-content')
  const shellCss = readCssBlock(css, '.korp-module-window-shell')
  const rootCss = readCssBlock(css, '.korp-module-window')
  const underlayPlacementStart = css.indexOf('.korp-module-window-backing,')
  const underlayPlacementEnd = css.indexOf('}', underlayPlacementStart) + 1
  const underlayPlacementCss = css.slice(underlayPlacementStart, underlayPlacementEnd)

  assert.notEqual(underlayPlacementStart, -1)
  assert.match(underlayPlacementCss, /\.korp-module-window-content-surface/)
  assert.doesNotMatch(underlayPlacementCss, /\.korp-module-window-content\s*\{/)
  assert.match(underlayPlacementCss, /left:\s*var\(--korp-module-underlay-left\)/)
  assert.match(underlayPlacementCss, /top:\s*var\(--korp-module-underlay-top\)/)
  assert.match(underlayPlacementCss, /width:\s*var\(--korp-module-underlay-width\)/)
  assert.match(underlayPlacementCss, /height:\s*var\(--korp-module-underlay-height\)/)
  assert.match(underlayPlacementCss, /overflow:\s*hidden/)
  assert.doesNotMatch(underlayPlacementCss, /--korp-module-content-|calc\(|%|transform|translate/)
  assert.match(contentCss, /left:\s*var\(--korp-module-content-left\)/)
  assert.match(contentCss, /top:\s*var\(--korp-module-content-top\)/)
  assert.match(contentCss, /width:\s*var\(--korp-module-content-width\)/)
  assert.match(contentCss, /height:\s*var\(--korp-module-content-height\)/)
  assert.match(contentCss, /overflow:\s*hidden/)
  assert.doesNotMatch(contentCss, /--korp-module-underlay-|calc\(|%|transform|translate/)
  assert.match(rootCss, /overflow:\s*hidden/)
  assert.match(backingCss, /background-color:\s*var\(--korp-module-interior-backing-color\)/)
  assert.match(shellCss, /left:\s*0/)
  assert.match(shellCss, /top:\s*0/)
  assert.match(shellCss, /width:\s*var\(--korp-module-outer-width\)/)
  assert.match(shellCss, /height:\s*var\(--korp-module-outer-height\)/)
  assert.match(shellCss, /pointer-events:\s*none/)
  assert.match(shellCss, /z-index:\s*var\(--korp-module-layer-fixed-shell\)/)

  assert.doesNotMatch(
    `${source}\n${css}`,
    /border-image|state-strip|header-seam|frame-viewport|frameOpticalCrop|footer-surface|linear-gradient|::after/,
  )
  assert.doesNotMatch(
    css,
    /background-size\s*:|object-fit\s*:|filter\s*:|blur\(|transform\s*:|clip-path\s*:|mask(?:-image)?\s*:/,
  )
})

test('shared chrome imports exactly the 19 generated pilot assets and no rejected pieces', () => {
  const source = readProjectFile('src/components/KorpModuleWindow.jsx')
  const css = readProjectFile('src/components/KorpModuleWindow.css')
  const catalogById = new Map(runtimeCatalog.assets.map((asset) => [asset.id, asset]))
  const runtimeAssetImports = [...source.matchAll(
    /design\/ui-runtime\/k0rp-ui-v01\/assets\/([^'?]+)[?]url/g,
  )].map((match) => match[1]).sort()
  const allowlistedAssetPaths = runtimeAllowlist.groups
    .flatMap((group) => group.assetIds)
    .map((assetId) => catalogById.get(assetId).sourcePath.replace(/^assets\//, ''))
    .sort()

  assert.equal(runtimeAllowlist.assetCount, 19)
  assert.deepEqual(runtimeAssetImports, allowlistedAssetPaths)
  assert.equal(new Set(runtimeAssetImports).size, runtimeAssetImports.length)
  assert.doesNotMatch(
    source,
    /design\/ui-source|k0rp-v3|window\.module\.nine-slice|header\.module|320x220/,
  )
  assert.doesNotMatch(css, /border-image|background-size|object-fit/)
  assert.equal(
    projectFileExists(
      'design/ui-runtime/k0rp-ui-v01/assets/windows/nine_slice/window.module.nine-slice.png',
    ),
    false,
  )
  assert.equal(
    projectFileExists(
      'design/ui-runtime/k0rp-ui-v01/assets/windows/headers/header.module.active.png',
    ),
    false,
  )
  assert.equal(
    projectFileExists(
      'design/ui-runtime/k0rp-ui-v01/assets/windows/headers/header.module.inactive.png',
    ),
    false,
  )

  assert.equal(KORP_MODULE_WINDOW_METRICS.surface.hasOpaqueBacking, true)
  assert.deepEqual(
    KORP_MODULE_WINDOW_METRICS.surface.tile,
    {
      width: 32,
      height: 32,
      repeat: true,
      originOffset: { x: 1, y: 1 },
    },
  )
  assert.deepEqual(KORP_MODULE_WINDOW_METRICS.surface.tile.originOffset, {
    x: KORP_MODULE_WINDOW_METRICS.contentRect.x
      - KORP_MODULE_WINDOW_METRICS.apertureUnderlayRect.x,
    y: KORP_MODULE_WINDOW_METRICS.contentRect.y
      - KORP_MODULE_WINDOW_METRICS.apertureUnderlayRect.y,
  })
  assert.deepEqual(
    KORP_MODULE_WINDOW_METRICS.surface.textureRegions,
    { apertureUnderlay: 'dark-panel', footer: null },
  )
  const contentSurfaceCss = readCssBlock(css, '.korp-module-window-content-surface')
  assert.equal((css.match(/var\(--korp-module-surface\)/g) ?? []).length, 1)
  assert.match(contentSurfaceCss, /background-image:\s*var\(--korp-module-surface\)/)
  assert.match(contentSurfaceCss, /background-repeat:\s*repeat/)
  assert.match(
    contentSurfaceCss,
    /background-position:\s*var\(--korp-module-surface-origin-x\)\s*var\(--korp-module-surface-origin-y\)/,
  )
  assert.doesNotMatch(css, /\.korp-module-window-footer-surface/)
})

test('both modules share the authored viewport and Fidget stays in the left footer slot', () => {
  const metrics = KORP_MODULE_WINDOW_METRICS
  const preserved = shellContract.families.module.preservedContentInstances
  const fidgetControlOuterRect = {
    x: metrics.footerRect.x + FIDGET_MODULE_FOOTER_CONTROL_RECT.x,
    y: metrics.footerRect.y + FIDGET_MODULE_FOOTER_CONTROL_RECT.y,
    width: FIDGET_MODULE_FOOTER_CONTROL_RECT.width,
    height: FIDGET_MODULE_FOOTER_CONTROL_RECT.height,
  }

  assert.deepEqual(preserved.clickAudit, { width: 173, height: 173 })
  assert.deepEqual(preserved.fidget, { width: 173, height: 173 })
  assert.deepEqual(metrics.contentRect, metrics.shell.transparentApertureRect)
  assert.deepEqual(FIDGET_MODULE_FOOTER_CONTROL_RECT, {
    x: 4,
    y: 1,
    width: 16,
    height: 16,
  })
  assert.deepEqual(fidgetControlOuterRect, metrics.footerControlRect)
  assert.equal(rectContains(metrics.footerSafeRect, fidgetControlOuterRect), true)
  assert.equal(fidgetControlOuterRect.x - metrics.footerSafeRect.x, 4)
  assert.notEqual(
    fidgetControlOuterRect.x,
    metrics.footerSafeRect.x
      + Math.round((metrics.footerSafeRect.width - fidgetControlOuterRect.width) / 2),
  )
  assert.equal(rectsIntersect(fidgetControlOuterRect, metrics.contentRect), true)
  assert.equal(rectsIntersect(fidgetControlOuterRect, metrics.bottomFrameRect), false)
})

test('ClickAudit basin ends at the authored content floor', () => {
  const metrics = KORP_MODULE_WINDOW_METRICS
  const source = readProjectFile('src/components/ClickAuditModule.jsx')
  const css = readProjectFile('src/components/ClickAuditModule.css')

  assert.deepEqual(CLICK_AUDIT_BASIN_RECT, {
    x: 0,
    y: 0,
    width: metrics.contentRect.width,
    height: metrics.contentRect.height,
  })
  assert.equal(CLICK_AUDIT_BASIN_FLOOR_Y, metrics.contentRect.height)
  assert.equal(metrics.contentRect.y + CLICK_AUDIT_BASIN_FLOOR_Y, 201)
  assert.equal(
    metrics.contentRect.y + CLICK_AUDIT_BASIN_FLOOR_Y,
    rectBottom(metrics.contentRect),
  )
  assert.equal(metrics.footerRect.y < metrics.bottomFrameRect.y, true)
  assert.match(source, /data-clickaudit-basin="content-floor"/)
  assert.match(css, /\.clickaudit-liquid-fill\s*\{[\s\S]*inset:\s*auto 0 0;/)
})

test('window-only previews center the odd fixed shell on integer coordinates', () => {
  assert.deepEqual(
    getIntegerModuleWindowPreviewPosition({ width: 1600, height: 900 }),
    { left: 709, top: 339 },
  )
  assert.deepEqual(
    getIntegerModuleWindowPreviewPosition({ width: 1920, height: 1080 }),
    { left: 869, top: 429 },
  )
})

test('ClickAudit and Fidget consume one fixed module-family chrome path', () => {
  const clickAuditPresentation = readProjectFile('src/runtime/clickAuditPresentation.js')
  const fidgetPresentation = readProjectFile('src/runtime/fidgetPresentation.js')
  const clickAuditWindow = readProjectFile('src/components/ClickAuditWindow.jsx')
  const fidgetWindow = readProjectFile('src/components/FidgetWindow.jsx')
  const sharedWindow = readProjectFile('src/components/KorpModuleWindow.jsx')
  const fidgetCss = readProjectFile('src/components/FidgetWindow.css')
  const fidgetModuleCss = readProjectFile('src/components/FidgetModule.css')
  const windowFamilyDoc = readProjectFile('docs/k0rp-os/08-codex-tasks.md')

  assert.match(clickAuditPresentation, /KORP_MODULE_WINDOW_METRICS/)
  assert.match(fidgetPresentation, /KORP_MODULE_WINDOW_METRICS/)
  assert.match(fidgetPresentation, /KORP_MODULE_WINDOW_SIZE/)
  assert.match(clickAuditWindow, /import KorpModuleWindow from '\.\/KorpModuleWindow'/)
  assert.match(fidgetWindow, /import KorpModuleWindow from '\.\/KorpModuleWindow'/)
  assert.equal((clickAuditWindow.match(/<KorpModuleWindow\b/g) ?? []).length, 1)
  assert.equal((fidgetWindow.match(/<KorpModuleWindow\b/g) ?? []).length, 1)
  assert.doesNotMatch(
    `${clickAuditWindow}\n${fidgetWindow}`,
    /apertureUnderlay|--korp-module-(?:underlay|content)-(?:left|top|width|height)/,
  )
  assert.match(sharedWindow, /data-korp-module-window="v01"/)
  assert.match(sharedWindow, /data-korp-module-layout="compact"/)
  assert.match(sharedWindow, /data-korp-module-region="footer"/)
  assert.match(sharedWindow, /data-footer-content=\{footer == null \? 'empty' : 'present'\}/)
  assert.doesNotMatch(clickAuditWindow, /\bfooter=/)
  assert.match(fidgetWindow, /footer=\{\([\s\S]*className="fidget-module-footer-mode"/)
  assert.match(fidgetCss, /\.fidget-standalone-shell\s*\{[\s\S]*width:\s*230px;[\s\S]*height:\s*230px;/)
  assert.match(fidgetModuleCss, /\.fidget-module-spinner\s*\{[\s\S]*width:\s*132px;[\s\S]*height:\s*132px;/)
  assert.match(windowFamilyDoc, /window\.module\.compact\.active/)
  assert.match(windowFamilyDoc, /window\.module\.compact\.inactive/)
  assert.match(windowFamilyDoc, /fixed authored `183×223` shells rendered at 1:1/)
  assert.match(windowFamilyDoc, /app content may not modify the outer family chrome/)
  assert.deepEqual(
    shellContract.families.module.pilotComposition.apertureUnderlayRectPx,
    KORP_MODULE_WINDOW_METRICS.apertureUnderlayRect,
  )
  assert.equal(
    shellContract.families.module.pilotComposition.apertureUnderlayExpansionPx,
    KORP_MODULE_WINDOW_METRICS.apertureUnderlayExpansion,
  )
})
