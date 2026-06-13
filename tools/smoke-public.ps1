param(
  [string]$PackageDir = "dist/public",
  [int]$Port = 4190
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
  param(
    [string]$Url
  )
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

function Get-SmokeText {
  param(
    [string]$BaseUrl,
    [string]$Path
  )
  $url = "$BaseUrl/$Path"
  $response = Invoke-WebRequest -Uri $url -UseBasicParsing
  Assert-True ([int]$response.StatusCode -eq 200) "Expected 200 for $Path, got $($response.StatusCode)"
  return [string]$response.Content
}

$root = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
$package = Join-Path $root $PackageDir
Assert-True (Test-Path $package) "Public package does not exist: $package"
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
  Assert-True $started "Local public server did not start on $baseUrl"

  $index = Get-SmokeText -BaseUrl $baseUrl -Path "index.html"
  $demo = Get-SmokeText -BaseUrl $baseUrl -Path "demo.html"
  $app = Get-SmokeText -BaseUrl $baseUrl -Path "app.js"
  $contract = Get-SmokeText -BaseUrl $baseUrl -Path "patient360-contract.js"
  $mapModel = Get-SmokeText -BaseUrl $baseUrl -Path "patient360-map-model.js"
  $preVisitModel = Get-SmokeText -BaseUrl $baseUrl -Path "patient360-previsit-model.js"
  $caregiverModel = Get-SmokeText -BaseUrl $baseUrl -Path "patient360-caregiver-model.js"
  $consentModel = Get-SmokeText -BaseUrl $baseUrl -Path "patient360-consent-model.js"
  $privacy = Get-SmokeText -BaseUrl $baseUrl -Path "privacy.html"
  $disclaimer = Get-SmokeText -BaseUrl $baseUrl -Path "disclaimer.html"
  $maintenance = Get-SmokeText -BaseUrl $baseUrl -Path "maintenance.html"
  $health = Get-SmokeText -BaseUrl $baseUrl -Path "health.txt"

  $assetResponse = Invoke-WebRequest -Uri "$baseUrl/assets/hero-clinical-context.png" -UseBasicParsing
  Assert-True ([int]$assetResponse.StatusCode -eq 200) "Hero asset should return 200"
  Assert-True ($assetResponse.RawContentLength -gt 10000) "Hero asset looks unexpectedly small"

  Assert-True ($index.Contains("Pacjent360")) "index.html should contain project name"
  Assert-True ($index.Contains("demo.html")) "index.html should link demo.html"
  Assert-True ($index.Contains("CeZ") -and $index.Contains("NFZ") -and $index.Contains("IKP")) "index.html should show public-system independence"
  Assert-True ($index.Contains('rel="canonical" href="https://pacjent360.com.pl/"')) "index.html should include canonical URL"

  Assert-True ($demo.Contains("DANE FIKCYJNE")) "demo.html should show fictional data marker"
  Assert-True ($demo.Contains('name="robots" content="noindex,nofollow"')) "demo.html should be noindex,nofollow"
  Assert-True ($demo.Contains("patient360-contract.js")) "demo.html should load contract model"
  Assert-True ($demo.Contains("patient360-map-model.js")) "demo.html should load map model"
  Assert-True ($demo.Contains("patient360-previsit-model.js")) "demo.html should load pre-visit model"
  Assert-True ($demo.Contains("patient360-caregiver-model.js")) "demo.html should load caregiver model"
  Assert-True ($demo.Contains("patient360-consent-model.js")) "demo.html should load consent model"
  Assert-True ($demo.Contains("app.js")) "demo.html should load app.js"

  Assert-True ($contract.Contains("Patient360Contract")) "patient360-contract.js should expose Patient360Contract"
  Assert-True ($mapModel.Contains("Patient360MapModel")) "patient360-map-model.js should expose Patient360MapModel"
  Assert-True ($preVisitModel.Contains("Patient360PreVisitModel")) "patient360-previsit-model.js should expose Patient360PreVisitModel"
  Assert-True ($caregiverModel.Contains("Patient360CaregiverModel")) "patient360-caregiver-model.js should expose Patient360CaregiverModel"
  Assert-True ($consentModel.Contains("Patient360ConsentModel")) "patient360-consent-model.js should expose Patient360ConsentModel"
  Assert-True ($consentModel.Contains("buildConsentDraft")) "consent model should expose consent draft builder"
  Assert-True ($preVisitModel.Contains("Ten widok")) "pre-visit model should keep safety copy"
  Assert-True ($caregiverModel.Contains("tylko zakres danych")) "caregiver model should keep scoped-access safety copy"
  Assert-True ($preVisitModel.Contains("nie diagnozuje")) "pre-visit model should state it does not diagnose"
  Assert-True ($preVisitModel.Contains("terapeutycznych")) "pre-visit model should avoid therapeutic recommendations"

  Assert-True ($app.Contains("Przygotowanie krok po kroku")) "app.js should contain patient pre-visit flow"
  Assert-True ($app.Contains("Raport kontekstowy")) "app.js should contain context report"
  Assert-True ($app.Contains("Znane / Nieznane / Niepewne / Do weryfikacji")) "app.js should contain report categories"
  Assert-True ($app.Contains("Doctor in the Loop") -or $app.Contains("DITL")) "app.js should contain DITL language"

  Assert-True ($privacy.Contains("localStorage")) "privacy.html should disclose localStorage"
  Assert-True ($privacy.Contains("pacjent360-state-v11")) "privacy.html should disclose the current demo localStorage key"
  Assert-True ($privacy.Contains("lucide@0.468.0")) "privacy.html should disclose pinned Lucide"
  Assert-True ($privacy.Contains('rel="canonical" href="https://pacjent360.com.pl/privacy.html"')) "privacy.html should include canonical URL"
  Assert-True ($disclaimer.Contains("Pacjent360")) "disclaimer.html should contain project name"
  Assert-True ($disclaimer.Contains('rel="canonical" href="https://pacjent360.com.pl/disclaimer.html"')) "disclaimer.html should include canonical URL"
  Assert-True ($maintenance.Contains("Pacjent360")) "maintenance.html should contain project name"
  Assert-True ($health.Contains("project=pacjent360") -and $health.Contains("contains_patient_data=false")) "health.txt should expose static deployment markers"

  $blockedPaths = @(".env", ".git/HEAD", "README.md", "PROGRAM_PLAN.md", "dist/", "prints/")
  foreach ($path in $blockedPaths) {
    $status = Get-SmokeStatusCode "$baseUrl/$path"
    Assert-True ($status -eq 404) "Blocked file should not be served: $path returned $status"
  }

  Write-Host "Public HTTP smoke passed: $baseUrl -> $package"
} finally {
  if ($server -and (Get-Process -Id $server.Id -ErrorAction SilentlyContinue)) {
    Stop-Process -Id $server.Id
  }
}
