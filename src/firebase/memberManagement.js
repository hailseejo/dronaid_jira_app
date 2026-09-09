import { getFunctions, httpsCallable } from "firebase/functions";
import { collection, doc, getDocs, setDoc, serverTimestamp } from "firebase/firestore";
import { createUserWithEmailAndPassword, getAuth, signOut } from "firebase/auth";
import { getApp, initializeApp } from "firebase/app";

import app, { firebaseConfig } from "./config";
import { db } from "./firebase";

const functions = getFunctions(app);

const getMemberRosterCall = httpsCallable(functions, "getMemberRoster");
const createMemberAccountCall = httpsCallable(functions, "createMemberAccount");

const provisioningApp = (() => {
  try {
    return getApp("member-provisioning");
  } catch {
    return initializeApp(firebaseConfig, "member-provisioning");
  }
})();

const provisioningAuth = getAuth(provisioningApp);

export const getMemberRoster = async () => {
  try {
    const result = await getMemberRosterCall();
    return result.data.members;
  } catch (functionError) {
    const response = await fetch("/api/member-roster");
    if (!response.ok) {
      throw functionError;
    }

    const { members } = await response.json();
    const usersSnapshot = await getDocs(collection(db, "users"));
    const registeredEmails = new Set(
      usersSnapshot.docs
        .map((document) => document.data().email?.trim().toLowerCase())
        .filter(Boolean)
    );

    return members.map((member) => ({
      ...member,
      registered: registeredEmails.has(member.email),
    }));
  }
};

export const createMemberAccount = async (memberEmail, password) => {
  try {
    const result = await createMemberAccountCall({ memberEmail, password });
    return result.data;
  } catch (functionError) {
    const response = await fetch("/api/member-roster");
    if (!response.ok) throw functionError;

    const { members } = await response.json();
    const member = members.find(
      (entry) => entry.email === memberEmail.trim().toLowerCase()
    );
    if (!member) throw new Error("That member is not in the official roster.");

    const subsystemLabel = member.roleAndSubsystem.split("•").pop()?.trim();
    const subsystem = {
      AIA: "AI and Automation",
      ECS: "Electronics",
      MAD: "MAD",
      Research: "Research",
      Management: "Management",
      Software: "Software",
    }[subsystemLabel] || "Management";

    try {
      const credential = await createUserWithEmailAndPassword(
        provisioningAuth,
        member.email,
        password
      );

      await setDoc(doc(db, "users", credential.user.uid), {
        name: member.fullName,
        email: member.email,
        role: "Member",
        subsystem,
        hierarchyTier: member.hierarchyTier,
        rosterRole: member.roleAndSubsystem,
        ...(member.memberId ? { memberId: member.memberId } : {}),
        createdAt: serverTimestamp(),
      });

      return { name: member.fullName, email: member.email };
    } finally {
      await signOut(provisioningAuth);
    }
  }
};
