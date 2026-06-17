$ErrorActionPreference = "Stop"
$root = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
$script = Join-Path $root "tools/validate-audit-catalog.js"

node $script
if ($LASTEXITCODE -ne 0) {
  throw "Audit catalog validation failed"
}
