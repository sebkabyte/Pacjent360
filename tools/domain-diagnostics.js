#!/usr/bin/env node

const dns = require("dns").promises;
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

function isHelperArtifactUrl(url) {
  return helperArtifactPaths.some((artifactPath) => url.endsWith(`/${artifactPath}`));
}

function parseArgs(argv) {
  const options = {
    domain: "pacjent360.com.pl",
    reportPath: "",
    timeoutMs: 12000,
  };

  const valueArgs = {
    "-Domain": "domain",
    "--domain": "domain",
    "-ReportPath": "reportPath",
    "--report-path": "reportPath",
    "-TimeoutMs": "timeoutMs",
    "--timeout-ms": "timeoutMs",
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (!valueArgs[arg]) {
      throw new Error(`Unknown argument: ${arg}`);
    }
    const value = argv[index + 1];
    if (!value || value.startsWith("-")) {
      throw new Error(`Missing value for ${arg}`);
    }
    options[valueArgs[arg]] = valueArgs[arg] === "timeoutMs" ? Number(value) : value;
    index += 1;
  }

  if (!Number.isFinite(options.timeoutMs) || options.timeoutMs < 1000) {
    throw new Error("TimeoutMs must be a number >= 1000");
  }

  options.domain = options.domain.trim().replace(/^https?:\/\//i, "").replace(/\/.*$/, "").toLowerCase();
  if (!options.domain) {
    throw new Error("Domain is required");
  }

  return options;
}

async function resolveRecord(label, resolver, options = {}) {
  try {
    const records = await resolver();
    return { label, status: "OK", detail: records.length ? records.join(", ") : "empty" };
  } catch (error) {
    if (options.optional && (error.code === "ENODATA" || error.code === "ENOTFOUND" || error.code === "ENODOMAIN")) {
      return { label, status: "INFO", detail: `${error.code}; optional record not configured` };
    }
    return { label, status: "NO-GO", detail: error.code || error.message };
  }
}

function requestUrl(url, timeoutMs) {
  return new Promise((resolve) => {
    const client = url.startsWith("https:") ? https : http;
    const request = client.get(url, { timeout: timeoutMs }, (response) => {
      const chunks = [];
      let bytes = 0;

      response.on("data", (chunk) => {
        if (bytes < 4096) {
          chunks.push(chunk);
          bytes += chunk.length;
        }
      });

      response.on("end", () => {
        const body = Buffer.concat(chunks).toString("utf8");
        resolve({
          url,
          status: response.statusCode || 0,
          location: response.headers.location || "",
          server: response.headers.server || "",
          contentType: response.headers["content-type"] || "",
          hasPacjent360: /Pacjent 360|Pacjent360|pacjent360/i.test(body),
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
        server: "",
        contentType: "",
        hasPacjent360: false,
        error: error.code || error.message,
      });
    });
  });
}

function statusLabel(probe) {
  if (probe.status === 0) return "NO-GO";
  if (isHelperArtifactUrl(probe.url)) {
    if (probe.status === 403 || probe.status === 404) return "GO";
    if (probe.status >= 200 && probe.status < 400) return "NO-GO";
    return "WARN";
  }
  if (probe.status >= 200 && probe.status < 300 && probe.hasPacjent360) return "GO";
  if (probe.status >= 300 && probe.status < 400) return "REDIRECT";
  if (probe.status === 404) return "NO-GO";
  return "WARN";
}

function formatProbe(probe) {
  const parts = [`${probe.status || "ERR"}`];
  if (probe.location) parts.push(`location=${probe.location}`);
  if (probe.server) parts.push(`server=${probe.server}`);
  if (probe.contentType) parts.push(`type=${probe.contentType}`);
  if (probe.error) parts.push(`error=${probe.error}`);
  parts.push(`marker=${probe.hasPacjent360 ? "yes" : "no"}`);
  return parts.join("; ");
}

function buildGuidance(probes, domain) {
  const httpsRoot = probes.find((probe) => probe.url === `https://${domain}/`);
  const httpsIndex = probes.find((probe) => probe.url === `https://${domain}/index.html`);
  const httpsDemo = probes.find((probe) => probe.url === `https://${domain}/demo.html`);
  const httpsHealth = probes.find((probe) => probe.url === `https://${domain}/health.txt`);
  const httpsWww = probes.find((probe) => probe.url === `https://www.${domain}/`);
  const httpRoot = probes.find((probe) => probe.url === `http://${domain}/`);
  const exposedHelpers = probes.filter((probe) => isHelperArtifactUrl(probe.url) && probe.status >= 200 && probe.status < 400);

  const guidance = [];

  if (exposedHelpers.length > 0) {
    guidance.push(`Helper artifacts are public in the document root: ${exposedHelpers.map((probe) => probe.url).join(", ")}. Remove ZIPs, manifests and handoff/status reports after extraction.`);
  }
  if (httpsIndex && httpsIndex.status === 404 && httpsDemo && httpsDemo.status === 404) {
    guidance.push("index.html and demo.html are 404 on HTTPS: upload dist/upload-ready contents to the domain document root or fix document root mapping.");
  }
  if (httpsHealth && httpsHealth.status === 404) {
    guidance.push("health.txt is 404: the upload-root package is not extracted in the current document root.");
  }
  if (httpsHealth && httpsHealth.status >= 200 && httpsHealth.status < 300 && httpsHealth.hasPacjent360) {
    guidance.push("health.txt contains Pacjent 360 markers: the static package is visible from this document root.");
  }
  if (httpsRoot && httpsRoot.status >= 200 && httpsRoot.status < 300 && !httpsRoot.hasPacjent360) {
    guidance.push("HTTPS root returns 200 but does not contain Pacjent 360 markers: another site or placeholder may be served from the domain root.");
  }
  if (httpsWww && httpsRoot && httpsWww.status !== httpsRoot.status) {
    guidance.push("www and bare domain differ: configure www alias/redirect after the bare domain is correct.");
  }
  if (httpRoot && httpRoot.status >= 200 && httpRoot.status < 300 && !httpRoot.location) {
    guidance.push("HTTP does not redirect to HTTPS: configure HTTP to HTTPS redirect after upload.");
  }
  if (guidance.length === 0) {
    guidance.push("No extra diagnosis beyond the probe table. If deployment verifier fails, compare the failing URL with the table above.");
  }

  return guidance;
}

function writeReport(reportPath, lines) {
  const fullPath = path.isAbsolute(reportPath) ? reportPath : path.join(root, reportPath);
  fs.mkdirSync(path.dirname(fullPath), { recursive: true });
  fs.writeFileSync(fullPath, `${lines.join("\r\n")}\r\n`, "utf8");
  return fullPath;
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  const domain = options.domain;
  const wwwDomain = `www.${domain}`;

  const dnsResults = await Promise.all([
    resolveRecord(`${domain} A`, () => dns.resolve4(domain)),
    resolveRecord(`${domain} AAAA`, () => dns.resolve6(domain), { optional: true }),
    resolveRecord(`${domain} CNAME`, () => dns.resolveCname(domain), { optional: true }),
    resolveRecord(`${domain} MX`, async () => (await dns.resolveMx(domain)).map((record) => `${record.priority} ${record.exchange}`)),
    resolveRecord(`${wwwDomain} A`, () => dns.resolve4(wwwDomain)),
    resolveRecord(`${wwwDomain} CNAME`, () => dns.resolveCname(wwwDomain), { optional: true }),
  ]);

  const urls = [
    `https://${domain}/`,
    `https://${domain}/index.html`,
    `https://${domain}/demo.html`,
    `https://${domain}/health.txt`,
    `https://www.${domain}/`,
    `https://www.${domain}/index.html`,
    `http://${domain}/`,
    `http://www.${domain}/`,
    ...helperArtifactPaths.map((artifactPath) => `https://${domain}/${artifactPath}`),
  ];

  const probes = await Promise.all(urls.map((url) => requestUrl(url, options.timeoutMs)));
  const guidance = buildGuidance(probes, domain);

  const lines = [];
  lines.push("Pacjent 360 domain diagnostics");
  lines.push(`GeneratedAtUtc: ${new Date().toISOString().replace(/\.\d{3}Z$/, "Z")}`);
  lines.push(`Domain: ${domain}`);
  lines.push("");
  lines.push("DNS");
  for (const result of dnsResults) {
    lines.push(`- ${result.status} | ${result.label} | ${result.detail}`);
  }
  lines.push("");
  lines.push("HTTP/HTTPS");
  for (const probe of probes) {
    lines.push(`- ${statusLabel(probe)} | ${probe.url} | ${formatProbe(probe)}`);
  }
  lines.push("");
  lines.push("GUIDANCE");
  for (const item of guidance) {
    lines.push(`- ${item}`);
  }

  console.log(lines.join("\n"));

  if (options.reportPath) {
    const fullPath = writeReport(options.reportPath, lines);
    console.log("");
    console.log(`Domain diagnostics written: ${fullPath}`);
  }
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
