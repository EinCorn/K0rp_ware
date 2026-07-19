import {
  copyFileSync,
  existsSync,
  mkdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from 'node:fs'
import { dirname, isAbsolute, relative, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import {
  KORP_UI_V01_ALLOWLIST_PATH,
  KORP_UI_V01_ASSET_ROOT,
  KORP_UI_V01_CATALOG_PATH,
  KORP_UI_V01_RUNTIME_ROOT,
  KORP_UI_V01_SOURCE_ROOT,
  KORP_UI_V01_WINDOW_CONTRACT_PATH,
} from './korp-ui-pack-v01-contract.mjs'
import {
  KorpUiAssetValidationError,
  createKorpUiV01Catalog,
  flattenKorpUiV01Allowlist,
  scanKorpUiV01RawImports,
  serializeKorpUiV01Json,
  validateKorpUiV01Allowlist,
  validateKorpUiV01Catalog,
  validateKorpUiV01GeneratedRuntime,
  validateKorpUiV01RawPack,
  validateKorpUiV01WindowContract,
} from './lib/korp-ui-pack-v01-validation.mjs'
import {
  parseKorpUiJson,
  resolveKorpUiPathInside,
} from './lib/korp-ui-asset-validation.mjs'

const scriptDirectory = dirname(fileURLToPath(import.meta.url))
const repoRoot = resolve(scriptDirectory, '..')
const rawRoot = resolveKorpUiPathInside(repoRoot, KORP_UI_V01_SOURCE_ROOT, 'v01 raw source root')
const runtimeRoot = resolveKorpUiPathInside(repoRoot, KORP_UI_V01_RUNTIME_ROOT, 'v01 runtime root')
const runtimeAssetRoot = resolveKorpUiPathInside(repoRoot, KORP_UI_V01_ASSET_ROOT, 'v01 runtime asset root')
const catalogPath = resolveKorpUiPathInside(repoRoot, KORP_UI_V01_CATALOG_PATH, 'v01 catalog')
const allowlistPath = resolveKorpUiPathInside(repoRoot, KORP_UI_V01_ALLOWLIST_PATH, 'v01 runtime allowlist')
const windowContractPath = resolveKorpUiPathInside(
  repoRoot,
  KORP_UI_V01_WINDOW_CONTRACT_PATH,
  'v01 window-shell contract',
)
const writeOutput = process.argv.includes('--write')

function readJson(absolutePath, label) {
  return parseKorpUiJson(readFileSync(absolutePath, 'utf8'), label)
}

function syncRuntimeAssets(catalog, selectedIds) {
  const runtimeRelative = resolve(repoRoot, KORP_UI_V01_RUNTIME_ROOT)
  const assetRelative = resolve(repoRoot, KORP_UI_V01_ASSET_ROOT)
  const relativeAssetRoot = relative(runtimeRelative, assetRelative)
  if (
    relativeAssetRoot === '..'
    || relativeAssetRoot.startsWith(`..${process.platform === 'win32' ? '\\' : '/'}`)
    || isAbsolute(relativeAssetRoot)
  ) {
    throw new KorpUiAssetValidationError(['refusing to sync runtime assets outside the v01 runtime root'])
  }
  rmSync(runtimeAssetRoot, { recursive: true, force: true })
  mkdirSync(runtimeAssetRoot, { recursive: true })
  const selected = new Set(selectedIds)
  for (const asset of catalog.assets.filter((entry) => selected.has(entry.id))) {
    const sourcePath = resolveKorpUiPathInside(rawRoot, asset.sourcePath, `source asset ${asset.id}`)
    const targetPath = resolveKorpUiPathInside(runtimeRoot, asset.sourcePath, `runtime asset ${asset.id}`)
    mkdirSync(dirname(targetPath), { recursive: true })
    copyFileSync(sourcePath, targetPath)
  }
}

try {
  const manifest = readJson(resolveKorpUiPathInside(rawRoot, 'manifest.json'), 'manifest.json')
  const csvSource = readFileSync(resolveKorpUiPathInside(rawRoot, 'manifest.csv'), 'utf8')
  const nineSliceTokens = readJson(
    resolveKorpUiPathInside(rawRoot, 'tokens/nine-slice.json'),
    'tokens/nine-slice.json',
  )
  const allowlist = readJson(allowlistPath, 'runtime-allowlist.json')
  const windowContract = readJson(windowContractPath, 'window-shell-contract.json')

  validateKorpUiV01RawPack({ rawRoot, manifest, csvSource, nineSliceTokens })
  const expectedCatalog = createKorpUiV01Catalog({ manifest, rawRoot })
  validateKorpUiV01WindowContract({ contract: windowContract, catalog: expectedCatalog })
  const selectedIds = validateKorpUiV01Allowlist({ allowlist, catalog: expectedCatalog })

  if (writeOutput) {
    mkdirSync(runtimeRoot, { recursive: true })
    writeFileSync(catalogPath, serializeKorpUiV01Json(expectedCatalog), 'utf8')
    syncRuntimeAssets(expectedCatalog, selectedIds)
  } else if (!existsSync(catalogPath)) {
    throw new KorpUiAssetValidationError([
      'generated v01 catalog is missing; run npm run build:korp-ui-pack-v01',
    ])
  }

  const catalog = readJson(catalogPath, 'catalog.json')
  validateKorpUiV01Catalog({ catalog, manifest, rawRoot })
  validateKorpUiV01GeneratedRuntime({
    repoRoot,
    rawRoot,
    catalog,
    selectedIds: flattenKorpUiV01Allowlist(allowlist),
  })
  scanKorpUiV01RawImports({ repoRoot })

  const counts = expectedCatalog.counts
  console.log(
    `K0rp UI pack v01 valid: ${expectedCatalog.sourceAssetCount} source assets, `
      + `${counts['nine-slice']} nine-slice, ${counts['three-slice']} three-slice, `
      + `${counts.tile} tile, ${counts.fixed} fixed, ${counts['reference-only']} reference-only; `
      + `${selectedIds.length} generated module-pilot assets `
      + `${writeOutput ? '(catalog and runtime subset written)' : '(generated output clean)'}.`,
  )
} catch (error) {
  if (error instanceof KorpUiAssetValidationError) console.error(error.message)
  else console.error(error)
  process.exitCode = 1
}
