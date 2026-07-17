# K0rp icon integration

## Source of truth

Canonical raw source lives at:

```text
design/icon-source/k0rp-icons-v2/
```

`manifest.json` is the semantic authority. The pack is retained unchanged, including its auxiliary files and known inconsistencies. Paths are derived narrowly from manifest `group` + `id` using the directory convention documented by the pack:

```text
png/64/<group>/<id>.png
png/256/<group>/<id>.png
ico/<group>/<id>.ico
```

The raw pack contains 106 files / 937,843 bytes:

- `README.md`, `manifest.json`, `manifest_cz_utf8.csv`;
- `atlases/atlas.json` plus module, system and combined PNG atlases;
- three preview contact sheets;
- 32 PNG64, 32 PNG256 and 32 multi-frame ICO files.

There are 12 module IDs and 20 system IDs. Every canonical PNG64 is RGBA8 with binary transparency. PNG256 is an exact nearest-neighbor 4× rendition. ICO contains 16, 24, 32, 48, 64, 128 and 256px 32bpp frames and remains a native-format reference, not the browser source.

The pack supplies no SVG, WebP, ICNS, window-control IDs or declared normal/hover/active/locked/disabled variants. It also supplies no separate LICENSE/NOTICE/provenance file. `README.md` names a nonexistent `manifest.csv`; the retained file is `manifest_cz_utf8.csv`, whose `meaning`/`repo` columns are shortened for eight rows. Neither auxiliary mismatch overrides `manifest.json`.

## Runtime separation

Runtime assets and the catalog are generated at:

```text
src/assets/icons/k0rp-v2/
src/ui/korpIconCatalog.js
```

Run:

```powershell
npm run build:korp-icons
npm run validate:korp-icons
```

Do not hand-edit the generated catalog or copied runtime PNG files. Validation proves that the 12 runtime files are byte-identical to their PNG64 source, no extra runtime PNG exists, the generated catalog has no drift, and the raw pack/atlases remain structurally valid.

The catalog contains metadata and raw/native references for all 32 semantic IDs. Only current visible mappings receive a literal Vite `new URL(...)` runtime URL, so future raw icons do not enter the production asset graph.

Current desktop icons render as square 40px images while the desktop item column and vertical slot flow remain unchanged. Folder/document icons render as square 30px images inside the existing 28px grid column and 48px row. Even centering geometry, `object-fit: contain`, and a final `image-rendering: pixelated` declaration keep the canonical raster square, stable, and unstretched. Hover and keyboard focus use a neutral white box-shadow glow without outlines, transforms, or filter re-rasterization.

## Current deployment

Desktop mappings:

| Surface | Semantic ID |
| --- | --- |
| Compliance Bin | `compliance-bin` |
| Doručené | `inbox` |
| Formuláře | `forms` |
| ClickAudit | `click-audit` |
| authorized Fidget | `fidget` |
| locked Corner Watch | `corner-watch` |
| locked Bublinková Fólie | `bubble-wrap` |

Folder/document mappings:

| Surface | Semantic ID |
| --- | --- |
| Audit 00-A and Audit 16-C forms | `audit-generic` |
| Audit 10-A placeholder and packet instances | `audit-packet` |
| daily and authorization memos | `memo` |
| startup audit record | `document` |
| Evidence packet archive | `evidence` |

The Evidence archive uses `evidence` because the present row represents certified Evidence records rather than the future general archive surface. Locked shortcuts retain their own module identity; `locked-pending` is a separate semantic icon, not a state variant.

The source pack has no mapping for generic minimize/close controls or the existing ClickAudit/Fidget close, pin, reset and mode controls. Those assets and their current interaction semantics remain unchanged.

## Source-only / future IDs

Current but not visible in the OS shell:

- `bloom`.

Future module surfaces:

- `button-compliance`, `surface-compliance`, `shape-compliance`;
- `attention-runner`, `zen-garden`, `newton-cradle`, `work-blob`.

Future system/progression surfaces:

- `wellbeing`, `care-alignment`, `pending-confirmations`, `certifications`;
- `knowledge-base`, `archive`, `folder-closed`, `folder-open`;
- `settings`, `computer`, `locked-pending`, `audit-cycle`.

All 32 ICO files remain catalogued as raw native references. Because the manifest declares no Tauri/package targets, no `src-tauri/icons` directory or Tauri configuration is modified by Task 022A.
