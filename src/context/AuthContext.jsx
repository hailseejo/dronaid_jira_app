import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

import { onAuthStateChanged } from "firebase/auth";
import { auth, logoutUser } from "../firebase/auth";
import { subscribeToUserProfile } from "../firebase/firestore";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);

  const [loading, setLoading] = useState(true);
  const [profileMissing, setProfileMissing] = useState(false);
  const [profileError, setProfileError] = useState(null);

  useEffect(() => {
    let unsubscribeProfile = () => {};
    const unsubscribeAuth = onAuthStateChanged(auth, (firebaseUser) => {
      unsubscribeProfile();
      if (!firebaseUser) {
        setCurrentUser(null);
        setUserProfile(null);
        setProfileMissing(false);
        setProfileError(null);
        setLoading(false);
        return;
      }

      setCurrentUser(firebaseUser);
      setProfileMissing(false);
      setProfileError(null);
      setLoading(true);
      unsubscribeProfile = subscribeToUserProfile(
        firebaseUser.uid,
        (profile) => {
          setUserProfile(profile);
          setProfileMissing(!profile);
          setLoading(false);
        },
        (error) => {
          console.error("Error loading user profile:", error);
          setUserProfile(null);
          setProfileError(error);
          setLoading(false);
        }
      );
    });

    return () => {
      unsubscribeAuth();
      unsubscribeProfile();
    };
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
