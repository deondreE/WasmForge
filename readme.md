# WasmForge

WasmForge is a toolkit designed to dramatically simplify the WebAssembly (Wasm) development workflow, bringing a new level of type safety, developer experience, and ease of integration to your Wasm projects. Say goodbye to manual bindings and arcane memory management; with WasmForge, loading and interacting with Wasm feels just like using regular JavaScript modules.

"I just loaded a Wasm module and called its functions type-safely without any manual binding!" — That's the WasmForge promise.

---

## ✨ Features

WasmForge aims to cover the entire Wasm lifecycle, from compilation hints to seamless runtime integration and optimization.

## Core Developer Experience

- ⚡️ Type-Safe Wasm Bindings (Auto-Generated):
  - Automatically generates TypeScript declaration files (.d.ts) and JavaScript/TypeScript wrapper modules for your Wasm binaries.
  - Provides full IDE auto-completion, parameter hints, and compile-time type checking for your Wasm module's exports.
  - No more instance.exports.myFunc as any or guesswork!
- 🔌 Effortless Module Loading:
  - Abstracts away WebAssembly.instantiateStreaming and WebAssembly.instantiate complexities.
  - Handles default import object creation and robust error handling during instantiation.
- ↔️ Seamless Data Marshalling:
  - Built-in, type-safe helpers for easily passing strings and common data types (numbers, booleans, Typed Arrays) between JavaScript and Wasm memory.
  - Eliminates the need for manual pointer arithmetic or TextEncoder/TextDecoder boilerplate.

## Build & Optimization

- 🚀 Wasm Binary Optimization Integration:
  - Provides a simple interface to integrate powerful optimization tools like wasm-opt (Binaryen) into your build pipeline.
  - Automate dead code elimination, aggressive size reduction, and performance enhancements.
- 🎯 Unified Build Tooling (Future):
  - A consistent CLI/API to orchestrate various Wasm compilers (Rust, C/C++, AssemblyScript) with simplified, language-agnostic configurations.
- 📦 Bundler Integration (Upcoming):
  - First-party plugins for popular bundlers (Webpack, Rollup, Vite) to automate Wasm compilation, optimization, and binding generation.

## Advanced Use Cases (Under Development)

- 🧵 Web Worker & Shared Memory Utilities: Simplified patterns for offloading Wasm computation to Web Workers and managing SharedArrayBuffers.
- 🔍 Debugging Hooks: Enhanced logging and performance monitoring integrations.
- 🧩 WASI Polyfills: Helpers for environments without full WASI support.

## 🚀 Getting Started

This guide assumes you have a Wasm module ready. If you don't, check out the WasmForge Examples repository for samples in Rust, AssemblyScript, and C++.

1. Installation

```bash
npm install --save-dev wasmforge
# or
yarn add --dev wasmforge
```

2. Prepare Your Wasm Module

Let's assume you have a Wasm module named my-module.wasm in your project's src/ directory. For demonstration, we'll use a simple module that exports an add function and a greet function that takes a string.

Example my-module.wasm (Conceptual Source - e.g., from Rust):

```rust
// my-module.rs
#[no_mangle]
pub extern "C" fn add(a: i32, b: i32) -> i32 {
    a + b
}

// For simplicity, assume greet takes a pointer and length
// and your Wasm module also exports a `memory` object
#[no_mangle]
pub extern "C" fn greet(ptr: *mut u8, len: usize) {
    // ... Wasm logic to read the string from memory and print it ...
}

// Ensure you export `memory` if you plan to manage strings/data
// This is typically handled by `wasm-bindgen` or similar tools
// but WasmForge provides helpers for direct memory access if needed.
```

3. Generate Type Bindings

Use the WasmForge CLI to generate the necessary TypeScript declaration and wrapper files.

```bash
npx wasmforge generate src/my-module.wasm --out-dir src/wasm-bindings
``
`
This command will create:


- src/wasm-bindings/my-module.wasm.d.ts: TypeScript types for your Wasm module.
- src/wasm-bindings/my-module.wasm.js: A JavaScript wrapper module that handles loading and provides convenient, type-safe APIs.
```

4. Integrate into Your Application

Now, you can import and use your Wasm module with full type safety!

```Typescript
// src/app.ts
import myModule from './wasm-bindings/my-module.wasm';

async function main() {
    // 🚀 AHA! moment: Load and instantiate the module with ONE line.
    // Full type inference and auto-completion are available for `wasm`!
    const wasm = await myModule.load();

    // ✨ Type-Safe Function Call:
    // `wasm.add` is recognized by TypeScript, expects numbers, returns a number.
    const result = wasm.add(10, 25);
    console.log(`10 + 25 = ${result}`); // Output: 10 + 25 = 35

    // ✨ Effortless String Passing:
    // `wasm.greetString` is an auto-generated helper for convenient string marshalling.
    wasm.greetString("Hello from WasmForge!"); // Calls Wasm `greet` function with your string

    // You can also access the raw Wasm exports and memory if needed:
    console.log("Raw Wasm exports:", wasm.rawExports);
    const memory = wasm.memory; // WebAssembly.Memory instance
    // ... direct memory manipulation if required
}

main();
```

To run this example, you'll typically need a TypeScript compiler and a bundler (like Webpack, Rollup, or Vite) configured for TypeScript.

---

## 🛠 Configuration

wasmforge generate CLI Options

```text
npx wasmforge generate <input_wasm_path> [options]

Options:
  --out-dir <path>       Specify the output directory for generated files (default: same as input)
  --name <string>        Custom name for the generated module (default: derived from input file name)
  --no-types             Do not generate TypeScript declaration files (.d.ts)
  --no-wrapper           Do not generate the JS/TS wrapper module
  --wit <path>           Path to an optional .wit file for richer type definitions (experimental)
  --optimize [level]     Apply wasm-opt optimization.
                         Levels: 0 (none), 1 (size), 2 (size aggressively), 3 (speed). Default: 2.
  --debug-info           Keep debug information in the optimized Wasm binary.
  --help                 Show help
```

Example with optimization:

```bash
npx wasmforge generate build/my-optimized-module.wasm --out-dir dist --optimize 2 --no-debug-info
```

This will generate types and a wrapper for my-optimized-module.wasm, also running wasm-opt -O2 on the input Wasm file before generating bindings.

## 💡 How It Works (Behind the Scenes)

When you run npx wasmforge generate <path/to/module.wasm>:

1. Wasm Parsing: WasmForge parses the provided .wasm binary using a Wasm parser library. It inspects the export section to identify all exported functions, globals, and the memory.
2. Signature Extraction: For each exported function, it extracts its name, the number and types of its parameters (e.g., i32, f64), and its return type.
3. Type Mapping: WasmForge maps these Wasm types to equivalent TypeScript types (e.g., i32 becomes number).
4. Wrapper Generation:
   - .d.ts: An interface is generated, providing type definitions for all identified exports.
   - .js (or .ts): A runtime module is created. This module contains:
     - A load() function that handles WebAssembly.instantiateStreaming (or instantiate) and injects a default importObject.
     - Proxy functions or direct re-exports of the Wasm functions.
     - Crucially, convenience wrappers like greetString are generated if WasmForge detects common patterns (e.g., a function taking (ptr: number, len: number) might suggest a string argument, prompting the generation of a string helper).
     - Logic for basic memory management (writing/reading strings/arrays to/from Wasm memory) is included or leveraged from the WasmForge runtime.
5. Optimization (Optional): If --optimize is used, WasmForge integrates with wasm-opt to pre-process the Wasm binary before generating bindings.

## 🤝 Contributing

We welcome contributions! If you have ideas for new features, bug reports, or want to help with development, please check out our Contributing Guidelines.

## 📄 License

WasmForge is licensed under the MIT License.
