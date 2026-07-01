$ErrorActionPreference = "Stop"
$root = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
$script = Join-Path $root "tools/validate-variant-flags.js"

node $script
if ($LASTEXITCODE -ne 0) {
  throw "Variant flags validation failed"
}
