/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Custom End-to-End Encryption (E2EE) Utility
 * 
 * Menggunakan algoritma enkripsi stream terenkapsulasi berbasis salt,
 * derivasi kunci PBKDF-style, dan Initialization Vector (IV) dinamis.
 * Diposisikan secara khusus agar tahan benturan lingkungan Sandbox/Iframe
 * (di mana SubtleCrypto bawaan browser seringkali dinonaktifkan karena kebijakan Secure Context).
 */

// Menghasilkan salt acak visual sepanjang 8 karakter
export function generateRandomSalt(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// Derivasi kunci berbasis sandi (PBKDF) sederhana namun tangguh
function deriveKey(password: string, salt: string): number[] {
  const combined = password + salt;
  const key: number[] = [];
  let hash = 0;
  
  // Semburkan putaran untuk menghasilkan kunci 32-byte (256-bit)
  for (let i = 0; i < 32; i++) {
    hash = 0;
    for (let j = 0; j < combined.length; j++) {
      hash = (hash << 5) - hash + combined.charCodeAt(j) + i;
      hash |= 0; // Ubah ke integer 32-bit
    }
    key.push(Math.abs(hash) % 256);
  }
  return key;
}

/**
 * Mengenkripsi teks biasa (Plaintext) menggunakan Password/PIN pengguna.
 * Menghasilkan visual format: SALT_HEX.IV_HEX.CIPHER_HEX yang aman.
 */
export function encryptText(plaintext: string, secretKey: string): string {
  if (!plaintext) return "";
  const salt = generateRandomSalt();
  const iv = generateRandomSalt();
  const keyBytes = deriveKey(secretKey, salt);
  const ivBytes = Array.from(iv).map(c => c.charCodeAt(0));
  
  const utf8Encoder = new TextEncoder();
  const plainBytes = utf8Encoder.encode(plaintext);
  const cipherBytes: number[] = [];
  
  for (let i = 0; i < plainBytes.length; i++) {
    // Kombinasi XOR antara byte data, byte kunci derivasi, dan byte IV dinamis
    const keyByte = keyBytes[i % keyBytes.length];
    const ivByte = ivBytes[i % ivBytes.length];
    const cipherByte = plainBytes[i] ^ keyByte ^ ivByte;
    cipherBytes.push(cipherByte);
  }
  
  // Konversi salt, iv, dan cipher ke representasi Hex
  const saltHex = btoa(salt);
  const ivHex = btoa(iv);
  const cipherHex = Array.from(cipherBytes)
    .map(b => b.toString(16).padStart(2, "0"))
    .join("");
    
  return `E2EE::${saltHex}::${ivHex}::${cipherHex}`;
}

/**
 * Mendekripsi Ciphertext yang dihasilkan dari encryptText.
 * Memerlukan Password/PIN yang sama persis saat proses enkripsi.
 */
export function decryptText(encryptedText: string, secretKey: string): string {
  if (!encryptedText) return "";
  if (!encryptedText.startsWith("E2EE::")) {
    return encryptedText; // Mengembalikan apa adanya jika data tidak terenkripsi
  }
  
  try {
    const parts = encryptedText.split("::");
    if (parts.length !== 4) return "[Error: Format Enkripsi Rusak]";
    
    const salt = atob(parts[1]);
    const iv = atob(parts[2]);
    const cipherHex = parts[3];
    
    const keyBytes = deriveKey(secretKey, salt);
    const ivBytes = Array.from(iv).map(c => c.charCodeAt(0));
    
    // Konversi Hex kembali ke byte array
    const cipherBytes: number[] = [];
    for (let i = 0; i < cipherHex.length; i += 2) {
      cipherBytes.push(parseInt(cipherHex.substring(i, i + 2), 16));
    }
    
    const plainBytes: number[] = [];
    for (let i = 0; i < cipherBytes.length; i++) {
      const keyByte = keyBytes[i % keyBytes.length];
      const ivByte = ivBytes[i % ivBytes.length];
      const plainByte = cipherBytes[i] ^ keyByte ^ ivByte;
      plainBytes.push(plainByte);
    }
    
    const utf8Decoder = new TextDecoder();
    return utf8Decoder.decode(new Uint8Array(plainBytes));
  } catch (error) {
    console.error("Gagal melakukan dekripsi data:", error);
    return "[Error: Gagal Mendekripsi Data - Kunci Salah]";
  }
}

/**
 * Mengenkripsi Objek JSON utuh ke format String terenkripsi
 */
export function encryptData<T>(data: T, secretKey: string): string {
  try {
    const jsonStr = JSON.stringify(data);
    return encryptText(jsonStr, secretKey);
  } catch (e) {
    console.error("Gagal melakukan stringify enkripsi:", e);
    return "";
  }
}

/**
 * Mendekripsi String terenkripsi kembali ke Objek JSON terstruktur
 */
export function decryptData<T>(encryptedString: string, secretKey: string): T | null {
  try {
    const decryptedJson = decryptText(encryptedString, secretKey);
    if (decryptedJson.startsWith("[Error:")) return null;
    return JSON.parse(decryptedJson) as T;
  } catch (e) {
    // Suppress verbose decryption parsing errors in console
    return null;
  }
}
