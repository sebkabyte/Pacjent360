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
  "engineering.html",
  "ditl.html",
  "agents.html",
  "investors.html",
  "jak-sie-przygotowac.html",
  "disclaimer.html",
  "privacy.html",
  "maintenance.html",
  "health.txt",
  "brand/tokens.css",
  "brand/components.css",
  "site.css",
  "patient360-contract.js",
  "patient360-format.js",
  "patient360-map-model.js",
  "patient360-map-view.js",
  "patient360-previsit-model.js",
  "patient360-caregiver-model.js",
  "patient360-consent-model.js",
  "patient360-demo-data.js",
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
  $destination = Join-Path $target $file
  $destinationDir = Split-Path -Parent $destination
  if (-not (Test-Path $destinationDir)) {
    New-Item -ItemType Directory -Force -Path $destinationDir | Out-Null
  }
  Copy-Item -LiteralPath $source -Destination $destination
}

$assetTarget = Join-Path $target "assets"
New-Item -ItemType Directory -Force -Path $assetTarget | Out-Null
$assetFiles = @(
  "assets/hero-clinical-context.png",
  "assets/story.css",
  "assets/story.js",
  "assets/favicon.svg"
)
foreach ($asset in $assetFiles) {
  $source = Join-Path $sourceRoot $asset
  if (-not (Test-Path $source)) {
    throw "Missing required public asset: $asset"
  }
  Copy-Item -LiteralPath $source -Destination $assetTarget
}

$blockedNamePatterns = @(
  "^\.env(\..*)?$",
  "^\.git$",
  "private",
  "handover",
  "working"
)
foreach ($pattern in $blockedNamePatterns) {
  $found = Get-ChildItem -LiteralPath $target -Force -Recurse | Where-Object { $_.Name -match $pattern }
  if ($found) {
    throw "Blocked private or working file found in public package: $pattern"
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
