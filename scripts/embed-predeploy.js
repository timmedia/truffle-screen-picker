const path = require("node:path");
const { execSync } = require("child_process");
const { getMode } = require("./get-mode");

const hostingDir = path.dirname(process.argv[1]);
const projectDir = path.dirname(hostingDir);
const firebaseProject = process.argv[2];
const mode = getMode(projectDir, firebaseProject);

console.log("Building Admin Embed...");
execSync(`(cd admin-embed && npm run build -- --mode=${mode})`, {
  stdio: "pipe",
});
console.log("Building Viewer Embed...");
execSync(`(cd viewer-embed && npm run build -- --mode=${mode})`, {
  stdio: "pipe",
});
