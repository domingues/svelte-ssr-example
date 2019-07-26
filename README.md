# Svelte SSR Example with Code Split

A [Svelte 3](https://v3.svelte.technology/) server side render example, with hashed JS and CSS chunks, using [rollup](https://github.com/rollup/rollup) and [rollup-plugin-css-chunks](https://github.com/domingues/rollup-plugin-css-chunks).

## Installation

```bash
git clone https://github.com/domingues/svelte-ssr-example.git
cd svelte-ssr-example
npm install
```

## Usage

```bash
npm run build
npm run start
```
or
```bash
npm run start:dev
```
and open your browser
```
http://localhost:3000/
```
you can pass props in the url
```
http://10.215.14.166:3000/?props={%22size%22:64}
```

## Environment variables

 - `$PUBLIC_STATIC_PATH`
 - `$NODE_HOST`
 - `$NODE_PORT`

## License

MIT
