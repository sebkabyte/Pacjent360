$ErrorActionPreference = "Stop"

$root = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
$script = Join-Path $root "tools/validate-s2-data-model.js"

& node $script
if ($LASTEXITCODE -ne 0) {
  throw "S2 data model validation failed"
}
