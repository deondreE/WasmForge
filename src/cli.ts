#!/usr/bin/env node
import { Command } from 'commander';
import * as path from 'path';
import { parseWasm } from './parser';
import { generateBindings } from './generator';

const program = new Command();

program
    .name('wasm-types')
    .description('Generate TypeScript bindings for WebAssembly modules')
    .version('0.1.0');

program
    .command('generate <wasmFile>')
    .option('-o, --out-dir <dir>', 'Output directory', './bindings')
    .option('-n, --name <name>', 'Module name (default: file basename)')
    .action(async (wasmFile, options) => {
        const absPath = path.resolve(wasmFile);
        const moduleName = options.name || path.basename(wasmFile, '.wasm');
        const outDir = path.resolve(options.outDir);

        console.log(`[wasm-types] Parsing ${absPath}...`);
        const info = parseWasm(absPath);

        console.log(`[wasm-types] Generating bindings in ${outDir}...`);
        await generateBindings(info, absPath, outDir, moduleName);

        console.log(`[wasm-types] Done!`);
    });

program.parse(process.argv);
