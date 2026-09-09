const fs = require("node:fs");
const path = require("node:path");

const { onCall, HttpsError } = require("firebase-functions/v2/https");
const { initializeApp } = require("firebase-admin/app");
const { getAuth } = require("firebase-admin/auth");
const { getFirestore, FieldValue } = require("firebase-admin/firestore");

initializeApp();

const auth = getAuth();
const db = getFirestore();
const CSV_PATH = path.join(__dirname, "private-data", "members.csv");

const parseCsv = (content) => {
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

  if (value || row.length) {
    row.push(value.trim());
    if (row.some(Boolean)) rows.push(row);
  }

  return rows;
};

const readRoster = () => {
  const rows = parseCsv(fs.readFileSync(CSV_PATH, "utf8"));
  const headerIndex = rows.findIndex((row) =>
    row.includes("Full Name") && row.includes("Email Address")
  );

  if (headerIndex < 0) {
    throw new Error("The member CSV does not contain the expected headers.");
  }

  const headers = rows[headerIndex];
  const column = (name) => headers.indexOf(name);
  const nameIndex = column("Full Name");
  const emailIndex = column("Email Address");
  const tierIndex = column("Hierarchy Tier");
  const roleIndex = column("Role & Subsystem");
  const memberIdIndex = headers.findIndex((header) =>
    /member\s*id|id/i.test(header)
  );

  return rows
    .slice(headerIndex + 1)
    .map((row) => ({
      hierarchyTier: row[tierIndex] || "",
      fullName: row[nameIndex] || "",
      email: (row[emailIndex] || "").toLowerCase(),
      roleAndSubsystem: row[roleIndex] || "",
      memberId: memberIdIndex >= 0 ? row[memberIdIndex] || "" : "",
    }))
    .filter((member) =>
      member.fullName &&
      member.email &&
      member.email.includes("@") &&
      !/^total directory members$/i.test(member.fullName)
    );
};

const requireAdmin = async (request) => {
  if (!request.auth) {
    throw new HttpsError("unauthenticated", "You must be signed in.");
  }

  const profile = await db.collection("users").doc(request.auth.uid).get();
  if (!profile.exists || !["Admin", "EB"].includes(profile.data().role)) {
    throw new HttpsError("permission-denied", "Executive Board access is required.");
  }
};

const isRegistered = async (email) => {
  try {
    await auth.getUserByEmail(email);
    return true;
  } catch (error) {
    if (error.code === "auth/user-not-found") return false;
    throw error;
  }
};

const subsystemFromRole = (roleAndSubsystem) => {
  const label = roleAndSubsystem.split("•").pop()?.trim() || "Management";
  const subsystemMap = {
    AIA: "AI and Automation",
    ECS: "Electronics",
    MAD: "MAD",
    Research: "Research",
    Management: "Management",
    Software: "Software",
  };
  return subsystemMap[label] || "Management";
};

exports.getMemberRoster = onCall(async (request) => {
  await requireAdmin(request);

  try {
    const roster = readRoster();
    const members = await Promise.all(
      roster.map(async (member) => ({
        ...member,
        registered: await isRegistered(member.email),
      }))
    );

    return { members };
  } catch (error) {
    console.error("Unable to load member roster:", error);
    throw new HttpsError("internal", "Unable to load the member roster.");
  }
});

exports.createMemberAccount = onCall(async (request) => {
  await requireAdmin(request);

  const { memberEmail, password } = request.data || {};
  if (!memberEmail || !password || password.length < 6) {
    throw new HttpsError("invalid-argument", "A member email and password of at least 6 characters are required.");
  }

  const rosterMember = readRoster().find(
    (member) => member.email === memberEmail.trim().toLowerCase()
  );
  if (!rosterMember) {
    throw new HttpsError("not-found", "That email is not in the official member roster.");
  }

  if (await isRegistered(rosterMember.email)) {
    throw new HttpsError("already-exists", "This member already has an account.");
  }

  try {
    const user = await auth.createUser({
      email: rosterMember.email,
      password,
      displayName: rosterMember.fullName,
    });

    await db.collection("users").doc(user.uid).set({
      name: rosterMember.fullName,
      email: rosterMember.email,
      role: "Member",
      subsystem: subsystemFromRole(rosterMember.roleAndSubsystem),
      hierarchyTier: rosterMember.hierarchyTier,
      rosterRole: rosterMember.roleAndSubsystem,
      ...(rosterMember.memberId ? { memberId: rosterMember.memberId } : {}),
      createdBy: request.auth.uid,
      createdAt: FieldValue.serverTimestamp(),
    });

    return { name: rosterMember.fullName, email: rosterMember.email };
  } catch (error) {
    console.error("Unable to create member account:", error);
    if (error.code === "auth/email-already-exists") {
      throw new HttpsError("already-exists", "This member already has an account.");
    }
    throw new HttpsError("internal", "Unable to create the member account.");
  }
});
