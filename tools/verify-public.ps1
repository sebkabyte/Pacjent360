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

$root = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
$target = Join-Path $root $PackageDir
Assert-True (Test-Path $target) "Public package does not exist: $target"
$target = (Resolve-Path $target).Path

$expectedFiles = @(
  ".htaccess",
  "index.html",
  "demo.html",
  "disclaimer.html",
  "privacy.html",
  "maintenance.html",
  "health.txt",
  "site.css",
  "site.js",
  "patient360-contract.js",
  "patient360-map-model.js",
  "patient360-previsit-model.js",
  "patient360-caregiver-model.js",
  "patient360-consent-model.js",
  "styles.css",
  "app.js",
  "robots.txt",
  "sitemap.xml",
  "assets/hero-clinical-context.png"
)

$actualFiles = Get-ChildItem -LiteralPath $target -Force -Recurse -File | ForEach-Object {
  Get-RelativePath -Base $target -Path $_.FullName
}

foreach ($file in $expectedFiles) {
  Assert-True ($actualFiles -contains $file) "Missing public file: $file"
}

$unexpected = $actualFiles | Where-Object { $expectedFiles -notcontains $_ }
Assert-True (-not $unexpected) ("Unexpected file in public package: " + ($unexpected -join ", "))

$blockedNames = @(
  "1.txt",
  "linkedin-story.md",
  ".env",
  ".git",
  ".claude",
  "CLAUDE.md",
  "CODEX_GOALS.md",
  "CODEX_MASTER_PROMPT.md",
  "CODEX_NIGHT_SPRINT.md",
  "HANDOVER.md"
)

$blockedFound = Get-ChildItem -LiteralPath $target -Force -Recurse | Where-Object { $blockedNames -contains $_.Name }
Assert-True (-not $blockedFound) ("Blocked private or working file found: " + (($blockedFound | Select-Object -ExpandProperty FullName) -join ", "))

& node --check (Join-Path $target "patient360-contract.js") | Out-Null
Assert-True ($LASTEXITCODE -eq 0) "node --check failed for public patient360-contract.js"
& node --check (Join-Path $target "patient360-map-model.js") | Out-Null
Assert-True ($LASTEXITCODE -eq 0) "node --check failed for public patient360-map-model.js"
& node --check (Join-Path $target "patient360-previsit-model.js") | Out-Null
Assert-True ($LASTEXITCODE -eq 0) "node --check failed for public patient360-previsit-model.js"
& node --check (Join-Path $target "patient360-caregiver-model.js") | Out-Null
Assert-True ($LASTEXITCODE -eq 0) "node --check failed for public patient360-caregiver-model.js"
& node --check (Join-Path $target "patient360-consent-model.js") | Out-Null
Assert-True ($LASTEXITCODE -eq 0) "node --check failed for public patient360-consent-model.js"
& node --check (Join-Path $target "app.js") | Out-Null
Assert-True ($LASTEXITCODE -eq 0) "node --check failed for public app.js"

$htaccess = Get-Content -LiteralPath (Join-Path $target ".htaccess") -Raw
$index = Get-Content -LiteralPath (Join-Path $target "index.html") -Raw
$demo = Get-Content -LiteralPath (Join-Path $target "demo.html") -Raw
$privacy = Get-Content -LiteralPath (Join-Path $target "privacy.html") -Raw
$disclaimer = Get-Content -LiteralPath (Join-Path $target "disclaimer.html") -Raw
$health = Get-Content -LiteralPath (Join-Path $target "health.txt") -Raw

Assert-True ($index.Contains("zast") -and $index.Contains("lekarza")) "index.html should state that Pacjent 360 does not replace the doctor"
Assert-True ($htaccess.Contains("Content-Security-Policy") -and $htaccess.Contains("frame-ancestors 'none'")) ".htaccess should configure CSP with frame-ancestors"
Assert-True ($htaccess.Contains("X-Frame-Options") -and $htaccess.Contains("DENY")) ".htaccess should configure X-Frame-Options DENY"
Assert-True ($htaccess.Contains("X-Content-Type-Options") -and $htaccess.Contains("nosniff")) ".htaccess should configure nosniff"
Assert-True ($htaccess.Contains("Options -Indexes")) ".htaccess should disable directory indexes"
Assert-True ($htaccess.Contains("RewriteEngine On")) ".htaccess should enable rewrite rules"
Assert-True ($htaccess.Contains('RewriteCond %{HTTPS} !=on')) ".htaccess should redirect HTTP to HTTPS"
Assert-True ($htaccess.Contains('RewriteCond %{HTTP_HOST} !^pacjent360\.com\.pl$ [NC]')) ".htaccess should canonicalize host to pacjent360.com.pl"
Assert-True ($htaccess.Contains('RewriteRule ^ https://pacjent360.com.pl%{REQUEST_URI} [R=301,L]')) ".htaccess should redirect to canonical HTTPS URL"
Assert-True ($htaccess.Contains("upload-root") -and $htaccess.Contains("deployment-handoff") -and $htaccess.Contains("document-root-checklist")) ".htaccess should deny helper release artifacts left in document root"
Assert-True ($index.Contains("CeZ") -and $index.Contains("NFZ") -and $index.Contains("IKP")) "index.html should show independence from CeZ/NFZ/IKP"
Assert-True ($index.Contains('class="skip-link"') -and $index.Contains('href="#main-content"')) "index.html should expose skip link"
Assert-True ($demo -match "DANE FIKCYJNE") "demo.html should show fictional data banner"
Assert-True ($demo.Contains('class="skip-link"') -and $demo.Contains('href="#viewRoot"')) "demo.html should expose skip link"
Assert-True ($demo.Contains('aria-label="Szukaj w danych demo"')) "demo search input should have aria-label"
Assert-True ($demo.Contains('aria-labelledby="dialogTitle"')) "entry dialog should be labelled"
Assert-True ($demo.Contains('name="robots" content="noindex,nofollow"')) "demo.html should be noindex,nofollow"
Assert-True ($demo.Contains("CeZ") -and $demo.Contains("NFZ") -and $demo.Contains("IKP")) "demo.html should show independence from CeZ/NFZ/IKP"
Assert-True ($health.Contains("project=pacjent360") -and $health.Contains("contains_patient_data=false")) "health.txt should expose static deployment markers without patient data"
Assert-True ($health.Contains("medical_device=false") -and $health.Contains("clinical_decision_support=false")) "health.txt should expose safety boundary markers"
Assert-True ($privacy -match "localStorage") "privacy.html should disclose localStorage"
Assert-True ($index.Contains('rel="canonical" href="https://pacjent360.com.pl/"')) "index.html should include canonical URL"
Assert-True ($privacy.Contains('rel="canonical" href="https://pacjent360.com.pl/privacy.html"')) "privacy.html should include canonical URL"
Assert-True ($disclaimer.Contains('rel="canonical" href="https://pacjent360.com.pl/disclaimer.html"')) "disclaimer.html should include canonical URL"
Assert-True ($demo.Contains('src="patient360-contract.js"')) "demo.html should load patient360-contract.js"
Assert-True ($demo.Contains('src="patient360-map-model.js"')) "demo.html should load patient360-map-model.js"
Assert-True ($demo.Contains('src="patient360-previsit-model.js"')) "demo.html should load patient360-previsit-model.js"
Assert-True ($demo.Contains('src="patient360-caregiver-model.js"')) "demo.html should load patient360-caregiver-model.js"
Assert-True ($demo.Contains('src="patient360-consent-model.js"')) "demo.html should load patient360-consent-model.js"
Assert-True ($demo.IndexOf('src="patient360-contract.js"') -lt $demo.IndexOf('src="app.js"')) "demo.html should load patient360-contract.js before app.js"
Assert-True ($demo.IndexOf('src="patient360-contract.js"') -lt $demo.IndexOf('src="patient360-map-model.js"')) "demo.html should load patient360-contract.js before patient360-map-model.js"
Assert-True ($demo.IndexOf('src="patient360-map-model.js"') -lt $demo.IndexOf('src="app.js"')) "demo.html should load patient360-map-model.js before app.js"
Assert-True ($demo.IndexOf('src="patient360-map-model.js"') -lt $demo.IndexOf('src="patient360-previsit-model.js"')) "demo.html should load patient360-map-model.js before patient360-previsit-model.js"
Assert-True ($demo.IndexOf('src="patient360-previsit-model.js"') -lt $demo.IndexOf('src="app.js"')) "demo.html should load patient360-previsit-model.js before app.js"
Assert-True ($demo.IndexOf('src="patient360-previsit-model.js"') -lt $demo.IndexOf('src="patient360-caregiver-model.js"')) "demo.html should load patient360-previsit-model.js before patient360-caregiver-model.js"
Assert-True ($demo.IndexOf('src="patient360-caregiver-model.js"') -lt $demo.IndexOf('src="app.js"')) "demo.html should load patient360-caregiver-model.js before app.js"
Assert-True ($demo.IndexOf('src="patient360-caregiver-model.js"') -lt $demo.IndexOf('src="patient360-consent-model.js"')) "demo.html should load patient360-caregiver-model.js before patient360-consent-model.js"
Assert-True ($demo.IndexOf('src="patient360-consent-model.js"') -lt $demo.IndexOf('src="app.js"')) "demo.html should load patient360-consent-model.js before app.js"
Assert-True (-not ($index.Contains("frame-ancestors") -or $demo.Contains("frame-ancestors") -or $privacy.Contains("frame-ancestors") -or $disclaimer.Contains("frame-ancestors"))) "frame-ancestors must be configured as an HTTP header, not as a meta CSP directive"

$lucidePinned = "https://unpkg.com/lucide@0.468.0/dist/umd/lucide.min.js"
Assert-True ($index.Contains($lucidePinned)) "index.html should use pinned Lucide"
Assert-True ($demo.Contains($lucidePinned)) "demo.html should use pinned Lucide"
Assert-True ($privacy.Contains($lucidePinned)) "privacy.html should disclose pinned Lucide"
Assert-True ($index -match 'integrity="sha384-[^"]+"' -and $index -match 'crossorigin="anonymous"') "index.html should use SRI and crossorigin for Lucide"
Assert-True ($demo -match 'integrity="sha384-[^"]+"' -and $demo -match 'crossorigin="anonymous"') "demo.html should use SRI and crossorigin for Lucide"

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
