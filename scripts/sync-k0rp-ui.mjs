import { copyFileSync, mkdirSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), '..')

const apps = ['desktop/click-audit', 'desktop/fidget', 'desktop/bloom-desktop']

const files = [
  {
    source: 'desktop/shared/k0rp-ui/korp-shell.css',
    targets: apps.map((app) => `${app}/src/k0rp-ui/korp-shell.css`),
  },
  {
    source: 'desktop/shared/k0rp-ui/assets/app-shell.webp',
    targets: apps.map((app) => `${app}/src/assets/app-shell.webp`),
  },
  {
    source: 'desktop/shared/k0rp-ui/assets/korp-ui-close.png',
    targets: apps.map((app) => `${app}/src/assets/korp-ui-close.png`),
  },
  {
    source: 'desktop/shared/k0rp-ui/assets/korp-ui-pin.png',
    targets: apps.map((app) => `${app}/src/assets/korp-ui-pin.png`),
  },
  {
    source: 'desktop/shared/k0rp-ui/assets/korp-ui-reset.webp',
    targets: apps.map((app) => `${app}/src/assets/korp-ui-reset.webp`),
  },
]

for (const { source, targets } of files) {
  const sourcePath = join(repoRoot, source)

  for (const target of targets) {
    const targetPath = join(repoRoot, target)
    mkdirSync(dirname(targetPath), { recursive: true })
    copyFileSync(sourcePath, targetPath)
    console.log(`synced ${source} -> ${target}`)
  }
}
