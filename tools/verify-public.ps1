param(
  [string]$PackageDir = "dist/public"
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

function Get-ScriptRefIndex {
  param(
    [string]$Html,
    [string]$File
  )
  $pattern = 'src="' + [regex]::Escape($File) + '(?:\?[^"]*)?"'
  $match = [regex]::Match($Html, $pattern)
  if ($match.Success) {
    return $match.Index
  }
  return -1
}

function Assert-ScriptLoaded {
  param(
    [string]$Html,
    [string]$File
  )
  Assert-True ((Get-ScriptRefIndex -Html $Html -File $File) -ge 0) "demo.html should load $File"
}

$root = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
$target = Join-Path $root $PackageDir
Assert-True (Test-Path $target) "Public package does not exist: $target"
$target = (Resolve-Path $target).Path

$expectedFiles = @(
  ".htaccess",
  ".well-known/security.txt",
  "index.html",
  "demo.html",
  "engineering.html",
  "ditl.html",
  "agents.html",
  "investors.html",
  "dla-lekarzy.html",
  "readme.html",
  "jak-sie-przygotowac.html",
  "mapa-historii.html",
  "biblioteka-dokumentow.html",
  "soczewki.html",
  "wspoltworcy.html",
  "disclaimer.html",
  "privacy.html",
  "maintenance.html",
  "health.txt",
  "brand/tokens.css",
  "brand/components.css",
  "patient360-contract.js",
  "patient360-format.js",
  "patient360-map-model.js",
  "patient360-map-view.js",
  "patient360-previsit-model.js",
  "patient360-caregiver-model.js",
  "patient360-consent-model.js",
  "patient360-a1-core.js",
  "patient360-a3-a5-quality.js",
  "patient360-a4-consent-guard.js",
  "patient360-a6-checklist.js",
  "patient360-agent-policy.js",
  "patient360-demo-data.js",
  "styles.css",
  "app.js",
  "robots.txt",
  "sitemap.xml",
  "moja-historia.html",
  "moja-historia.css",
  "moja-historia.js",
  "p360-store.js",
  "p360-result-series.js",
  "p360-report.js",
  "historia-zycia.js",
  "historia-zycia.css",
  "assets/hero-clinical-context.png",
  "assets/story.css",
  "assets/story.js",
  "assets/lucide.min.js",
  "assets/favicon.svg"
)

$actualFiles = Get-ChildItem -LiteralPath $target -Force -Recurse -File | ForEach-Object {
  Get-RelativePath -Base $target -Path $_.FullName
}

foreach ($file in $expectedFiles) {
  Assert-True ($actualFiles -contains $file) "Missing public file: $file"
}

$unexpected = $actualFiles | Where-Object { $expectedFiles -notcontains $_ }
Assert-True (-not $unexpected) ("Unexpected file in public package: " + ($unexpected -join ", "))

$blockedNamePatterns = @(
  "^\.env(\..*)?$",
  "^\.git$",
  "private",
  "handover",
  "working"
)

$blockedFound = Get-ChildItem -LiteralPath $target -Force -Recurse | Where-Object {
  $name = $_.Name
  @($blockedNamePatterns | Where-Object { $name -match $_ }).Count -gt 0
}
Assert-True (-not $blockedFound) ("Blocked private or working file found: " + (($blockedFound | Select-Object -ExpandProperty FullName) -join ", "))

& node --check (Join-Path $target "patient360-contract.js") | Out-Null
Assert-True ($LASTEXITCODE -eq 0) "node --check failed for public patient360-contract.js"
& node --check (Join-Path $target "patient360-format.js") | Out-Null
Assert-True ($LASTEXITCODE -eq 0) "node --check failed for public patient360-format.js"
& node --check (Join-Path $target "patient360-map-model.js") | Out-Null
Assert-True ($LASTEXITCODE -eq 0) "node --check failed for public patient360-map-model.js"
& node --check (Join-Path $target "patient360-map-view.js") | Out-Null
Assert-True ($LASTEXITCODE -eq 0) "node --check failed for public patient360-map-view.js"
& node --check (Join-Path $target "patient360-previsit-model.js") | Out-Null
Assert-True ($LASTEXITCODE -eq 0) "node --check failed for public patient360-previsit-model.js"
& node --check (Join-Path $target "patient360-caregiver-model.js") | Out-Null
Assert-True ($LASTEXITCODE -eq 0) "node --check failed for public patient360-caregiver-model.js"
& node --check (Join-Path $target "patient360-consent-model.js") | Out-Null
Assert-True ($LASTEXITCODE -eq 0) "node --check failed for public patient360-consent-model.js"
& node --check (Join-Path $target "patient360-a1-core.js") | Out-Null
Assert-True ($LASTEXITCODE -eq 0) "node --check failed for public patient360-a1-core.js"
& node --check (Join-Path $target "patient360-a3-a5-quality.js") | Out-Null
Assert-True ($LASTEXITCODE -eq 0) "node --check failed for public patient360-a3-a5-quality.js"
& node --check (Join-Path $target "patient360-a4-consent-guard.js") | Out-Null
Assert-True ($LASTEXITCODE -eq 0) "node --check failed for public patient360-a4-consent-guard.js"
& node --check (Join-Path $target "patient360-a6-checklist.js") | Out-Null
Assert-True ($LASTEXITCODE -eq 0) "node --check failed for public patient360-a6-checklist.js"
& node --check (Join-Path $target "patient360-agent-policy.js") | Out-Null
Assert-True ($LASTEXITCODE -eq 0) "node --check failed for public patient360-agent-policy.js"
& node --check (Join-Path $target "patient360-demo-data.js") | Out-Null
Assert-True ($LASTEXITCODE -eq 0) "node --check failed for public patient360-demo-data.js"
& node --check (Join-Path $target "app.js") | Out-Null
Assert-True ($LASTEXITCODE -eq 0) "node --check failed for public app.js"
& node --check (Join-Path $target "moja-historia.js") | Out-Null
Assert-True ($LASTEXITCODE -eq 0) "node --check failed for public moja-historia.js"
& node --check (Join-Path $target "p360-store.js") | Out-Null
Assert-True ($LASTEXITCODE -eq 0) "node --check failed for public p360-store.js"
& node --check (Join-Path $target "p360-result-series.js") | Out-Null
Assert-True ($LASTEXITCODE -eq 0) "node --check failed for public p360-result-series.js"
& node --check (Join-Path $target "p360-report.js") | Out-Null
Assert-True ($LASTEXITCODE -eq 0) "node --check failed for public p360-report.js"
& node --check (Join-Path $target "historia-zycia.js") | Out-Null
Assert-True ($LASTEXITCODE -eq 0) "node --check failed for public historia-zycia.js"

$htaccess = Get-Content -LiteralPath (Join-Path $target ".htaccess") -Raw
$securityTxt = Get-Content -LiteralPath (Join-Path $target ".well-known/security.txt") -Raw
$index = Get-Content -LiteralPath (Join-Path $target "index.html") -Raw
$demo = Get-Content -LiteralPath (Join-Path $target "demo.html") -Raw
$privacy = Get-Content -LiteralPath (Join-Path $target "privacy.html") -Raw
$disclaimer = Get-Content -LiteralPath (Join-Path $target "disclaimer.html") -Raw
$health = Get-Content -LiteralPath (Join-Path $target "health.txt") -Raw
$app = Get-Content -LiteralPath (Join-Path $target "app.js") -Raw

Assert-True ($index.Contains("zast") -and $index.Contains("lekarza")) "index.html should state that Pacjent360 does not replace the doctor"
Assert-True ($htaccess.Contains("Content-Security-Policy") -and $htaccess.Contains("frame-ancestors 'none'")) ".htaccess should configure CSP with frame-ancestors"
Assert-True ($htaccess.Contains("Strict-Transport-Security") -and $htaccess.Contains("max-age=15552000")) ".htaccess should configure HSTS"
Assert-True ($htaccess.Contains("script-src 'self'") -and -not $htaccess.Contains("https://unpkg.com")) ".htaccess should use self-hosted scripts only"
Assert-True ($htaccess.Contains("X-Frame-Options") -and $htaccess.Contains("DENY")) ".htaccess should configure X-Frame-Options DENY"
Assert-True ($htaccess.Contains("X-Content-Type-Options") -and $htaccess.Contains("nosniff")) ".htaccess should configure nosniff"
Assert-True ($htaccess.Contains("Options -Indexes")) ".htaccess should disable directory indexes"
Assert-True ($htaccess.Contains("RewriteEngine On")) ".htaccess should enable rewrite rules"
Assert-True ($htaccess.Contains('RewriteCond %{HTTPS} !=on')) ".htaccess should redirect HTTP to HTTPS"
Assert-True ($htaccess.Contains('RewriteCond %{HTTP_HOST} !^pacjent360\.com\.pl$ [NC]')) ".htaccess should canonicalize host to pacjent360.com.pl"
Assert-True ($htaccess.Contains('RewriteRule ^ https://pacjent360.com.pl%{REQUEST_URI} [R=301,L]')) ".htaccess should redirect to canonical HTTPS URL"
Assert-True ($htaccess.Contains(".*\.zip") -and $htaccess.Contains("manifest") -and $htaccess.Contains("deployment-handoff") -and $htaccess.Contains("document-root-checklist")) ".htaccess should deny helper release artifacts left in document root"
Assert-True ($index.Contains("CeZ") -and $index.Contains("NFZ") -and $index.Contains("IKP")) "index.html should show independence from CeZ/NFZ/IKP"
Assert-True ($index.Contains('class="skip-link"') -and $index.Contains('href="#main-content"')) "index.html should expose skip link"
Assert-True ($demo -match "DANE FIKCYJNE") "demo.html should show fictional data banner"
Assert-True ($demo.Contains('class="skip-link"') -and $demo.Contains('href="#viewRoot"')) "demo.html should expose skip link"
Assert-True ($demo.Contains('aria-label="Szukaj w danych demo"')) "demo search input should have aria-label"
Assert-True ($demo.Contains('aria-labelledby="dialogTitle"')) "entry dialog should be labelled"
Assert-True ($demo.Contains('name="robots" content="noindex,nofollow"')) "demo.html should be noindex,nofollow"
Assert-True (-not $demo.Contains('id="exportJson"')) "demo.html should not expose a JSON export button"
Assert-True ($demo.Contains("CeZ") -and $demo.Contains("NFZ") -and $demo.Contains("IKP")) "demo.html should show independence from CeZ/NFZ/IKP"
Assert-True ($health.Contains("project=pacjent360") -and $health.Contains("contains_patient_data=false")) "health.txt should expose static deployment markers without patient data"
Assert-True ($health.Contains("medical_device=false") -and $health.Contains("clinical_decision_support=false")) "health.txt should expose safety boundary markers"
Assert-True ($securityTxt.Contains("security@pacjent360.com.pl") -and $securityTxt.Contains("Expires:")) "security.txt should expose security contact and expiry"
Assert-True ($privacy -match "localStorage") "privacy.html should disclose localStorage"
Assert-True ($privacy.Contains("pacjent360-state-v11")) "privacy.html should disclose the current demo localStorage key"
Assert-True ($index.Contains('rel="canonical" href="https://pacjent360.com.pl/"')) "index.html should include canonical URL"
Assert-True ($privacy.Contains('rel="canonical" href="https://pacjent360.com.pl/privacy.html"')) "privacy.html should include canonical URL"
Assert-True ($disclaimer.Contains('rel="canonical" href="https://pacjent360.com.pl/disclaimer.html"')) "disclaimer.html should include canonical URL"
Assert-ScriptLoaded -Html $demo -File "assets/lucide.min.js"
Assert-ScriptLoaded -Html $demo -File "patient360-contract.js"
Assert-ScriptLoaded -Html $demo -File "patient360-format.js"
Assert-ScriptLoaded -Html $demo -File "patient360-map-model.js"
Assert-ScriptLoaded -Html $demo -File "patient360-map-view.js"
Assert-ScriptLoaded -Html $demo -File "patient360-previsit-model.js"
Assert-ScriptLoaded -Html $demo -File "patient360-caregiver-model.js"
Assert-ScriptLoaded -Html $demo -File "patient360-consent-model.js"
Assert-ScriptLoaded -Html $demo -File "patient360-a1-core.js"
Assert-ScriptLoaded -Html $demo -File "patient360-a3-a5-quality.js"
Assert-ScriptLoaded -Html $demo -File "patient360-a4-consent-guard.js"
Assert-ScriptLoaded -Html $demo -File "patient360-a6-checklist.js"
Assert-ScriptLoaded -Html $demo -File "patient360-demo-data.js"
Assert-ScriptLoaded -Html $demo -File "p360-result-series.js"
Assert-ScriptLoaded -Html $demo -File "app.js"
$scriptIndex = @{
  lucide = Get-ScriptRefIndex -Html $demo -File "assets/lucide.min.js"
  contract = Get-ScriptRefIndex -Html $demo -File "patient360-contract.js"
  format = Get-ScriptRefIndex -Html $demo -File "patient360-format.js"
  mapModel = Get-ScriptRefIndex -Html $demo -File "patient360-map-model.js"
  mapView = Get-ScriptRefIndex -Html $demo -File "patient360-map-view.js"
  previsit = Get-ScriptRefIndex -Html $demo -File "patient360-previsit-model.js"
  caregiver = Get-ScriptRefIndex -Html $demo -File "patient360-caregiver-model.js"
  consent = Get-ScriptRefIndex -Html $demo -File "patient360-consent-model.js"
  a1Core = Get-ScriptRefIndex -Html $demo -File "patient360-a1-core.js"
  a3a5 = Get-ScriptRefIndex -Html $demo -File "patient360-a3-a5-quality.js"
  a4Consent = Get-ScriptRefIndex -Html $demo -File "patient360-a4-consent-guard.js"
  a6Checklist = Get-ScriptRefIndex -Html $demo -File "patient360-a6-checklist.js"
  demoData = Get-ScriptRefIndex -Html $demo -File "patient360-demo-data.js"
  resultSeries = Get-ScriptRefIndex -Html $demo -File "p360-result-series.js"
  app = Get-ScriptRefIndex -Html $demo -File "app.js"
}
Assert-True ($scriptIndex.lucide -lt $scriptIndex.app) "demo.html should load local Lucide before app.js"
Assert-True ($scriptIndex.contract -lt $scriptIndex.app) "demo.html should load patient360-contract.js before app.js"
Assert-True ($scriptIndex.format -lt $scriptIndex.app) "demo.html should load patient360-format.js before app.js"
Assert-True ($scriptIndex.contract -lt $scriptIndex.format) "demo.html should load patient360-contract.js before patient360-format.js"
Assert-True ($scriptIndex.contract -lt $scriptIndex.mapModel) "demo.html should load patient360-contract.js before patient360-map-model.js"
Assert-True ($scriptIndex.format -lt $scriptIndex.previsit) "demo.html should load patient360-format.js before patient360-previsit-model.js"
Assert-True ($scriptIndex.mapModel -lt $scriptIndex.app) "demo.html should load patient360-map-model.js before app.js"
Assert-True ($scriptIndex.mapModel -lt $scriptIndex.mapView) "demo.html should load patient360-map-model.js before patient360-map-view.js"
Assert-True ($scriptIndex.mapView -lt $scriptIndex.app) "demo.html should load patient360-map-view.js before app.js"
Assert-True ($scriptIndex.mapView -lt $scriptIndex.previsit) "demo.html should load patient360-map-view.js before patient360-previsit-model.js"
Assert-True ($scriptIndex.mapModel -lt $scriptIndex.previsit) "demo.html should load patient360-map-model.js before patient360-previsit-model.js"
Assert-True ($scriptIndex.previsit -lt $scriptIndex.app) "demo.html should load patient360-previsit-model.js before app.js"
Assert-True ($scriptIndex.previsit -lt $scriptIndex.caregiver) "demo.html should load patient360-previsit-model.js before patient360-caregiver-model.js"
Assert-True ($scriptIndex.caregiver -lt $scriptIndex.app) "demo.html should load patient360-caregiver-model.js before app.js"
Assert-True ($scriptIndex.caregiver -lt $scriptIndex.consent) "demo.html should load patient360-caregiver-model.js before patient360-consent-model.js"
Assert-True ($scriptIndex.consent -lt $scriptIndex.app) "demo.html should load patient360-consent-model.js before app.js"
Assert-True ($scriptIndex.a1Core -lt $scriptIndex.app) "demo.html should load patient360-a1-core.js before app.js"
Assert-True ($scriptIndex.consent -lt $scriptIndex.a1Core) "demo.html should load patient360-consent-model.js before patient360-a1-core.js"
Assert-True ($scriptIndex.a3a5 -lt $scriptIndex.app) "demo.html should load patient360-a3-a5-quality.js before app.js"
Assert-True ($scriptIndex.a1Core -lt $scriptIndex.a3a5) "demo.html should load patient360-a1-core.js before patient360-a3-a5-quality.js"
Assert-True ($scriptIndex.a4Consent -lt $scriptIndex.app) "demo.html should load patient360-a4-consent-guard.js before app.js"
Assert-True ($scriptIndex.a3a5 -lt $scriptIndex.a4Consent) "demo.html should load patient360-a3-a5-quality.js before patient360-a4-consent-guard.js"
Assert-True ($scriptIndex.a6Checklist -lt $scriptIndex.app) "demo.html should load patient360-a6-checklist.js before app.js"
Assert-True ($scriptIndex.a4Consent -lt $scriptIndex.a6Checklist) "demo.html should load patient360-a4-consent-guard.js before patient360-a6-checklist.js"
Assert-True ($scriptIndex.demoData -lt $scriptIndex.app) "demo.html should load patient360-demo-data.js before app.js"
Assert-True ($scriptIndex.a1Core -lt $scriptIndex.demoData) "demo.html should load patient360-a1-core.js before patient360-demo-data.js"
Assert-True ($scriptIndex.a3a5 -lt $scriptIndex.demoData) "demo.html should load patient360-a3-a5-quality.js before patient360-demo-data.js"
Assert-True ($scriptIndex.a4Consent -lt $scriptIndex.demoData) "demo.html should load patient360-a4-consent-guard.js before patient360-demo-data.js"
Assert-True ($scriptIndex.a6Checklist -lt $scriptIndex.demoData) "demo.html should load patient360-a6-checklist.js before patient360-demo-data.js"
Assert-True ($scriptIndex.resultSeries -lt $scriptIndex.app) "demo.html should load p360-result-series.js before app.js"
Assert-True (-not ($index.Contains("frame-ancestors") -or $demo.Contains("frame-ancestors") -or $privacy.Contains("frame-ancestors") -or $disclaimer.Contains("frame-ancestors"))) "frame-ancestors must be configured as an HTTP header, not as a meta CSP directive"

$lucidePinned = "assets/lucide.min.js"
Assert-True (-not ($index.Contains("unpkg.com"))) "index.html should not load external scripts (landing is self-contained)"
Assert-True ($demo.Contains($lucidePinned)) "demo.html should use local Lucide"
Assert-True ($privacy.Contains("assets/lucide.min.js") -and $privacy.Contains("0.468.0")) "privacy.html should disclose local pinned Lucide"
Assert-True ($demo -match 'integrity="sha384-[^"]+"' -and $demo -match 'crossorigin="anonymous"') "demo.html should use SRI and crossorigin for Lucide"
Assert-True (-not (($index + $demo + $privacy + $disclaimer) -match "unpkg\.com")) "Public HTML should not reference unpkg.com"
Assert-True (-not $app.Contains("URL.createObjectURL")) "app.js should not create downloadable local files"
Assert-True (-not $app.Contains(".download =")) "app.js should not set browser download targets"

$legacyPhrases = @(
  "lucide@latest",
  "NFZ one-pager",
  "One-pager",
  "one-pager",
  "HITL",
  "Risk / Flag Radar",
  "Red flag",
  "Amber flag",
  "Green flag",
  "Blue flag",
  "Główne ryzyka",
  "Dzisiejsza decyzja",
  "Clinical Decision Context",
  "Patient Story",
  "Decision Context",
  "AI lekarz",
  "Raport decyzyjny",
  "one-pager decyzyjny"
)

$textFiles = Get-ChildItem -LiteralPath $target -Recurse -File | Where-Object { $_.Extension -in @(".html", ".css", ".js", ".txt", ".xml") }
foreach ($phrase in $legacyPhrases) {
  $hits = $textFiles | Select-String -SimpleMatch -Pattern $phrase
  Assert-True (-not $hits) ("Legacy or risky phrase found in public package: " + $phrase)
}

$htmlFiles = Get-ChildItem -LiteralPath $target -Recurse -File -Filter "*.html"
foreach ($html in $htmlFiles) {
  $content = Get-Content -LiteralPath $html.FullName -Raw
  $matches = [regex]::Matches($content, '(?:href|src)="([^"]+)"')
  foreach ($match in $matches) {
    $ref = $match.Groups[1].Value
    if ($ref -match '^(https?:|mailto:|tel:|#|data:|javascript:)') {
      continue
    }
    $cleanRef = ($ref -split '#')[0]
    $cleanRef = ($cleanRef -split '\?')[0]
    if ([string]::IsNullOrWhiteSpace($cleanRef)) {
      continue
    }
    if ($cleanRef.StartsWith("/")) {
      $candidate = Join-Path $target $cleanRef.TrimStart("/")
    } else {
      $candidate = Join-Path $html.DirectoryName $cleanRef
    }
    Assert-True (Test-Path $candidate) "Broken local reference in $($html.Name): $ref"
  }
}

Write-Host "Public package verification passed: $target"
