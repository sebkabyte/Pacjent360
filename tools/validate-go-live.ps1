param(
  [switch]$SkipBrowser,
  [switch]$SkipRepoPackage,
  [switch]$SkipGitDiffCheck
)

$ErrorActionPreference = "Stop"

function Invoke-Step {
  param(
    [string]$Name,
    [scriptblock]$Action
  )

  Write-Host ""
  Write-Host "==> $Name"
  & $Action
  Write-Host "OK: $Name"
}

function Invoke-External {
  param(
    [string]$Name,
    [string]$Command,
    [string[]]$Arguments = @()
  )

  Invoke-Step $Name {
    & $Command @Arguments
    if ($LASTEXITCODE -ne 0) {
      throw "$Name failed with exit code $LASTEXITCODE"
    }
  }
}

$root = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path

$nodeCheckFiles = @(
  "public/app.js",
  "public/patient360-contract.js",
  "public/patient360-map-model.js",
  "public/patient360-previsit-model.js",
  "public/patient360-caregiver-model.js",
  "public/patient360-consent-model.js",
  "tools/validate-data-contract.js",
  "tools/validate-map-model.js",
  "tools/validate-previsit-workflow.js",
  "tools/validate-caregiver-scope.js",
  "tools/validate-consent-draft.js",
  "tools/validate-a11y.js",
  "tools/validate-validation-pack.js",
  "tools/validate-harm-gates.js",
  "tools/domain-diagnostics.js",
  "tools/release-readiness.js",
  "tools/smoke-browser.js"
)

$powerShellCheckFiles = @(
  "tools/prepare-public.ps1",
  "tools/verify-public.ps1",
  "tools/smoke-public.ps1",
  "tools/smoke-deployed-compare.ps1",
  "tools/smoke-browser.ps1",
  "tools/prepare-hosting-upload.ps1",
  "tools/prepare-public-repo.ps1",
  "tools/verify-public-repo.ps1",
  "tools/validate-data-contract.ps1",
  "tools/validate-map-model.ps1",
  "tools/validate-previsit-workflow.ps1",
  "tools/validate-caregiver-scope.ps1",
  "tools/validate-consent-draft.ps1",
  "tools/validate-a11y.ps1",
  "tools/validate-validation-pack.ps1",
  "tools/validate-harm-gates.ps1",
  "tools/validate-pre-show.ps1",
  "tools/validate-go-live.ps1",
  "tools/verify-contact-gate.ps1",
  "tools/verify-deployed-site.ps1",
  "tools/verify-release-artifacts.ps1",
  "tools/write-release-manifest.ps1",
  "tools/write-upload-manifest.ps1"
)

Invoke-Step "node --check for runtime and tools" {
  foreach ($file in $nodeCheckFiles) {
    & node --check (Join-Path $root $file)
    if ($LASTEXITCODE -ne 0) {
      throw "node --check failed: $file"
    }
  }
}

Invoke-Step "PowerShell syntax parse for publication scripts" {
  foreach ($file in $powerShellCheckFiles) {
    $content = Get-Content -LiteralPath (Join-Path $root $file) -Raw
    [void][scriptblock]::Create($content)
  }
}

Invoke-External "JSON fixture and schema parse" "node" @(
  "-e",
  "const fs=require('fs'); ['schema/patient360.schema.json','fixtures/patient-map-model.snapshot.json','fixtures/patient-map-model-edgecases.json','fixtures/previsit-workflow-edgecases.json','fixtures/caregiver-scope-edgecases.json','fixtures/consent-draft-edgecases.json'].forEach((file)=>JSON.parse(fs.readFileSync(file,'utf8')));"
)

Invoke-External "Data Contract validation" "powershell" @("-ExecutionPolicy", "Bypass", "-File", (Join-Path $root "tools/validate-data-contract.ps1"))
Invoke-External "Patient map model validation" "powershell" @("-ExecutionPolicy", "Bypass", "-File", (Join-Path $root "tools/validate-map-model.ps1"))
Invoke-External "Pre-visit workflow validation" "powershell" @("-ExecutionPolicy", "Bypass", "-File", (Join-Path $root "tools/validate-previsit-workflow.ps1"))
Invoke-External "Caregiver scope validation" "powershell" @("-ExecutionPolicy", "Bypass", "-File", (Join-Path $root "tools/validate-caregiver-scope.ps1"))
Invoke-External "Consent draft validation" "powershell" @("-ExecutionPolicy", "Bypass", "-File", (Join-Path $root "tools/validate-consent-draft.ps1"))
Invoke-External "Accessibility static validation" "powershell" @("-ExecutionPolicy", "Bypass", "-File", (Join-Path $root "tools/validate-a11y.ps1"))
Invoke-External "Validation pack validation" "powershell" @("-ExecutionPolicy", "Bypass", "-File", (Join-Path $root "tools/validate-validation-pack.ps1"))
Invoke-External "Definition of Harm gates" "powershell" @("-ExecutionPolicy", "Bypass", "-File", (Join-Path $root "tools/validate-harm-gates.ps1"))

Invoke-External "Prepare public package" "powershell" @("-ExecutionPolicy", "Bypass", "-File", (Join-Path $root "tools/prepare-public.ps1"), "-Zip")
Invoke-External "Verify public package" "powershell" @("-ExecutionPolicy", "Bypass", "-File", (Join-Path $root "tools/verify-public.ps1"))
Invoke-External "HTTP smoke public package" "powershell" @("-ExecutionPolicy", "Bypass", "-File", (Join-Path $root "tools/smoke-public.ps1"))

if ($SkipBrowser) {
  Write-Host ""
  Write-Host "SKIP: Browser smoke public package (-SkipBrowser)"
} else {
  Invoke-External "Browser smoke public package" "powershell" @("-ExecutionPolicy", "Bypass", "-File", (Join-Path $root "tools/smoke-browser.ps1"))
}

if ($SkipRepoPackage) {
  Write-Host ""
  Write-Host "SKIP: Public repo package (-SkipRepoPackage)"
} else {
  Invoke-External "Prepare public repo package" "powershell" @("-ExecutionPolicy", "Bypass", "-File", (Join-Path $root "tools/prepare-public-repo.ps1"), "-Zip")
  Invoke-External "Verify public repo package" "powershell" @("-ExecutionPolicy", "Bypass", "-File", (Join-Path $root "tools/verify-public-repo.ps1"))
}

Invoke-External "Write release manifest" "powershell" @("-ExecutionPolicy", "Bypass", "-File", (Join-Path $root "tools/write-release-manifest.ps1"))
Invoke-External "Verify release artifacts" "powershell" @("-ExecutionPolicy", "Bypass", "-File", (Join-Path $root "tools/verify-release-artifacts.ps1"))
Invoke-External "Prepare upload-ready hosting directory" "powershell" @("-ExecutionPolicy", "Bypass", "-File", (Join-Path $root "tools/prepare-hosting-upload.ps1"), "-SkipArtifactVerification")
Invoke-External "HTTP smoke upload-ready hosting directory" "powershell" @("-ExecutionPolicy", "Bypass", "-File", (Join-Path $root "tools/smoke-public.ps1"), "-PackageDir", "dist/upload-ready", "-Port", "4194")
Invoke-External "Local deployed compare upload-ready directory" "powershell" @("-ExecutionPolicy", "Bypass", "-File", (Join-Path $root "tools/smoke-deployed-compare.ps1"), "-PackageDir", "dist/upload-ready", "-Port", "4196")
Invoke-External "Write upload manifest and deployment handoff" "powershell" @("-ExecutionPolicy", "Bypass", "-File", (Join-Path $root "tools/write-upload-manifest.ps1"))
Invoke-External "Release readiness status report" "node" @("tools/release-readiness.js", "-ReportPath", "dist/go-live-status.txt")

if ($SkipGitDiffCheck) {
  Write-Host ""
  Write-Host "SKIP: git diff --check (-SkipGitDiffCheck)"
} else {
  Invoke-External "git diff --check" "git" @("diff", "--check")
}

Write-Host ""
Write-Host "Go-live local validation passed. External go-live gate remains: tested contact aliases and final human review."
