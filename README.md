# jabascript

Simple, yet, delightfully made utilities and mixins for the javascript ecosystem.

## Getting Started

This project is broken down into multiple packages each with their own dedicated platform or a framework.

1. `@jabascript/core`: Contains extensions to the javascript std. Functions like `takeIf`, `debounce`, `wait` etc.
2. `@jabascript/react`: Contains hooks and other utlities used inside react projects.
    - Client hooks are contained under `@jabascript/react/client`
    - Server only utilities are grouped under `@jabascript/react/server`
3. `@jabascript/dom`: Contains utilities and mixins to use in an environment with DOM access. (Vanilla, hydrated client-side react, etc)

All of these packages are published npm.

```
pnpm add @jabascript/core @jabascript/react
```

## Contributions

Anyone and everyone are welcomed to contribute. Make sure to write readable JSDoc comments as this project relies on it for building types.

## License

Entirety of this project is licensed under MIT. For more information, check [LICENSE](./LICENSE).
