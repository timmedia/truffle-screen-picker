const { readFileSync } = require("fs");

function getMode(projectDir, firebaseProject) {
  const firebaserc = JSON.parse(readFileSync(`${projectDir}/.firebaserc`));
  return Object.entries(firebaserc.projects).find(
    ([_, value]) => value === firebaseProject
  )[0];
}

exports.getMode = getMode;
