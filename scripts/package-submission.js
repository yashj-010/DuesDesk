const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

const rootDir = path.join(__dirname, "..");
const stageDir = path.join(rootDir, "submission_bundle");
const zipFile = path.join(rootDir, "submission.zip");

console.log("Preparing submission package...");

// Clean existing
if (fs.existsSync(stageDir)) {
  fs.rmSync(stageDir, { recursive: true, force: true });
}
if (fs.existsSync(zipFile)) {
  fs.rmSync(zipFile, { force: true });
}

fs.mkdirSync(stageDir, { recursive: true });

// Ensure TDD.docx exists
if (!fs.existsSync(path.join(rootDir, "TDD.docx"))) {
  execSync("node scripts/generate-tdd-docx.js", { cwd: rootDir, stdio: "inherit" });
}

// Copy required submission files into stage folder
fs.copyFileSync(path.join(rootDir, "TDD.docx"), path.join(stageDir, "TDD.docx"));
fs.copyFileSync(path.join(rootDir, "TDD.md"), path.join(stageDir, "TDD.md"));
fs.copyFileSync(path.join(rootDir, "deployment.md"), path.join(stageDir, "deployment.md"));

console.log("Copied files to stage directory:");
fs.readdirSync(stageDir).forEach((f) => console.log(" - " + f));

// Use PowerShell Compress-Archive
try {
  const psCmd = `powershell -Command "Compress-Archive -Path '${stageDir}\\*' -DestinationPath '${zipFile}' -Force"`;
  execSync(psCmd, { stdio: "inherit" });
  const stats = fs.statSync(zipFile);
  console.log(`\nSUCCESS! Created submission.zip (${(stats.size / 1024).toFixed(1)} KB) at: ${zipFile}`);
} catch (err) {
  console.error("Compression failed", err);
}
