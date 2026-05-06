/**
 * File: encryption.ts
 * Description: A lightweight encryption utility for securing sensitive data in LocalStorage.
 * It uses a simple XOR-based algorithm with a secret key to transform strings into hex-encoded numeric-like strings.
 */

// A secret key used for the bitwise XOR operation. 
// In a real production app, this should be more complex or fetched from a secure config.
const ENCRYPTION_KEY = "airbnb-secret-key-2026";

/**
 * Encrypts a plaintext string into a hex string.
 * @param text The plain text to encrypt (e.g., a JWT token)
 * @returns An encrypted string in hexadecimal format (contains 0-9 and a-f)
 */
export const encrypt = (text: string): string => {
  // Convert the string into a sequence of characters and apply bitwise XOR with the key
  return text
    .split("")
    .map((char, index) => {
      // Get char code and XOR it with the character code of the key at a cyclic position
      const charCode = char.charCodeAt(0) ^ ENCRYPTION_KEY.charCodeAt(index % ENCRYPTION_KEY.length);
      // Return the result as a 2-digit hex string
      return charCode.toString(16).padStart(2, "0");
    })
    .join("");
};

/**
 * Decrypts a hex string back into its original plaintext.
 * @param encodedText The hex-encoded encrypted string
 * @returns The original decrypted plaintext
 */
export const decrypt = (encodedText: string): string => {
  try {
    // Split the hex string into 2-character chunks (each representing one original character)
    const matches = encodedText.match(/.{1,2}/g);
    if (!matches) return "";

    return matches
      .map((hex, index) => {
        // Convert hex back to decimal, then reverse the XOR operation
        const charCode = parseInt(hex, 16) ^ ENCRYPTION_KEY.charCodeAt(index % ENCRYPTION_KEY.length);
        // Convert back to character
        return String.fromCharCode(charCode);
      })
      .join("");
  } catch (error) {
    console.error("Decryption failed:", error);
    return "";
  }
};
