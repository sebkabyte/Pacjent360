$ErrorActionPreference = "Stop"
$root = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
$script = Join-Path $root "tools/validate-demo-coherence.js"
& node $script
if ($LASTEXITCODE -ne 0) {
  throw "Demo coherence validation failed"
}
