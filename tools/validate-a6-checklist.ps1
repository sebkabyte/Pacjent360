$ErrorActionPreference = "Stop"

$root = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
$script = Join-Path $root "tools/validate-a6-checklist.js"

& node $script
if ($LASTEXITCODE -ne 0) {
  throw "A6 visit checklist validation failed"
}
