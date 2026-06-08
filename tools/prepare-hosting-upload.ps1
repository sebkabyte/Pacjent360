param(
  [string]$SourceZip = "dist/pacjent360-public.zip",
  [string]$OutputDir = "dist/upload-ready",
  [switch]$SkipArtifactVerification
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

$root = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
$dist = Join-Path $root "dist"
$sourceZipPath = if ([System.IO.Path]::IsPathRooted($SourceZip)) { $SourceZip } else { Join-Path $root $SourceZip }
$outputPath = if ([System.IO.Path]::IsPathRooted($OutputDir)) { $OutputDir } else { Join-Path $root $OutputDir }

Assert-True (Test-Path $sourceZipPath) "Hosting ZIP does not exist: $sourceZipPath"
Assert-True (Test-Path $dist) "dist directory does not exist: $dist"

if (-not $SkipArtifactVerification) {
  $artifactVerifier = Join-Path $root "tools/verify-release-artifacts.ps1"
  & powershell -ExecutionPolicy Bypass -File $artifactVerifier
  Assert-True ($LASTEXITCODE -eq 0) "Release artifact verification failed"
}

if (Test-Path $outputPath) {
  $resolvedOutput = (Resolve-Path $outputPath).Path
  $resolvedDist = (Resolve-Path $dist).Path
  Assert-True ($resolvedOutput.StartsWith($resolvedDist, [System.StringComparison]::OrdinalIgnoreCase)) "Refusing to clean upload path outside dist: $resolvedOutput"
  Remove-Item -LiteralPath $resolvedOutput -Recurse -Force
}

New-Item -ItemType Directory -Force -Path $outputPath | Out-Null
Expand-Archive -LiteralPath $sourceZipPath -DestinationPath $outputPath -Force

$verifyPublic = Join-Path $root "tools/verify-public.ps1"
$relativeOutput = Get-RelativePath -Base $root -Path (Resolve-Path $outputPath).Path
& powershell -ExecutionPolicy Bypass -File $verifyPublic -PackageDir $relativeOutput
Assert-True ($LASTEXITCODE -eq 0) "Upload-ready directory did not pass public package verification"

$htaccessPath = Join-Path $outputPath ".htaccess"
Assert-True (Test-Path $htaccessPath) "Upload-ready directory is missing hidden .htaccess"

Write-Host "Prepared upload-ready directory: $outputPath"
Write-Host "Upload the contents of this directory to the pacjent360.com.pl document root."
