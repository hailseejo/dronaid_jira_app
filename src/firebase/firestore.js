import {
  doc,
  getDoc,
  getDocs,
  setDoc,
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  addDoc,
  updateDoc,
  deleteDoc,
  writeBatch,
  serverTimestamp,
} from "firebase/firestore";

import { db } from "./firebase";

// =====================================================
// USER PROFILES
// =====================================================

// Create a user profile.
// SignUpPage always sends role: "Member".
// Firestore Security Rules also enforce this.
export const createUserProfile = async (
  uid,
  { name, email, subsystem, role, ebAuthorizationCode }
) => {
  return setDoc(doc(db, "users", uid), {
    name,
    email,
    subsystem,
    role,
    ...(ebAuthorizationCode ? { ebAuthorizationCode } : {}),
  });
};

// Get one user's profile.
export const getUserProfile = async (uid) => {
  if (!uid) return null;

  try {
    const ref = doc(db, "users", uid);
    const snap = await getDoc(ref);

    if (!snap.exists()) {
      return null;
    }

    return {
      id: snap.id,
      ...snap.data(),
    };
  } catch (error) {
    console.error("Error fetching user profile:", error);
    throw error;
  }
};

// Live subscription to one user's profile.
// This allows role/subsystem changes to update immediately.
export const subscribeToUserProfile = (uid, onNext, onError) => {
  if (!uid) {
    onNext(null);
    return () => {};
  }

  const ref = doc(db, "users", uid);

  return onSnapshot(
    ref,
    (snap) => {
      if (snap.exists()) {
        onNext({
          id: snap.id,
          ...snap.data(),
        });
      } else {
        onNext(null);
      }
    },
    onError
  );
};


// =====================================================
// MEMBERS
// =====================================================

// Get members belonging to one subsystem.
//
// IMPORTANT:
// The caller should pass the logged-in user's own subsystem
// when the caller is a normal Member.
export const subscribeToSubsystemMembers = (
  subsystem,
  onNext,
  onError
) => {
  if (!subsystem) {
    onNext([]);
    return () => {};
  }

  const q = query(
    collection(db, "users"),
    where("subsystem", "==", subsystem)
  );

  return onSnapshot(
    q,
    (snap) => {
      const members = snap.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      }));

      onNext(members);
    },
    onError
  );
};


// Get ALL members.
// This should only be called by Executive Board users.
export const subscribeToAllMembers = (onNext, onError) => {
  const q = query(collection(db, "users"));

  return onSnapshot(
    q,
    (snap) => {
      const members = snap.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      }));

      onNext(members);
    },
    onError
  );
};


// =====================================================
// TASKS
// =====================================================

// Create a task.
export const createTask = ({
  title,
  description,
  assignedTo,
  subsystem,
  priority,
  dueDate,
  createdBy,
}) => {
  return addDoc(collection(db, "tasks"), {
    title,
    description: description || "",
    assignedTo: assignedTo || null,
    subsystem,
    priority: priority || "Medium",
    status: "Ongoing",
    dueDate: dueDate ? new Date(dueDate) : null,
    createdBy,
    createdAt: serverTimestamp(),
  });
};


// Update task status.
export const updateTaskStatus = (taskId, status) => {
  return updateDoc(doc(db, "tasks", taskId), {
    status,
  });
};


// Delete task.
export const deleteTask = (taskId) => {
  return deleteDoc(doc(db, "tasks", taskId));
};


// =====================================================
// ONGOING TASKS BY SUBSYSTEM
// =====================================================

export const subscribeToOngoingSubsystemTasks = (
  subsystem,
  onNext,
  onError
) => {
  if (!subsystem) {
    onNext([]);
    return () => {};
  }

  const q = query(
    collection(db, "tasks"),
    where("subsystem", "==", subsystem),
    where("status", "==", "Ongoing")
  );

  return onSnapshot(
    q,
    (snap) => {
      const tasks = snap.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      }));

      onNext(tasks);
    },
    onError
  );
};


// =====================================================
// ALL ONGOING TASKS
// =====================================================

// Executive Board only.
export const subscribeToAllOngoingTasks = (onNext, onError) => {
  const q = query(
    collection(db, "tasks"),
    where("status", "==", "Ongoing")
  );

  return onSnapshot(
    q,
    (snap) => {
      const tasks = snap.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      }));

      onNext(tasks);
    },
    onError
  );
};


// =====================================================
// TASKS ASSIGNED TO ONE MEMBER
// =====================================================

export const subscribeToMemberTasks = (
  uid,
  onNext,
  onError
) => {
  if (!uid) {
    onNext([]);
    return () => {};
  }

  const q = query(
    collection(db, "tasks"),
    where("assignedTo", "==", uid)
  );

  return onSnapshot(
    q,
    (snap) => {
      const tasks = snap.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      }));

      // Sort newest first.
      tasks.sort(
        (a, b) =>
          (b.createdAt?.toMillis?.() || 0) -
          (a.createdAt?.toMillis?.() || 0)
      );

      onNext(tasks);
    },
    onError
  );
};
// =====================================================
// CALENDAR TASKS (Dashboard calendar widget)
// =====================================================
//
// Each document is its own calendar task, keyed by a full "YYYY-MM-DD"
// date string (not just a day-of-month number) so the same day number in
// different months/years is never confused. Shared team-wide: every
// signed-in user sees the same calendar, matching the previous local
// state's behaviour of one shared calendar for everyone.

export const createCalendarTask = ({ title, date, createdBy }) =>
  addDoc(collection(db, "calendarTasks"), {
    title,
    date, // "YYYY-MM-DD" string
    createdBy,
    createdAt: serverTimestamp(),
  });

export const deleteCalendarTask = (taskId) =>
  deleteDoc(doc(db, "calendarTasks", taskId));

// Small, shared, team-wide collection — loaded in full and grouped by date
// client-side rather than re-querying per month, so switching months does
// not need a new subscription.
export const subscribeToCalendarTasks = (onNext, onError) => {
  const q = collection(db, "calendarTasks");
  return onSnapshot(
    q,
    (snap) => onNext(snap.docs.map((d) => ({ id: d.id, ...d.data() }))),
    onError
  );
};

// =====================================================
// ANNOUNCEMENTS (Dashboard announcements widget)
// =====================================================

export const createAnnouncement = ({ title, createdBy }) =>
  addDoc(collection(db, "announcements"), {
    title,
    createdBy,
    createdAt: serverTimestamp(),
  });

export const deleteAnnouncement = (announcementId) =>
  deleteDoc(doc(db, "announcements", announcementId));

// orderBy on a single field needs no composite index.
export const subscribeToAnnouncements = (onNext, onError) => {
  const q = query(collection(db, "announcements"), orderBy("createdAt", "desc"));
  return onSnapshot(
    q,
    (snap) => onNext(snap.docs.map((d) => ({ id: d.id, ...d.data() }))),
    onError
  );
};

// =====================================================
// COMPETITIONS (Competition page + Dashboard CompetitionCard —
// single shared source of truth for both)
// =====================================================
//
// startDate/endDate are stored as real Firestore Timestamps (not display
// strings), so they stay sortable/queryable; formatting happens only when
// rendering.

export const createCompetition = ({ name, startDate, endDate, location, createdBy }) =>
  addDoc(collection(db, "competitions"), {
    name,
    startDate: startDate ? new Date(startDate) : null,
    endDate: endDate ? new Date(endDate) : null,
    location: location || "",
    createdBy,
    createdAt: serverTimestamp(),
  });

// Deleting a competition also deletes every competitionChecklistTasks doc
// that points at it (competitionId == competitionId), so no orphaned
// checklist tasks are left behind. Tasks belonging to OTHER competitions
// are untouched. Done as a single atomic batch.
export const deleteCompetition = async (competitionId) => {
  const orphanedTasksQuery = query(
    collection(db, "competitionChecklistTasks"),
    where("competitionId", "==", competitionId)
  );
  const orphanedTasksSnap = await getDocs(orphanedTasksQuery);

  const batch = writeBatch(db);
  orphanedTasksSnap.docs.forEach((taskDoc) => batch.delete(taskDoc.ref));
  batch.delete(doc(db, "competitions", competitionId));

  return batch.commit();
};

// Small, shared collection — loaded in full and sorted by start date
// client-side (avoids requiring an orderBy index on a field that can be null).
export const subscribeToCompetitions = (onNext, onError) => {
  const q = collection(db, "competitions");
  return onSnapshot(
    q,
    (snap) => {
      const competitions = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      competitions.sort(
        (a, b) => (a.startDate?.toMillis?.() || 0) - (b.startDate?.toMillis?.() || 0)
      );
      onNext(competitions);
    },
    onError
  );
};

// =====================================================
// COMPETITION CHECKLIST TASKS
// =====================================================
//
// competitionId stores only the Firestore document ID of the competition
// it belongs to — the competition itself is never duplicated in here.

export const createCompetitionChecklistTask = ({
  subsystem,
  task,
  priority,
  competitionId,
  createdBy,
}) =>
  addDoc(collection(db, "competitionChecklistTasks"), {
    subsystem,
    task,
    priority: priority || "Medium",
    competitionId,
    complete: false,
    createdBy,
    createdAt: serverTimestamp(),
  });

export const updateCompetitionChecklistTask = (taskId, fields) =>
  updateDoc(doc(db, "competitionChecklistTasks", taskId), fields);

export const deleteCompetitionChecklistTask = (taskId) =>
  deleteDoc(doc(db, "competitionChecklistTasks", taskId));

// Loaded in full (shared, small collection) — the existing "All
// Competitions" / competitionId-match filter continues to run client-side
// exactly as it did before, just over Firestore-backed data now.
export const subscribeToCompetitionChecklistTasks = (onNext, onError) => {
  const q = collection(db, "competitionChecklistTasks");
  return onSnapshot(
    q,
    (snap) => onNext(snap.docs.map((d) => ({ id: d.id, ...d.data() }))),
    onError
  );
};
// =====================================================
// ONE MEMBER'S TASKS, VISIBLE TO A SAME-SUBSYSTEM TEAMMATE
// =====================================================
//
// subscribeToMemberTasks(uid) only satisfies the Firestore rule when the
// caller IS uid (or an Admin) — the rule can't verify an arbitrary
// assignedTo query against someone else's data. For a teammate viewing
// another member's page, the query has to also filter by subsystem so it
// structurally matches the rule's `resource.data.subsystem == mySubsystem()`
// branch; filtering by assignedTo on top of that (client-side-safe since
// it only narrows further) picks out just this one member's tasks.
export const subscribeToSubsystemMemberTasks = (subsystem, memberId, onNext, onError) => {
  if (!subsystem || !memberId) {
    onNext([]);
    return () => {};
  }
  const q = query(
    collection(db, "tasks"),
    where("subsystem", "==", subsystem),
    where("assignedTo", "==", memberId)
  );
  return onSnapshot(
    q,
    (snap) => onNext(snap.docs.map((d) => ({ id: d.id, ...d.data() }))),
    onError
  );
};