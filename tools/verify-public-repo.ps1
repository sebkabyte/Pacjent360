param(
  [string]$RepoDir = "dist/repo",
  [string]$Manifest = "tools/public-repo-manifest.txt"
)

$ErrorActionPreference = "Stop"

function Assert-True {
  param(
    [bool]$Condition,
    [string]$Message
  )
  if (-not $Condition) {
    throw $Message
  }
}

function Get-RelativePath {
  param(
    [string]$Base,
    [string]$Path
  )
  $baseFull = [System.IO.Path]::GetFullPath($Base).TrimEnd([System.IO.Path]::DirectorySeparatorChar, [System.IO.Path]::AltDirectorySeparatorChar)
  $pathFull = [System.IO.Path]::GetFullPath($Path)
  $relative = $pathFull.Substring($baseFull.Length).TrimStart([System.IO.Path]::DirectorySeparatorChar, [System.IO.Path]::AltDirectorySeparatorChar)
  return $relative.Replace("\", "/")
}

function Get-ManifestEntries {
  param([string]$ManifestPath)
  Assert-True (Test-Path $ManifestPath) "Public repo manifest does not exist: $ManifestPath"
  return Get-Content -LiteralPath $ManifestPath |
    ForEach-Object { $_.Trim() } |
    Where-Object { $_ -and -not $_.StartsWith("#") }
}

function Expand-ManifestEntries {
  param(
    [string]$Root,
    [string[]]$Entries
  )
  $expanded = New-Object System.Collections.Generic.List[string]
  foreach ($entry in $Entries) {
    $source = Join-Path $Root $entry
    Assert-True (Test-Path $source) "Allowlisted source does not exist: $entry"
    if ($entry.EndsWith("/")) {
      Get-ChildItem -LiteralPath $source -Recurse -File | ForEach-Object {
        $expanded.Add((Get-RelativePath -Base $Root -Path $_.FullName))
      }
    } else {
      $expanded.Add($entry.Replace("\", "/"))
    }
  }
  return $expanded | Sort-Object -Unique
}

$root = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
$target = Join-Path $root $RepoDir
$manifestPath = Join-Path $root $Manifest
Assert-True (Test-Path $target) "Public repo package does not exist: $target"
$target = (Resolve-Path $target).Path

$entries = Get-ManifestEntries -ManifestPath $manifestPath
$expectedFiles = Expand-ManifestEntries -Root $root -Entries $entries
$actualFiles = Get-ChildItem -LiteralPath $target -Force -Recurse -File | ForEach-Object {
  Get-RelativePath -Base $target -Path $_.FullName
} | Sort-Object -Unique

$missing = $expectedFiles | Where-Object { $actualFiles -notcontains $_ }
Assert-True (-not $missing) ("Missing public repo file: " + ($missing -join ", "))

$unexpected = $actualFiles | Where-Object { $expectedFiles -notcontains $_ }
Assert-True (-not $unexpected) ("Unexpected file in public repo package: " + ($unexpected -join ", "))

$blockedNamePatterns = @(
  "^\.env(\..*)?$",
  "^\.git$",
  "private",
  "handover",
  "working"
)

$blockedFound = Get-ChildItem -LiteralPath $target -Force -Recurse | Where-Object {
  $name = $_.Name
  @($blockedNamePatterns | Where-Object { $name -match $_ }).Count -gt 0
}
Assert-True (-not $blockedFound) ("Blocked private or working file found: " + (($blockedFound | Select-Object -ExpandProperty FullName) -join ", "))

$blockedPathPrefixes = @("dist/", "prints/", ".git/")
foreach ($file in $actualFiles) {
  foreach ($prefix in $blockedPathPrefixes) {
    Assert-True (-not $file.StartsWith($prefix, [System.StringComparison]::OrdinalIgnoreCase)) "Blocked path found in public repo package: $file"
  }
}

$privateTextPatterns = @(
  ("C:" + [char]92 + "Users" + [char]92),
  "file:///C:/Users/"
)

$textFiles = Get-ChildItem -LiteralPath $target -Recurse -File | Where-Object {
  $_.Extension -in @(".md", ".txt", ".html", ".css", ".js", ".json", ".xml", ".yml", ".yaml", ".ps1")
} | Where-Object {
  (Get-RelativePath -Base $target -Path $_.FullName) -ne "tools/verify-public-repo.ps1"
}
foreach ($pattern in $privateTextPatterns) {
  $hits = $textFiles | Select-String -SimpleMatch -Pattern $pattern
  Assert-True (-not $hits) ("Private marker found in public repo package: " + $pattern)
}

& node --check (Join-Path $target "public/patient360-contract.js") | Out-Null
Assert-True ($LASTEXITCODE -eq 0) "node --check failed for repo public/patient360-contract.js"
& node --check (Join-Path $target "public/patient360-format.js") | Out-Null
Assert-True ($LASTEXITCODE -eq 0) "node --check failed for repo public/patient360-format.js"
& node --check (Join-Path $target "public/patient360-map-model.js") | Out-Null
Assert-True ($LASTEXITCODE -eq 0) "node --check failed for repo public/patient360-map-model.js"
& node --check (Join-Path $target "public/patient360-previsit-model.js") | Out-Null
Assert-True ($LASTEXITCODE -eq 0) "node --check failed for repo public/patient360-previsit-model.js"
& node --check (Join-Path $target "public/patient360-caregiver-model.js") | Out-Null
Assert-True ($LASTEXITCODE -eq 0) "node --check failed for repo public/patient360-caregiver-model.js"
& node --check (Join-Path $target "public/patient360-consent-model.js") | Out-Null
Assert-True ($LASTEXITCODE -eq 0) "node --check failed for repo public/patient360-consent-model.js"
& node --check (Join-Path $target "public/patient360-demo-data.js") | Out-Null
Assert-True ($LASTEXITCODE -eq 0) "node --check failed for repo public/patient360-demo-data.js"
& node --check (Join-Path $target "public/app.js") | Out-Null
Assert-True ($LASTEXITCODE -eq 0) "node --check failed for repo public/app.js"
& node --check (Join-Path $target "tools/validate-data-contract.js") | Out-Null
Assert-True ($LASTEXITCODE -eq 0) "node --check failed for repo tools/validate-data-contract.js"
& node --check (Join-Path $target "tools/validate-format.js") | Out-Null
Assert-True ($LASTEXITCODE -eq 0) "node --check failed for repo tools/validate-format.js"
& node --check (Join-Path $target "tools/validate-glossary.js") | Out-Null
Assert-True ($LASTEXITCODE -eq 0) "node --check failed for repo tools/validate-glossary.js"
& node --check (Join-Path $target "tools/validate-map-model.js") | Out-Null
Assert-True ($LASTEXITCODE -eq 0) "node --check failed for repo tools/validate-map-model.js"
& node --check (Join-Path $target "tools/validate-previsit-workflow.js") | Out-Null
Assert-True ($LASTEXITCODE -eq 0) "node --check failed for repo tools/validate-previsit-workflow.js"
& node --check (Join-Path $target "tools/validate-caregiver-scope.js") | Out-Null
Assert-True ($LASTEXITCODE -eq 0) "node --check failed for repo tools/validate-caregiver-scope.js"
& node --check (Join-Path $target "tools/validate-consent-draft.js") | Out-Null
Assert-True ($LASTEXITCODE -eq 0) "node --check failed for repo tools/validate-consent-draft.js"
& node --check (Join-Path $target "tools/validate-demo-coherence.js") | Out-Null
Assert-True ($LASTEXITCODE -eq 0) "node --check failed for repo tools/validate-demo-coherence.js"
& node --check (Join-Path $target "tools/validate-a11y.js") | Out-Null
Assert-True ($LASTEXITCODE -eq 0) "node --check failed for repo tools/validate-a11y.js"
& node --check (Join-Path $target "tools/validate-validation-pack.js") | Out-Null
Assert-True ($LASTEXITCODE -eq 0) "node --check failed for repo tools/validate-validation-pack.js"
& node --check (Join-Path $target "tools/smoke-browser.js") | Out-Null
Assert-True ($LASTEXITCODE -eq 0) "node --check failed for repo tools/smoke-browser.js"
& node --check (Join-Path $target "tools/verify-click-routes.js") | Out-Null
Assert-True ($LASTEXITCODE -eq 0) "node --check failed for repo tools/verify-click-routes.js"
& node --check (Join-Path $target "tools/verify-reactivity.js") | Out-Null
Assert-True ($LASTEXITCODE -eq 0) "node --check failed for repo tools/verify-reactivity.js"

Write-Host "Public repo package verification passed: $target"
