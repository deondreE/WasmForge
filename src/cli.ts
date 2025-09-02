#!/usr/bin/env node
import { Command } from 'commander';
import * as path from 'path';
import { parseWasm } from './parser';
import { generateBindings } from './generator';
import { optimizeWasm } from './optimizer';

const program = new Command();

program
    .name('wasmforge')
    .description('Generate TypeScript bindings for WebAssembly modules')
    .version('0.2.0');

program
    .command('generate <wasmFile>')
    .option('-o, --out-dir <dir>', 'Output directory', './bindings')
    .option('-n, --name <name>', 'Module name (default: file basename)')
    .option('--no-types', 'Do not generate TypeScript declaration files')
    .option('--no-wrapper', 'Do not generate JS/TS wrapper module')
    .option('--optimize [level]', 'Run wasm-opt with optimization level (0-3)')
    .action(async (wasmFile, options) => {
        const absPath = path.resolve(wasmFile);
        const moduleName = options.name || path.basename(wasmFile, '.wasm');
        const outDir = path.resolve(options.outDir);

        let inputPath = absPath;

        if (options.optimize !== undefined) {
            const level =
                options.optimize === true ? 2 : Number(options.optimize);
            console.log(`[wasmforge] Optimizing with wasm-opt -O${level}...`);
            inputPath = path.join(outDir, `${moduleName}.opt.wasm`);
            await optimizeWasm(absPath, inputPath, level);
        }

        console.log(`[wasmforge] Parsing ${inputPath}...`);
        const info = parseWasm(inputPath);

        console.log(`[wasmforge] Generating bindings in ${outDir}...`);
        await generateBindings(info, inputPath, outDir, moduleName, {
            noTypes: options.types === false,
            noWrapper: options.wrapper === false,
        });

        console.log(`[wasmforge] Done!`);
    });

program.parse(process.argv);
