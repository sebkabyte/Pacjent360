$ErrorActionPreference = "Stop"
$Root = Resolve-Path (Join-Path $PSScriptRoot "..")
Push-Location $Root
try {
  node tools/validate-a0-agent-policy.js
  if ($LASTEXITCODE -ne 0) {
    throw "A0 agent policy validation failed"
  }
} finally {
  Pop-Location
}
