import {
  copyFileSync,
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  rmSync,
  writeFileSync,
} from 'node:fs'
import { dirname, join, relative, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import {
  KORP_ICON_CATALOG_PATH,
  KORP_ICON_RAW_ROOT,
  KORP_ICON_RUNTIME_ROOT,
  KORP_REQUIRED_CURRENT_ICON_IDS,
  KORP_RUNTIME_ICON_SELECTIONS,
} from './korp-icon-contract.mjs'
import {
  KorpIconValidationError,
  getKorpIconRawPaths,
  parseKorpIconManifest,
  resolvePathInside,
  validateKorpIconPack,
} from './lib/korp-icon-validation.mjs'

const scriptDirectory = dirname(fileURLToPath(import.meta.url))
const repoRoot = resolve(scriptDirectory, '..')
const rawRoot = resolvePathInside(repoRoot, KORP_ICON_RAW_ROOT, 'raw icon root')
const runtimeRoot = resolvePathInside(repoRoot, KORP_ICON_RUNTIME_ROOT, 'runtime icon root')
const catalogPath = resolvePathInside(repoRoot, KORP_ICON_CATALOG_PATH, 'runtime catalog path')
const manifestPath = resolvePathInside(rawRoot, 'manifest.json', 'manifest path')
const checkOnly = process.argv.includes('--check')

try {
  const manifest = parseKorpIconManifest(readFileSync(manifestPath, 'utf8'))
  validateKorpIconPack({
    rawRoot,
    manifest,
    runtimeSelections: KORP_RUNTIME_ICON_SELECTIONS,
    requiredCurrentIds: KORP_REQUIRED_CURRENT_ICON_IDS,
  })

  const selectionById = new Map(
    KORP_RUNTIME_ICON_SELECTIONS.map((selection) => [selection.id, selection]),
  )
  const catalogSource = createCatalogSource(manifest, selectionById)

  if (checkOnly) {
    checkGeneratedRuntime(manifest, selectionById, catalogSource)
  } else {
    writeGeneratedRuntime(manifest, selectionById, catalogSource)
  }

  console.log(
    `K0rp icons valid: ${manifest.icons.length} source icons, `
      + `${selectionById.size} runtime assets, 3 atlases${checkOnly ? ' (generated output clean)' : ' (generated)'}.`,
  )
} catch (error) {
  if (error instanceof KorpIconValidationError) {
    console.error(error.message)
  } else {
    console.error(error)
  }
  process.exitCode = 1
}

function createCatalogSource(manifest, selectionById) {
  const runtimeUrlLines = manifest.icons
    .filter(({ id }) => selectionById.has(id))
    .map(({ id }) => (
      `  ${JSON.stringify(id)}: new URL(`
        + `${JSON.stringify(`../assets/icons/korp-v2/${id}.png`)}, import.meta.url).href,`
    ))
    .join('\n')

  const runtimeVariantUrlLines = manifest.icons
    .filter(({ id }) => selectionById.has(id))
    .filter((icon) => Object.keys(icon.variants ?? {}).length > 0)
    .map((icon) => {
      const variants = Object.keys(icon.variants).map((state) => (
        `    ${JSON.stringify(state)}: new URL(`
          + `${JSON.stringify(`../assets/icons/korp-v2/${getVariantRuntimeName(icon.id, state)}`)}, `
          + 'import.meta.url).href,'
      )).join('\n')
      return `  ${JSON.stringify(icon.id)}: Object.freeze({\n${variants}\n  }),`
    })
    .join('\n')
  const runtimeVariantBlock = runtimeVariantUrlLines
    ? `\nconst runtimeVariantUrls = Object.freeze({\n${runtimeVariantUrlLines}\n})\n`
    : ''

  const definitionLines = manifest.icons.map((icon) => {
    const selection = selectionById.get(icon.id)
    const rawPaths = getKorpIconRawPaths(icon)
    const runtimeVariantLines = Object.keys(icon.variants ?? {}).map((state) => (
      selection
        ? `      ${JSON.stringify(state)}: runtimeVariantUrls[${JSON.stringify(icon.id)}]`
          + `?.[${JSON.stringify(state)}] ?? null,`
        : `      ${JSON.stringify(state)}: null,`
    ))
    const sourceVariantLines = Object.entries(icon.variants ?? {}).map(([state, variantPath]) => (
      `        ${JSON.stringify(state)}: ${JSON.stringify(`${KORP_ICON_RAW_ROOT}/${variantPath}`)},`
    ))
    const lines = [
      '  Object.freeze({',
      `    id: ${JSON.stringify(icon.id)},`,
      `    title: ${JSON.stringify(icon.title)},`,
      `    group: ${JSON.stringify(icon.group)},`,
      `    category: ${JSON.stringify(icon.category)},`,
      `    accent: ${JSON.stringify(icon.accent ?? null)},`,
      `    intrinsicWidth: ${manifest.sourceSize},`,
      `    intrinsicHeight: ${manifest.sourceSize},`,
      `    intendedSlots: Object.freeze(${JSON.stringify(selection?.slots ?? [])}),`,
      `    intendedSize: ${selection?.intendedSize ?? 'null'},`,
      `    runtimeUrl: runtimeUrls[${JSON.stringify(icon.id)}] ?? null,`,
      '    variants: Object.freeze({',
      ...runtimeVariantLines,
      '    }),',
      '    sourceReferences: Object.freeze({',
      `      png64: ${JSON.stringify(`${KORP_ICON_RAW_ROOT}/${rawPaths.png64}`)},`,
      `      png256: ${JSON.stringify(`${KORP_ICON_RAW_ROOT}/${rawPaths.png256}`)},`,
      `      ico: ${JSON.stringify(`${KORP_ICON_RAW_ROOT}/${rawPaths.ico}`)},`,
      '      variants: Object.freeze({',
      ...sourceVariantLines,
      '      }),',
      '    }),',
      '  }),',
    ]
    return lines.join('\n')
  }).join('\n')

  return `/* This file is generated by scripts/build-k0rp-icons.mjs. */
const runtimeUrls = Object.freeze({
${runtimeUrlLines}
})
${runtimeVariantBlock}

export const KORP_ICON_CATALOG = Object.freeze([
${definitionLines}
])

export const KORP_RUNTIME_ICON_IDS = Object.freeze(
  KORP_ICON_CATALOG.filter(({ runtimeUrl }) => Boolean(runtimeUrl)).map(({ id }) => id),
)

const iconById = new Map(KORP_ICON_CATALOG.map((icon) => [icon.id, icon]))

export function getKorpIcon(id) {
  return typeof id === 'string' ? iconById.get(id) ?? null : null
}

export function resolveKorpRuntimeIcon(id) {
  const icon = getKorpIcon(id)
  return icon?.runtimeUrl ? icon : null
}
`
}

function writeGeneratedRuntime(manifest, selectionById, catalogSource) {
  mkdirSync(runtimeRoot, { recursive: true })
  mkdirSync(dirname(catalogPath), { recursive: true })

  const runtimeCopies = getRuntimeCopies(manifest, selectionById)
  const expectedFileNames = new Set(runtimeCopies.map(({ targetName }) => targetName))
  for (const entry of readdirSync(runtimeRoot, { withFileTypes: true })) {
    if (!expectedFileNames.has(entry.name)) {
      rmSync(join(runtimeRoot, entry.name), { recursive: true, force: true })
    }
  }

  for (const copy of runtimeCopies) {
    const sourcePath = resolvePathInside(rawRoot, copy.sourceRelative, copy.label)
    copyFileSync(sourcePath, join(runtimeRoot, copy.targetName))
  }

  writeFileSync(catalogPath, catalogSource, 'utf8')
}

function checkGeneratedRuntime(manifest, selectionById, catalogSource) {
  const errors = []

  if (!existsSync(runtimeRoot)) {
    errors.push(`runtime icon root is missing: ${relative(repoRoot, runtimeRoot)}`)
  } else {
    const runtimeEntries = readdirSync(runtimeRoot, { withFileTypes: true })
    const runtimeNames = runtimeEntries
      .map(({ name }) => name)
      .sort()
    const runtimeCopies = getRuntimeCopies(manifest, selectionById)
    const expectedNames = runtimeCopies.map(({ targetName }) => targetName).sort()

    if (
      runtimeEntries.some((entry) => !entry.isFile())
      || JSON.stringify(runtimeNames) !== JSON.stringify(expectedNames)
    ) {
      errors.push('runtime icon directory must contain exactly the generated asset allowlist')
    }

    for (const copy of runtimeCopies) {
      const sourcePath = resolvePathInside(rawRoot, copy.sourceRelative, copy.label)
      const targetPath = join(runtimeRoot, copy.targetName)
      if (!existsSync(targetPath)) continue
      if (!readFileSync(sourcePath).equals(readFileSync(targetPath))) {
        errors.push(`runtime icon differs from canonical source: ${copy.targetName}`)
      }
    }
  }

  if (!existsSync(catalogPath)) {
    errors.push(`runtime catalog is missing: ${relative(repoRoot, catalogPath)}`)
  } else if (readFileSync(catalogPath, 'utf8') !== catalogSource) {
    errors.push('runtime catalog has generated drift; run npm run build:korp-icons')
  }

  if (errors.length > 0) throw new KorpIconValidationError(errors)
}

function getVariantRuntimeName(iconId, state) {
  return `${iconId}--${state}.png`
}

function getRuntimeCopies(manifest, selectionById) {
  return manifest.icons.flatMap((icon) => {
    if (!selectionById.has(icon.id)) return []

    const copies = [{
      sourceRelative: getKorpIconRawPaths(icon).png64,
      targetName: `${icon.id}.png`,
      label: `${icon.id} source`,
    }]

    for (const [state, variantPath] of Object.entries(icon.variants ?? {})) {
      copies.push({
        sourceRelative: variantPath,
        targetName: getVariantRuntimeName(icon.id, state),
        label: `${icon.id}.${state} state variant`,
      })
    }

    return copies
  })
}
