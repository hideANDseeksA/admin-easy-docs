// aes.js
import CryptoJS from "crypto-js";

const ENCRYPTION_KEY = "1234567890abcdef1234567890abcdef"; // Must match backend key

const decrypt = (cipherText) => {
  try {
    const textParts = cipherText.split(":"); // Split IV and encrypted data
    const iv = CryptoJS.enc.Hex.parse(textParts[0]); // Convert IV to bytes
    const encryptedData = CryptoJS.enc.Hex.parse(textParts[1]); // Convert encrypted text to bytes

    // Decrypt using AES-256-CBC
    const decrypted = CryptoJS.AES.decrypt(
      { ciphertext: encryptedData }, 
      CryptoJS.enc.Utf8.parse(ENCRYPTION_KEY), 
      {
        iv: iv,
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7,
      }
    );

    return decrypted.toString(CryptoJS.enc.Utf8); // Convert decrypted bytes to text
  } catch (error) {
    console.error("Decryption error:", error);
    return cipherText; // Return original text if decryption fails
  }
};

export default decrypt;
