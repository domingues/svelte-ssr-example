# Svelte SSR Example with Code Split

A [Svelte 3](https://v3.svelte.technology/) server side render example, with hashed JS and CSS chunks, using [rollup](https://github.com/rollup/rollup) and [rollup-plugin-css-chunks](https://github.com/domingues/rollup-plugin-css-chunks).

## Installation

```bash
git clone https://github.com/domingues/svelte-ssr-example.git
cd svelte-ssr-example
npm install
```

## Usage

```shell script
npm run build
npm run start
```
or
```shell script
npm run start:dev
```
and open your browser
```shell script
curl http://localhost:3000/
```
you can pass props in the url
```shell script
curl http://localhost:3000/?props={%22size%22:64}
```
or submit it a POST request
```shell script
curl --header "Content-Type: application/json" \
  --request POST \
  --data '{"size":64}' \
  http://localhost:3000/
```

## Environment variables

### Build time
 - `$PUBLIC_STATIC_PATH`: path where the static files will be located,
                          local like `/static` or a remote CDN like `//abc.mycdn/project`;

### Runtime
 - `$NODE_HOST`
 - `$NODE_PORT`

## License

MIT
