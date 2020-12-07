import multiInput from 'rollup-plugin-multi-input';
import resolve from '@rollup/plugin-node-resolve';
import svelte from 'rollup-plugin-svelte';
import css from 'rollup-plugin-css-chunks';
import bundleTree from 'rollup-plugin-extract-bundle-tree';
import importAssets from 'rollup-plugin-import-assets';
import {terser} from 'rollup-plugin-terser';
import commonjs from '@rollup/plugin-commonjs';
import replace from '@rollup/plugin-replace';
import del from 'rollup-plugin-delete';
import json from '@rollup/plugin-json';
import livereload from 'rollup-plugin-livereload';

const production = !process.env.ROLLUP_WATCH;
const publicStaticPath = process.env.PUBLIC_STATIC_PATH || '/static';

export default [
    {
        input: ['src/*.svelte'],
        output: {
            dir: 'dist/client',
            sourcemap: !production,
            format: 'esm',
            chunkFileNames: '[hash].js',
            entryFileNames: '[hash].js',
        },
        plugins: [
            del({targets: 'dist/client/*'}),
            multiInput(),
            resolve({browser: true}),
            svelte({
                compilerOptions: {
                    dev: !production,
                    immutable: true,
                    hydratable: true,
                },
            }),
            css({
                chunkFileNames: '[hash].css',
                entryFileNames: '[hash].css',
                sourcemap: !production,
            }),
            importAssets({
                fileNames: '[hash].[ext]',
                publicPath: publicStaticPath,
            }),
            bundleTree({
                file: 'dist/client-tree.json',
            }),
            !production && livereload({
                watch: 'dist/server',
                delay: 750,
            }),
            production && terser(),
        ],
        watch: {
            clearScreen: false,
        },
    },
    {
        input: ['src/*.svelte'],
        output: {
            dir: 'dist/server',
            format: 'cjs',
            exports: 'default',
        },
        plugins: [
            del({targets: 'dist/server/*'}),
            multiInput(),
            resolve(),
            svelte({
                compilerOptions: {
                    dev: !production,
                    immutable: true,
                    hydratable: true,
                    generate: 'ssr',
                },
            }),
            css({
                emitFiles: false,
            }),
            importAssets({
                fileNames: '[hash].[ext]',
                publicPath: publicStaticPath,
                emitAssets: false,
            }),
            production && terser(),
        ],
    },
    {
        input: 'src/server.js',
        output: {
            file: 'dist/server.js',
            format: 'cjs',
        },
        plugins: [
            replace({
                STATIC_PATH: publicStaticPath,
                DEV_SERVER: !production,
            }),
            resolve({preferBuiltins: true}),
            commonjs(),
            json(),
            production && terser(),
        ],
    },
];
