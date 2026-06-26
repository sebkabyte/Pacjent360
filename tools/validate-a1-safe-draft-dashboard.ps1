$ErrorActionPreference = "Stop"

$root = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
$script = Join-Path $root "tools/validate-a1-safe-draft-dashboard.js"

& node $script
if ($LASTEXITCODE -ne 0) {
  throw "A1 safe draft dashboard validation failed"
}
