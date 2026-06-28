# K0rp_ware

Small web-based desk parasites for controlled procrastination, ritualized delay, and professionally framed non-output.

## Version 0.1 — Desk Parasite Prototype

Current module:

- **StatusLamp** — a compact status module for work-adjacent conditions such as `Buffering`, `Waiting for Context`, and `Strategically Unavailable`.

The app is intentionally frontend-only for now:

- React + Vite
- no backend
- no login
- localStorage for current StatusLamp state
- detachable popup mode via `window.open()`

## Local development

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

## Routes

Dashboard:

```text
/
```

StatusLamp:

```text
/?app=status-lamp
```

Detached StatusLamp:

```text
/?app=status-lamp&mode=detached
```
