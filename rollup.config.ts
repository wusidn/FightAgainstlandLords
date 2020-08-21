import path from 'path'
import { RollupOptions } from "rollup"
import rollupTypescript from 'rollup-plugin-typescript2'
import commonjs from 'rollup-plugin-commonjs'
import { eslint } from 'rollup-plugin-eslint'
import resolve from 'rollup-plugin-node-resolve'
import babel from 'rollup-plugin-babel'
import { DEFAULT_EXTENSIONS } from '@babel/core'

import pkg from './package.json'


const servicePaths = {
    input: path.join(__dirname, "/service/main.ts"),
    output: path.join(__dirname, "/dist")
};

const clientPaths = {
    input: path.join(__dirname, "/client/main.ts"),
    output: path.join(__dirname, "/dist")
};

//service config
export const serviceConfig: RollupOptions = {
    input: servicePaths.input,
    output: [
        {
            file: path.join(servicePaths.output, "service.js"),
            format: "cjs",
            name: pkg.name,
        },
        {
            file: path.join(servicePaths.output, "service.mjs"),
            format: "es",
            name: pkg.name,
        }
    ],
    plugins: [
        // 验证导入的文件
        eslint({
            throwOnError: true, // lint 结果有错误将会抛出异常
            throwOnWarning: true,
            include: ['service/*.ts', 'common/*.ts', 'untls/*.ts'],
            exclude: ['node_modules/**', 'dist/service.*', '*.js'],
        }),
        commonjs(),
        // 配合 commnjs 解析第三方模块
        resolve({
            // 将自定义选项传递给解析插件
            customResolveOptions: {
                moduleDirectory: 'node_modules',
            },
            preferBuiltins: true,   //屏蔽调用js库错误
        }),
        rollupTypescript(),
        babel({
            runtimeHelpers: true,
            // 只转换源代码，不运行外部依赖
            exclude: 'node_modules/**',
            // babel 默认不支持 ts 需要手动添加
            extensions: [
              ...DEFAULT_EXTENSIONS,
              '.ts',
            ],
        }),
    ],
    external: ['os', 'net', 'readline', 'crypto']
};

//client config
export const clientConfig: RollupOptions = {
    input: clientPaths.input,
    output: [
        {
            file: path.join(clientPaths.output, "client.js"),
            format: "cjs",
            name: pkg.name,
        },
        {
            file: path.join(clientPaths.output, "client.mjs"),
            format: "es",
            name: pkg.name,
        }
    ],
    plugins: [
        // 验证导入的文件
        eslint({
            throwOnError: true, // lint 结果有错误将会抛出异常
            throwOnWarning: true,
            include: ['client/*.ts', 'common/*.ts', 'untls/*.ts'],
            exclude: ['node_modules/**', 'dist/client.*', '*.js'],
        }),
        commonjs(),
        // 配合 commnjs 解析第三方模块
        resolve({
            // 将自定义选项传递给解析插件
            customResolveOptions: {
                moduleDirectory: 'node_modules',
            },
            preferBuiltins: true,   //屏蔽ts引用js库错误
        }),
        rollupTypescript(),
        babel({
            runtimeHelpers: true,
            // 只转换源代码，不运行外部依赖
            exclude: 'node_modules/**',
            // babel 默认不支持 ts 需要手动添加
            extensions: [
              ...DEFAULT_EXTENSIONS,
              '.ts',
            ],
        }),
    ],
    external: ['readline', 'net', 'crypto']
}