$ErrorActionPreference = "Stop"

$root = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
$script = Join-Path $root "tools/validate-a4-consent-guard.js"

& node $script
if ($LASTEXITCODE -ne 0) {
  throw "A4 consent guard validation failed"
}
