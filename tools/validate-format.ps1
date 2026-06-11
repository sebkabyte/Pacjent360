$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $PSScriptRoot
$script = Join-Path $root "tools/validate-format.js"
& node $script
if ($LASTEXITCODE -ne 0) {
  throw "Polish format validation failed"
}
