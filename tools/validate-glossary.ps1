$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $PSScriptRoot
$script = Join-Path $root "tools/validate-glossary.js"
& node $script
if ($LASTEXITCODE -ne 0) {
  throw "Public glossary validation failed"
}
