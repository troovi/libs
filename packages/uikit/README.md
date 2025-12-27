# Unset browser styles

If you're not using @tailwind with preflighting, you'll need to override the browser's default styles using the `modern-normalize` package.
Tailwind's preflighting is actually built on top of the `modern-normalize` package.

## Install

```sh
npm i modern-normalize
```

## Usage

```css
@import 'node_modules/modern-normalize/modern-normalize.css';
```
