$ErrorActionPreference = "Stop"
node (Join-Path $PSScriptRoot "validate-harm-gates.js")
if ($LASTEXITCODE -ne 0) {
  throw "Definition of Harm gates failed"
}
