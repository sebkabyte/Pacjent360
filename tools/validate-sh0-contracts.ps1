$ErrorActionPreference = "Stop"
$root = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
$script = Join-Path $root "tools/validate-sh0-contracts.js"

node $script
if ($LASTEXITCODE -ne 0) {
  throw "SH-0 cross-contract validation failed"
}
