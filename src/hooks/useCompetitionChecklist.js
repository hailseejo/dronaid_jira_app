import { useEffect, useState } from "react";
import {
  subscribeToCompetitionChecklistTasks,
  createCompetitionChecklistTask as createCompetitionChecklistTaskDoc,
  updateCompetitionChecklistTask as updateCompetitionChecklistTaskDoc,
  deleteCompetitionChecklistTask as deleteCompetitionChecklistTaskDoc,
} from "../firebase/firestore";

export function useCompetitionChecklist() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- resetting loading/error before starting the subscription
    setLoading(true);
    setError(null);
    const unsubscribe = subscribeToCompetitionChecklistTasks(
      (data) => {
        setTasks(data);
        setLoading(false);
      },
      (err) => {
        console.error("Error loading competition checklist tasks:", err);
        setError(err);
        setLoading(false);
      }
    );
    return unsubscribe;
  }, []);

  return { tasks, loading, error };
}

export const createCompetitionChecklistTask = createCompetitionChecklistTaskDoc;
export const updateCompetitionChecklistTask = updateCompetitionChecklistTaskDoc;
export const deleteCompetitionChecklistTask = deleteCompetitionChecklistTaskDoc;