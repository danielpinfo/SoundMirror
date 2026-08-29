/** Hindi pack-owned Devanagari keyboard layout. */

export const HINDI_KEYBOARD_ROWS = Object.freeze([
  Object.freeze(['अ','आ','इ','ई','उ','ऊ','ऋ','ए','ऐ','ओ','औ']),
  Object.freeze(['क','ख','ग','घ','ङ','च','छ','ज','झ','ञ']),
  Object.freeze(['ट','ठ','ड','ढ','ण','त','थ','द','ध','न']),
  Object.freeze(['प','फ','ब','भ','म','य','र','ल','व']),
  Object.freeze(['श','ष','स','ह','क़','ख़','ग़','ज़','फ़']),
  Object.freeze(['ँ','ं','ः','़','्','ा','ि','ी','ु','ू','ृ','े','ै','ो','ौ','⌫']),
]);

export function getHindiKeyboardLayout() {
  return {
    type: 'rows',
    direction: 'ltr',
    rows: HINDI_KEYBOARD_ROWS,
  };
}

export default getHindiKeyboardLayout;
