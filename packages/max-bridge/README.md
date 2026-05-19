# max-bridge

TypeScript declarations for the MAX Bridge WebApp SDK from `max-web-app.js`.

## Usage

Add the package to a global declarations file, for example `src/max-bridge.d.ts`:

```ts
/// <reference types="max-bridge" />

interface Window {
  WebApp: import('max-bridge').MaxBridgeWebApp
}
```

Then use `window.WebApp` in a project that loads `max-web-app.js`:

```ts
window.WebApp.ready()
```
