import { cp, mkdir, stat } from "node:fs/promises";

const sourceCandidates = [
	"private-data/members.csv",
	"public/members.csv",
	"members.csv",
];
let sourcePath;
for (const candidate of sourceCandidates) {
	try {
		await stat(candidate);
		sourcePath = candidate;
		break;
	} catch {
		// Try the next supported CSV location.
	}
}

if (!sourcePath) {
	throw new Error("members.csv was not found. Add it to private-data, public, or the project root.");
}

if ((await stat(sourcePath)).size === 0) {
	throw new Error("private-data/members.csv is empty. Save the roster before deploying Firebase Functions.");
}

await mkdir("functions/private-data", { recursive: true });
await cp(sourcePath, "functions/private-data/members.csv");
