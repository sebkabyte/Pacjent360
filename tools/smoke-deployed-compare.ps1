param(
  [string]$PackageDir = "dist/upload-ready",
  [int]$Port = 4196
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
Assert-True (Test-Path $package) "Package does not exist: $package"
$package = (Resolve-Path $package).Path

$existingListener = Get-NetTCPConnection -LocalPort $Port -State Listen -ErrorAction SilentlyContinue
Assert-True (-not $existingListener) "Port $Port is already in use. Choose another port with -Port."

$server = $null
$baseUrl = "http://127.0.0.1:$Port"

try {
  $serverArgs = "-m http.server $Port --bind 127.0.0.1 --directory `"$package`""
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
  Assert-True $started "Local deployed-compare server did not start on $baseUrl"

  & (Join-Path $root "tools/verify-deployed-site.ps1") `
    -BaseUrl $baseUrl `
    -AllowHttp `
    -CompareLocalPackage `
    -LocalPublicPath $PackageDir

  Write-Host "Local deployed compare smoke passed: $baseUrl -> $package"
} finally {
  if ($server -and (Get-Process -Id $server.Id -ErrorAction SilentlyContinue)) {
    Stop-Process -Id $server.Id
  }
}
