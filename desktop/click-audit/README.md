# K0rp ClickAudit Desktop

Portable-first desktop MVP for counting global mouse clicks locally.

## Privacy and safety contract

ClickAudit is designed around strict local-only behavior:

- no cloud sync
- no account
- no outbound telemetry
- local API binds only to `127.0.0.1`
- no screenshots
- no keyboard capture
- no text capture
- no active window titles
- no process names
- no click coordinates
- stores only aggregate counters and runtime state

The only global input it observes is mouse button down events, and only to increment an aggregate counter while counting is enabled.

## Current target

Windows-first proof of concept.

macOS and Linux builds can open the UI. Global click counting may require platform permissions or may fail depending on the system environment. The app will show a local notice if input counting cannot start.

## Development

```bash
cd desktop/click-audit
npm install
npm run dev
```

## Build

```bash
cd desktop/click-audit
npm run build
```

## Local API

When the app runs, it exposes a read-only local status endpoint:

```text
http://127.0.0.1:47891/state
```

Example response:

```json
{
  "app": "click-audit",
  "running": true,
  "globalClicks": 42,
  "startedAtUnixMs": 1760000000000,
  "alwaysOnTop": false,
  "privacyMode": "aggregate-only"
}
```

This is intended for the web Dashboard to read local aggregate state without any cloud relay.
