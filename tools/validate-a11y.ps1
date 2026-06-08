$ErrorActionPreference = "Stop"

$root = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
& node (Join-Path $root "tools/validate-a11y.js")
if ($LASTEXITCODE -ne 0) {
  throw "Accessibility static validation failed"
}
