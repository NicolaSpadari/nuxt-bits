# Nuxt Bits

[![npm version][npm-version-src]][npm-version-href]
[![npm downloads][npm-downloads-src]][npm-downloads-href]
[![License][license-src]][license-href]
[![Nuxt][nuxt-src]][nuxt-href]

Nuxt 3 module for [Vue Bits](https://github.com/DavidHDev/vue-bits/)

> This module is still a WIP

## Features

- Auto import Vue Bits components
- SSR ready
- Powered by TypeScript

## Quick Setup

Install the module to your Nuxt application with one command:

```bash
npx nuxi module add nuxt-bits
```

That's it! You can now use Nuxt Bits in your Nuxt app ✨

## Usage

Just refer to the [official documentation](https://vue-bits.dev/). Instead of installing components manually or with jsrepo, simply import the component prefixed with "Bits", for example:

- Split Text -> BitsSplitText
- True Focus -> BitsTrueFocus
- and so on...

Component prefix in customizable in the nuxt config, by creating a custom configuration:

```ts
// nuxt.config.ts

export default defineNuxtConfig({
	modules: ["nuxt-bits"],
	bits: {
		prefix: "Foo" // BitsSplitText -> FooSplitText
	}
	// ...
});
```

Find out an example in the [playground](https://github.com/NicolaSpadari/nuxt-bits/blob/main/playground/app.vue)

## Contribution

<details>
  <summary>Local development</summary>

  ```bash
  # Install dependencies
  pnpm install

  # Generate type stubs
  pnpm run dev:prepare

  # Develop with the playground
  pnpm run dev

  # Build the playground
  pnpm run dev:build

  # Run ESLint
  pnpm run lint

  # Release new version
  pnpm run release
  ```

</details>

[npm-version-src]: https://img.shields.io/npm/v/my-module/latest.svg?style=flat&colorA=020420&colorB=00DC82
[npm-version-href]: https://npmjs.com/package/nuxt-bits

[npm-downloads-src]: https://img.shields.io/npm/dm/my-module.svg?style=flat&colorA=020420&colorB=00DC82
[npm-downloads-href]: https://npm.chart.dev/nuxt-bits

[license-src]: https://img.shields.io/npm/l/my-module.svg?style=flat&colorA=020420&colorB=00DC82
[license-href]: https://npmjs.com/package/nuxt-bits

[nuxt-src]: https://img.shields.io/badge/Nuxt-020420?logo=nuxt.js
[nuxt-href]: https://nuxt.com

## Credits

Ported Vue components by [DavidHDev](https://github.com/DavidHDev), author of the original [React Bits](https://reactbits.dev)
