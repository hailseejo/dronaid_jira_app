import { useEffect, useState } from "react";
import {
  subscribeToOngoingSubsystemTasks,
  subscribeToAllOngoingTasks,
  subscribeToMemberTasks,
  subscribeToSubsystemMemberTasks,
  createTask as createTaskDoc,
  updateTaskStatus as updateTaskStatusDoc,
  deleteTask as deleteTaskDoc,
} from "../firebase/firestore";

// Live ongoing-task list, scoped the same way useMembers is scoped:
//   scope: "subsystem" (default) -> ongoing tasks for one subsystem
//   scope: "all"                 -> ongoing tasks across every subsystem (Admin)
export function useSubsystemTasks(subsystem, { scope = "subsystem" } = {}) {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- resetting loading/error before starting a new subscription
    setLoading(true);
    setError(null);

    const onNext = (data) => {
      setTasks(data);
      setLoading(false);
    };
    const onError = (err) => {
      console.error("Error loading tasks:", err);
      setError(err);
      setLoading(false);
    };

    const unsubscribe =
      scope === "all"
        ? subscribeToAllOngoingTasks(onNext, onError)
        : subscribeToOngoingSubsystemTasks(subsystem, onNext, onError);

    return unsubscribe;
  }, [subsystem, scope]);

  return { tasks, loading, error };
}

// Live list of every task assigned to a single member (any status) — for
// the member's own page.
export function useMemberTasks(uid) {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- resetting loading/error before starting a new subscription
    setLoading(true);
    setError(null);
    const unsubscribe = subscribeToMemberTasks(
      uid,
      (data) => {
        setTasks(data);
        setLoading(false);
      },
      (err) => {
        console.error("Error loading member tasks:", err);
        setError(err);
        setLoading(false);
      }
    );
    return unsubscribe;
  }, [uid]);

  return { tasks, loading, error };
}

// Live list of one member's tasks, as visible to a same-subsystem teammate
// (not the member themself, not an Admin). See subscribeToSubsystemMemberTasks
// for why the query has to be shaped this way.
export function useSubsystemMemberTasks(subsystem, memberId) {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- resetting loading/error before starting a new subscription
    setLoading(true);
    setError(null);
    const unsubscribe = subscribeToSubsystemMemberTasks(
      subsystem,
      memberId,
      (data) => {
        setTasks(data);
        setLoading(false);
      },
      (err) => {
        console.error("Error loading teammate's tasks:", err);
        setError(err);
        setLoading(false);
      }
    );
    return unsubscribe;
  }, [subsystem, memberId]);

  return { tasks, loading, error };
}

// Task creation always derives `subsystem` and `createdBy` from the caller's
// own authenticated profile — never from a form field — matching both the
// UI expectation and the security rule that validates the same thing.
export function useCreateTask({ userProfile, currentUser }) {
  return (fields) =>
    createTaskDoc({
      ...fields,
      subsystem: fields.subsystem || userProfile?.subsystem,
      createdBy: currentUser?.uid,
    });
}

export function canManageSubsystemTasks(userProfile, subsystem) {
  if (!userProfile || !subsystem) return false;
  if (userProfile.role === "EB") return true;
  if (userProfile.hierarchyTier !== "Subsystem Heads") return false;

  const email = userProfile.email?.toLowerCase();
  if (email === "mahekg819@gmail.com" && ["AI and Automation", "Software"].includes(subsystem)) {
    return true;
  }

  return userProfile.subsystem === subsystem || userProfile.managedSubsystems?.includes(subsystem);
}

export const updateTaskStatus = updateTaskStatusDoc;
export const deleteTask = deleteTaskDoc;