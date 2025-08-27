import { readFileSync } from 'fs';
import { WasmModuleInfo, FunctionType, WasmValueType } from './types';

// Section IDs
enum SectionID {
    Type = 1,
    Function = 3,
    Export = 7,
}

// Export kinds
enum ExportKind {
    Func = 0,
    Table = 1,
    Mem = 2,
    Global = 3,
}

// --- Helpers ---
function readU32LEB(buf: Uint8Array, offset: { pos: number }): number {
    let result = 0,
        shift = 0;
    while (true) {
        const byte = buf[offset.pos++];
        result |= (byte & 0x7f) << shift;
        if ((byte & 0x80) === 0) break;
        shift += 7;
    }
    return result;
}

function readByte(buf: Uint8Array, offset: { pos: number }): number {
    return buf[offset.pos++];
}

function readString(buf: Uint8Array, offset: { pos: number }): string {
    const len = readU32LEB(buf, offset);
    const bytes = buf.slice(offset.pos, offset.pos + len);
    offset.pos += len;
    return new TextDecoder().decode(bytes);
}

function mapValType(byte: number): WasmValueType {
    switch (byte) {
        case 0x7f:
            return 'i32';
        case 0x7e:
            return 'i64';
        case 0x7d:
            return 'f32';
        case 0x7c:
            return 'f64';
        default:
            throw new Error(`Unknown valtype: 0x${byte.toString(16)}`);
    }
}

// --- Parser ---
export function parseWasm(filePath: string): WasmModuleInfo {
    const buf = new Uint8Array(readFileSync(filePath));
    const offset = { pos: 0 };

    // Magic + version
    if (
        buf[0] !== 0x00 ||
        buf[1] !== 0x61 ||
        buf[2] !== 0x73 ||
        buf[3] !== 0x6d
    ) {
        throw new Error('Invalid wasm magic');
    }
    if (
        buf[4] !== 0x01 ||
        buf[5] !== 0x00 ||
        buf[6] !== 0x00 ||
        buf[7] !== 0x00
    ) {
        throw new Error('Unsupported wasm version');
    }
    offset.pos = 8;

    const types: FunctionType[] = [];
    const funcTypeIndices: number[] = [];
    const exports: any[] = [];
    let hasMemory = false;

    while (offset.pos < buf.length) {
        const id = readU32LEB(buf, offset);
        const size = readU32LEB(buf, offset);
        const end = offset.pos + size;

        switch (id) {
            case SectionID.Type: {
                const count = readU32LEB(buf, offset);
                for (let i = 0; i < count; i++) {
                    const form = readByte(buf, offset); // should be 0x60
                    if (form !== 0x60) throw new Error('Invalid type form');
                    const paramCount = readU32LEB(buf, offset);
                    const params: WasmValueType[] = [];
                    for (let j = 0; j < paramCount; j++) {
                        params.push(mapValType(readByte(buf, offset)));
                    }
                    const resultCount = readU32LEB(buf, offset);
                    const results: WasmValueType[] = [];
                    for (let j = 0; j < resultCount; j++) {
                        results.push(mapValType(readByte(buf, offset)));
                    }
                    types.push({ params, results });
                }
                break;
            }
            case SectionID.Function: {
                const count = readU32LEB(buf, offset);
                for (let i = 0; i < count; i++) {
                    funcTypeIndices.push(readU32LEB(buf, offset));
                }
                break;
            }
            case SectionID.Export: {
                const count = readU32LEB(buf, offset);
                for (let i = 0; i < count; i++) {
                    const name = readString(buf, offset);
                    const kind = readByte(buf, offset);
                    const index = readU32LEB(buf, offset);
                    if (kind === ExportKind.Func) {
                        exports.push({ name, index });
                    } else if (kind === ExportKind.Mem) {
                        hasMemory = true;
                    }
                }
                break;
            }
            default:
                offset.pos = end; // skip
        }
        offset.pos = end;
    }

    // Resolve function types
    const exportedFunctions = exports.map((e) => {
        const typeIndex = funcTypeIndices[e.index];
        return {
            name: e.name,
            typeIndex,
            type: types[typeIndex],
        };
    });

    return { types, funcTypeIndices, exports: exportedFunctions, hasMemory };
}
