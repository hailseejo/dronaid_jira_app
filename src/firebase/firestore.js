import { doc, setDoc } from "firebase/firestore";
import { db } from "./firebase";

export const createUserProfile = (uid, { name, email, subsystem, role }) =>
  setDoc(doc(db, "users", uid), {
    name,
    email,
    subsystem,
    role,
  });
