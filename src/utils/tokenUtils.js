// utils/tokenUtils.js
import { jwtDecode } from "jwt-decode";

export function isTokenValid(token) {
  try {
    const decoded = jwtDecode(token);
    const currentTime = Date.now() / 1000; // current time in seconds
    return decoded.exp > currentTime;
  } catch (error) {
    return false;
  }
}
