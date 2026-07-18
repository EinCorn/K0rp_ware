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
const isMainModule = process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)

export function validateKorpUiAssetRepository({ writeOutput = false } = {}) {
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

  return { summary, warnings, writeOutput }
}

export function runKorpUiAssetValidation({
  writeOutput = process.argv.includes('--write'),
  validate = () => validateKorpUiAssetRepository({ writeOutput }),
  stdout = process.stdout,
  stderr = process.stderr,
} = {}) {
  try {
    const result = validate()
    writeKorpUiAssetValidationSuccess(result, stdout)
    return 0
  } catch (error) {
    writeKorpUiAssetValidationFailure(error, stderr)
    return 1
  }
}

export function writeKorpUiAssetValidationSuccess({ summary, warnings, writeOutput }, stdout) {
  const warningCount = warnings.length
  const status = warningCount === 0
    ? 'PASS'
    : `PASS WITH ${warningCount} KNOWN SOURCE WARNING${warningCount === 1 ? '' : 'S'}`
  writeValidationLine(
    stdout,
    `${status}: ${summary.semanticAssets} semantic assets `
      + `(${summary.productionAssets} production, ${summary.referenceAssets} reference), `
      + `${summary.files} files / ${summary.bytes} bytes, `
      + `${summary.nineSliceFamilies} nine-slice families / ${summary.nineSlicePieces} pieces, `
      + `${summary.atlases} atlases / ${summary.atlasFrames} frames, `
      + `${summary.windowFamilies} window families, ${summary.pilotAssets} pilot selections `
      + `${writeOutput ? '(inventory written)' : '(inventory clean)'}.`,
  )
  for (const warning of warnings) {
    writeValidationLine(stdout, `WARN [${warning.code}]: ${warning.message}`)
  }
}

export function writeKorpUiAssetValidationFailure(error, stderr) {
  const diagnostic = error instanceof KorpUiAssetValidationError
    ? error.message
    : error?.stack ?? String(error)
  writeValidationLine(stderr, `FAIL: ${diagnostic}`)
}

function writeValidationLine(stream, message) {
  stream.write(`${message}\n`)
}

if (isMainModule) {
  process.exitCode = runKorpUiAssetValidation()
}
