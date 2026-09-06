// Single source of truth for subsystem names.
// Keep this in sync with the `subsystem` values allowed in firestore.rules.
export const SUBSYSTEMS = [
  "AI and Automation",
  "Software",
  "MAD",
  "Electronics",
  "Management",
  "Research",
];

export const ROLES = {
  MEMBER: "Member",
  ADMIN: "Admin",
};