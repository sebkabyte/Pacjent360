param(
  [string]$OutputPath = "dist/release-manifest.json"
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

function Get-DirectoryFileCount {
  param([string]$Path)
  if (-not (Test-Path $Path)) {
    return 0
  }
  return @(Get-ChildItem -LiteralPath $Path -Recurse -File).Count
}

function Get-ArtifactInfo {
  param(
    [string]$Root,
    [string]$Path,
    [string]$Purpose
  )

  $fullPath = Join-Path $Root $Path
  Assert-True (Test-Path $fullPath) "Release artifact does not exist: $Path"
  $item = Get-Item -LiteralPath $fullPath
  $hash = Get-FileHash -LiteralPath $fullPath -Algorithm SHA256
  return [ordered]@{
    path = (Get-RelativePath -Base $Root -Path $item.FullName)
    purpose = $Purpose
    bytes = $item.Length
    sha256 = $hash.Hash.ToLowerInvariant()
    lastWriteTimeUtc = $item.LastWriteTimeUtc.ToString("o")
  }
}

$root = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
$dist = Join-Path $root "dist"
Assert-True (Test-Path $dist) "dist directory does not exist. Run tools/validate-go-live.ps1 first."

$manifest = [ordered]@{
  project = "Pacjent360"
  status = "local release candidate"
  generatedAtUtc = (Get-Date).ToUniversalTime().ToString("o")
  externalGates = [ordered]@{
    contactAliases = "manual receipt and reply required before public repo/go-live"
    deployedDomain = "run tools/verify-deployed-site.ps1 after upload"
    humanReview = "required before production go-live"
  }
  directories = [ordered]@{
    publicFiles = Get-DirectoryFileCount -Path (Join-Path $dist "public")
    repoFiles = Get-DirectoryFileCount -Path (Join-Path $dist "repo")
  }
  artifacts = @(
    (Get-ArtifactInfo -Root $root -Path "dist/pacjent360-public.zip" -Purpose "hosting package"),
    (Get-ArtifactInfo -Root $root -Path "dist/pacjent360-upload-root.zip" -Purpose "hosting upload-root package"),
    (Get-ArtifactInfo -Root $root -Path "dist/pacjent360-public-repo.zip" -Purpose "public repository package")
  )
}

$outputFullPath = Join-Path $root $OutputPath
$outputParent = Split-Path -Parent $outputFullPath
if ($outputParent) {
  New-Item -ItemType Directory -Force -Path $outputParent | Out-Null
}

$manifestJson = $manifest | ConvertTo-Json -Depth 5
$utf8NoBom = New-Object System.Text.UTF8Encoding($false)
[System.IO.File]::WriteAllText($outputFullPath, $manifestJson + [Environment]::NewLine, $utf8NoBom)

$manifestBytes = [System.IO.File]::ReadAllBytes($outputFullPath)
Assert-True (-not ($manifestBytes.Length -ge 3 -and $manifestBytes[0] -eq 239 -and $manifestBytes[1] -eq 187 -and $manifestBytes[2] -eq 191)) "Release manifest must be UTF-8 without BOM"
[void]($manifestJson | ConvertFrom-Json)

foreach ($artifact in $manifest.artifacts) {
  $shaPath = Join-Path $root "$($artifact.path).sha256"
  "$($artifact.sha256)  $($artifact.path)" | Set-Content -LiteralPath $shaPath -Encoding ASCII
}

Write-Host "Release manifest written: $outputFullPath"
