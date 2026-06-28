# K0rp_ware

Small local-first desk tools for controlled procrastination, ritualized delay, and professionally framed non-output.

Production URL:

```text
https://k0rp-ware.k0rp.workers.dev
```

## Current production scope

Production currently shows only **ClickAudit**:

- desktop companion app keeps an aggregate click count locally
- web dashboard mirrors the local status response from `127.0.0.1:47891`
- no account
- no cloud sync
- no telemetry
- no coordinates
- no screenshots
- no window titles

Other web modules remain in the repository as parked experiments, but they are not shown on the production dashboard.

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

## Build web

```bash
npm run build
```

## Production route

```text
/
```
