$ErrorActionPreference = "Stop"

$root = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
$script = Join-Path $root "tools/validate-caregiver-scope.js"

& node $script
if ($LASTEXITCODE -ne 0) {
  throw "Caregiver scope validation failed"
}
