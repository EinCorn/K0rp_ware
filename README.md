# K0rp_ware

Small web-based desk parasites for controlled procrastination, ritualized delay, and professionally framed non-output.

Production URL:

```text
https://k0rp-ware.k0rp.workers.dev
```

## Current modules

- **StatusLamp** — a compact status module for work-adjacent conditions such as `Buffering`, `Waiting for Context`, and `Strategically Unavailable`.
- **ClickAudit** — counts clicks inside approved K0rp_ware windows, including detached windows.
- **Compliance Pebble** — a dopamine fidget with no measurable output.
- **Archive Bloom** — a small single-player procedure game against a simulated opponent.

The app is intentionally frontend-only for now:

- React + Vite
- Cloudflare Workers static assets via Wrangler
- no backend
- no login
- localStorage for small persistent state
- BroadcastChannel-ready local event bus
- global click telemetry inside K0rp_ware only
- detachable popup mode via `window.open()`

## Project structure

```text
src/
  App.jsx                         # query-param module router
  App.css                         # shared base styling
  modules.css                     # module-specific styling
  index.css                       # global theme
  core/
    clickStore.js                 # persistent click telemetry store
    detachedWindow.js             # popup window helper
    eventBus.js                   # local BroadcastChannel event bus
    storage.js                    # localStorage helpers
    time.js                       # shared time formatting
    useClickTelemetry.js          # document click capture hook
  components/
    Dashboard.jsx                 # main dashboard
    ModuleCard.jsx                # dashboard module card
  modules/
    archiveBloom/
      ArchiveBloom.jsx            # single-player procedure game
      archiveBloomLogic.js        # board logic and simulated opponent
    clickAudit/
      ClickAudit.jsx              # click telemetry UI
    dopamineFidget/
      DopamineFidget.jsx          # Compliance Pebble fidget
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

Modules:

```text
/?app=status-lamp
/?app=click-audit
/?app=dopamine-fidget
/?app=archive-bloom
```

Detached modules:

```text
/?app=status-lamp&mode=detached
/?app=click-audit&mode=detached
/?app=dopamine-fidget&mode=detached
/?app=archive-bloom&mode=detached
```
