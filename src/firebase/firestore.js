import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "./firebase";

export const createUserProfile = (uid, { name, email, subsystem, role }) =>
  setDoc(doc(db, "users", uid), {
    name,
    email,
    subsystem,
    role,
  });

export const getUserProfile = async (uid) => {
  if (!uid) return null;
  try {
    const ref = doc(db, "users", uid);
    const snap = await getDoc(ref);
    if (snap.exists()) {
      const data = snap.data();
      try {
        localStorage.setItem(`dronaid-user-${uid}`, JSON.stringify(data));
      } catch {}
      return data;
    }
  } catch (err) {
    console.warn("Error fetching user profile from Firestore:", err);
  }
  try {
    const cached = localStorage.getItem(`dronaid-user-${uid}`);
    if (cached) return JSON.parse(cached);
  } catch {}
  return null;
};
