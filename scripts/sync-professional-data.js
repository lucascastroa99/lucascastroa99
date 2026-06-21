import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";

const GITHUB_OWNER = "lucascastroa99";
const GITHUB_REPO = "curriculum-vitae";
const GITHUB_BRANCH = "main";
const SOURCE_DIR = "data";

const FILES = [
  "personal.yaml",
  "resume.yaml",
];

const DEST_DIR = join(import.meta.dirname, "..", "data");

async function fetchFile(filename) {
  const url = `https://raw.githubusercontent.com/${GITHUB_OWNER}/${GITHUB_REPO}/${GITHUB_BRANCH}/${SOURCE_DIR}/${filename}`;
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`${response.status} ${response.statusText}`);
  }

  return response.text();
}

async function main() {
  await mkdir(DEST_DIR, { recursive: true });

  const results = await Promise.allSettled(
    FILES.map(async (filename) => {
      const content = await fetchFile(filename);
      await writeFile(join(DEST_DIR, filename), content, "utf-8");
      return filename;
    })
  );

  let hasError = false;

  for (let i = 0; i < results.length; i++) {
    const result = results[i];
    const filename = FILES[i];

    if (result.status === "fulfilled") {
      console.log(`  ${filename}`);
    } else {
      console.error(`  ${filename} — ${result.reason.message}`);
      hasError = true;
    }
  }

  console.log();

  if (hasError) {
    process.exit(1);
  }
}

main();
