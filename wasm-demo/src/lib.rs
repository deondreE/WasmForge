// src/lib.rs

/// Add two 32-bit integers
#[unsafe(no_mangle)]
pub extern "C" fn add(a: i32, b: i32) -> i32 {
    a + b
}

/// Multiply two 32-bit integers
#[unsafe(no_mangle)]
pub extern "C" fn multiply(a: i32, b: i32) -> i32 {
    a * b
}

/// Greet function: takes a pointer and length to a UTF-8 string in Wasm memory
#[unsafe(no_mangle)]
pub extern "C" fn greet(ptr: *const u8, len: usize) {
    unsafe {
        let slice = std::slice::from_raw_parts(ptr, len);
        if let Ok(s) = std::str::from_utf8(slice) {
            // For now, just print to stdout (will show up in Node, not browser)
            println!("Hello from Wasm! Got string: {}", s);
        }
    }
}

/// Allocate memory inside Wasm (so JS can write strings into it)
#[unsafe(no_mangle)]
pub extern "C" fn __malloc(size: usize) -> *mut u8 {
    let mut buf = Vec::with_capacity(size);
    let ptr = buf.as_mut_ptr();
    std::mem::forget(buf); // don't free
    ptr
}

/// Free memory previously allocated
#[unsafe(no_mangle)]
pub extern "C" fn __free(ptr: *mut u8, size: usize) {
    unsafe {
        let _ = Vec::from_raw_parts(ptr, 0, size);
    }
}
