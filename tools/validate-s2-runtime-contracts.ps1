$ErrorActionPreference = "Stop"

$root = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
$script = Join-Path $root "tools/validate-s2-runtime-contracts.js"

& node $script
if ($LASTEXITCODE -ne 0) {
  throw "S2 runtime contract validation failed"
}
