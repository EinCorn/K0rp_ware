import {
  existsSync,
  mkdirSync,
  readFileSync,
  writeFileSync,
} from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import {
  KORP_UI_INVENTORY_PATH,
  KORP_UI_RAW_ROOT,
  KORP_UI_RUNTIME_ALLOWLIST_PATH,
} from './korp-ui-assets-contract.mjs'
import {
  KorpUiAssetValidationError,
  parseKorpUiJson,
  resolveKorpUiPathInside,
  serializeKorpUiJson,
  validateKorpUiPack,
} from './lib/korp-ui-asset-validation.mjs'

const scriptDirectory = dirname(fileURLToPath(import.meta.url))
const repoRoot = resolve(scriptDirectory, '..')
const rawRoot = resolveKorpUiPathInside(repoRoot, KORP_UI_RAW_ROOT, 'raw UI source root')
const manifestPath = resolveKorpUiPathInside(rawRoot, 'manifest.json', 'UI asset manifest')
const allowlistPath = resolveKorpUiPathInside(
  repoRoot,
  KORP_UI_RUNTIME_ALLOWLIST_PATH,
  'UI runtime allowlist',
)
const inventoryPath = resolveKorpUiPathInside(repoRoot, KORP_UI_INVENTORY_PATH, 'UI inventory')
const writeOutput = process.argv.includes('--write')

try {
  const manifest = parseKorpUiJson(readFileSync(manifestPath, 'utf8'), 'manifest.json')
  const allowlist = parseKorpUiJson(readFileSync(allowlistPath, 'utf8'), 'runtime-allowlist.json')
  const { inventory, summary, warnings } = validateKorpUiPack({
    rawRoot,
    repoRoot,
    manifest,
    allowlist,
  })
  const inventorySource = serializeKorpUiJson(inventory)

  if (writeOutput) {
    mkdirSync(dirname(inventoryPath), { recursive: true })
    writeFileSync(inventoryPath, inventorySource, 'utf8')
  } else if (!existsSync(inventoryPath)) {
    throw new KorpUiAssetValidationError([
      `normalized inventory is missing; run npm run build:korp-ui-assets`,
    ])
  } else if (readFileSync(inventoryPath, 'utf8') !== inventorySource) {
    throw new KorpUiAssetValidationError([
      `normalized inventory has generated drift; run npm run build:korp-ui-assets`,
    ])
  }

  console.log(
    `K0rp UI assets valid: ${summary.semanticAssets} semantic assets `
      + `(${summary.productionAssets} production, ${summary.referenceAssets} reference), `
      + `${summary.files} files / ${summary.bytes} bytes, `
      + `${summary.nineSliceFamilies} nine-slice families / ${summary.nineSlicePieces} pieces, `
      + `${summary.atlases} atlases / ${summary.atlasFrames} frames, `
      + `${summary.windowFamilies} window families, ${summary.pilotAssets} pilot selections `
      + `${writeOutput ? '(inventory written)' : '(inventory clean)'}.`,
  )
  console.log(`Non-blocking source warnings: ${warnings.length}.`)
  for (const warning of warnings) console.warn(`- [${warning.code}] ${warning.message}`)
} catch (error) {
  if (error instanceof KorpUiAssetValidationError) console.error(error.message)
  else console.error(error)
  process.exitCode = 1
}
