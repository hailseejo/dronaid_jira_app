import {
  doc,
  getDoc,
  setDoc,
  collection,
  query,
  where,
  onSnapshot,
  addDoc,
  updateDoc,
  deleteDoc,
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
  { name, email, subsystem, role }
) => {
  return setDoc(doc(db, "users", uid), {
    name,
    email,
    subsystem,
    role,
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