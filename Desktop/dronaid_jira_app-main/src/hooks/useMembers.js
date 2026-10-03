import { useEffect, useState } from "react";
import {
  subscribeToSubsystemMembers,
  subscribeToAllMembers,
} from "../firebase/firestore";

// Returns the live member list appropriate for the caller:
//   - Admins (scope: "all") see every member across every subsystem
//   - everyone else sees only members of `subsystem`
// Firestore Security Rules enforce the same boundary server-side, so this
// hook can't be used to see data the rules wouldn't otherwise allow.
export function useMembers(subsystem, { scope = "subsystem" } = {}) {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- resetting loading/error before starting a new subscription
    setLoading(true);
    setError(null);

    const onNext = (data) => {
      setMembers(data);
      setLoading(false);
    };
    const onError = (err) => {
      console.error("Error loading members:", err);
      setError(err);
      setLoading(false);
    };

    const unsubscribe =
      scope === "all"
        ? subscribeToAllMembers(onNext, onError)
        : subscribeToSubsystemMembers(subsystem, onNext, onError);

    return unsubscribe;
  }, [subsystem, scope]);

  return { members, loading, error };
}