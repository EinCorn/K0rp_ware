# K0rp UI asset pack v01 runtime contract

This directory is the dedicated curated runtime boundary for
`design/ui-source/k0rp-ui-asset-pack-v01`. It preserves the family-level resize
contract from Task 024A while defining the fixed authored compact-module pilot used by
Task 024B.

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
- Preview boards, historical 320x220 shells, baked reference screens and full
  source-pack copies are excluded from runtime output.

## Manual files

- `window-shell-contract.json` defines shared pixel-rendering rules and machine-readable
  geometry for module, audit and folder windows.
- `runtime-allowlist.json` is the only source of assets eligible for the Task 024B
  module-window pilot. It contains 19 assets: two fixed authored 183x223 module shells,
  the repeatable dark-panel surface, and four states for pin, unpin, minimize and close.

Generated catalogs and copied assets are build output. Do not edit them by hand or add
unlisted files to the generated runtime subset.

## Window-shell rules

All geometry is expressed in integer logical pixels. The Task 024B compact module uses
the authored active or inactive 183x223 shell directly at 1:1; switching focus changes
only that selected fixed asset. It is not a resizable nine-slice solution, and resize
composition is deferred until a separate authored export contract exists. Audit, folder
and future family work may still use explicitly prepared nine-slice frames and
fixed-height horizontal three-slice headers. Material surfaces tile at native resolution.
Full shells and 32x32 textures must never be stretched. Fractional transforms, smoothing,
blur and filters are outside the contract.

The future slice-frame cap insets remain 8 px left, 30 px top, 8 px right and 8 px
bottom. The fixed module viewport uses the measured authored transparent rect directly:
5/28/5/22 px (left/top/right/bottom), producing a 173x173 content viewport inside the
183x223 shell. Live content and clipping use that exact top-left-anchored integer rect.
For device-pixel seam insurance, the opaque backing and repeated surface alone use its
one-pixel expansion at x4/y27 with size 175x175; the authored shell masks this underlay,
which remains clipped inside the outer rect. The tile origin stays anchored to the
content rect. Percentage sizing, derived centering and translate-based placement are
forbidden. Audit and folder continue to use 8/31/8/8 px content insets.
Compact-module controls are fixed at 18x16 px and align to the authored slots at y=5;
all labels remain live DOM text using the current runtime font.

Family defaults are:

| Family | Controls | Content | Derived outer | Orientation |
| --- | ---: | ---: | ---: | --- |
| Module | pin/unpin, minimize, close | 173x173 | 183x223 | content-derived |
| Audit | minimize, close | 294x431 | 310x470 | portrait |
| Folder | minimize, close | 252x321 | 268x360 | portrait |

The embedded ClickAudit and Fidget viewports both use the exact 173x173 authored cutout.
Their intrinsic gameplay artwork is not rescaled: the Fidget rotor remains 132x132 and
ClickAudit keeps its existing digit and effect sizing. The standalone 181px app windows
retain their existing 167x167 inner boxes. Audit remains a live form that can grow
vertically. Folder remains a live vertically scrolling list; rows and scrollbars are not
baked into its assets.

## Pilot boundary

Task 024B applies the fixed compact shell only to embedded ClickAudit and Fidget windows.
The old module nine-slice and separate headers remain cataloged for future contract work
but are not copied into the pilot runtime subset. Audit and Formuláře portrait conversion
comes later, and gameplay, progression, authorization, audit and save-state behavior stay
outside this visual integration.

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
npm --prefix packages/korp-core install --no-save --no-package-lock
npm --prefix packages/korp-modules install --no-save --no-package-lock
npm --prefix packages/korp-progression install --no-save --no-package-lock

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

npm.cmd run dev -- --host=127.0.0.1 --port=5173 --strictPort
```

Open `http://127.0.0.1:5173/` while the final command is running.
