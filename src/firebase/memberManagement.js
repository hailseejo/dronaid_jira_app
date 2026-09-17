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
const uploadedRosterKey = "dronaid-uploaded-member-roster";
const googleRosterUrl = "https://docs.google.com/spreadsheets/d/1uWB6v8Mch2GESfhoNki9Zk1ljaEbGDReP5rQ-6L0W-4/export?format=csv&gid=2049926785";

const parseRosterCsv = (content) => {
  const rows = [];
  let row = [];
  let value = "";
  let quoted = false;

  for (let index = 0; index < content.length; index += 1) {
    const character = content[index];
    const nextCharacter = content[index + 1];
    if (character === '"' && quoted && nextCharacter === '"') {
      value += '"';
      index += 1;
    } else if (character === '"') {
      quoted = !quoted;
    } else if (character === "," && !quoted) {
      row.push(value.trim());
      value = "";
    } else if ((character === "\n" || character === "\r") && !quoted) {
      if (character === "\r" && nextCharacter === "\n") index += 1;
      row.push(value.trim());
      if (row.some(Boolean)) rows.push(row);
      row = [];
      value = "";
    } else {
      value += character;
    }
  }
  if (value || row.length) rows.push([...row, value.trim()]);

  const headerIndex = rows.findIndex((row) =>
    row.some((header) => /^full\s*name$/i.test(header)) &&
    row.some((header) => /^email\s*address$/i.test(header))
  );
  if (headerIndex < 0) {
    throw new Error("CSV must contain Full Name and Email Address columns.");
  }

  const headers = rows[headerIndex];
  const indexOf = (pattern) => headers.findIndex((header) => pattern.test(header));
  const nameIndex = indexOf(/^full\s*name$/i);
  const emailIndex = indexOf(/^email\s*address$/i);
  const tierIndex = indexOf(/^hierarchy\s*tier$/i);
  const roleIndex = indexOf(/^role\s*&\s*subsystem$/i);
  const memberIdIndex = headers.findIndex((header) => /member\s*id|^id$/i.test(header));

  return rows.slice(headerIndex + 1)
    .map((item) => ({
      hierarchyTier: item[tierIndex] || "",
      fullName: item[nameIndex] || "",
      email: (item[emailIndex] || "").toLowerCase(),
      roleAndSubsystem: item[roleIndex] || "",
      memberId: memberIdIndex >= 0 ? item[memberIdIndex] || "" : "",
      registered: false,
    }))
    .filter((member) => member.fullName && member.email.includes("@"));
};

export const saveUploadedRoster = async (file) => {
  const roster = parseRosterCsv(await file.text());
  if (roster.length === 0) throw new Error("The CSV does not contain any valid members.");
  localStorage.setItem(uploadedRosterKey, JSON.stringify(roster));
  return roster;
};

export const loadGoogleRoster = async () => {
  const response = await fetch(googleRosterUrl, { cache: "no-store" });
  if (!response.ok) {
    throw new Error("Unable to load the Google Sheet roster.");
  }
  const roster = parseRosterCsv(await response.text());
  if (roster.length === 0) throw new Error("The Google Sheet does not contain any valid members.");
  localStorage.setItem(uploadedRosterKey, JSON.stringify(roster));
  return roster;
};

const getUploadedRoster = () => {
  try {
    return JSON.parse(localStorage.getItem(uploadedRosterKey) || "[]");
  } catch {
    return [];
  }
};

export const getMemberRoster = async () => {
  try {
    const googleRoster = await loadGoogleRoster();
    const usersSnapshot = await getDocs(collection(db, "users"));
    const registeredEmails = new Set(
      usersSnapshot.docs
        .map((document) => document.data().email?.trim().toLowerCase())
        .filter(Boolean)
    );
    return googleRoster.map((member) => ({
      ...member,
      registered: registeredEmails.has(member.email),
    }));
  } catch {
    const uploadedRoster = getUploadedRoster();
    if (uploadedRoster.length > 0) {
      const usersSnapshot = await getDocs(collection(db, "users"));
      const registeredEmails = new Set(
        usersSnapshot.docs
          .map((document) => document.data().email?.trim().toLowerCase())
          .filter(Boolean)
      );
      return uploadedRoster.map((member) => ({
        ...member,
        registered: registeredEmails.has(member.email),
      }));
    }
  }

  try {
    const result = await getMemberRosterCall();
    return result.data.members;
  } catch (functionError) {
    const response = await fetch("/api/member-roster");
    if (!response.ok) {
      const details = await response.json().catch(() => ({}));
      throw new Error(details.error || functionError.message || "Unable to load the member roster.", { cause: functionError });
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
    const uploadedRoster = getUploadedRoster();
    let members = uploadedRoster;
    if (members.length === 0) {
      const response = await fetch("/api/member-roster");
      if (!response.ok) {
        const details = await response.json().catch(() => ({}));
        throw new Error(details.error || functionError.message || "Unable to load the member roster.", { cause: functionError });
      }
      ({ members } = await response.json());
    }
    const member = members.find(
      (entry) => entry.email === memberEmail.trim().toLowerCase()
    );
    if (!member) {
      throw new Error("That member is not in the official roster.", { cause: functionError });
    }

    const subsystemLabels = member.roleAndSubsystem
      .split("•").pop()?.split(/[,/]/).map((label) => label.trim()) || [];
    const subsystemMap = {
      AIA: "AI and Automation",
      ECS: "Electronics",
      MAD: "MAD",
      Research: "Research",
      Management: "Management",
      Software: "Software",
    };
    const managedSubsystems = subsystemLabels
      .map((label) => subsystemMap[label])
      .filter(Boolean);
    const subsystem = managedSubsystems[0] || "Management";

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
        ...(managedSubsystems.length > 0 ? { managedSubsystems } : {}),
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
