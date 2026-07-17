export const KORP_UI_RAW_ROOT = 'design/ui-source/k0rp-os-ui-assets-v3'
export const KORP_UI_RUNTIME_METADATA_ROOT = 'design/ui-runtime/k0rp-v3'
export const KORP_UI_INVENTORY_PATH = `${KORP_UI_RUNTIME_METADATA_ROOT}/inventory.json`
export const KORP_UI_RUNTIME_ALLOWLIST_PATH = `${KORP_UI_RUNTIME_METADATA_ROOT}/runtime-allowlist.json`

export const KORP_UI_RUNTIME_SCAN_ROOTS = Object.freeze([
  'src',
  'public',
  'packages',
  'desktop',
  'index.html',
  'vite.config.js',
  'vite.config.mjs',
  'vite.config.ts',
])

export const KORP_UI_RUNTIME_COPY_SCAN_ROOTS = Object.freeze([
  'src',
  'public',
  'packages',
  'desktop',
])

export const KORP_UI_REQUIRED_SOURCE_FILES = Object.freeze([
  'README.md',
  'SHA256SUMS.txt',
  'index.html',
  'manifest.csv',
  'manifest.json',
  'repo-mapping.json',
  'tokens.json',
  'atlases/atlas.json',
  'docs/USAGE.md',
  'docs/window-metrics.json',
  'qa/report.json',
])

export const KORP_UI_FLAVOR_CATEGORY_PREFIXES = Object.freeze([
  'documents/scraps',
  'documents/stamps/',
  'system/screens',
  'system/toasts',
  'textures/',
])
