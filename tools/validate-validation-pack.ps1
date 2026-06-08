$ErrorActionPreference = "Stop"

$root = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
& node (Join-Path $root "tools/validate-validation-pack.js")
if ($LASTEXITCODE -ne 0) {
  throw "Validation pack validation failed"
}
