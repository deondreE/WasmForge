export type WasmValueType =
    | 'i32'
    | 'i64'
    | 'f32'
    | 'f64'
    | 'v128'
    | 'anyref'
    | 'funcref'
    | 'externref';

export interface FunctionType {
    paramTypes: WasmValueType[];
    resultTypes: WasmValueType[];
}

export interface ExportedFunctionInfo {
    name: string;
    typeIndex: number; // Index into the Type Section
    functionType: FunctionType; // Resolved function type
    typeScriptParams: string; // Pre-formatted for TS declaration
    typeScriptReturn: string; // Pre-formatted for TS declaration
    paramWasmTypes: WasmValueType[];
    resultWasmTypes: WasmValueType[];
}

export interface ExportedMemoryInfo {
    name: string;
}

export interface WasmModuleInfo {
    functionTypes: FunctionType[]; // All types from the Type Section
    functionTypeIndices: number[]; // Maps function index to type index (from Function Section)
    exportedFunctions: ExportedFunctionInfo[];
    exportedMemory: ExportedMemoryInfo | null;
}

export interface WasmForgeLoaderOptions {
    importObject?: WebAssembly.Imports;
}

export type WasmForgeLoadedExports<T extends WebAssembly.Exports> = T & {
    rawExports: T;
    memory: WebAssembly.Memory | null;
} & RuntimeModuleWrappers;

export interface RuntimeModuleWrappers {
    greetString?: (message: string) => void;
    // ... other future marshalling wrappers
}
