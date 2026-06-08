$ErrorActionPreference = "Stop"
$root = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
$script = Join-Path $root "tools/validate-consent-draft.js"

node $script
if ($LASTEXITCODE -ne 0) {
  throw "Consent draft validation failed"
}
