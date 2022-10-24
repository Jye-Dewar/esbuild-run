const fs = require("fs");
const path = require("path");
const core = require("@actions/core");

const getAllFiles = function (dirPath, arrayOfFiles) {
  const files = fs.readdirSync(dirPath);

  arrayOfFiles = arrayOfFiles || [];

  files.forEach(file => {
    if (fs.statSync(`${dirPath}/${file}`).isDirectory()) {
      arrayOfFiles = getAllFiles(`${dirPath}/${file}`, arrayOfFiles);
    } else {
      arrayOfFiles.push(path.join(__dirname, dirPath, "/", file));
    }
  });

  return arrayOfFiles.filter(file => file.includes(".ts", ".json"));
};

const getNodeModules = function (dirPath) {
  const files = fs.readdirSync(dirPath);
  return files.filter(file => !file.includes("@"));
};

const fileList = getAllFiles("src");
const moduleList = getNodeModules("../../node_modules");

try {
  require("esbuild")
    .build({
      // the entry point file described above
      entryPoints: fileList,
      // the build folder location described above
      outdir: "lib",
      bundle: true,
      // Replace with the browser versions you need to target
      platform: "node",
      target: ["node16"],
      external: moduleList,
      // Optional and for development only. This provides the ability to
      // map the built code back to the original source format when debugging.
      sourcemap: "inline"
    })
    .catch(() => process.exit(1));
} catch (error) {
  core.setFailed(error.message);
}