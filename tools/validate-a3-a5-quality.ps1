$ErrorActionPreference = "Stop"

$root = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
$script = Join-Path $root "tools/validate-a3-a5-quality.js"

& node $script
if ($LASTEXITCODE -ne 0) {
  throw "A3+A5 quality validation failed"
}
