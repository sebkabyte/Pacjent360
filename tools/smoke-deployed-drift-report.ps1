param(
  [string]$PackageDir = "dist/upload-ready",
  [int]$Port = 4197
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

function Get-SmokeStatusCode {
  param([string]$Url)

  try {
    $response = Invoke-WebRequest -Uri $Url -UseBasicParsing -MaximumRedirection 0 -TimeoutSec 1
    return [int]$response.StatusCode
  } catch {
    if ($_.Exception.Response -and $_.Exception.Response.StatusCode) {
      return [int]$_.Exception.Response.StatusCode
    }
    return 0
  }
}

$root = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
$package = Join-Path $root $PackageDir
Assert-True (Test-Path -LiteralPath $package) "Package does not exist: $package"
$package = (Resolve-Path $package).Path

$existingListener = Get-NetTCPConnection -LocalPort $Port -State Listen -ErrorAction SilentlyContinue
Assert-True (-not $existingListener) "Port $Port is already in use. Choose another port with -Port."

$server = $null
$baseUrl = "http://127.0.0.1:$Port"
$tempRoot = Join-Path ([System.IO.Path]::GetTempPath()) ("pacjent360-drift-smoke-" + [System.Guid]::NewGuid().ToString("N"))
$remotePackage = Join-Path $tempRoot "remote"
$driftReport = Join-Path $tempRoot "deployed-package-drift.txt"

try {
  New-Item -ItemType Directory -Force -Path $tempRoot | Out-Null
  Copy-Item -LiteralPath $package -Destination $remotePackage -Recurse -Force

  Add-Content -LiteralPath (Join-Path $remotePackage "robots.txt") -Value "`n# intentional drift for smoke test"
  Remove-Item -LiteralPath (Join-Path $remotePackage "sw.js") -Force

  $serverArgs = "-m http.server $Port --bind 127.0.0.1 --directory `"$remotePackage`""
  $server = Start-Process `
    -FilePath "python" `
    -ArgumentList $serverArgs `
    -WindowStyle Hidden `
    -PassThru

  $started = $false
  for ($attempt = 0; $attempt -lt 30; $attempt++) {
    Start-Sleep -Milliseconds 200
    if ((Get-SmokeStatusCode "$baseUrl/index.html") -eq 200) {
      $started = $true
      break
    }
  }
  Assert-True $started "Local deployed drift server did not start on $baseUrl"

  $failedAsExpected = $false
  try {
    & (Join-Path $root "tools/verify-deployed-site.ps1") `
      -BaseUrl $baseUrl `
      -AllowHttp `
      -CompareLocalPackage `
      -LocalPublicPath $PackageDir `
      -DriftReportPath $driftReport
  } catch {
    $failedAsExpected = $true
  }

  Assert-True $failedAsExpected "Expected deployed verifier to fail for intentionally drifted package"
  Assert-True (Test-Path -LiteralPath $driftReport) "Expected drift report to be written: $driftReport"

  $report = Get-Content -LiteralPath $driftReport -Raw
  Assert-True ($report.Contains("Status: DRIFT")) "Drift report should mark DRIFT status"
  Assert-True ($report.Contains("IssueCount: 2")) "Drift report should contain exactly 2 smoke issues"
  Assert-True ($report.Contains("DIFF robots.txt")) "Drift report should contain robots.txt hash drift"
  Assert-True ($report.Contains("MISSING sw.js status=404")) "Drift report should contain missing sw.js"

  Write-Host "Local deployed drift report smoke passed: $baseUrl -> $driftReport"
} finally {
  if ($server -and (Get-Process -Id $server.Id -ErrorAction SilentlyContinue)) {
    Stop-Process -Id $server.Id
  }
  if (Test-Path -LiteralPath $tempRoot) {
    Remove-Item -LiteralPath $tempRoot -Recurse -Force
  }
}
