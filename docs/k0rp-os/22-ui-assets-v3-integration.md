# K0rp_OS UI assets V3 — source and validation contract

## Scope

Task 022A(2.1) establishes a trustworthy source boundary for later visual integration. It does not convert any player-visible UI and does not copy raw assets into the Vite runtime graph.

```text
design/ui-source/k0rp-os-ui-assets-v3/       canonical raw source snapshot
design/ui-runtime/k0rp-v3/inventory.json     generated normalized inventory
design/ui-runtime/k0rp-v3/runtime-allowlist.json maintained Task 022A(2.2) boundary
src/assets/                                  unchanged by this task
```

Commands:

```text
npm run build:korp-ui-assets     regenerate only the normalized inventory
npm run validate:korp-ui-assets  validate source, allowlist and generated drift
```

Both commands are offline and use only Node built-ins. The generator never rewrites the raw snapshot, its checksums or the runtime allowlist.

## Actual source snapshot

The committed source is an exact mirror of the reviewed local V3 kit.

| Inventory item | Actual value |
|---|---:|
| Total files | 1,494 |
| Total bytes | 16,733,914 |
| Semantic assets | 493 |
| Production assets | 436 |
| Reference-only assets | 57 |
| Native PNG | 493 |
| Nearest-neighbour `@2x` PNG | 493 |
| Lossless WebP | 493 |
| Atlas PNG sheets | 4 |
| Auxiliary/non-payload files | 15 |
| Content rectangles | 138 |
| Cap-inset declarations | 109 |
| Materialized nine-slice families | 11 |
| Materialized nine-slice pieces | 99 semantic / 297 format files |
| Window metric families | 8 |
| Atlas frames | 48 |

The manifest has 52 categories and 56 functional roles. All 493 asset IDs and all 1,479 format paths are unique. Every production/reference payload has one native PNG, one exact-dimension `@2x` PNG and one lossless WebP. There are no missing manifest paths, unsafe paths, case-insensitive path collisions, dimension mismatches or orphan payload files.

`qa/report.json` covers all 493 assets with zero failures. `manifest.csv` and `manifest.json` contain the same 493 IDs. The local `index.html` gallery references the production set; no physical source-board or preview PNG is included in this snapshot.

Source-board provenance remains machine-readable in the manifest: 310 assets reference `bars`, `controls`, `documents`, `master` or `windows` source rectangles. Those labels are provenance, not paths that the runtime should load.

## Window, nine-slice and atlas readiness

The eight consistent window families are:

```text
audit
compact_module
document_memo
folder
lock_panel
standard_module
system_modal
toast
```

Each family has matching production frame, content surface and fixed composite metadata. `window.folder` additionally supplies `window.folder.list_surface`.

Only 11 parents intentionally materialize nine separate pieces: three bar materials and all eight window frames. The other 98 assets with cap-inset metadata are resizable whole assets and are not missing pieces.

The atlas bundle contains:

| Atlas | Dimensions | Frames |
|---|---:|---:|
| Window controls | 280×160 | 28 |
| Digits | 360×36 | 10 |
| Lamps | 240×48 | 5 |
| Taskbar states | 160×800 | 5 |

Every atlas frame is within bounds, names an existing manifest ID and matches its declared dimensions.

## Validation and readiness model

`npm run validate:korp-ui-assets` fails closed for:

- malformed required JSON or manifest structure;
- duplicate semantic IDs, duplicate format paths or duplicate runtime selections;
- missing production assets, unsafe/path-escaping paths or manifest path mismatches;
- native, `@2x` or WebP dimensions that disagree with headers;
- malformed/out-of-bounds content rectangles or cap insets;
- an incomplete materialized nine-slice family;
- invalid atlas/window-metric/QA references;
- unknown, reference-only or icon-like runtime allowlist selections;
- checksum mismatches for files that exist;
- generated inventory drift;
- a deterministic runtime-source reference to the raw V3 root;
- a byte-identical raw source file copied into `src`, `public`, `packages` or `desktop`.

Every normalized asset is classified as `core-now`, `derived-piece`, `later-state`, `reference-only` or `flavor-later`. The inventory stores relative source paths, intrinsic/header dimensions, byte sizes, SHA-256 values, category/role, production status, content/nine-slice metadata and pilot selection state. It contains no absolute Windows paths or timestamps.

## Packaging findings

Blocking runtime-source findings: **none**.

Four stable non-blocking warnings preserve upstream packaging truth without mutating the snapshot:

1. `SHA256SUMS.txt` has 106 stale paths under absent `icons/k0rp_icons_v2/`. The separately integrated `design/icon-source/k0rp-icons-v2/` remains authoritative and must not be duplicated.
2. Six auxiliary QA overview sheets remain in checksums but are absent: `qa/bars.png`, `qa/controls.png`, `qa/documents.png`, `qa/system.png`, `qa/textures.png`, `qa/windows.png`.
3. README documents a top-level `nine_slice/`; actual pieces live under `assets/{native,2x,webp}/nine_slice`.
4. README and `tokens.json` state that the nested icon snapshot is included, although it is intentionally absent.

The checksum file contains 1,605 well-formed unique entries. All 1,493 paths that exist in the snapshot are covered and hash correctly; the 112 absent auxiliary paths above are reported, never regenerated or silently removed.

## Task 022A(2.2) runtime allowlist

The maintained pilot boundary contains exactly 45 unique, production, text-free semantic IDs:

| Pilot group | Count | Boundary |
|---|---:|---|
| Audit window | 11 | `window.audit.frame`, `window.audit.content`, 9 frame pieces |
| Formuláře folder window | 12 | frame, content/list surfaces, 9 frame pieces |
| Titlebar materials | 2 | active and inactive blanks |
| Window controls | 8 | close/minimize × disabled/hover/normal/pressed |
| Audit controls | 11 | 4 button, 4 checkbox and 3 radio states |
| Folder row | 1 | blank resizable row |

This allowlist is metadata only; Task 022A(2.1) copies zero assets into runtime.

The fixed `composite_blank` files remain source alternatives to `content → runtime content → frame` composition and are deliberately excluded from the pilot boundary. The independent baked `document.audit_00a.template` is also excluded: reference/example screens and document templates are not player-facing runtime copy. Existing React data remains authoritative for Audit text and Formuláře status text.

Canonical icons continue to come only from `design/icon-source/k0rp-icons-v2` and its generated runtime subset. ClickAudit and Fidget retain their existing asset-backed module surfaces. Compact/standard modules, memo/modal/toast/lock families, bars, taskbar, extra controls, status language, textures and flavor surfaces remain reserved for Tasks 022A(2.3–2.5) or later.
