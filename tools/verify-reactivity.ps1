param(
  [string]$PackageDir = "public",
  [string]$EvidenceDir = "TEMP_REVIEW_OUTPUT/R1_EVIDENCE",
  [switch]$Capture
)

$ErrorActionPreference = "Stop"
$root = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
$script = Join-Path $root "tools/verify-reactivity.js"

$arguments = @(
  $script,
  "--packageDir",
  $PackageDir,
  "--evidenceDir",
  $EvidenceDir
)

if ($Capture) {
  $arguments += "--capture"
}

& node @arguments
exit $LASTEXITCODE
