import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'
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
    Object.values(KORP_MODULE_WINDOW_METRICS)
      .flatMap((value) => Object.values(value))
      .filter((value) => typeof value === 'number')
      .every(Number.isInteger),
    true,
  )
})

test('focused and unfocused module windows select deterministic authored header states', () => {
  assert.equal(getModuleWindowHeaderState(true), 'active')
  assert.equal(getModuleWindowHeaderState(false), 'inactive')
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

  assert.equal(runtimeAssetImports.length, 20)
  assert.equal(new Set(runtimeAssetImports).size, 20)
  assert.doesNotMatch(source, /design\/ui-source|k0rp-v3|window\.module\.(?:active|inactive)\.png/)
  assert.doesNotMatch(css, /background-size\s*:\s*100%\s+100%|filter\s*:|blur\(|transform\s*:/)
  assert.match(css, /border-image-source:\s*var\(--korp-module-frame\)/)
  assert.match(css, /border-image-source:\s*var\(--korp-module-header\)/)
  assert.match(css, /background-repeat:\s*repeat/)
  assert.match(css, /\.korp-module-window\s*\{[\s\S]*overflow:\s*visible/)
  assert.match(css, /\.korp-module-window-controls\s*\{[\s\S]*top:\s*6px;[\s\S]*right:\s*0;/)
})

test('Fidget mode toggle lives in the footer while content and standalone shell stay preserved', () => {
  const source = readProjectFile('src/components/FidgetWindow.jsx')
  const css = readProjectFile('src/components/FidgetWindow.css')
  const moduleCss = readProjectFile('src/components/FidgetModule.css')

  assert.match(source, /footer=\{\([\s\S]*className="fidget-module-footer-mode"/)
  assert.doesNotMatch(source, /fidget-window-control-mode/)
  assert.match(css, /\.fidget-module-footer-mode\s*\{[\s\S]*width:\s*16px;[\s\S]*height:\s*16px;/)
  assert.match(css, /\.fidget-standalone-shell\s*\{[\s\S]*width:\s*230px;[\s\S]*height:\s*230px;/)
  assert.match(moduleCss, /\.fidget-module-spinner\s*\{[\s\S]*width:\s*132px;[\s\S]*height:\s*132px;/)
})
