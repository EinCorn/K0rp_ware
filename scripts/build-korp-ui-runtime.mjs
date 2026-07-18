import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import {
  buildKorpUiRuntime,
  KorpUiRuntimeBuildError,
} from './lib/korp-ui-runtime-build.mjs'

const scriptDirectory = dirname(fileURLToPath(import.meta.url))
const repoRoot = resolve(scriptDirectory, '..')
const checkOnly = process.argv.includes('--check')

try {
  const summary = buildKorpUiRuntime({ repoRoot, checkOnly })
  console.log(
    `K0rp UI runtime valid: ${summary.assets} @2x assets / ${summary.bytes} bytes, `
      + `${summary.groups} groups, ${summary.windowFamilies} window families `
      + `${checkOnly ? '(generated output clean)' : '(generated)'}.`,
  )
} catch (error) {
  if (error instanceof KorpUiRuntimeBuildError) console.error(error.message)
  else console.error(error)
  process.exitCode = 1
}
