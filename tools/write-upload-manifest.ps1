param(
  [string]$UploadDir = "dist/upload-ready",
  [string]$OutputPath = "dist/upload-ready-manifest.json",
  [string]$ReleaseManifestPath = "dist/release-manifest.json",
  [string]$DeploymentHandoffPath = "dist/deployment-handoff.txt",
  [string]$DocumentRootChecklistPath = "dist/document-root-checklist.txt",
  [string]$BaseUrl = "https://pacjent360.com.pl",
  [switch]$SkipDeploymentHandoff
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
$uploadFullPath = if ([System.IO.Path]::IsPathRooted($UploadDir)) { $UploadDir } else { Join-Path $root $UploadDir }
$outputFullPath = if ([System.IO.Path]::IsPathRooted($OutputPath)) { $OutputPath } else { Join-Path $root $OutputPath }
$releaseManifestFullPath = if ([System.IO.Path]::IsPathRooted($ReleaseManifestPath)) { $ReleaseManifestPath } else { Join-Path $root $ReleaseManifestPath }
$deploymentHandoffFullPath = if ([System.IO.Path]::IsPathRooted($DeploymentHandoffPath)) { $DeploymentHandoffPath } else { Join-Path $root $DeploymentHandoffPath }
$documentRootChecklistFullPath = if ([System.IO.Path]::IsPathRooted($DocumentRootChecklistPath)) { $DocumentRootChecklistPath } else { Join-Path $root $DocumentRootChecklistPath }

Assert-True (Test-Path -LiteralPath $uploadFullPath) "Upload directory does not exist: $uploadFullPath"
$uploadRoot = (Resolve-Path -LiteralPath $uploadFullPath).Path

$outputDirectory = Split-Path -Parent $outputFullPath
if (-not (Test-Path -LiteralPath $outputDirectory)) {
  New-Item -ItemType Directory -Force -Path $outputDirectory | Out-Null
}

$files = Get-ChildItem -LiteralPath $uploadRoot -Force -Recurse -File |
  ForEach-Object {
    $relative = Get-RelativePath -Base $uploadRoot -Path $_.FullName
    $hash = (Get-FileHash -LiteralPath $_.FullName -Algorithm SHA256).Hash.ToLowerInvariant()
    [pscustomobject]@{
      path = $relative
      bytes = $_.Length
      sha256 = $hash
    }
  } |
  Sort-Object path

$filePaths = @($files | ForEach-Object { $_.path })
Assert-True ($filePaths -contains ".htaccess") "Upload manifest is missing .htaccess"
Assert-True ($filePaths -contains "index.html") "Upload manifest is missing index.html"
Assert-True (-not ($filePaths -contains "deployment-handoff.txt")) "Upload manifest should not include deployment-handoff.txt"
Assert-True (-not ($filePaths -contains "upload-ready-manifest.json")) "Upload manifest should not include upload-ready-manifest.json"

$manifest = [pscustomobject]@{
  project = "Pacjent360"
  generatedAtUtc = (Get-Date).ToUniversalTime().ToString("yyyy-MM-ddTHH:mm:ssZ")
  uploadDir = $UploadDir
  fileCount = @($files).Count
  files = @($files)
}

$json = $manifest | ConvertTo-Json -Depth 5
$utf8NoBom = New-Object System.Text.UTF8Encoding($false)
[System.IO.File]::WriteAllText($outputFullPath, ($json + "`r`n"), $utf8NoBom)

Write-Host "Upload manifest written: $outputFullPath"

$checklistLines = New-Object System.Collections.Generic.List[string]
$checklistLines.Add("Pacjent360 document root checklist") | Out-Null
$checklistLines.Add("GeneratedAtUtc: $((Get-Date).ToUniversalTime().ToString("yyyy-MM-ddTHH:mm:ssZ"))") | Out-Null
$checklistLines.Add("TargetBaseUrl: $BaseUrl") | Out-Null
$checklistLines.Add("ExpectedFileCount: $($manifest.fileCount)") | Out-Null
$checklistLines.Add("") | Out-Null
$checklistLines.Add("WHAT MUST BE DIRECTLY IN DOCUMENT ROOT") | Out-Null
foreach ($file in $filePaths) {
  $checklistLines.Add("- $file") | Out-Null
}
$checklistLines.Add("") | Out-Null
$checklistLines.Add("DO NOT LEAVE IN DOCUMENT ROOT") | Out-Null
$checklistLines.Add("- pacjent360-public.zip") | Out-Null
$checklistLines.Add("- pacjent360-upload-root.zip") | Out-Null
$checklistLines.Add("- pacjent360-public-repo.zip") | Out-Null
$checklistLines.Add("- *.sha256") | Out-Null
$checklistLines.Add("- release-manifest.json") | Out-Null
$checklistLines.Add("- upload-ready-manifest.json") | Out-Null
$checklistLines.Add("- deployment-handoff.txt") | Out-Null
$checklistLines.Add("- go-live-status.txt") | Out-Null
$checklistLines.Add("- domain-diagnostics.txt") | Out-Null
$checklistLines.Add("- document-root-checklist.txt") | Out-Null
$checklistLines.Add("") | Out-Null
$checklistLines.Add("FIRST POST-UPLOAD CHECK") | Out-Null
$checklistLines.Add("- $BaseUrl/health.txt should return project=pacjent360") | Out-Null

$checklistDirectory = Split-Path -Parent $documentRootChecklistFullPath
if (-not (Test-Path -LiteralPath $checklistDirectory)) {
  New-Item -ItemType Directory -Force -Path $checklistDirectory | Out-Null
}
[System.IO.File]::WriteAllText($documentRootChecklistFullPath, (($checklistLines -join "`r`n") + "`r`n"), $utf8NoBom)
Write-Host "Document root checklist written: $documentRootChecklistFullPath"

if (-not $SkipDeploymentHandoff) {
  Assert-True (Test-Path -LiteralPath $releaseManifestFullPath) "Release manifest does not exist: $releaseManifestFullPath"

  $releaseManifest = Get-Content -LiteralPath $releaseManifestFullPath -Raw | ConvertFrom-Json
  $hostingArtifact = @($releaseManifest.artifacts | Where-Object { $_.purpose -eq "hosting package" })[0]
  $uploadRootArtifact = @($releaseManifest.artifacts | Where-Object { $_.purpose -eq "hosting upload-root package" })[0]
  $repoArtifact = @($releaseManifest.artifacts | Where-Object { $_.purpose -eq "public repository package" })[0]
  Assert-True ($null -ne $hostingArtifact) "Release manifest is missing hosting package artifact"
  Assert-True ($null -ne $uploadRootArtifact) "Release manifest is missing hosting upload-root package artifact"
  Assert-True ($null -ne $repoArtifact) "Release manifest is missing public repository package artifact"

  $uploadManifestHash = (Get-FileHash -LiteralPath $outputFullPath -Algorithm SHA256).Hash.ToLowerInvariant()
  $documentRootChecklistHash = (Get-FileHash -LiteralPath $documentRootChecklistFullPath -Algorithm SHA256).Hash.ToLowerInvariant()
  $handoffLines = New-Object System.Collections.Generic.List[string]

  $handoffLines.Add("Pacjent360 deployment handoff") | Out-Null
  $handoffLines.Add("GeneratedAtUtc: $((Get-Date).ToUniversalTime().ToString("yyyy-MM-ddTHH:mm:ssZ"))") | Out-Null
  $handoffLines.Add("ManifestGeneratedAtUtc: $($releaseManifest.generatedAtUtc)") | Out-Null
  $handoffLines.Add("") | Out-Null
  $handoffLines.Add("SZYBKA INSTRUKCJA OPERATORA") | Out-Null
  $handoffLines.Add("1. Wgraj zawartosc katalogu $UploadDir do document root domeny $BaseUrl.") | Out-Null
  $handoffLines.Add("2. Alternatywnie: jesli panel hostingu potrafi rozpakowac ZIP, rozpakuj dist/pacjent360-upload-root.zip bezposrednio w document root.") | Out-Null
  $handoffLines.Add("3. Upewnij sie, ze ukryty plik .htaccess zostal wyslany razem z index.html.") | Out-Null
  $handoffLines.Add("4. Jesli rozpakowujesz ZIP w panelu, usun ZIP z document root po rozpakowaniu.") | Out-Null
  $handoffLines.Add("5. Nie wgrywaj katalogu projektu, katalogu dist, ZIP-ow, .sha256, manifestow ani raportow pomocniczych.") | Out-Null
  $handoffLines.Add("6. Po uploadzie uruchom verifier domeny z sekcji AFTER UPLOAD.") | Out-Null
  $handoffLines.Add("7. Go-live jest gotowy dopiero po zielonym verifierze domeny i recznym tescie aliasow email.") | Out-Null
  $handoffLines.Add("") | Out-Null
  $handoffLines.Add("UPLOAD THIS DIRECTORY CONTENTS") | Out-Null
  $handoffLines.Add("Path: $UploadDir") | Out-Null
  $handoffLines.Add("Important: upload the contents of the directory, including hidden file .htaccess, not the workspace root and not the whole dist directory.") | Out-Null
  $handoffLines.Add("") | Out-Null
  $handoffLines.Add("ARTIFACTS") | Out-Null
  $handoffLines.Add("Hosting ZIP: $($hostingArtifact.path)") | Out-Null
  $handoffLines.Add("Hosting ZIP SHA256: $($hostingArtifact.sha256)") | Out-Null
  $handoffLines.Add("Upload-root ZIP: $($uploadRootArtifact.path)") | Out-Null
  $handoffLines.Add("Upload-root ZIP SHA256: $($uploadRootArtifact.sha256)") | Out-Null
  $handoffLines.Add("Upload-root ZIP note: if the hosting panel can extract ZIP files, extract this archive directly inside the document root.") | Out-Null
  $handoffLines.Add("Public repo ZIP: $($repoArtifact.path)") | Out-Null
  $handoffLines.Add("Public repo ZIP SHA256: $($repoArtifact.sha256)") | Out-Null
  $handoffLines.Add("Public files: $($releaseManifest.directories.publicFiles)") | Out-Null
  $handoffLines.Add("Repo files: $($releaseManifest.directories.repoFiles)") | Out-Null
  $handoffLines.Add("") | Out-Null
  $handoffLines.Add("UPLOAD FILE MANIFEST") | Out-Null
  $handoffLines.Add("Path: $OutputPath") | Out-Null
  $handoffLines.Add("SHA256: $uploadManifestHash") | Out-Null
  $handoffLines.Add("Files: $($manifest.fileCount)") | Out-Null
  $handoffLines.Add("Important: this manifest is for verification only. Do not upload it to the hosting document root.") | Out-Null
  $handoffLines.Add("") | Out-Null
  $handoffLines.Add("DOCUMENT ROOT CHECKLIST") | Out-Null
  $handoffLines.Add("Path: $DocumentRootChecklistPath") | Out-Null
  $handoffLines.Add("SHA256: $documentRootChecklistHash") | Out-Null
  $handoffLines.Add("Important: this checklist is for operator verification only. Do not upload it to the hosting document root.") | Out-Null
  $handoffLines.Add("") | Out-Null
  $handoffLines.Add("FILES TO UPLOAD ($($manifest.fileCount))") | Out-Null
  foreach ($file in $filePaths) {
    $handoffLines.Add("- $file") | Out-Null
  }
  $handoffLines.Add("") | Out-Null
  $handoffLines.Add("AFTER UPLOAD") | Out-Null
  $handoffLines.Add("1. Run deployed verifier:") | Out-Null
  $handoffLines.Add("   powershell -ExecutionPolicy Bypass -File tools\verify-deployed-site.ps1 -BaseUrl `"$BaseUrl`" -CompareLocalPackage -LocalPublicPath `"$UploadDir`"") | Out-Null
  $handoffLines.Add("2. Run go-live status:") | Out-Null
  $handoffLines.Add("   node tools\release-readiness.js -ReportPath `"dist/go-live-status.txt`"") | Out-Null
  $handoffLines.Add("3. After manual email receipt/reply tests, run the final strict gate:") | Out-Null
  $handoffLines.Add("   node tools\release-readiness.js -Strict -ReceiptConfirmed -MonitorOwner `"Name`" -ReportPath `"dist/go-live-status.txt`"") | Out-Null
  $handoffLines.Add("4. If the domain still returns 404 or www behaves differently, run:") | Out-Null
  $handoffLines.Add("   node tools\domain-diagnostics.js -ReportPath `"dist/domain-diagnostics.txt`"") | Out-Null
  $handoffLines.Add("") | Out-Null
  $handoffLines.Add("EXTERNAL NO-GO UNTIL DONE") | Out-Null
  $handoffLines.Add("- Domain verifier passes on $BaseUrl.") | Out-Null
  $handoffLines.Add("- security@pacjent360.com.pl receives and replies to an external test email.") | Out-Null
  $handoffLines.Add("- kontakt@pacjent360.com.pl receives and replies to an external test email.") | Out-Null
  $handoffLines.Add("- Final human review passes on desktop and mobile.") | Out-Null

  $handoffDirectory = Split-Path -Parent $deploymentHandoffFullPath
  if (-not (Test-Path -LiteralPath $handoffDirectory)) {
    New-Item -ItemType Directory -Force -Path $handoffDirectory | Out-Null
  }

  [System.IO.File]::WriteAllText($deploymentHandoffFullPath, (($handoffLines -join "`r`n") + "`r`n"), $utf8NoBom)
  Write-Host "Deployment handoff written: $deploymentHandoffFullPath"
}
