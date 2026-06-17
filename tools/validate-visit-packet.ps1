$ErrorActionPreference = "Stop"
$root = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
$script = Join-Path $root "tools/validate-visit-packet.js"

node $script
if ($LASTEXITCODE -ne 0) {
  throw "VisitPacket validation failed"
}
