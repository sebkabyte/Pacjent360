$ErrorActionPreference = "Stop"

$root = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
$script = Join-Path $root "tools/validate-api-contract.js"

& node $script
if ($LASTEXITCODE -ne 0) {
  throw "API contract validation failed"
}
