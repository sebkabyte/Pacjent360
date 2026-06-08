param(
  [string]$OutputDir = "dist/repo",
  [string]$Manifest = "tools/public-repo-manifest.txt",
  [switch]$Zip
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

function Get-ManifestEntries {
  param([string]$ManifestPath)
  Assert-True (Test-Path $ManifestPath) "Public repo manifest does not exist: $ManifestPath"
  return Get-Content -LiteralPath $ManifestPath |
    ForEach-Object { $_.Trim() } |
    Where-Object { $_ -and -not $_.StartsWith("#") }
}

function Copy-AllowlistedEntry {
  param(
    [string]$Root,
    [string]$Target,
    [string]$Entry
  )

  $source = Join-Path $Root $Entry
  Assert-True (Test-Path $source) "Allowlisted source does not exist: $Entry"

  if ($Entry.EndsWith("/")) {
    $destination = Join-Path $Target $Entry.TrimEnd("/")
    New-Item -ItemType Directory -Force -Path $destination | Out-Null
    Copy-Item -LiteralPath $source -Destination (Split-Path -Parent $destination) -Recurse -Force
    return
  }

  $destination = Join-Path $Target $Entry
  $parent = Split-Path -Parent $destination
  if ($parent) {
    New-Item -ItemType Directory -Force -Path $parent | Out-Null
  }
  Copy-Item -LiteralPath $source -Destination $destination -Force
}

$root = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
$target = Join-Path $root $OutputDir
$dist = Join-Path $root "dist"
$manifestPath = Join-Path $root $Manifest

if (Test-Path $target) {
  $resolvedTarget = (Resolve-Path $target).Path
  $resolvedDist = if (Test-Path $dist) { (Resolve-Path $dist).Path } else { $dist }
  Assert-True ($resolvedTarget.StartsWith($resolvedDist, [System.StringComparison]::OrdinalIgnoreCase)) "Refusing to clean path outside dist: $resolvedTarget"
  Remove-Item -LiteralPath $resolvedTarget -Recurse -Force
}

New-Item -ItemType Directory -Force -Path $target | Out-Null

$entries = Get-ManifestEntries -ManifestPath $manifestPath
foreach ($entry in $entries) {
  Copy-AllowlistedEntry -Root $root -Target $target -Entry $entry
}

$verifyScript = Join-Path $root "tools/verify-public-repo.ps1"
& powershell -ExecutionPolicy Bypass -File $verifyScript -RepoDir $OutputDir -Manifest $Manifest
if ($LASTEXITCODE -ne 0) {
  throw "Public repo package verification failed"
}

if ($Zip) {
  $zipPath = Join-Path $root "dist/pacjent360-public-repo.zip"
  if (Test-Path $zipPath) {
    Remove-Item -LiteralPath $zipPath -Force
  }
  Compress-Archive -Path (Join-Path $target "*") -DestinationPath $zipPath
  Write-Host "Created $zipPath"
}

Write-Host "Prepared public repo package: $target"
