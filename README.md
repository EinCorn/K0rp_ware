# K0rp_ware

Small web-based desk parasites for controlled procrastination, ritualized delay, and professionally framed non-output.

Production URL:

```text
https://k0rp-ware.k0rp.workers.dev
```

## Version 0.1 — Desk Parasite Prototype

Current module:

- **StatusLamp** — a compact status module for work-adjacent conditions such as `Buffering`, `Waiting for Context`, and `Strategically Unavailable`.

The app is intentionally frontend-only for now:

- React + Vite
- Cloudflare Workers static assets via Wrangler
- no backend
- no login
- localStorage for current StatusLamp state
- BroadcastChannel-ready local event bus
- detachable popup mode via `window.open()`

## Project structure

```text
src/
  App.jsx                         # query-param module router
  App.css                         # shared app/module styling
  index.css                       # global theme
  core/
    detachedWindow.js             # popup window helper
    eventBus.js                   # local BroadcastChannel event bus
    storage.js                    # localStorage helpers
    time.js                       # shared time formatting
  components/
    Dashboard.jsx                 # main dashboard
    ModuleCard.jsx                # dashboard module card
  modules/
    statusLamp/
      StatusLamp.jsx              # StatusLamp UI and behavior
      statusLampData.js           # statuses and messages
      statusLampState.js          # initial state helper
  moduleRegistry.js               # available modules
```

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
