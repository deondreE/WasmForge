export type WasmValueType = 'i32' | 'i64' | 'f32' | 'f64';

export interface FunctionType {
    params: WasmValueType[];
    results: WasmValueType[];
}

export interface ExportedFunction {
    name: string;
    typeIndex: number;
    type: FunctionType;
}

export interface WasmModuleInfo {
    types: FunctionType[];
    funcTypeIndices: number[];
    exports: ExportedFunction[];
    hasMemory: boolean;
}
