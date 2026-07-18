import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import {
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  symlinkSync,
  writeFileSync,
} from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join } from 'node:path'
import test from 'node:test'
import {
  KorpUiAssetValidationError,
  auditKorpUiChecksums,
  parseKorpUiJson,
  scanKorpUiRuntimeCopies,
  scanKorpUiRuntimeImports,
  validateKorpUiAllowlist,
  validateKorpUiAssetFiles,
  validateKorpUiManifest,
} from '../lib/korp-ui-asset-validation.mjs'
import { runKorpUiAssetValidation } from '../validate-korp-ui-assets.mjs'

const baseAsset = () => ({
  id: 'window.audit.frame',
  category: 'windows/frames',
  name: 'window_audit_frame',
  role: 'window-frame',
  description_cs: 'fixture',
  path_native: 'assets/native/windows/frames/window_audit_frame.png',
  path_2x: 'assets/2x/windows/frames/window_audit_frame@2x.png',
  path_webp: 'assets/webp/windows/frames/window_audit_frame.webp',
  width: 10,
  height: 10,
  has_alpha: true,
  alpha_bbox: [0, 0, 10, 10],
  source_board: 'windows',
  source_rect: [0, 0, 10, 10],
  derived_from: null,
  state: null,
  semantic: null,
  text_baked: false,
  content_rect: [2, 2, 6, 6],
  nine_slice: { left: 2, top: 2, right: 2, bottom: 2 },
  production_status: 'production',
  notes: null,
})

const baseManifest = () => ({
  version: '3.0',
  asset_count: 1,
  assets: [baseAsset()],
})

const allowlistFor = (...assetIds) => ({
  schemaVersion: 1,
  targetTask: '022A(2.2)',
  scope: 'fixture',
  sourceRoot: 'design/ui-source/k0rp-os-ui-assets-v3',
  copyAssets: false,
  groups: [{ id: 'fixture-group', purpose: 'fixture', assetIds }],
})

const baseValidationSummary = () => ({
  atlases: 0,
  atlasFrames: 0,
  bytes: 1,
  files: 1,
  nineSliceFamilies: 0,
  nineSlicePieces: 0,
  pilotAssets: 1,
  productionAssets: 1,
  referenceAssets: 0,
  semanticAssets: 1,
  windowFamilies: 0,
})

test('valid minimal manifest and runtime selection pass', () => {
  const manifest = baseManifest()
  assert.equal(validateKorpUiManifest(manifest), manifest)
  assert.deepEqual(validateKorpUiAllowlist(allowlistFor('window.audit.frame'), manifest), [
    'window.audit.frame',
  ])

  const copyEnabled = allowlistFor('window.audit.frame')
  copyEnabled.copyAssets = true
  assert.deepEqual(validateKorpUiAllowlist(copyEnabled, manifest), ['window.audit.frame'])

  const malformedCopyFlag = allowlistFor('window.audit.frame')
  malformedCopyFlag.copyAssets = 'yes'
  assert.throws(
    () => validateKorpUiAllowlist(malformedCopyFlag, manifest),
    /runtime allowlist copyAssets must be a boolean/,
  )
})

test('malformed required JSON fails with a deterministic diagnostic', () => {
  assert.throws(
    () => parseKorpUiJson('{ broken', 'manifest.json'),
    (error) => error instanceof KorpUiAssetValidationError
      && error.message.includes('manifest.json is malformed'),
  )
})

test('duplicate semantic IDs fail closed', () => {
  const manifest = baseManifest()
  manifest.assets.push({ ...manifest.assets[0] })
  manifest.asset_count = manifest.assets.length
  assert.throws(() => validateKorpUiManifest(manifest), /duplicate semantic asset id: window\.audit\.frame/)
})

test('case-insensitive duplicate paths fail on every host platform', () => {
  const manifest = baseManifest()
  const collision = {
    ...baseAsset(),
    id: 'window.audit.content',
    path_native: 'assets/native/WINDOWS/frames/window_audit_frame.png',
    path_2x: 'assets/2x/WINDOWS/frames/window_audit_frame@2x.png',
    path_webp: 'assets/webp/WINDOWS/frames/window_audit_frame.webp',
  }
  manifest.assets.push(collision)
  manifest.asset_count = manifest.assets.length
  assert.throws(() => validateKorpUiManifest(manifest), /case-insensitive duplicate manifest asset path/)
})

test('unsafe traversal and malformed dimensions or content rectangles fail', () => {
  const unsafe = baseManifest()
  unsafe.assets[0].path_native = '../escape.png'
  assert.throws(() => validateKorpUiManifest(unsafe), /escapes or is not canonical/)

  const invalidDimensions = baseManifest()
  invalidDimensions.assets[0].width = 0
  assert.throws(() => validateKorpUiManifest(invalidDimensions), /dimensions must be positive integers/)

  const malformedContentRect = baseManifest()
  malformedContentRect.assets[0].content_rect = [8, 8, 4, 4]
  assert.throws(() => validateKorpUiManifest(malformedContentRect), /content_rect exceeds declared/)
})

test('missing required production assets fail pack validation', () => {
  const fixtureRoot = mkdtempSync(join(tmpdir(), 'korp-ui-missing-fixture-'))
  try {
    assert.throws(
      () => validateKorpUiAssetFiles({ rawRoot: fixtureRoot, manifest: baseManifest() }),
      /missing production asset for window\.audit\.frame/,
    )
  } finally {
    rmSync(fixtureRoot, { recursive: true, force: true })
  }
})

test('declared dimensions that disagree with PNG or WebP headers fail', () => {
  const fixtureRoot = mkdtempSync(join(tmpdir(), 'korp-ui-dimension-fixture-'))
  const asset = baseAsset()
  try {
    writeFixtureFile(fixtureRoot, asset.path_native, createPngHeader(11, 10))
    writeFixtureFile(fixtureRoot, asset.path_2x, createPngHeader(20, 20))
    writeFixtureFile(fixtureRoot, asset.path_webp, createLosslessWebpHeader(10, 10))
    assert.throws(
      () => validateKorpUiAssetFiles({ rawRoot: fixtureRoot, manifest: baseManifest() }),
      /window_audit_frame\.png is 11x10; expected 10x10/,
    )
  } finally {
    rmSync(fixtureRoot, { recursive: true, force: true })
  }
})

test('an established nine-slice family with a missing piece fails', () => {
  const parent = baseAsset()
  const dimensions = {
    b: [6, 2],
    bl: [2, 2],
    br: [2, 2],
    c: [6, 6],
    l: [2, 6],
    r: [2, 6],
    t: [6, 2],
    tl: [2, 2],
    tr: [2, 2],
  }
  const pieces = Object.entries(dimensions).map(([piece, [width, height]]) => ({
    ...baseAsset(),
    id: `${parent.id}.slice.${piece}`,
    category: 'nine_slice',
    name: `window_audit_frame_${piece}`,
    role: 'nine-slice-piece',
    path_native: `assets/native/nine_slice/window_audit_frame_${piece}.png`,
    path_2x: `assets/2x/nine_slice/window_audit_frame_${piece}@2x.png`,
    path_webp: `assets/webp/nine_slice/window_audit_frame_${piece}.webp`,
    width,
    height,
    alpha_bbox: [0, 0, width, height],
    source_board: null,
    source_rect: null,
    derived_from: parent.id,
    content_rect: null,
    nine_slice: null,
  }))
  const manifest = {
    version: '3.0',
    asset_count: pieces.length,
    assets: [parent, ...pieces.slice(0, -1)],
  }

  assert.throws(
    () => validateKorpUiManifest(manifest),
    /nine-slice family window\.audit\.frame is missing pieces: tr/,
  )

  const referencePiece = { ...pieces.at(-1), production_status: 'reference', text_baked: true }
  const statusMismatchManifest = {
    version: '3.0',
    asset_count: pieces.length + 1,
    assets: [parent, ...pieces.slice(0, -1), referencePiece],
  }
  assert.throws(
    () => validateKorpUiManifest(statusMismatchManifest),
    /production_status reference does not match nine-slice parent window\.audit\.frame \(production\)/,
  )
})

test('unknown, reference-only and duplicate runtime selection IDs fail', () => {
  const manifest = baseManifest()
  const reference = {
    ...baseAsset(),
    id: 'window.audit.reference',
    name: 'window_audit_reference',
    role: 'window-reference',
    path_native: 'assets/native/windows/reference/window_audit_reference.png',
    path_2x: 'assets/2x/windows/reference/window_audit_reference@2x.png',
    path_webp: 'assets/webp/windows/reference/window_audit_reference.webp',
    production_status: 'reference',
    text_baked: true,
  }
  manifest.assets.push(reference)
  const bakedTemplate = {
    ...baseAsset(),
    id: 'document.audit_00a.template',
    category: 'documents/templates',
    name: 'document_audit_00a_template',
    role: 'document-template',
    path_native: 'assets/native/documents/templates/document_audit_00a_template.png',
    path_2x: 'assets/2x/documents/templates/document_audit_00a_template@2x.png',
    path_webp: 'assets/webp/documents/templates/document_audit_00a_template.webp',
    text_baked: true,
  }
  manifest.assets.push(bakedTemplate)
  manifest.asset_count = manifest.assets.length

  assert.throws(
    () => validateKorpUiAllowlist(
      allowlistFor(
        'window.audit.frame',
        'window.audit.frame',
        'missing.asset',
        reference.id,
        bakedTemplate.id,
      ),
      manifest,
    ),
    (error) => error.message.includes('duplicate runtime-selection id: window.audit.frame')
      && error.message.includes('runtime allowlist references unknown asset: missing.asset')
      && error.message.includes('runtime allowlist references reference-only asset: window.audit.reference')
      && error.message.includes('runtime allowlist references baked/template runtime copy: document.audit_00a.template'),
  )
})

test('known auxiliary stale checksum paths produce stable warnings', () => {
  const fixtureRoot = mkdtempSync(join(tmpdir(), 'korp-ui-checksum-fixture-'))
  try {
    const readme = Buffer.from('fixture')
    writeFixtureFile(fixtureRoot, 'README.md', readme)
    const checksumSource = [
      `${createHash('sha256').update(readme).digest('hex')}  README.md`,
      `${'0'.repeat(64)}  qa/windows.png`,
      '',
    ].join('\n')

    const first = auditKorpUiChecksums({ rawRoot: fixtureRoot, source: checksumSource })
    const second = auditKorpUiChecksums({ rawRoot: fixtureRoot, source: checksumSource })
    const windowsLineEndings = auditKorpUiChecksums({
      rawRoot: fixtureRoot,
      source: checksumSource.replaceAll('\n', '\r\n'),
    })
    assert.deepEqual(first.warnings, second.warnings)
    assert.deepEqual(first.warnings, windowsLineEndings.warnings)
    assert.deepEqual(first.warnings, [{
      code: 'AUX_QA_BOARD_SHEETS_OMITTED',
      severity: 'warning',
      message: '1 optional QA board sheets remain in checksums but are absent from the snapshot',
      paths: ['qa/windows.png'],
    }])

    const unsafeMissingSource = `${checksumSource}${'0'.repeat(64)}  assets/native/deleted-production.png\n`
    assert.throws(
      () => auditKorpUiChecksums({ rawRoot: fixtureRoot, source: unsafeMissingSource }),
      /checksum references missing non-auxiliary path: assets\/native\/deleted-production\.png/,
    )

    const caseCollisionSource = [
      `${createHash('sha256').update(readme).digest('hex')}  README.md`,
      `${createHash('sha256').update(readme).digest('hex')}  readme.md`,
      '',
    ].join('\n')
    assert.throws(
      () => auditKorpUiChecksums({ rawRoot: fixtureRoot, source: caseCollisionSource }),
      /duplicate checksum path \(case-insensitive\): readme\.md/,
    )
  } finally {
    rmSync(fixtureRoot, { recursive: true, force: true })
  }
})

test('known warning-only validation reports PASS and WARN on stdout without source mutation', () => {
  const fixtureRoot = mkdtempSync(join(tmpdir(), 'korp-ui-warning-cli-fixture-'))
  try {
    const readme = Buffer.from('source fixture must remain byte-identical')
    writeFixtureFile(fixtureRoot, 'README.md', readme)
    const checksumSource = [
      `${createHash('sha256').update(readme).digest('hex')}  README.md`,
      `${'0'.repeat(64)}  qa/windows.png`,
      '',
    ].join('\r\n')
    const before = readFileSync(join(fixtureRoot, 'README.md'))
    const capture = createValidationCapture()

    const exitCode = runKorpUiAssetValidation({
      writeOutput: false,
      validate: () => ({
        summary: baseValidationSummary(),
        warnings: auditKorpUiChecksums({ rawRoot: fixtureRoot, source: checksumSource }).warnings,
        writeOutput: false,
      }),
      stdout: capture.stdout,
      stderr: capture.stderr,
    })

    assert.equal(exitCode, 0)
    assert.match(capture.output.stdout, /^PASS WITH 1 KNOWN SOURCE WARNING:/)
    assert.match(capture.output.stdout, /WARN \[AUX_QA_BOARD_SHEETS_OMITTED\]:/)
    assert.equal(capture.output.stderr, '')
    assert.deepEqual(readFileSync(join(fixtureRoot, 'README.md')), before)

    const cleanCapture = createValidationCapture()
    assert.equal(runKorpUiAssetValidation({
      writeOutput: false,
      validate: () => ({
        summary: baseValidationSummary(),
        warnings: [],
        writeOutput: false,
      }),
      stdout: cleanCapture.stdout,
      stderr: cleanCapture.stderr,
    }), 0)
    assert.match(cleanCapture.output.stdout, /^PASS:/)
    assert.doesNotMatch(cleanCapture.output.stdout, /WARN/)
    assert.equal(cleanCapture.output.stderr, '')
  } finally {
    rmSync(fixtureRoot, { recursive: true, force: true })
  }
})

test('missing production fixture reports FAIL on stderr and exits non-zero', () => {
  const fixtureRoot = mkdtempSync(join(tmpdir(), 'korp-ui-failure-cli-fixture-'))
  try {
    const capture = createValidationCapture()
    const exitCode = runKorpUiAssetValidation({
      validate: () => validateKorpUiAssetFiles({ rawRoot: fixtureRoot, manifest: baseManifest() }),
      stdout: capture.stdout,
      stderr: capture.stderr,
    })

    assert.equal(exitCode, 1)
    assert.equal(capture.output.stdout, '')
    assert.match(capture.output.stderr, /^FAIL: K0rp UI asset validation failed:/)
    assert.match(capture.output.stderr, /missing production asset for window\.audit\.frame/)
  } finally {
    rmSync(fixtureRoot, { recursive: true, force: true })
  }
})

test('runtime source imports from the raw snapshot fail a deterministic scan', () => {
  const fixtureRoot = mkdtempSync(join(tmpdir(), 'korp-ui-runtime-scan-fixture-'))
  try {
    writeFixtureFile(
      fixtureRoot,
      'src/bad.js',
      Buffer.from("import raw from '../design/ui-source/k0rp-os-ui-assets-v3/manifest.json'\n"),
    )
    assert.throws(
      () => scanKorpUiRuntimeImports({ repoRoot: fixtureRoot, scanRoots: ['src'] }),
      /raw UI source is referenced by runtime source: src\/bad\.js:1/,
    )
  } finally {
    rmSync(fixtureRoot, { recursive: true, force: true })
  }
})

test('byte-identical raw files copied into runtime roots fail a deterministic scan', () => {
  const fixtureRoot = mkdtempSync(join(tmpdir(), 'korp-ui-runtime-copy-fixture-'))
  try {
    const rawRoot = join(fixtureRoot, 'raw')
    const rawBytes = Buffer.from('canonical raw fixture bytes')
    writeFixtureFile(rawRoot, 'assets/native/example.png', rawBytes)
    writeFixtureFile(fixtureRoot, 'public/dist/renamed.bin', rawBytes)

    assert.throws(
      () => scanKorpUiRuntimeCopies({
        repoRoot: fixtureRoot,
        rawRoot,
        scanRoots: ['public'],
      }),
      /raw UI source file was copied into runtime source: public\/dist\/renamed\.bin/,
    )
  } finally {
    rmSync(fixtureRoot, { recursive: true, force: true })
  }
})

test('only the sanctioned generated runtime root bypasses the blanket raw-copy rejection', () => {
  const fixtureRoot = mkdtempSync(join(tmpdir(), 'korp-ui-sanctioned-copy-fixture-'))
  try {
    const rawRoot = join(fixtureRoot, 'raw')
    const rawBytes = Buffer.from('allowlisted generated runtime bytes')
    writeFixtureFile(rawRoot, 'assets/2x/example@2x.png', rawBytes)
    writeFixtureFile(fixtureRoot, 'src/assets/ui/korp-v3/example.png', rawBytes)

    const result = scanKorpUiRuntimeCopies({
      repoRoot: fixtureRoot,
      rawRoot,
      scanRoots: ['src', 'public'],
      allowedCopyRoots: ['src/assets/ui/korp-v3'],
    })
    assert.deepEqual(result.matches, [])
    assert.deepEqual(result.allowedMatches, [{
      path: 'src/assets/ui/korp-v3/example.png',
      rawPaths: ['assets/2x/example@2x.png'],
    }])

    writeFixtureFile(fixtureRoot, 'public/unauthorized-copy.png', rawBytes)
    assert.throws(
      () => scanKorpUiRuntimeCopies({
        repoRoot: fixtureRoot,
        rawRoot,
        scanRoots: ['src', 'public'],
        allowedCopyRoots: ['src/assets/ui/korp-v3'],
      }),
      (error) => error.message.includes(
        'raw UI source file was copied into runtime source: public/unauthorized-copy.png',
      ) && !error.message.includes('src/assets/ui/korp-v3/example.png'),
    )
  } finally {
    rmSync(fixtureRoot, { recursive: true, force: true })
  }
})

test('a raw file symlink inside a runtime root cannot bypass copy detection', (context) => {
  const fixtureRoot = mkdtempSync(join(tmpdir(), 'korp-ui-runtime-symlink-fixture-'))
  try {
    const rawRoot = join(fixtureRoot, 'raw')
    const rawPath = join(rawRoot, 'assets/native/example.png')
    writeFixtureFile(rawRoot, 'assets/native/example.png', Buffer.from('canonical raw symlink fixture'))
    mkdirSync(join(fixtureRoot, 'public'), { recursive: true })
    try {
      symlinkSync(rawPath, join(fixtureRoot, 'public/linked.png'), 'file')
    } catch (error) {
      if (error.code === 'EPERM') {
        context.skip('file symlinks require Windows Developer Mode or elevated privileges')
        return
      }
      throw error
    }

    assert.throws(
      () => scanKorpUiRuntimeCopies({
        repoRoot: fixtureRoot,
        rawRoot,
        scanRoots: ['public'],
      }),
      /raw UI source file was copied into runtime source: public\/linked\.png/,
    )
  } finally {
    rmSync(fixtureRoot, { recursive: true, force: true })
  }
})

test('runtime scan rejects symlinks that escape the repository', (context) => {
  const fixtureRoot = mkdtempSync(join(tmpdir(), 'korp-ui-runtime-outside-fixture-'))
  const outsideRoot = mkdtempSync(join(tmpdir(), 'korp-ui-runtime-outside-target-'))
  try {
    const rawRoot = join(fixtureRoot, 'raw')
    writeFixtureFile(rawRoot, 'assets/native/example.png', Buffer.from('raw fixture'))
    writeFixtureFile(outsideRoot, 'unrelated.png', Buffer.from('outside fixture'))
    mkdirSync(join(fixtureRoot, 'public'), { recursive: true })
    try {
      symlinkSync(
        outsideRoot,
        join(fixtureRoot, 'public/outside'),
        process.platform === 'win32' ? 'junction' : 'dir',
      )
    } catch (error) {
      if (error.code === 'EPERM') {
        context.skip('directory symlinks require Windows Developer Mode or elevated privileges')
        return
      }
      throw error
    }

    assert.throws(
      () => scanKorpUiRuntimeCopies({
        repoRoot: fixtureRoot,
        rawRoot,
        scanRoots: ['public'],
      }),
      /runtime scan symlink escapes repository: public\/outside/,
    )
  } finally {
    rmSync(fixtureRoot, { recursive: true, force: true })
    rmSync(outsideRoot, { recursive: true, force: true })
  }
})

test('normalized inventory has stable ordering and no absolute local paths', () => {
  const inventorySource = readFileSync('design/ui-runtime/k0rp-v3/inventory.json', 'utf8')
  const inventory = JSON.parse(inventorySource)
  const assetIds = inventory.assets.map((asset) => asset.id)

  assert.deepEqual(assetIds, [...assetIds].sort())
  assert.equal(inventory.runtimeBoundary.selectedAssets, 45)
  assert.equal(/[a-z]:[\\/]/i.test(inventorySource), false)
  assert.equal(inventorySource.includes('C:\\Users\\'), false)
})

function writeFixtureFile(root, relativePath, contents) {
  const filePath = join(root, ...relativePath.split('/'))
  mkdirSync(dirname(filePath), { recursive: true })
  writeFileSync(filePath, contents)
}

function createValidationCapture() {
  const output = { stderr: '', stdout: '' }
  return {
    output,
    stderr: { write: (chunk) => { output.stderr += chunk } },
    stdout: { write: (chunk) => { output.stdout += chunk } },
  }
}

function createPngHeader(width, height) {
  const buffer = Buffer.alloc(26)
  Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]).copy(buffer, 0)
  buffer.writeUInt32BE(13, 8)
  buffer.write('IHDR', 12, 'ascii')
  buffer.writeUInt32BE(width, 16)
  buffer.writeUInt32BE(height, 20)
  buffer.writeUInt8(8, 24)
  buffer.writeUInt8(6, 25)
  return buffer
}

function createLosslessWebpHeader(width, height) {
  const buffer = Buffer.alloc(26)
  buffer.write('RIFF', 0, 'ascii')
  buffer.writeUInt32LE(buffer.length - 8, 4)
  buffer.write('WEBP', 8, 'ascii')
  buffer.write('VP8L', 12, 'ascii')
  buffer.writeUInt32LE(5, 16)
  buffer.writeUInt8(0x2f, 20)
  buffer.writeUInt32LE((width - 1) | ((height - 1) << 14), 21)
  return buffer
}
