# invoice-generator

This template should help get you started developing with Vue 3 in Vite.

## Recommended IDE Setup

[VSCode](https://code.visualstudio.com/) + [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar) (and disable Vetur).

## Type Support for `.vue` Imports in TS

TypeScript cannot handle type information for `.vue` imports by default, so we replace the `tsc` CLI with `vue-tsc` for type checking. In editors, we need [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar) to make the TypeScript language service aware of `.vue` types.

## Customize configuration

See [Vite Configuration Reference](https://vite.dev/config/).

## Project Setup

```sh
npm install
```

### Environment variables (Doppler)

This app loads env vars from [Doppler](https://doppler.com) (project: `custom-invoice-generator`) instead of a local `.env` / `.env.local` file.

1. Install the [Doppler CLI](https://docs.doppler.com/docs/install-cli) and run `doppler login`
2. From the repo root, link the project:

```sh
doppler setup --no-interactive
```

That uses `doppler.yaml` (`custom-invoice-generator` / `dev`). Vite scripts below wrap commands with `doppler run` so `VITE_*` secrets are injected into `import.meta.env`.

### Compile and Hot-Reload for Development

```sh
npm run dev
```

### Type-Check, Compile and Minify for Production

```sh
npm run build
```

### Run Unit Tests with [Vitest](https://vitest.dev/)

```sh
npm run test:unit
```

### Lint with [ESLint](https://eslint.org/)

```sh
npm run lint
```
