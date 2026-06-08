$ErrorActionPreference = "Stop"

$root = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
$script = Join-Path $root "tools/validate-previsit-workflow.js"

& node $script
if ($LASTEXITCODE -ne 0) {
  throw "Pre-visit workflow validation failed"
}
