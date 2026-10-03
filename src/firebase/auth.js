import {
  signInWithEmailAndPassword,
  signOut,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
} from "firebase/auth";

// Reuse the single auth instance created in firebase.js instead of calling
// getAuth(app) a second time here.
import { auth } from "./firebase";

export const loginUser = (email, password) => {
  return signInWithEmailAndPassword(auth, email, password);
};

export const registerUser = (email, password) => {
  return createUserWithEmailAndPassword(auth, email, password);
};

export const logoutUser = () => {
  return signOut(auth);
};

// Reset password
export const resetUserPassword = (email) => {
  return sendPasswordResetEmail(auth, email);
};

// Export auth instance
export { auth };