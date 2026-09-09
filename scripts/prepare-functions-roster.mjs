import { cp, mkdir, stat } from "node:fs/promises";

const sourcePath = "private-data/members.csv";

if ((await stat(sourcePath)).size === 0) {
	throw new Error("private-data/members.csv is empty. Save the roster before deploying Firebase Functions.");
}

await mkdir("functions/private-data", { recursive: true });
await cp(sourcePath, "functions/private-data/members.csv");
