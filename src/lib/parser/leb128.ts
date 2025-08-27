/**
 * Reads an unsigned LEB128 integer from a Uint8Array, updating the offset.
 * @param buffer The Uint8Array containing the Wasm binary.
 * @param offset An object holding the current read offset (will be updated).
 * @returns The decoded unsigned integer.
 */
export function readUleb128(
    buffer: Uint8Array,
    offset: { value: number },
): number {
    let result = 0;
    let shift = 0;
    let byte: number;

    while (true) {
        if (offset.value >= buffer.length) {
            throw new Error('Unexpected end of buffer while reading ULEB128');
        }
        byte = buffer[offset.value++];
        result |= (byte & 0x7f) << shift;
        if ((byte & 0x080) === 0) {
            break;
        }
        shift += 7;
        if (shift >= 32) {
            throw new Error('ULEB128 integer too large');
        }
    }
    return result;
}
