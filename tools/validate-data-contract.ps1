$ErrorActionPreference = "Stop"

$root = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
$script = Join-Path $root "tools/validate-data-contract.js"

& node $script
if ($LASTEXITCODE -ne 0) {
  throw "Data Contract validation failed"
}
