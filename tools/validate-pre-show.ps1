param(
  [switch]$SkipBrowser
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
  "tools/smoke-browser.js"
)

Invoke-Step "node --check pre-show files" {
  foreach ($file in $nodeCheckFiles) {
    & node --check (Join-Path $root $file)
    if ($LASTEXITCODE -ne 0) {
      throw "node --check failed: $file"
    }
  }
}

Invoke-External "Data Contract validation" "powershell" @("-ExecutionPolicy", "Bypass", "-File", (Join-Path $root "tools/validate-data-contract.ps1"))
Invoke-External "Patient map model validation" "powershell" @("-ExecutionPolicy", "Bypass", "-File", (Join-Path $root "tools/validate-map-model.ps1"))
Invoke-External "Pre-visit workflow validation" "powershell" @("-ExecutionPolicy", "Bypass", "-File", (Join-Path $root "tools/validate-previsit-workflow.ps1"))
Invoke-External "Caregiver scope validation" "powershell" @("-ExecutionPolicy", "Bypass", "-File", (Join-Path $root "tools/validate-caregiver-scope.ps1"))
Invoke-External "Consent draft validation" "powershell" @("-ExecutionPolicy", "Bypass", "-File", (Join-Path $root "tools/validate-consent-draft.ps1"))
Invoke-External "Accessibility static validation" "powershell" @("-ExecutionPolicy", "Bypass", "-File", (Join-Path $root "tools/validate-a11y.ps1"))
Invoke-External "Validation pack validation" "powershell" @("-ExecutionPolicy", "Bypass", "-File", (Join-Path $root "tools/validate-validation-pack.ps1"))

if ($SkipBrowser) {
  Write-Host ""
  Write-Host "SKIP: Browser smoke on public source (-SkipBrowser)"
} else {
  Invoke-External "Browser smoke on public source" "node" @((Join-Path $root "tools/smoke-browser.js"), "--packageDir", (Join-Path $root "public"))
}

Write-Host ""
Write-Host "Pre-show validation passed. Reset demo localStorage before each reviewer session."
