export const KORP_UI_V01_SOURCE_ROOT = 'design/ui-source/k0rp-ui-asset-pack-v01'
export const KORP_UI_V01_RUNTIME_ROOT = 'design/ui-runtime/k0rp-ui-v01'

export const KORP_UI_V01_CATALOG_PATH = `${KORP_UI_V01_RUNTIME_ROOT}/catalog.json`
export const KORP_UI_V01_WINDOW_CONTRACT_PATH = `${KORP_UI_V01_RUNTIME_ROOT}/window-shell-contract.json`
export const KORP_UI_V01_ALLOWLIST_PATH = `${KORP_UI_V01_RUNTIME_ROOT}/runtime-allowlist.json`
export const KORP_UI_V01_ASSET_ROOT = `${KORP_UI_V01_RUNTIME_ROOT}/assets`

export const KORP_UI_V01_RUNTIME_SCAN_ROOTS = Object.freeze([
  'src',
  'public',
  'packages',
  'desktop',
  'index.html',
  'vite.config.js',
  'vite.config.mjs',
  'vite.config.ts',
])

export const KORP_UI_V01_REQUIRED_SOURCE_FILES = Object.freeze([
  'README.md',
  'manifest.csv',
  'manifest.json',
  'tokens/k0rp-ui-tokens.css',
  'tokens/nine-slice.json',
  'tokens/palette.json',
  'previews/01_chrome_and_bars.png',
  'previews/02_window_taxonomy.png',
  'previews/03_audits_and_forms.png',
  'previews/04_unlock_and_system_flows.png',
  'previews/05_full_desktop_concept_1520x855.png',
  'previews/06_production_asset_atlas.png',
])

export const KORP_UI_V01_WINDOW_FAMILIES = Object.freeze(['module', 'audit', 'folder'])
export const KORP_UI_V01_TEXTURE_MODES = Object.freeze([
  'tile',
  'nine-slice',
  'three-slice',
  'fixed',
  'reference-only',
])
