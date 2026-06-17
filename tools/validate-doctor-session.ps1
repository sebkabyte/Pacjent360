$ErrorActionPreference = "Stop"
$root = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
$script = Join-Path $root "tools/validate-doctor-session.js"

node $script
if ($LASTEXITCODE -ne 0) {
  throw "DoctorReadOnlySession validation failed"
}
