#!/usr/bin/env node

const childProcess = require("child_process");
const crypto = require("crypto");
const fs = require("fs");
const http = require("http");
const https = require("https");
const path = require("path");

const root = path.resolve(__dirname, "..");
const helperArtifactPaths = [
  "pacjent360-public.zip",
  "pacjent360-upload-root.zip",
  "pacjent360-public-repo.zip",
  "pacjent360-public.zip.sha256",
  "pacjent360-upload-root.zip.sha256",
  "pacjent360-public-repo.zip.sha256",
  "release-manifest.json",
  "upload-ready-manifest.json",
  "deployment-handoff.txt",
  "go-live-status.txt",
  "domain-diagnostics.txt",
  "document-root-checklist.txt",
];

function parseArgs(argv) {
  const options = {
    baseUrl: "https://pacjent360.com.pl",
    localPublicPath: "dist/upload-ready",
    smokePort: "4195",
    receiptConfirmed: false,
    monitorOwner: "",
    reportPath: "",
    skipDomain: false,
    strict: false,
  };

  const aliases = {
    "-BaseUrl": "baseUrl",
    "--base-url": "baseUrl",
    "-LocalPublicPath": "localPublicPath",
    "--local-public-path": "localPublicPath",
    "-SmokePort": "smokePort",
    "--smoke-port": "smokePort",
    "-MonitorOwner": "monitorOwner",
    "--monitor-owner": "monitorOwner",
    "-ReportPath": "reportPath",
    "--report-path": "reportPath",
  };

  const flags = {
    "-ReceiptConfirmed": "receiptConfirmed",
    "--receipt-confirmed": "receiptConfirmed",
    "-SkipDomain": "skipDomain",
    "--skip-domain": "skipDomain",
    "-Strict": "strict",
    "--strict": "strict",
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (flags[arg]) {
      options[flags[arg]] = true;
      continue;
    }
    if (aliases[arg]) {
      const value = argv[index + 1];
      if (!value || value.startsWith("-")) {
        throw new Error(`Missing value for ${arg}`);
      }
      options[aliases[arg]] = value;
      index += 1;
      continue;
    }
    throw new Error(`Unknown argument: ${arg}`);
  }

  return options;
}

function resolveProjectPath(projectPath) {
  return path.isAbsolute(projectPath) ? projectPath : path.join(root, projectPath);
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

function fileExists(projectPath) {
  const fullPath = resolveProjectPath(projectPath);
  assert(fs.existsSync(fullPath), `Missing required path: ${projectPath}`);
  return fullPath;
}

function sha256(filePath) {
  return crypto.createHash("sha256").update(fs.readFileSync(filePath)).digest("hex");
}

function relativePath(base, target) {
  return path.relative(base, target).split(path.sep).join("/");
}

function walkFiles(directory) {
  const results = [];
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const fullPath = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      results.push(...walkFiles(fullPath));
    } else if (entry.isFile()) {
      results.push(fullPath);
    }
  }
  return results.sort((left, right) => left.localeCompare(right));
}

function readJson(projectPath) {
  return JSON.parse(fs.readFileSync(fileExists(projectPath), "utf8"));
}

function cleanPowerShellFailure(stdout, stderr) {
  const raw = [stdout || "", stderr || ""].filter(Boolean).join("\n");
  const lines = raw
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
  const meaningful = [];

  for (const line of lines) {
    if (line.startsWith("At ") || line.startsWith("+") || line.includes("CategoryInfo") || line.includes("FullyQualifiedErrorId")) {
      break;
    }
    meaningful.push(line);
  }

  return meaningful
    .join(" ")
    .replace(/\s+/g, " ")
    .replace(/upload-read\s+y/g, "upload-ready")
    .trim();
}

function runPowerShell(scriptProjectPath, args = []) {
  const scriptPath = resolveProjectPath(scriptProjectPath);
  const output = childProcess.spawnSync(
    "powershell",
    ["-NoProfile", "-ExecutionPolicy", "Bypass", "-File", scriptPath, ...args],
    {
      cwd: root,
      encoding: "utf8",
      windowsHide: true,
      maxBuffer: 1024 * 1024 * 20,
    },
  );

  if (output.status !== 0) {
    throw new Error(cleanPowerShellFailure(output.stdout, output.stderr) || `PowerShell failed: ${scriptProjectPath}`);
  }

  return (output.stdout || "").trim();
}

function addStatus(results, area, status, detail) {
  results.push({ area, status, detail: detail || "OK" });
}

function invokeStatusCheck(results, area, action) {
  try {
    addStatus(results, area, "GO", action());
  } catch (error) {
    addStatus(results, area, "NO-GO", error.message);
  }
}

function getArtifacts(manifest) {
  const publicArtifact = manifest.artifacts.find((artifact) => artifact.purpose === "hosting package");
  const uploadRootArtifact = manifest.artifacts.find((artifact) => artifact.purpose === "hosting upload-root package");
  const repoArtifact = manifest.artifacts.find((artifact) => artifact.purpose === "public repository package");
  assert(publicArtifact, "Manifest is missing hosting package artifact");
  assert(uploadRootArtifact, "Manifest is missing hosting upload-root package artifact");
  assert(repoArtifact, "Manifest is missing public repository package artifact");
  return { publicArtifact, uploadRootArtifact, repoArtifact };
}

function joinUrl(baseUrl, relativePath) {
  return `${baseUrl.replace(/\/+$/, "")}/${relativePath.replace(/^\/+/, "")}`;
}

function requestStatus(url, timeoutMs = 10000) {
  return new Promise((resolve) => {
    const client = url.startsWith("https:") ? https : http;
    const request = client.get(url, { timeout: timeoutMs }, (response) => {
      response.resume();
      response.on("end", () => {
        resolve({
          url,
          status: response.statusCode || 0,
          location: response.headers.location || "",
        });
      });
    });

    request.on("timeout", () => {
      request.destroy(new Error(`timeout after ${timeoutMs}ms`));
    });

    request.on("error", (error) => {
      resolve({
        url,
        status: 0,
        location: "",
        error: error.code || error.message,
      });
    });
  });
}

async function assessHelperArtifactExposure(baseUrl) {
  const probes = await Promise.all(helperArtifactPaths.map((artifactPath) => requestStatus(joinUrl(baseUrl, artifactPath))));
  const exposed = probes.filter((probe) => probe.status >= 200 && probe.status < 400);
  const unreachable = probes.filter((probe) => probe.status === 0);
  const blockedCount = probes.filter((probe) => probe.status === 403 || probe.status === 404).length;

  if (exposed.length > 0) {
    return {
      status: "NO-GO",
      detail: `Helper artifacts are public: ${exposed.map((probe) => `${path.basename(new URL(probe.url).pathname)}=${probe.status}`).join(", ")}`,
    };
  }

  if (unreachable.length > 0) {
    return {
      status: "WARN",
      detail: `Could not verify ${unreachable.length} helper artifact URL(s): ${unreachable.map((probe) => probe.error || probe.url).join(", ")}`,
    };
  }

  return {
    status: "GO",
    detail: `${blockedCount}/${helperArtifactPaths.length} helper artifact URL(s) return 403/404`,
  };
}

function verifyUploadManifest(localPublicPath) {
  const uploadManifestPath = fileExists("dist/upload-ready-manifest.json");
  const uploadRoot = fileExists(localPublicPath);
  const uploadManifest = JSON.parse(fs.readFileSync(uploadManifestPath, "utf8"));

  assert(uploadManifest.uploadDir === localPublicPath, `upload-ready-manifest.json uploadDir does not match ${localPublicPath}`);

  const currentFiles = walkFiles(uploadRoot).map((filePath) => ({
    path: relativePath(uploadRoot, filePath),
    bytes: fs.statSync(filePath).size,
    sha256: sha256(filePath),
  }));
  const manifestFiles = [...uploadManifest.files].sort((left, right) => left.path.localeCompare(right.path));

  assert(Number(uploadManifest.fileCount) === currentFiles.length, "upload-ready-manifest.json fileCount does not match current upload directory");
  assert(manifestFiles.length === currentFiles.length, "upload-ready-manifest.json files array does not match current upload directory");

  for (let index = 0; index < currentFiles.length; index += 1) {
    const current = currentFiles[index];
    const declared = manifestFiles[index];
    if (current.path !== declared.path || current.bytes !== Number(declared.bytes) || current.sha256 !== declared.sha256) {
      throw new Error(`upload-ready-manifest.json differs for ${current.path}`);
    }
  }

  const paths = currentFiles.map((file) => file.path);
  assert(paths.includes(".htaccess"), "upload-ready-manifest.json is missing .htaccess");
  assert(!paths.includes("deployment-handoff.txt") && !paths.includes("upload-ready-manifest.json"), "upload-ready-manifest.json should not describe helper files outside upload-ready");

  return `dist/upload-ready-manifest.json matches ${uploadManifest.fileCount} upload files`;
}

function verifyDeploymentHandoff(localPublicPath) {
  const handoffPath = fileExists("dist/deployment-handoff.txt");
  const uploadRoot = fileExists(localPublicPath);
  const manifest = readJson("dist/release-manifest.json");
  const { publicArtifact, uploadRootArtifact, repoArtifact } = getArtifacts(manifest);
  const uploadManifestHash = sha256(fileExists("dist/upload-ready-manifest.json"));
  const documentRootChecklistHash = sha256(fileExists("dist/document-root-checklist.txt"));
  const uploadFileCount = walkFiles(uploadRoot).length;
  const handoff = fs.readFileSync(handoffPath, "utf8");

  const requiredMarkers = [
    "UPLOAD THIS DIRECTORY CONTENTS",
    `Path: ${localPublicPath}`,
    "including hidden file .htaccess",
    "usun ZIP z document root",
    "ZIP-ow, .sha256, manifestow ani raportow pomocniczych",
    `Hosting ZIP SHA256: ${publicArtifact.sha256}`,
    `Public repo ZIP SHA256: ${repoArtifact.sha256}`,
    "UPLOAD FILE MANIFEST",
    `Upload-root ZIP SHA256: ${uploadRootArtifact.sha256}`,
    "Path: dist/upload-ready-manifest.json",
    `SHA256: ${uploadManifestHash}`,
    "DOCUMENT ROOT CHECKLIST",
    "Path: dist/document-root-checklist.txt",
    `SHA256: ${documentRootChecklistHash}`,
    `FILES TO UPLOAD (${uploadFileCount})`,
    "- .htaccess",
    "AFTER UPLOAD",
    "verify-deployed-site.ps1",
    "release-readiness.js",
  ];

  for (const marker of requiredMarkers) {
    assert(handoff.includes(marker), `deployment-handoff.txt is missing marker: ${marker}`);
  }

  return `dist/deployment-handoff.txt matches current manifest and ${uploadFileCount} upload files`;
}

function verifyDocumentRootChecklist(localPublicPath) {
  const checklistPath = fileExists("dist/document-root-checklist.txt");
  const uploadRoot = fileExists(localPublicPath);
  const uploadFiles = walkFiles(uploadRoot).map((filePath) => relativePath(uploadRoot, filePath));
  const checklist = fs.readFileSync(checklistPath, "utf8");

  const requiredMarkers = [
    "Pacjent 360 document root checklist",
    `ExpectedFileCount: ${uploadFiles.length}`,
    "WHAT MUST BE DIRECTLY IN DOCUMENT ROOT",
    "DO NOT LEAVE IN DOCUMENT ROOT",
    "pacjent360-upload-root.zip",
    "document-root-checklist.txt",
    "FIRST POST-UPLOAD CHECK",
    "health.txt should return project=pacjent360",
  ];

  for (const marker of requiredMarkers) {
    assert(checklist.includes(marker), `document-root-checklist.txt is missing marker: ${marker}`);
  }

  for (const uploadFile of uploadFiles) {
    assert(checklist.includes(`- ${uploadFile}`), `document-root-checklist.txt is missing upload file: ${uploadFile}`);
  }

  return `dist/document-root-checklist.txt lists ${uploadFiles.length} expected document-root files`;
}

function formatResults(results) {
  const widths = {
    area: Math.max("Area".length, ...results.map((result) => result.area.length)),
    status: Math.max("Status".length, ...results.map((result) => result.status.length)),
  };

  const lines = [];
  lines.push(`${"Area".padEnd(widths.area)}  ${"Status".padEnd(widths.status)}  Detail`);
  lines.push(`${"-".repeat(widths.area)}  ${"-".repeat(widths.status)}  ${"-".repeat(80)}`);
  for (const result of results) {
    lines.push(`${result.area.padEnd(widths.area)}  ${result.status.padEnd(widths.status)}  ${result.detail}`);
  }
  return lines.join("\n");
}

function writeReport(reportPath, options, results, noGoCount, warnCount, nextActions) {
  const fullPath = resolveProjectPath(reportPath);
  fs.mkdirSync(path.dirname(fullPath), { recursive: true });

  const lines = [
    "Pacjent 360 go-live status report",
    `GeneratedAtUtc: ${new Date().toISOString().replace(/\.\d{3}Z$/, "Z")}`,
    `Base URL: ${options.baseUrl}`,
    `Local package: ${options.localPublicPath}`,
    `Summary: ${noGoCount} NO-GO, ${warnCount} WARN`,
    "",
    "RESULTS",
  ];

  for (const result of results) {
    lines.push(`- ${result.status} | ${result.area} | ${result.detail}`);
  }

  if (nextActions.length > 0) {
    lines.push("", "NEXT REQUIRED ACTIONS", ...nextActions);
  }

  fs.writeFileSync(fullPath, `${lines.join("\r\n")}\r\n`, "utf8");
  return fullPath;
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  const results = [];

  console.log("Pacjent 360 go-live status");
  console.log(`Base URL: ${options.baseUrl}`);
  console.log(`Local package: ${options.localPublicPath}`);
  console.log("");

  invokeStatusCheck(results, "Release manifest", () => {
    const manifestPath = fileExists("dist/release-manifest.json");
    const bytes = fs.readFileSync(manifestPath);
    assert(bytes.length >= 4 && bytes[0] === 123, "release-manifest.json should start with JSON object and no BOM");
    const manifest = JSON.parse(bytes.toString("utf8"));
    const { publicArtifact, uploadRootArtifact, repoArtifact } = getArtifacts(manifest);
    return `generatedAtUtc=${manifest.generatedAtUtc}; publicZip=${publicArtifact.sha256}; uploadRootZip=${uploadRootArtifact.sha256}; repoZip=${repoArtifact.sha256}`;
  });

  invokeStatusCheck(results, "Release files", () => {
    fileExists("dist/pacjent360-public.zip");
    fileExists("dist/pacjent360-public.zip.sha256");
    fileExists("dist/pacjent360-upload-root.zip");
    fileExists("dist/pacjent360-upload-root.zip.sha256");
    fileExists("dist/pacjent360-public-repo.zip");
    fileExists("dist/pacjent360-public-repo.zip.sha256");
    fileExists(options.localPublicPath);
    fileExists(path.join(options.localPublicPath, ".htaccess"));
    return "release ZIPs, upload-root ZIP, .sha256 files and upload-ready .htaccess exist";
  });

  invokeStatusCheck(results, "Upload file manifest", () => verifyUploadManifest(options.localPublicPath));
  invokeStatusCheck(results, "Deployment handoff", () => verifyDeploymentHandoff(options.localPublicPath));
  invokeStatusCheck(results, "Document root checklist", () => verifyDocumentRootChecklist(options.localPublicPath));

  invokeStatusCheck(results, "Upload-ready verifier", () => {
    runPowerShell("tools/verify-public.ps1", ["-PackageDir", options.localPublicPath]);
    return `tools/verify-public.ps1 -PackageDir "${options.localPublicPath}" passed`;
  });

  invokeStatusCheck(results, "Upload-ready HTTP smoke", () => {
    runPowerShell("tools/smoke-public.ps1", ["-PackageDir", options.localPublicPath, "-Port", String(options.smokePort)]);
    return `tools/smoke-public.ps1 -PackageDir "${options.localPublicPath}" -Port ${options.smokePort} passed`;
  });

  invokeStatusCheck(results, "Contact DNS", () => {
    runPowerShell("tools/verify-contact-gate.ps1", ["-DnsOnly"]);
    return "MX precheck passed; manual receipt/reply is still separate";
  });

  if (options.receiptConfirmed) {
    invokeStatusCheck(results, "Contact aliases", () => {
      assert(options.monitorOwner.trim().length > 0, "MonitorOwner is required with -ReceiptConfirmed");
      runPowerShell("tools/verify-contact-gate.ps1", ["-ReceiptConfirmed", "-MonitorOwner", options.monitorOwner]);
      return `manual receipt/reply confirmed by ${options.monitorOwner}`;
    });
  } else {
    addStatus(results, "Contact aliases", "NO-GO", "Manual receipt/reply not confirmed. Re-run with -ReceiptConfirmed -MonitorOwner \"Name\" after testing security@ and kontakt@.");
  }

  if (options.skipDomain) {
    addStatus(results, "Deployed domain", "WARN", "Skipped by -SkipDomain. Run tools/verify-deployed-site.ps1 after upload.");
    addStatus(results, "Helper artifact exposure", "WARN", "Skipped by -SkipDomain. Run tools/domain-diagnostics.js after upload.");
  } else {
    invokeStatusCheck(results, "Deployed domain", () => {
      runPowerShell("tools/verify-deployed-site.ps1", ["-BaseUrl", options.baseUrl, "-CompareLocalPackage", "-LocalPublicPath", options.localPublicPath]);
      return `deployed domain matches ${options.localPublicPath}`;
    });
    const helperExposure = await assessHelperArtifactExposure(options.baseUrl);
    addStatus(results, "Helper artifact exposure", helperExposure.status, helperExposure.detail);
  }

  console.log(formatResults(results));
  console.log("");

  const noGoCount = results.filter((result) => result.status === "NO-GO").length;
  const warnCount = results.filter((result) => result.status === "WARN").length;
  console.log(`Summary: ${noGoCount} NO-GO, ${warnCount} WARN`);

  const nextActions = noGoCount > 0 ? [
    "1. Upload the contents of dist/upload-ready, including .htaccess, to the domain document root; alternatively extract dist/pacjent360-upload-root.zip in the document root and delete the ZIP after extraction.",
    "2. Confirm https://pacjent360.com.pl/health.txt returns project=pacjent360.",
    `3. Run: powershell -ExecutionPolicy Bypass -File tools\\verify-deployed-site.ps1 -BaseUrl "${options.baseUrl}" -CompareLocalPackage -LocalPublicPath "${options.localPublicPath}"`,
    "4. Test security@pacjent360.com.pl and kontakt@pacjent360.com.pl: external send, receive, reply.",
    "5. Re-run: node tools\\release-readiness.js -ReceiptConfirmed -MonitorOwner \"Name\"",
  ] : [];

  if (nextActions.length > 0) {
    console.log("");
    console.log("Next required actions:");
    nextActions.forEach((action) => console.log(action));
  }

  if (options.reportPath.trim().length > 0) {
    const reportFullPath = writeReport(options.reportPath, options, results, noGoCount, warnCount, nextActions);
    console.log("");
    console.log(`Status report written: ${reportFullPath}`);
  }

  if (options.strict && noGoCount > 0) {
    process.exit(1);
  }
}

try {
  main().catch((error) => {
    console.error(error.message);
    process.exit(1);
  });
} catch (error) {
  console.error(error.message);
  process.exit(1);
}
