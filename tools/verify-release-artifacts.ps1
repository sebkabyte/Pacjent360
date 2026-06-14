param(
  [string]$PublicDir = "dist/public",
  [string]$RepoDir = "dist/repo",
  [string]$PublicZip = "dist/pacjent360-public.zip",
  [string]$UploadRootZip = "dist/pacjent360-upload-root.zip",
  [string]$RepoZip = "dist/pacjent360-public-repo.zip",
  [string]$Manifest = "dist/release-manifest.json"
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

function Get-ZipFileEntries {
  param([string]$ZipPath)
  Add-Type -AssemblyName System.IO.Compression.FileSystem
  $zip = [System.IO.Compression.ZipFile]::OpenRead($ZipPath)
  try {
    return $zip.Entries |
      Where-Object { -not [string]::IsNullOrWhiteSpace($_.Name) } |
      ForEach-Object { $_.FullName.Replace("\", "/").TrimStart("/") } |
      Sort-Object -Unique
  } finally {
    $zip.Dispose()
  }
}

function Get-DirectoryFileEntries {
  param([string]$Directory)
  $resolved = (Resolve-Path $Directory).Path
  return Get-ChildItem -LiteralPath $resolved -Force -Recurse -File |
    ForEach-Object { Get-RelativePath -Base $resolved -Path $_.FullName } |
    Sort-Object -Unique
}

function Assert-ZipMatchesDirectory {
  param(
    [string]$ZipPath,
    [string]$Directory,
    [string[]]$RequiredFiles
  )

  Assert-True (Test-Path $ZipPath) "ZIP does not exist: $ZipPath"
  Assert-True (Test-Path $Directory) "Directory does not exist: $Directory"

  $zipEntries = @(Get-ZipFileEntries -ZipPath $ZipPath)
  $dirEntries = @(Get-DirectoryFileEntries -Directory $Directory)

  foreach ($entry in $zipEntries) {
    Assert-True (-not ([System.IO.Path]::IsPathRooted($entry))) "ZIP contains rooted path: $entry"
    Assert-True (-not ($entry -match '(^|/)\.\.($|/)')) "ZIP contains path traversal entry: $entry"
  }

  $missing = $dirEntries | Where-Object { $zipEntries -notcontains $_ }
  Assert-True (-not $missing) ("ZIP missing file(s): " + ($missing -join ", "))

  $unexpected = $zipEntries | Where-Object { $dirEntries -notcontains $_ }
  Assert-True (-not $unexpected) ("ZIP contains unexpected file(s): " + ($unexpected -join ", "))

  foreach ($file in $RequiredFiles) {
    Assert-True ($zipEntries -contains $file) "ZIP missing required file: $file"
  }
}

function Assert-BlockedEntriesAbsent {
  param(
    [string]$ZipPath,
    [string[]]$BlockedNamePatterns,
    [string[]]$BlockedPrefixes
  )

  $entries = @(Get-ZipFileEntries -ZipPath $ZipPath)
  foreach ($entry in $entries) {
    $name = Split-Path -Leaf $entry
    foreach ($pattern in $BlockedNamePatterns) {
      Assert-True (-not ($name -match $pattern)) "ZIP contains blocked file name pattern: $entry"
    }
    foreach ($prefix in $BlockedPrefixes) {
      Assert-True (-not $entry.StartsWith($prefix, [System.StringComparison]::OrdinalIgnoreCase)) "ZIP contains blocked path: $entry"
    }
  }
}

function Assert-HashFileMatches {
  param([string]$ZipPath)
  $shaPath = "$ZipPath.sha256"
  Assert-True (Test-Path $shaPath) "Missing SHA256 sidecar: $shaPath"
  $actual = (Get-FileHash -LiteralPath $ZipPath -Algorithm SHA256).Hash.ToLowerInvariant()
  $content = (Get-Content -LiteralPath $shaPath -Raw).Trim()
  Assert-True ($content.StartsWith($actual)) "SHA256 sidecar does not match ZIP: $shaPath"
}

function Assert-ManifestMatchesArtifact {
  param(
    $ManifestObject,
    [string]$ZipPath
  )
  $relativeZip = (Get-RelativePath -Base $root -Path (Resolve-Path $ZipPath).Path)
  $artifact = @($ManifestObject.artifacts | Where-Object { $_.path -eq $relativeZip })[0]
  Assert-True ($null -ne $artifact) "Manifest missing artifact: $relativeZip"

  $item = Get-Item -LiteralPath $ZipPath
  $hash = (Get-FileHash -LiteralPath $ZipPath -Algorithm SHA256).Hash.ToLowerInvariant()
  Assert-True ([int64]$artifact.bytes -eq [int64]$item.Length) "Manifest bytes do not match artifact: $relativeZip"
  Assert-True ([string]$artifact.sha256 -eq $hash) "Manifest sha256 does not match artifact: $relativeZip"
}

function Assert-PublicZipExtractsToValidPackage {
  param([string]$ZipPath)

  $distRoot = Join-Path $root "dist"
  $extractRoot = Join-Path $distRoot "release-artifact-public-extract"

  if (Test-Path $extractRoot) {
    $resolvedExtractRoot = (Resolve-Path $extractRoot).Path
    $resolvedDistRoot = (Resolve-Path $distRoot).Path
    Assert-True ($resolvedExtractRoot.StartsWith($resolvedDistRoot, [System.StringComparison]::OrdinalIgnoreCase)) "Refusing to clean extract path outside dist: $resolvedExtractRoot"
    Remove-Item -LiteralPath $resolvedExtractRoot -Recurse -Force
  }

  New-Item -ItemType Directory -Force -Path $extractRoot | Out-Null

  try {
    Expand-Archive -LiteralPath $ZipPath -DestinationPath $extractRoot -Force
    $verifyScript = Join-Path $root "tools/verify-public.ps1"
    & powershell -ExecutionPolicy Bypass -File $verifyScript -PackageDir "dist/release-artifact-public-extract"
    Assert-True ($LASTEXITCODE -eq 0) "Extracted public ZIP did not pass verify-public.ps1"
  } finally {
    if (Test-Path $extractRoot) {
      $resolvedExtractRoot = (Resolve-Path $extractRoot).Path
      $resolvedDistRoot = (Resolve-Path $distRoot).Path
      Assert-True ($resolvedExtractRoot.StartsWith($resolvedDistRoot, [System.StringComparison]::OrdinalIgnoreCase)) "Refusing to clean extract path outside dist: $resolvedExtractRoot"
      Remove-Item -LiteralPath $resolvedExtractRoot -Recurse -Force
    }
  }
}

$root = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
$publicDirPath = Join-Path $root $PublicDir
$repoDirPath = Join-Path $root $RepoDir
$publicZipPath = Join-Path $root $PublicZip
$uploadRootZipPath = Join-Path $root $UploadRootZip
$repoZipPath = Join-Path $root $RepoZip
$manifestPath = Join-Path $root $Manifest

Assert-True (Test-Path $manifestPath) "Release manifest does not exist: $manifestPath"
$manifestBytes = [System.IO.File]::ReadAllBytes($manifestPath)
Assert-True (-not ($manifestBytes.Length -ge 3 -and $manifestBytes[0] -eq 239 -and $manifestBytes[1] -eq 187 -and $manifestBytes[2] -eq 191)) "Release manifest must be UTF-8 without BOM"
$manifestObject = Get-Content -LiteralPath $manifestPath -Raw | ConvertFrom-Json

Assert-ZipMatchesDirectory -ZipPath $publicZipPath -Directory $publicDirPath -RequiredFiles @(
  ".htaccess",
  ".well-known/security.txt",
  "index.html",
  "demo.html",
  "engineering.html",
  "ditl.html",
  "agents.html",
  "investors.html",
  "readme.html",
  "jak-sie-przygotowac.html",
  "soczewki.html",
  "wspoltworcy.html",
  "privacy.html",
  "disclaimer.html",
  "maintenance.html",
  "health.txt",
  "assets/lucide.min.js",
  "assets/hero-clinical-context.png"
)

Assert-ZipMatchesDirectory -ZipPath $uploadRootZipPath -Directory $publicDirPath -RequiredFiles @(
  ".htaccess",
  ".well-known/security.txt",
  "index.html",
  "demo.html",
  "engineering.html",
  "ditl.html",
  "agents.html",
  "investors.html",
  "readme.html",
  "jak-sie-przygotowac.html",
  "soczewki.html",
  "wspoltworcy.html",
  "privacy.html",
  "disclaimer.html",
  "maintenance.html",
  "health.txt",
  "assets/lucide.min.js",
  "assets/hero-clinical-context.png"
)

Assert-ZipMatchesDirectory -ZipPath $repoZipPath -Directory $repoDirPath -RequiredFiles @(
  "README.md",
  "SECURITY.md",
  "public/.htaccess",
  "public/index.html",
  "docs/deployment/GO_LIVE_CHECKLIST.md",
  "docs/deployment/DEPLOYMENT_RUNBOOK_NAZWA.md",
  "tools/verify-release-artifacts.ps1"
)

$blockedNamePatterns = @(
  "^\.env(\..*)?$",
  "^\.git$",
  "private",
  "handover",
  "working"
)

Assert-BlockedEntriesAbsent -ZipPath $publicZipPath -BlockedNamePatterns $blockedNamePatterns -BlockedPrefixes @("dist/", "prints/", ".git/")
Assert-BlockedEntriesAbsent -ZipPath $uploadRootZipPath -BlockedNamePatterns $blockedNamePatterns -BlockedPrefixes @("dist/", "prints/", ".git/")
Assert-BlockedEntriesAbsent -ZipPath $repoZipPath -BlockedNamePatterns $blockedNamePatterns -BlockedPrefixes @("dist/", "prints/", ".git/")

Assert-HashFileMatches -ZipPath $publicZipPath
Assert-HashFileMatches -ZipPath $uploadRootZipPath
Assert-HashFileMatches -ZipPath $repoZipPath

Assert-ManifestMatchesArtifact -ManifestObject $manifestObject -ZipPath $publicZipPath
Assert-ManifestMatchesArtifact -ManifestObject $manifestObject -ZipPath $uploadRootZipPath
Assert-ManifestMatchesArtifact -ManifestObject $manifestObject -ZipPath $repoZipPath
Assert-PublicZipExtractsToValidPackage -ZipPath $publicZipPath
Assert-PublicZipExtractsToValidPackage -ZipPath $uploadRootZipPath

Assert-True ([int]$manifestObject.directories.publicFiles -eq @(Get-DirectoryFileEntries -Directory $publicDirPath).Count) "Manifest publicFiles does not match dist/public"
Assert-True ([int]$manifestObject.directories.repoFiles -eq @(Get-DirectoryFileEntries -Directory $repoDirPath).Count) "Manifest repoFiles does not match dist/repo"

Write-Host "Release artifact verification passed"
