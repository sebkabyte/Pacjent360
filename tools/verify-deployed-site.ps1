param(
  [string]$BaseUrl = "https://pacjent360.com.pl",
  [switch]$AllowHttp,
  [switch]$CompareLocalPackage,
  [string]$LocalPublicPath = "dist/upload-ready"
)

$ErrorActionPreference = "Stop"

$root = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path

function Assert-True {
  param(
    [bool]$Condition,
    [string]$Message
  )
  if (-not $Condition) {
    throw $Message
  }
}

function Join-WebPath {
  param(
    [string]$Base,
    [string]$Path
  )
  return "$($Base.TrimEnd('/'))/$($Path.TrimStart('/'))"
}

function Get-HttpStatus {
  param([string]$Url)
  try {
    $response = Invoke-WebRequest -Uri $Url -UseBasicParsing -MaximumRedirection 0 -TimeoutSec 10
    return [int]$response.StatusCode
  } catch {
    if ($_.Exception.Response -and $_.Exception.Response.StatusCode) {
      return [int]$_.Exception.Response.StatusCode
    }
    return 0
  }
}

function Get-HttpProbe {
  param([string]$Url)
  try {
    $response = Invoke-WebRequest -Uri $Url -UseBasicParsing -MaximumRedirection 0 -TimeoutSec 10
    return [pscustomobject]@{
      Status = [int]$response.StatusCode
      Location = Get-HeaderValue -Headers $response.Headers -Name "Location"
    }
  } catch {
    if ($_.Exception.Response -and $_.Exception.Response.StatusCode) {
      return [pscustomobject]@{
        Status = [int]$_.Exception.Response.StatusCode
        Location = Get-HeaderValue -Headers $_.Exception.Response.Headers -Name "Location"
      }
    }
    return [pscustomobject]@{
      Status = 0
      Location = ""
    }
  }
}

function Get-HttpContent {
  param([string]$Url)
  $response = Invoke-WebRequest -Uri $Url -UseBasicParsing -TimeoutSec 15
  Assert-True ([int]$response.StatusCode -eq 200) "Expected 200 for $Url, got $($response.StatusCode)"
  return [string]$response.Content
}

function Get-HeaderValue {
  param(
    $Headers,
    [string]$Name
  )
  foreach ($key in $Headers.Keys) {
    if ([string]::Equals($key, $Name, [System.StringComparison]::OrdinalIgnoreCase)) {
      $value = $Headers[$key]
      if ($value -is [array]) {
        return [string]::Join(", ", $value)
      }
      return [string]$value
    }
  }
  return ""
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

function Compare-DeployedFilesWithLocalPackage {
  param(
    [string]$Base,
    [string]$LocalPath
  )

  Assert-True (Test-Path $LocalPath) "Local package does not exist: $LocalPath"
  $localRoot = (Resolve-Path $LocalPath).Path
  $tempRoot = Join-Path ([System.IO.Path]::GetTempPath()) ("pacjent360-deploy-verify-" + [System.Guid]::NewGuid().ToString("N"))
  New-Item -ItemType Directory -Force -Path $tempRoot | Out-Null

  try {
    $localFiles = Get-ChildItem -LiteralPath $localRoot -Force -Recurse -File | ForEach-Object {
      Get-RelativePath -Base $localRoot -Path $_.FullName
    } | Sort-Object

    foreach ($relative in $localFiles) {
      if ($relative -eq ".htaccess") {
        continue
      }

      $localFile = Join-Path $localRoot $relative
      $remoteUrl = Join-WebPath $Base $relative
      $tempFile = Join-Path $tempRoot ($relative -replace '[\\/:*?"<>|]', "_")
      $status = Get-HttpStatus $remoteUrl
      Assert-True ($status -eq 200) "Expected 200 for deployed file $remoteUrl, got $status"
      Invoke-WebRequest -Uri $remoteUrl -UseBasicParsing -TimeoutSec 20 -OutFile $tempFile | Out-Null

      $localHash = (Get-FileHash -LiteralPath $localFile -Algorithm SHA256).Hash.ToLowerInvariant()
      $remoteHash = (Get-FileHash -LiteralPath $tempFile -Algorithm SHA256).Hash.ToLowerInvariant()
      Assert-True ($localHash -eq $remoteHash) "Deployed file differs from local package: $relative"
    }
  } finally {
    if (Test-Path $tempRoot) {
      Remove-Item -LiteralPath $tempRoot -Recurse -Force
    }
  }

  Write-Host "Deployed files match local package: $localRoot"
}

$base = $BaseUrl.Trim().TrimEnd("/")
Assert-True ($base.Length -gt 0) "BaseUrl is required"

$uri = [Uri]$base
if (-not $AllowHttp) {
  Assert-True ($uri.Scheme -eq "https") "Production verification requires HTTPS. Use -AllowHttp only for local test servers."
}

$indexUrl = Join-WebPath $base "index.html"
$demoUrl = Join-WebPath $base "demo.html"
$disclaimerUrl = Join-WebPath $base "disclaimer.html"
$privacyUrl = Join-WebPath $base "privacy.html"
$maintenanceUrl = Join-WebPath $base "maintenance.html"
$healthUrl = Join-WebPath $base "health.txt"

$rootStatus = Get-HttpStatus $base
Assert-True ($rootStatus -in @(200, 301, 302, 308)) "Expected root to be reachable, got status $rootStatus"

$indexStatus = Get-HttpStatus $indexUrl
Assert-True ($indexStatus -eq 200) "Expected 200 for $indexUrl, got $indexStatus. If this is 404, upload the contents of $LocalPublicPath to the domain document root or fix the hosting directory mapping."
$indexResponse = Invoke-WebRequest -Uri $indexUrl -UseBasicParsing -TimeoutSec 15
$index = [string]$indexResponse.Content
$demo = Get-HttpContent $demoUrl
$disclaimer = Get-HttpContent $disclaimerUrl
$privacy = Get-HttpContent $privacyUrl
$maintenance = Get-HttpContent $maintenanceUrl
$health = Get-HttpContent $healthUrl
$app = Get-HttpContent (Join-WebPath $base "app.js")
$contract = Get-HttpContent (Join-WebPath $base "patient360-contract.js")
$format = Get-HttpContent (Join-WebPath $base "patient360-format.js")
$mapModel = Get-HttpContent (Join-WebPath $base "patient360-map-model.js")
$preVisitModel = Get-HttpContent (Join-WebPath $base "patient360-previsit-model.js")
$caregiverModel = Get-HttpContent (Join-WebPath $base "patient360-caregiver-model.js")
$consentModel = Get-HttpContent (Join-WebPath $base "patient360-consent-model.js")
$demoData = Get-HttpContent (Join-WebPath $base "patient360-demo-data.js")

if (-not $AllowHttp) {
  $httpProbe = Get-HttpProbe ("http://$($uri.Host)/")
  Assert-True ($httpProbe.Status -in @(301, 302, 308)) "HTTP root should redirect to HTTPS canonical URL, got status $($httpProbe.Status)"
  Assert-True ($httpProbe.Location.StartsWith("https://pacjent360.com.pl")) "HTTP root should redirect to https://pacjent360.com.pl, got $($httpProbe.Location)"

  $wwwProbe = Get-HttpProbe "https://www.pacjent360.com.pl/"
  Assert-True ($wwwProbe.Status -in @(301, 302, 308)) "www HTTPS root should redirect to canonical domain, got status $($wwwProbe.Status)"
  Assert-True ($wwwProbe.Location.StartsWith("https://pacjent360.com.pl")) "www HTTPS root should redirect to https://pacjent360.com.pl, got $($wwwProbe.Location)"

  $cspHeader = Get-HeaderValue -Headers $indexResponse.Headers -Name "Content-Security-Policy"
  $xFrameHeader = Get-HeaderValue -Headers $indexResponse.Headers -Name "X-Frame-Options"
  $nosniffHeader = Get-HeaderValue -Headers $indexResponse.Headers -Name "X-Content-Type-Options"
  $referrerHeader = Get-HeaderValue -Headers $indexResponse.Headers -Name "Referrer-Policy"
  $permissionsHeader = Get-HeaderValue -Headers $indexResponse.Headers -Name "Permissions-Policy"

  Assert-True ($cspHeader.Contains("frame-ancestors 'none'")) "Deployed site should send CSP header with frame-ancestors 'none'"
  Assert-True ($cspHeader.Contains("object-src 'none'")) "Deployed site should send CSP header with object-src 'none'"
  Assert-True ($xFrameHeader -match "DENY") "Deployed site should send X-Frame-Options: DENY"
  Assert-True ($nosniffHeader -match "nosniff") "Deployed site should send X-Content-Type-Options: nosniff"
  Assert-True ($referrerHeader -match "strict-origin-when-cross-origin") "Deployed site should send Referrer-Policy"
  Assert-True ($permissionsHeader.Contains("camera=()") -and $permissionsHeader.Contains("microphone=()")) "Deployed site should send restrictive Permissions-Policy"
}

$assetResponse = Invoke-WebRequest -Uri (Join-WebPath $base "assets/hero-clinical-context.png") -UseBasicParsing -TimeoutSec 15
Assert-True ([int]$assetResponse.StatusCode -eq 200) "Hero asset should return 200"
Assert-True ($assetResponse.RawContentLength -gt 10000) "Hero asset looks unexpectedly small"

Assert-True ($index.Contains("Pacjent 360")) "index.html should contain project name"
Assert-True ($index.Contains("demo.html")) "index.html should link demo.html"
Assert-True ($index.Contains("CeZ") -and $index.Contains("NFZ") -and $index.Contains("IKP")) "index.html should show public-system independence"
Assert-True ($index.Contains("nie zastępuje lekarza") -or ($index.Contains("zast") -and $index.Contains("lekarza"))) "index.html should state that Pacjent 360 does not replace the doctor"
Assert-True ($index.Contains('rel="canonical" href="https://pacjent360.com.pl/"')) "index.html should include canonical URL"

Assert-True ($demo.Contains("DANE FIKCYJNE")) "demo.html should show fictional data marker"
Assert-True ($demo.Contains('name="robots" content="noindex,nofollow"')) "demo.html should be noindex,nofollow"
Assert-True ($demo.Contains("patient360-contract.js")) "demo.html should load contract model"
Assert-True ($demo.Contains("patient360-format.js")) "demo.html should load Polish format model"
Assert-True ($demo.Contains("patient360-map-model.js")) "demo.html should load map model"
Assert-True ($demo.Contains("patient360-previsit-model.js")) "demo.html should load pre-visit model"
Assert-True ($demo.Contains("patient360-caregiver-model.js")) "demo.html should load caregiver model"
Assert-True ($demo.Contains("patient360-consent-model.js")) "demo.html should load consent model"
Assert-True ($demo.Contains("patient360-demo-data.js")) "demo.html should load demo data"
Assert-True ($demo.Contains("app.js")) "demo.html should load app.js"

Assert-True ($contract.Contains("Patient360Contract")) "patient360-contract.js should expose Patient360Contract"
Assert-True ($format.Contains("Patient360Format")) "patient360-format.js should expose Patient360Format"
Assert-True ($mapModel.Contains("Patient360MapModel")) "patient360-map-model.js should expose Patient360MapModel"
Assert-True ($preVisitModel.Contains("Patient360PreVisitModel")) "patient360-previsit-model.js should expose Patient360PreVisitModel"
Assert-True ($caregiverModel.Contains("Patient360CaregiverModel")) "patient360-caregiver-model.js should expose Patient360CaregiverModel"
Assert-True ($consentModel.Contains("Patient360ConsentModel")) "patient360-consent-model.js should expose Patient360ConsentModel"
Assert-True ($demoData.Contains("Patient360DemoData")) "patient360-demo-data.js should expose Patient360DemoData"
Assert-True ($app.Contains("Raport kontekstowy")) "app.js should contain context report"
Assert-True ($app.Contains("Znane / Nieznane / Niepewne / Do weryfikacji")) "app.js should contain report categories"
Assert-True ($app.Contains("consentSourceRefsForContract")) "app.js should contain consent source ref resolver"
Assert-True ($demoData.Contains("consent:g1")) "patient360-demo-data.js should contain consent source refs"

Assert-True ($privacy.Contains("localStorage")) "privacy.html should disclose localStorage"
Assert-True ($privacy.Contains("lucide@0.468.0")) "privacy.html should disclose pinned Lucide"
Assert-True ($privacy.Contains('rel="canonical" href="https://pacjent360.com.pl/privacy.html"')) "privacy.html should include canonical URL"
Assert-True ($disclaimer.Contains("Pacjent 360")) "disclaimer.html should contain project name"
Assert-True ($disclaimer.Contains('rel="canonical" href="https://pacjent360.com.pl/disclaimer.html"')) "disclaimer.html should include canonical URL"
Assert-True ($maintenance.Contains("Pacjent 360")) "maintenance.html should contain project name"
Assert-True ($health.Contains("project=pacjent360") -and $health.Contains("contains_patient_data=false")) "health.txt should expose static deployment markers"
Assert-True ($health.Contains("medical_device=false") -and $health.Contains("clinical_decision_support=false")) "health.txt should expose safety boundary markers"

$riskyPhrases = @(
  "lucide@latest",
  "NFZ one-pager",
  "HITL",
  "AI lekarz",
  "Raport decyzyjny",
  "Clinical Decision Context"
)
$publicText = @($index, $demo, $privacy, $disclaimer, $maintenance, $app) -join "`n"
foreach ($phrase in $riskyPhrases) {
  Assert-True (-not $publicText.Contains($phrase)) "Risky phrase found on deployed site: $phrase"
}

$blockedPaths = @(
  ".env",
  ".git/HEAD",
  "README.md",
  "PROGRAM_PLAN.md",
  "dist/",
  "prints/",
  "pacjent360-public.zip",
  "pacjent360-upload-root.zip",
  "pacjent360-public-repo.zip",
  "pacjent360-public.zip.sha256",
  "pacjent360-upload-root.zip.sha256",
  "pacjent360-public-repo.zip.sha256",
  "release-manifest.json",
  "upload-ready-manifest.json",
  "deployment-handoff.txt",
  "go-live-status.txt",
  "domain-diagnostics.txt",
  "document-root-checklist.txt"
)

if (-not $AllowHttp) {
  $blockedPaths += ".htaccess"
}

foreach ($path in $blockedPaths) {
  $url = Join-WebPath $base $path
  $status = Get-HttpStatus $url
  Assert-True ($status -in @(403, 404)) "Blocked path should not be public: $path returned $status"
}

if ($CompareLocalPackage) {
  $resolvedLocalPublicPath = if ([System.IO.Path]::IsPathRooted($LocalPublicPath)) { $LocalPublicPath } else { Join-Path $root $LocalPublicPath }
  Compare-DeployedFilesWithLocalPackage -Base $base -LocalPath $resolvedLocalPublicPath
}

Write-Host "Deployed site verification passed: $base"
