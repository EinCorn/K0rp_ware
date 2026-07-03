import { copyFileSync, mkdirSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), '..')

const files = [
  {
    source: 'desktop/shared/k0rp-ui/korp-shell.css',
    targets: [
      'desktop/click-audit/src/k0rp-ui/korp-shell.css',
      'desktop/fidget/src/k0rp-ui/korp-shell.css',
      'desktop/bloom-desktop/src/k0rp-ui/korp-shell.css',
    ],
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
