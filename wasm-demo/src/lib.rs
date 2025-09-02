#[unsafe(no_mangle)]
pub extern "C" fn add(a: i32, b: i32) -> i32 {
    a + b
}

#[unsafe(no_mangle)]
pub extern "C" fn multiply(a: i32, b: i32) -> i32 {
    a * b
}

#[unsafe(no_mangle)]
pub extern "C" fn greet(ptr: *const u8, len: usize) {
    unsafe {
        let slice = std::slice::from_raw_parts(ptr, len);
        if let Ok(s) = std::str::from_utf8(slice) {
            println!("Hello from Wasm! Got string: {}", s);
        }
    }
}

#[unsafe(no_mangle)]
pub extern "C" fn __malloc(size: usize) -> *mut u8 {
    let mut buf = Vec::with_capacity(size);
    let ptr = buf.as_mut_ptr();
    std::mem::forget(buf);
    ptr
}

#[unsafe(no_mangle)]
pub extern "C" fn __free(ptr: *mut u8, size: usize) {
    unsafe {
        let _ = Vec::from_raw_parts(ptr, 0, size);
    }
}

// --- Extra functions for parser testing ---

#[unsafe(no_mangle)]
pub extern "C" fn negate_i64(x: i64) -> i64 {
    -x
}

#[unsafe(no_mangle)]
pub extern "C" fn half_f32(x: f32) -> f32 {
    x / 2.0
}

#[unsafe(no_mangle)]
pub extern "C" fn hypotenuse(a: f64, b: f64) -> f64 {
    (a * a + b * b).sqrt()
}

#[unsafe(no_mangle)]
pub extern "C" fn log_number(x: i32) {
    println!("Wasm log: {}", x);
}

#[unsafe(no_mangle)]
pub extern "C" fn mix(a: i32, b: f32, c: f64) -> f64 {
    a as f64 + b as f64 + c
}

#[unsafe(no_mangle)]
pub extern "C" fn get_magic_number() -> i32 {
    42
}

#[unsafe(no_mangle)]
pub static mut COUNTER: i32 = 0;

#[unsafe(no_mangle)]
pub extern "C" fn increment_counter() {
    unsafe {
        COUNTER += 1;
    }
}
