$ErrorActionPreference = "Stop"

$root = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
$script = Join-Path $root "tools/validate-map-model.js"

& node $script
if ($LASTEXITCODE -ne 0) {
  throw "Patient map model validation failed"
}
