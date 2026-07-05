import { copyFileSync, mkdirSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), '..')
const apps = ['desktop/click-audit', 'desktop/fidget', 'desktop/bloom-desktop']

function appTargets(path) {
  return apps.map((app) => app + path)
}

const files = [
  ['desktop/shared/k0rp-ui/korp-shell.css', appTargets('/src/k0rp-ui/korp-shell.css')],
  ['desktop/shared/k0rp-ui/korp-runtime.css', appTargets('/src/k0rp-ui/korp-runtime.css')],
  ['desktop/shared/k0rp-ui/assets/app-shell.webp', appTargets('/src/assets/app-shell.webp')],
  ['desktop/shared/k0rp-ui/assets/app-window.png', appTargets('/src/assets/app-window.png')],
  ['desktop/shared/k0rp-ui/assets/korp-ui-close.png', appTargets('/src/assets/korp-ui-close.png')],
  ['desktop/shared/k0rp-ui/assets/korp-ui-pin.png', appTargets('/src/assets/korp-ui-pin.png')],
  ['desktop/shared/k0rp-ui/assets/korp-ui-reset.webp', appTargets('/src/assets/korp-ui-reset.webp')],
]

for (const [source, targets] of files) {
  const sourcePath = join(repoRoot, source)
  for (const target of targets) {
    const targetPath = join(repoRoot, target)
    mkdirSync(dirname(targetPath), { recursive: true })
    copyFileSync(sourcePath, targetPath)
    console.log('synced ' + source + ' -> ' + target)
  }
}
