import { terser } from 'rollup-plugin-terser'
import typescript from '@rollup/plugin-typescript'
import nodeResolve from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'
import json from '@rollup/plugin-json'

const input = ['src/index.ts']
const fileName = 'yiu-axios'

export default [
    {
        input,
        plugins: [
            commonjs(),
            nodeResolve({ browser: true }),
            json(),
            typescript(),
        ],
        // external: ['lodash-es'],
        output: [
            // ↓浏览器
            {
                file: `dist/${fileName}.iife.js`,
                format: 'iife',
                name: 'YiuAxios',
                esModule: false,
                exports: 'named',
                // globals: {
                //     'lodash-es': '_',
                // },
            },
            // ↓浏览器压缩版
            {
                file: `dist/${fileName}.iife.min.js`,
                format: 'iife',
                name: 'YiuAxios',
                esModule: false,
                exports: 'named',
                // globals: {
                //     'lodash-es': '_',
                // },
                sourcemap: true,
                plugins: [terser()],
            },
        ],
    },
    {
        input,
        plugins: [
            commonjs(),
            nodeResolve({ browser: true }),
            json(),
            typescript(),
        ],
        external: ['lodash', 'axios'],
        output: [
            // ↓浏览器 去lodash-es、qs、axios 版
            // <script src="https://unpkg.com/lodash@4.17.21/lodash.min.js"></script>
            // <script src="https://unpkg.com/axios/dist/axios.min.js"></script>
            {
                file: `dist/${fileName}.onlib.iife.js`,
                format: 'iife',
                name: 'YiuAxios',
                esModule: false,
                exports: 'named',
                globals: {
                    'lodash': '_',
                    'axios': 'axios',
                },
            },
            // ↓浏览器压缩版
            {
                file: `dist/${fileName}.onlib.iife.min.js`,
                format: 'iife',
                name: 'YiuAxios',
                esModule: false,
                exports: 'named',
                globals: {
                    'lodash': '_',
                    'axios': 'axios',
                },
                sourcemap: true,
                plugins: [terser()],
            },
        ],
    },
    {
        input,
        plugins: [
            commonjs(),
            nodeResolve({ browser: true }),
            typescript(),
            json(),
        ],
        external: ['axios', 'lodash', 'qs'],
        output: [
            // 打包器
            {
                file: `dist/${fileName}.esm.js`,
                format: 'esm',
                exports: 'named',
            },
            // 打包器压缩版
            {
                file: `dist/${fileName}.esm.min.js`,
                format: 'esm',
                exports: 'named',
                sourcemap: true,
                plugins: [terser()],
            },
            // Node
            {
                file: `dist/${fileName}.cjs.js`,
                format: 'cjs',
                exports: 'named',
            },
            // Node压缩版
            {
                file: `dist/${fileName}.cjs.min.js`,
                format: 'cjs',
                exports: 'named',
                plugins: [terser()],
            },
            {
                file: `dist/${fileName}.cjs`,
                format: 'cjs',
                exports: 'named',
            },
            // Node压缩版
            {
                file: `dist/${fileName}.min.cjs`,
                format: 'cjs',
                exports: 'named',
                plugins: [terser()],
            },
        ],
    },
]
