import { useEffect, useState } from "react";
import {
  subscribeToCompetitions,
  createCompetition as createCompetitionDoc,
  deleteCompetition as deleteCompetitionDoc,
} from "../firebase/firestore";

// Single shared hook used by BOTH CompetitionPage and the Dashboard's
// CompetitionCard — there is exactly one Firestore collection behind this,
// so both call sites always see the same live data.
export function useCompetitions() {
  const [competitions, setCompetitions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- resetting loading/error before starting the subscription
    setLoading(true);
    setError(null);
    const unsubscribe = subscribeToCompetitions(
      (data) => {
        setCompetitions(data);
        setLoading(false);
      },
      (err) => {
        console.error("Error loading competitions:", err);
        setError(err);
        setLoading(false);
      }
    );
    return unsubscribe;
  }, []);

  return { competitions, loading, error };
}

export const createCompetition = createCompetitionDoc;
export const deleteCompetition = deleteCompetitionDoc;