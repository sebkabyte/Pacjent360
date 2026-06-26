$ErrorActionPreference = "Stop"

$root = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
$script = Join-Path $root "tools/validate-safety-gate-matrix.js"

& node $script
if ($LASTEXITCODE -ne 0) {
  throw "Safety gate matrix validation failed"
}

