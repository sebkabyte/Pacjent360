$ErrorActionPreference = "Stop"

$root = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
$script = Join-Path $root "tools/smoke-browser.js"

& node $script @args
if ($LASTEXITCODE -ne 0) {
  throw "Browser smoke failed"
}
