import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import app from "./config";

// Reuse the app initialized in config.js so Firebase is configured only once.
export const auth = getAuth(app);
export const db = getFirestore(app);
