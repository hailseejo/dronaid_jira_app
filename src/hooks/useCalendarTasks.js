import { useEffect, useState } from "react";
import {
  subscribeToCalendarTasks,
  createCalendarTask as createCalendarTaskDoc,
  deleteCalendarTask as deleteCalendarTaskDoc,
} from "../firebase/firestore";

export function useCalendarTasks() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- resetting loading/error before starting the subscription
    setLoading(true);
    setError(null);
    const unsubscribe = subscribeToCalendarTasks(
      (data) => {
        setTasks(data);
        setLoading(false);
      },
      (err) => {
        console.error("Error loading calendar tasks:", err);
        setError(err);
        setLoading(false);
      }
    );
    return unsubscribe;
  }, []);

  return { tasks, loading, error };
}

export const createCalendarTask = createCalendarTaskDoc;
export const deleteCalendarTask = deleteCalendarTaskDoc;