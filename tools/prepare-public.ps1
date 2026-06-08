param(
  [string]$OutputDir = "dist/public",
  [switch]$Zip
)

$ErrorActionPreference = "Stop"

$root = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
$sourceRoot = Join-Path $root "public"
$target = Join-Path $root $OutputDir
$resolvedDist = Join-Path $root "dist"
if (-not (Test-Path $sourceRoot)) {
  throw "Missing public source directory: $sourceRoot"
}

if (Test-Path $target) {
  $resolvedTarget = (Resolve-Path $target).Path
  $resolvedDistPath = if (Test-Path $resolvedDist) { (Resolve-Path $resolvedDist).Path } else { $resolvedDist }
  if (-not $resolvedTarget.StartsWith($resolvedDistPath, [System.StringComparison]::OrdinalIgnoreCase)) {
    throw "Refusing to clean path outside dist: $resolvedTarget"
  }
  Remove-Item -LiteralPath $resolvedTarget -Recurse -Force
}

New-Item -ItemType Directory -Force -Path $target | Out-Null

$files = @(
  ".htaccess",
  "index.html",
  "demo.html",
  "disclaimer.html",
  "privacy.html",
  "maintenance.html",
  "health.txt",
  "site.css",
  "site.js",
  "patient360-contract.js",
  "patient360-map-model.js",
  "patient360-previsit-model.js",
  "patient360-caregiver-model.js",
  "patient360-consent-model.js",
  "styles.css",
  "app.js",
  "robots.txt",
  "sitemap.xml"
)

foreach ($file in $files) {
  $source = Join-Path $sourceRoot $file
  if (-not (Test-Path $source)) {
    throw "Missing required public file: $file"
  }
  Copy-Item -LiteralPath $source -Destination (Join-Path $target $file)
}

$assetTarget = Join-Path $target "assets"
New-Item -ItemType Directory -Force -Path $assetTarget | Out-Null
Copy-Item -LiteralPath (Join-Path $sourceRoot "assets/hero-clinical-context.png") -Destination $assetTarget

$blockedNames = @(
  "1.txt",
  "linkedin-story.md",
  ".env",
  ".git",
  ".claude",
  "CLAUDE.md",
  "CODEX_GOALS.md",
  "CODEX_MASTER_PROMPT.md",
  "CODEX_NIGHT_SPRINT.md",
  "HANDOVER.md"
)
foreach ($blocked in $blockedNames) {
  $found = Get-ChildItem -LiteralPath $target -Force -Recurse | Where-Object { $_.Name -eq $blocked }
  if ($found) {
    throw "Blocked private file found in public package: $blocked"
  }
}

if ($Zip) {
  $zipPath = Join-Path $root "dist/pacjent360-public.zip"
  $uploadRootZipPath = Join-Path $root "dist/pacjent360-upload-root.zip"
  if (Test-Path $zipPath) {
    Remove-Item -LiteralPath $zipPath -Force
  }
  if (Test-Path $uploadRootZipPath) {
    Remove-Item -LiteralPath $uploadRootZipPath -Force
  }
  Compress-Archive -Path (Join-Path $target "*") -DestinationPath $zipPath
  Write-Host "Created $zipPath"
  Copy-Item -LiteralPath $zipPath -Destination $uploadRootZipPath
  Write-Host "Created $uploadRootZipPath"
}

Write-Host "Prepared public package: $target"
