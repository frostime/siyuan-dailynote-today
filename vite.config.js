// vite.config.js
import { resolve } from 'path'
import { defineConfig } from 'vite'

export default defineConfig({
    build: {
        lib: {
            entry: resolve(__dirname, 'src', "index.ts"),
            formats: ['cjs'],
            fileName: 'main',
        },
        commonjsOptions: {
            defaultIsModuleExports: true,
        },
        rollupOptions: {
            input: {
                main: resolve(__dirname, 'src', "index.ts"),
            },
            output: {
                name: 'main',
                format: 'commonjs',
                esModule: 'if-default-prop',
                manualChunks: undefined,
            },
            external: ['siyuan'],
        },
        //构建后是否生成 source map 文件
        sourcemap: false,
    },
})
