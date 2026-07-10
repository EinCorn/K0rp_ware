# K0rp UI Shell

This folder is the source of truth for the shared 230×230 desktop shell used by K0rp_ware desktop apps.

## Source files

```text
desktop/shared/k0rp-ui/korp-shell.css
desktop/shared/k0rp-ui/korp-runtime.css
desktop/shared/k0rp-ui/assets/app-window.png
desktop/shared/k0rp-ui/assets/app-shell.webp
desktop/shared/k0rp-ui/assets/korp-ui-close.png
desktop/shared/k0rp-ui/assets/korp-ui-pin.png
desktop/shared/k0rp-ui/assets/korp-ui-reset.webp
```

## Runtime copies

Each desktop app is its own small Tauri/Vite project, so the shared files are copied into app-local runtime folders:

```text
desktop/click-audit/src/k0rp-ui/korp-shell.css
desktop/fidget/src/k0rp-ui/korp-shell.css
desktop/bloom-desktop/src/k0rp-ui/korp-shell.css

desktop/click-audit/src/assets/app-shell.webp
desktop/click-audit/src/assets/korp-ui-close.png
desktop/click-audit/src/assets/korp-ui-pin.png
desktop/click-audit/src/assets/korp-ui-reset.webp

...same asset pattern for fidget and bloom-desktop.
```

## Sync

After editing the shared shell or assets, run:

```bash
npm run sync:korp-ui
```

or directly:

```bash
node scripts/sync-k0rp-ui.mjs
```

Do not manually tune the shared frame/control layout separately in each app unless the app genuinely needs a local exception. App-specific CSS should control only the app's internal moving/interacting content.

## Geometry contract

`korp-runtime.css` defines one derived hierarchy for every desktop app:

```text
230 × 230 shell canvas
└── shell pocket
    └── app-window frame
        └── app-window content viewport
```

The app-window frame occupies the shell pocket exactly. The content viewport
is derived from the shared frame insets and is the only box for app-specific
layers. Use the `.korp-app-window-content` class for a clipped content layer;
do not create app-specific shell offsets or frame-padding approximations.
