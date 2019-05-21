import multiInput from 'rollup-plugin-multi-input';
import resolve from 'rollup-plugin-node-resolve';
import svelte from 'rollup-plugin-svelte';
import css from 'rollup-plugin-css-chunks';
import bundleTree from 'rollup-plugin-extract-bundle-tree';
import importAssets from 'rollup-plugin-import-assets';
import { terser } from 'rollup-plugin-terser';

const production = !process.env.ROLLUP_WATCH;

export default [
	{
		input: 'src/*.svelte',
		output: {
			dir: 'dist/public',
			sourcemap: !production,
			format: 'esm',
			chunkFileNames: '[hash].js',
			entryFileNames: '[name].[hash].js'
		},
		plugins: [
			multiInput(),
			resolve(),
			svelte({
				dev: !production,
				immutable: true,
				hydratable: true,
				emitCss: true
			}),
			css({
				sourcemap: !production,
				chunkFileNames: '[hash].css',
				entryFileNames: '[hash].css'
			}),
			importAssets({
				fileNames: '[hash].[ext]',
				publicPath: '/static/',
			}),
			bundleTree({
				file: 'dist/server/client-tree.json'
			}),
			production && terser()
		],
		watch: {
			clearScreen: false
		},
	},
	{
		input: 'src/*.svelte',
		output: {
			dir: 'dist/server',
			format: 'cjs',
		},
		plugins: [
			multiInput(),
			resolve(),
			svelte({
				dev: !production,
				immutable: true,
				hydratable: true,
				generate: 'ssr',
			}),
			css({
				ignore: true
			}),
			importAssets({
				fileNames: '[hash].[ext]',
				publicPath: '/static/',
				emitAssets: false,
			}),
			production && terser()
		],
	},
	{
		input: 'src/server.js',
		output: {
			file: 'dist/server/server.js',
			format: 'cjs',
		},
		plugins: [
			resolve(),
			production && terser()
		],
		external: [
			'fs', 'path',
			'polka', 'serve-static'
		],
	}
];
