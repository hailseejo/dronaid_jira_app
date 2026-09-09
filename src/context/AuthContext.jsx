import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

import { onAuthStateChanged } from "firebase/auth";
import { auth, logoutUser } from "../firebase/auth";
import { getUserProfile } from "../firebase/firestore";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);

  const [loading, setLoading] = useState(true);
  const [profileMissing, setProfileMissing] = useState(false);
  const [profileError, setProfileError] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(
      auth,
      async (firebaseUser) => {
        try {
          // =====================================================
          // USER LOGGED OUT
          // =====================================================

          if (!firebaseUser) {
            setCurrentUser(null);
            setUserProfile(null);
            setProfileMissing(false);
            setProfileError(null);
            setLoading(false);
            return;
          }

          // =====================================================
          // USER LOGGED IN
          // =====================================================

          setCurrentUser(firebaseUser);
          setProfileMissing(false);
          setProfileError(null);

          // Load the corresponding Firestore profile
          const profile = await getUserProfile(
            firebaseUser.uid
          );

          if (!profile) {
            setUserProfile(null);
            setProfileMissing(true);
          } else {
            setUserProfile(profile);
            setProfileMissing(false);
          }
        } catch (error) {
          console.error(
            "Error loading user profile:",
            error
          );

          setUserProfile(null);
          setProfileError(error);
        } finally {
          setLoading(false);
        }
      }
    );

    return unsubscribe;
  }, []);

  // =====================================================
  // ROLE
  // =====================================================

  const isAdmin =
    userProfile?.role === "Admin" || userProfile?.role === "EB";

  // =====================================================
  // CONTEXT VALUE
  // =====================================================

  const value = {
    currentUser,
    userProfile,
    isAdmin,

    // Keep "user" too in case other existing components
    // in your project use user instead of currentUser.
    user: currentUser,

    loading,
    profileMissing,
    profileError,
    logout: logoutUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthContext() {
  return useContext(AuthContext);
}