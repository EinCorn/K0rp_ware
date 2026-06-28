# K0rp_ware

Small local-first desk tools for controlled procrastination, ritualized delay, and professionally framed non-output.

Production URL:

```text
https://k0rp-ware.k0rp.workers.dev
```

## Current production scope

Production currently exposes stable v0.2 modules:

- **ClickAudit**
  - desktop companion app keeps an aggregate click count locally
  - web dashboard mirrors the local status response from `127.0.0.1:47891`
  - no account
  - no cloud sync
  - no telemetry
  - no coordinates
  - no screenshots
  - no window titles
- **Fidget**
  - local fidget spinner toy
  - click/manual modes
  - desktop pin-on-top control
  - no telemetry
  - no meaningful business value
- **Bloom**
  - local status-stone puzzle toy
  - green, yellow, and red indicator stones
  - slower wave progression
  - red stones begin appearing from wave 15
  - desktop pin-on-top control
  - no telemetry

Other web modules remain in the repository as parked experiments, but they are not shown on the production dashboard.

## Desktop downloads

The dashboard shows each stable module with these actions:

```text
Open web
Download app
```

The desktop action opens the latest repository release. The dashboard link stays stable because it always targets the latest release.

## Create a desktop release

GitHub Actions builds the three macOS desktop apps and attaches them to a release.

Tag-based release:

```bash
git pull
git tag k0rp-ware-v0.2
git push origin k0rp-ware-v0.2
```

Or run the workflow manually in GitHub Actions:

```text
K0rp desktop release -> Run workflow -> release_tag: k0rp-ware-v0.2
```

Recommended future labels:

```text
k0rp-ware-v0.3
k0rp-ware-v0.4
```

## Local web development

```bash
npm install
npm run dev
```

## ClickAudit desktop development

```bash
cd desktop/click-audit
npm install
npm run dev
```

The desktop companion exposes:

```text
GET  http://127.0.0.1:47891/state
POST http://127.0.0.1:47891/always-on-top?enabled=true
POST http://127.0.0.1:47891/always-on-top?enabled=false
```

## Fidget desktop development

```bash
cd desktop/fidget
npm install
npm run dev
```

## Bloom desktop development

```bash
cd desktop/bloom-desktop
npm install
npm run dev
```

## Build web

```bash
npm run build
```

## Production route

```text
/
```
