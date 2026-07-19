# K0rp UI asset pack v01 runtime contract

This directory is the dedicated curated runtime boundary for
`design/ui-source/k0rp-ui-asset-pack-v01`. It establishes the resizable window-shell
contract for Task 024A without changing any visible runtime surface.

## Ownership and boundaries

- `design/ui-source/k0rp-ui-asset-pack-v01/` is the immutable raw source pack. Preserve
  its structure, manifests, tokens, documentation and previews.
- This directory owns only the v01 contract, generated catalog and generated runtime
  subset. It is independent from `design/ui-runtime/k0rp-v3/`.
- Runtime React and CSS may consume future v01 assets only through the generated
  catalog and copied asset paths in this directory. They must never import the raw
  source tree.
- Canonical desktop icons remain under `design/icon-source/k0rp-icons-v2/` and are not
  replaced by this pack.
- Preview boards, complete 320x220 shells, baked reference screens and full source-pack
  copies are excluded from runtime output.

## Manual files

- `window-shell-contract.json` defines shared pixel-rendering rules and machine-readable
  geometry for module, audit and folder windows.
- `runtime-allowlist.json` is the only source of assets eligible for the first future
  module-window pilot. It contains 20 assets: the module nine-slice frame, active and
  inactive module headers, the repeatable dark-panel surface, and four states for pin,
  unpin, minimize and close.

Generated catalogs and copied assets are build output. Do not edit them by hand or add
unlisted files to the generated runtime subset.

## Window-shell rules

All geometry is expressed in integer logical pixels. Frames use nine-slice composition,
headers use a fixed-height horizontal three-slice, and material surfaces tile at native
resolution. Full shells and 32x32 textures must never be stretched. If scaling is ever
unavoidable, use nearest-neighbor at an integer factor; fractional transforms, smoothing,
blur and filters are outside the contract.

The frame cap insets are 8 px left, 30 px top, 8 px right and 8 px bottom. Content insets
are measured independently from the authored transparent slot: module uses 8/31/8/25 px
(left/top/right/bottom), while audit and folder use 8/31/8/8 px. The header is 27 px high,
controls are fixed at 18x16 px, and all labels remain live DOM text using the current
runtime font.

Family defaults are:

| Family | Controls | Content | Derived outer | Orientation |
| --- | ---: | ---: | ---: | --- |
| Module | pin/unpin, minimize, close | 167x167 | 183x223 | content-derived |
| Audit | minimize, close | 294x431 | 310x470 | portrait |
| Folder | minimize, close | 252x321 | 268x360 | portrait |

The 167x167 ClickAudit and Fidget content boxes are preserved exactly. The future module
chrome wraps those boxes; it may not shrink, crop or rescale them. Audit remains a live
form that can grow vertically. Folder remains a live vertically scrolling list; rows and
scrollbars are not baked into its assets.

## Pilot boundary

Task 024A performs ingestion and contract work only. The next visual task may pilot this
contract on ClickAudit and Fidget module windows. Audit and Formuláře portrait conversion
comes later, and no gameplay, progression, authorization, audit, save-state or runtime
behavior belongs in this task.

## Windows PowerShell verification

Run this from the repository checkout. Replace the first path with the local checkout
when necessary. The guard keeps every recursive clean target inside that checkout.

```powershell
Set-Location 'C:\path\to\K0rp_ware'
if (-not (Test-Path -LiteralPath '.\package.json')) { throw 'Run from the K0rp_ware repository root.' }

Get-Process -Name node -ErrorAction SilentlyContinue | Stop-Process -Force

$korpRepoRoot = (Resolve-Path -LiteralPath '.').Path
$korpCleanTargets = @(
  '.\node_modules',
  '.\dist',
  '.\packages\korp-core\node_modules',
  '.\packages\korp-modules\node_modules',
  '.\packages\korp-progression\node_modules'
)
foreach ($korpTarget in $korpCleanTargets) {
  $korpAbsoluteTarget = [System.IO.Path]::GetFullPath((Join-Path $korpRepoRoot $korpTarget))
  if (-not $korpAbsoluteTarget.StartsWith($korpRepoRoot + [System.IO.Path]::DirectorySeparatorChar)) {
    throw "Refusing to clean outside repository: $korpAbsoluteTarget"
  }
  if (Test-Path -LiteralPath $korpAbsoluteTarget) {
    Remove-Item -LiteralPath $korpAbsoluteTarget -Recurse -Force
  }
}

npm ci
npm --prefix packages/korp-core install --no-package-lock
npm --prefix packages/korp-modules install --no-package-lock
npm --prefix packages/korp-progression install --no-package-lock

npm run build:korp-ui-pack-v01
npm run validate:korp-icons
npm run validate:korp-ui-assets
npm run validate:korp-ui-pack-v01
npm run validate:korp-progression

npm run test:runtime
npm run test:runtime-save
npm run test:korp-core
npm run typecheck:korp-core
npm run test:korp-modules
npm run typecheck:korp-modules
npm run typecheck:korp-progression
npm run build

npm run dev -- --host 127.0.0.1 --port 5173 --strictPort
```

Open `http://127.0.0.1:5173/` while the final command is running.
