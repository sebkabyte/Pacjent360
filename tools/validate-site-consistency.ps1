$ErrorActionPreference = "Stop"
node (Join-Path $PSScriptRoot "validate-site-consistency.js")
if ($LASTEXITCODE -ne 0) { throw "Site consistency validation failed" }
